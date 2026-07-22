const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  usuario: { id: string; nome: string; email: string; role: string };
};

export type Usuario = LoginResponse["usuario"] & {
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
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

  getUsuarios(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>("/usuarios" + this.query(params)); }
  cadastrarUsuario(body: { nome: string; login: string; email: string; role: string; senha: string; funcionarioId?: string; permissoes?: string[]; ativo?: boolean }) {
    return this.request<Usuario>("/usuarios", { method: "POST", body: JSON.stringify(body) });
  }
  atualizarUsuario(id: string, body: { nome?: string; login?: string; email?: string; role?: string; funcionarioId?: string; permissoes?: string[]; ativo?: boolean }) {
    return this.request<Usuario>(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  }
  redefinirSenhaUsuario(id: string, senha: string) {
    return this.request<{ message: string }>(`/usuarios/${id}/senha`, { method: "PATCH", body: JSON.stringify({ senha }) });
  }
  desativarUsuario(id: string) { return this.request<Usuario>(`/usuarios/${id}`, { method: "DELETE" }); }

  // --- Receitas de producao ---
  getReceitas(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>("/receitas" + this.query(params)); }
  getReceitasAtivas() { return this.request<any[]>("/receitas/ativas"); }
  getReceita(id: string) { return this.request<any>("/receitas/" + id); }
  cadastrarReceita(body: any) { return this.request<any>("/receitas", { method: "POST", body: JSON.stringify(body) }); }
  atualizarReceita(id: string, body: any) { return this.request<any>("/receitas/" + id, { method: "PATCH", body: JSON.stringify(body) }); }
  duplicarReceita(id: string) { return this.request<any>("/receitas/" + id + "/duplicar", { method: "POST" }); }
  excluirReceita(id: string) { return this.request<any>("/receitas/" + id, { method: "DELETE" }); }
  getProducoesReceitas(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>("/producoes-receitas" + this.query(params)); }
  getProducaoReceita(id: string) { return this.request<any>("/producoes-receitas/" + id); }
  cadastrarProducaoReceita(body: any) { return this.request<any>("/producoes-receitas", { method: "POST", body: JSON.stringify(body) }); }
  atualizarProducaoReceita(id: string, body: any) { return this.request<any>("/producoes-receitas/" + id, { method: "PATCH", body: JSON.stringify(body) }); }
  processarEstoqueProducao(id: string) { return this.request<any>("/producoes-receitas/" + id + "/processar-estoque", { method: "POST" }); }
  estornarProducaoReceita(id: string, motivo: string) { return this.request<any>("/producoes-receitas/" + id, { method: "DELETE", body: JSON.stringify({ motivo }) }); }
  cancelarProducaoReceita(id: string, motivo: string) { return this.request<any>("/producoes-receitas/" + id + "/cancelar", { method: "POST", body: JSON.stringify({ motivo }) }); }
  pausarProducaoReceita(id: string) { return this.request<any>("/producoes-receitas/" + id + "/pausar", { method: "POST" }); }
  continuarProducaoReceita(id: string) { return this.request<any>("/producoes-receitas/" + id + "/continuar", { method: "POST" }); }
  informarPerdaProducao(id: string, body: { quantidadePerdida: number; motivo: string }) { return this.request<any>("/producoes-receitas/" + id + "/perda", { method: "POST", body: JSON.stringify(body) }); }
  adicionarObservacaoProducao(id: string, observacao: string) { return this.request<any>("/producoes-receitas/" + id + "/observacao", { method: "POST", body: JSON.stringify({ observacao }) }); }
  getIndicadoresProducao(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>("/producoes-receitas/indicadores" + this.query(params)); }
  getRankingProducao(params?: Record<string, string | number | boolean | undefined>) { return this.request<any[]>("/producoes-receitas/ranking" + this.query(params)); }

  getInsumos() { return this.request<any>("/estoque/insumos?limit=200"); }
  cadastrarInsumo(body: any) { return this.request<any>("/estoque/insumos", { method: "POST", body: JSON.stringify(body) }); }
  atualizarInsumo(codigo: string, body: any) { return this.request<any>(`/estoque/insumos/${codigo}`, { method: "PATCH", body: JSON.stringify(body) }); }
  excluirInsumo(codigo: string) { return this.request<any>(`/estoque/insumos/${codigo}`, { method: "DELETE" }); }
  getMovimentacoes() { return this.request<any>("/estoque/movimentacoes?limit=20"); }
  registrarMovimentacaoEstoque(body: any) { return this.request<any>("/estoque/movimentacoes", { method: "POST", body: JSON.stringify(body) }); }
  atualizarEstoqueMinimo(codigo: string, minimo: number) { return this.request<any>(`/estoque/insumos/${codigo}/minimo`, { method: "PATCH", body: JSON.stringify({ minimo }) }); }
  getPainelCotacoes() { return this.request<any>("/cotacoes/painel"); }
  getCotacao(codigo: string) { return this.request<any>(`/cotacoes/${codigo}`); }
  getCotacaoPublica(token: string) { return this.request<any>(`/cotacoes-publicas/${token}`); }
  salvarRascunhoCotacaoPublica(token: string, body: any) { return this.request<any>(`/cotacoes-publicas/${token}/rascunho`, { method: "PATCH", body: JSON.stringify(body) }); }
  enviarCotacaoPublica(token: string, body: any) { return this.request<any>(`/cotacoes-publicas/${token}/enviar`, { method: "POST", body: JSON.stringify(body) }); }
  recusarCotacaoPublica(token: string, body: any) { return this.request<any>(`/cotacoes-publicas/${token}/recusar`, { method: "POST", body: JSON.stringify(body) }); }
  finalizarCotacao(codigo: string, body: any) { return this.request<any>(`/cotacoes/${codigo}/finalizar`, { method: "POST", body: JSON.stringify(body) }); }
  prorrogarCotacao(codigo: string, prazoResposta: string) { return this.request<any>(`/cotacoes/${codigo}/prorrogar`, { method: "POST", body: JSON.stringify({ prazoResposta }) }); }
  encerrarCotacao(codigo: string, motivo?: string) { return this.request<any>(`/cotacoes/${codigo}/encerrar`, { method: "POST", body: JSON.stringify({ motivo }) }); }
  gerarNovoLinkCotacao(codigo: string, participacaoId: string) { return this.request<any>(`/cotacoes/${codigo}/fornecedores/${participacaoId}/novo-link`, { method: "POST" }); }
  getPedidosCompra() { return this.request<any>("/cotacoes/pedidos/lista"); }
  getRecebimentosCompra() { return this.request<any>("/compras/recebimentos"); }
  criarRecebimentoCompra(pedidoId: string, body: any) { return this.request<any>(`/compras/pedidos/${pedidoId}/recebimentos`, { method: "POST", body: JSON.stringify(body) }); }
  confirmarEntradaRecebimento(id: string) { return this.request<any>(`/compras/recebimentos/${id}/confirmar-estoque`, { method: "POST" }); }
  cancelarPedidoCompra(id: string, motivo: string) { return this.request<any>(`/compras/pedidos/${id}/cancelar`, { method: "POST", body: JSON.stringify({ motivo }) }); }
  getHistoricoPrecosCompra() { return this.request<any>("/compras/historico-precos"); }
  async baixarPdfPedido(id: string) {
    const response = await fetch(`${API_URL}/cotacoes/pedidos/${id}/pdf`, { headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {} });
    if (!response.ok) throw new Error("Nao foi possivel abrir o PDF do pedido.");
    return response.blob();
  }
  enviarPdfPedidoWhatsapp(id: string) { return this.request<any>(`/cotacoes/pedidos/${id}/enviar-whatsapp`, { method: "POST" }); }
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
  getWhatsappMeta() { return this.request<any>("/integracoes/whatsapp-meta"); }
  salvarWhatsappMeta(body: any) { return this.request<any>("/integracoes/whatsapp-meta", { method: "PUT", body: JSON.stringify(body) }); }
  verificarWhatsappMeta() { return this.request<any>("/integracoes/whatsapp-meta/verificar", { method: "POST" }); }
  removerWhatsappMeta() { return this.request<any>("/integracoes/whatsapp-meta", { method: "DELETE" }); }

  private query(params?: Record<string, string | number | boolean | undefined>) {
    const valores = Object.entries(params || {}).filter(([, valor]) => valor !== undefined && valor !== "").map(([chave, valor]) => [chave, String(valor)]);
    const qs = new URLSearchParams(valores).toString();
    return qs ? "?" + qs : "";
  }

  // --- Funcionários ---
  getFuncionarios(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>("/funcionarios" + this.query(params)); }
  getFuncionariosAtivos() { return this.request<any[]>("/funcionarios/ativos"); }
  getFuncionario(id: string) { return this.request<any>("/funcionarios/" + id); }
  cadastrarFuncionario(body: any) { return this.request<any>("/funcionarios", { method: "POST", body: JSON.stringify(body) }); }
  atualizarFuncionario(id: string, body: any) { return this.request<any>("/funcionarios/" + id, { method: "PATCH", body: JSON.stringify(body) }); }
  desativarFuncionario(id: string) { return this.request<any>("/funcionarios/" + id, { method: "DELETE" }); }

  // --- Fornecedores ---
  getFornecedores(params?: Record<string, string | number | boolean | undefined>) { return this.request<any>("/fornecedores" + this.query(params)); }
  getFornecedor(id: string) {
    return this.request<any>(`/fornecedores/${id}`);
  }
  cadastrarFornecedor(body: any) {
    return this.request<any>("/fornecedores", { method: "POST", body: JSON.stringify(body) });
  }
  atualizarFornecedor(id: string, body: any) {
    return this.request<any>(`/fornecedores/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  }
  desativarFornecedor(id: string) {
    return this.request<any>(`/fornecedores/${id}`, { method: "DELETE" });
  }
}

export const api = new ImperialApi();
