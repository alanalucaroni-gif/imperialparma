const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  usuario: { id: string; nome: string; email: string; role: string };
};

const ACCESS_KEY = "imperial.accessToken";
const REFRESH_KEY = "imperial.refreshToken";
const USER_KEY = "imperial.usuario";

class ImperialApi {
  private accessToken = sessionStorage.getItem(ACCESS_KEY) || "";

  get enabled() { return Boolean(API_URL); }
  get hasSession() { return this.tokenValido(this.accessToken); }

  get usuario(): LoginResponse["usuario"] | null {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  private tokenValido(token: string) {
    if (!token) return false;
    try {
      const payloadPart = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = payloadPart.padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
      const payload = JSON.parse(atob(padded));
      return Number(payload.exp || 0) * 1000 > Date.now() + 5_000;
    } catch {
      return false;
    }
  }

  private salvarSessao(data: LoginResponse) {
    this.accessToken = data.accessToken;
    sessionStorage.setItem(ACCESS_KEY, data.accessToken);
    sessionStorage.setItem(REFRESH_KEY, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  }

  logout() {
    this.accessToken = "";
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  private async renovarSessao() {
    const refreshToken = sessionStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) throw new Error("Sessao expirada.");
      this.salvarSessao(await response.json());
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  private async request<T>(path: string, init: RequestInit = {}, permitirRenovacao = true): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        ...init.headers,
      },
    });
    if (response.status === 401 && permitirRenovacao && !path.startsWith("/auth/") && await this.renovarSessao()) {
      return this.request<T>(path, init, false);
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message?.join?.(", ") || body.message || `Erro HTTP ${response.status}`);
    }
    return response.json();
  }

  async login(email: string, senha: string) {
    const data = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }, false);
    this.salvarSessao(data);
    return data.usuario;
  }

  async ensureSession() {
    if (!this.enabled) return false;
    if (this.hasSession) return true;
    return this.renovarSessao();
  }

  getInsumos() { return this.request<any>("/estoque/insumos?limit=100"); }
  cadastrarInsumo(body: any) { return this.request<any>("/estoque/insumos", { method: "POST", body: JSON.stringify(body) }); }
  atualizarInsumo(codigo: string, body: any) { return this.request<any>(`/estoque/insumos/${codigo}`, { method: "PATCH", body: JSON.stringify(body) }); }
  excluirInsumo(codigo: string) { return this.request<any>(`/estoque/insumos/${codigo}`, { method: "DELETE" }); }
  getMovimentacoes() { return this.request<any>("/estoque/movimentacoes?limit=20"); }
  registrarMovimentacaoEstoque(body: any) { return this.request<any>("/estoque/movimentacoes", { method: "POST", body: JSON.stringify(body) }); }
  atualizarEstoqueMinimo(codigo: string, minimo: number) { return this.request<any>(`/estoque/insumos/${codigo}/minimo`, { method: "PATCH", body: JSON.stringify({ minimo }) }); }
  getPainelCotacoes() { return this.request<any>("/cotacoes/painel"); }
  getFornecedoresCotacao() { return this.request<any>("/cotacoes/fornecedores/ativos"); }
  cadastrarFornecedorCotacao(body: any) { return this.request<any>("/cotacoes/fornecedores", { method: "POST", body: JSON.stringify(body) }); }
  criarCotacaoInteligente(body: any) { return this.request<any>("/cotacoes", { method: "POST", body: JSON.stringify(body) }); }
  registrarRespostaCotacao(codigo: string, body: any) { return this.request<any>(`/cotacoes/${codigo}/respostas`, { method: "POST", body: JSON.stringify(body) }); }
  enviarCotacaoWhatsapp(codigo: string) { return this.request<any>(`/cotacoes/${codigo}/enviar-whatsapp`, { method: "POST" }); }
  getContasPagar() { return this.request<any>("/financeiro/contas-pagar?limit=100"); }
  compraManual(body: any) { return this.request<any>("/compras/manual", { method: "POST", body: JSON.stringify(body) }); }
  entradaBoleto(body: any) { return this.request<any>("/compras/boleto", { method: "POST", body: JSON.stringify(body) }); }
  entradaXml(body: any) { return this.request<any>("/compras/xml", { method: "POST", body: JSON.stringify(body) }); }
  getCredenciaisIntegracao() { return this.request<any>("/integracoes/credenciais"); }
  salvarCredencialIntegracao(plataforma: string, body: { identificador?: string; token: string }) {
    return this.request<any>(`/integracoes/credenciais/${plataforma}`, { method: "PUT", body: JSON.stringify(body) });
  }
  verificarCredencialIntegracao(plataforma: string) {
    return this.request<any>(`/integracoes/credenciais/${plataforma}/verificar`, { method: "POST" });
  }
  removerCredencialIntegracao(plataforma: string) {
    return this.request<any>(`/integracoes/credenciais/${plataforma}`, { method: "DELETE" });
  }
}

export const api = new ImperialApi();
