import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import { SalvarCredencialDto, SalvarWhatsappMetaDto } from "./integracoes.dto.js";

const PLATAFORMAS = new Set(["sichef", "cardapio-web", "ifood", "rappi"]);
const WHATSAPP_META = "whatsapp-meta";

type WhatsappMetadados = {
  phoneNumberId: string;
  graphVersion: string;
  templateName: string;
  pedidoTemplateName: string;
  templateLanguage: string;
};

type WhatsappSegredos = {
  accessToken: string;
  verifyToken: string;
  appSecret: string;
};

export type WhatsappMetaConfiguracao = WhatsappMetadados & WhatsappSegredos;

@Injectable()
export class IntegracoesService {
  constructor(private readonly prisma: PrismaService) {}

  private plataformaValida(plataforma: string) {
    const normalizada = plataforma.trim().toLowerCase();
    if (!PLATAFORMAS.has(normalizada)) throw new BadRequestException("Plataforma de integracao invalida.");
    return normalizada;
  }

  private chave() {
    const secret = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new InternalServerErrorException("INTEGRATION_ENCRYPTION_KEY deve ter pelo menos 32 caracteres.");
    }
    return createHash("sha256").update(secret, "utf8").digest();
  }

  private cifrar(token: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.chave(), iv);
    const segredoCifrado = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
    return {
      segredoCifrado: segredoCifrado.toString("base64"),
      iv: iv.toString("base64"),
      authTag: cipher.getAuthTag().toString("base64"),
    };
  }

  private decifrar(segredoCifrado: string, iv: string, authTag: string) {
    const decipher = createDecipheriv("aes-256-gcm", this.chave(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(segredoCifrado, "base64")),
      decipher.final(),
    ]).toString("utf8");
  }

  private metadados(item: { plataforma: string; identificador: string | null; verificadoEm: Date | null; atualizadoEm: Date }) {
    return {
      plataforma: item.plataforma,
      identificador: item.identificador,
      possuiCredencial: true,
      verificadoEm: item.verificadoEm,
      atualizadoEm: item.atualizadoEm,
    };
  }

  async listar() {
    const itens = await this.prisma.credencialIntegracao.findMany({ where: { plataforma: { in: [...PLATAFORMAS] } }, orderBy: { plataforma: "asc" } });
    return { data: itens.map(item => this.metadados(item)) };
  }

  async salvar(plataforma: string, dto: SalvarCredencialDto) {
    const chavePlataforma = this.plataformaValida(plataforma);
    const segredo = this.cifrar(dto.token.trim());
    const item = await this.prisma.credencialIntegracao.upsert({
      where: { plataforma: chavePlataforma },
      create: { plataforma: chavePlataforma, identificador: dto.identificador?.trim() || null, ...segredo },
      update: { identificador: dto.identificador?.trim() || null, verificadoEm: null, ...segredo },
    });
    return this.metadados(item);
  }

  async verificar(plataforma: string) {
    const chavePlataforma = this.plataformaValida(plataforma);
    const item = await this.prisma.credencialIntegracao.findUnique({ where: { plataforma: chavePlataforma } });
    if (!item) throw new NotFoundException("Credencial nao cadastrada.");
    try {
      const token = this.decifrar(item.segredoCifrado, item.iv, item.authTag);
      if (!token) throw new Error("Credencial vazia");
      const verificadoEm = new Date();
      await this.prisma.credencialIntegracao.update({ where: { plataforma: chavePlataforma }, data: { verificadoEm } });
      return { plataforma: chavePlataforma, disponivel: true, verificadoEm };
    } catch {
      throw new UnprocessableEntityException("A credencial existe, mas nao pode ser validada com a chave atual.");
    }
  }

  async remover(plataforma: string) {
    const chavePlataforma = this.plataformaValida(plataforma);
    const resultado = await this.prisma.credencialIntegracao.deleteMany({ where: { plataforma: chavePlataforma } });
    return { removida: resultado.count > 0 };
  }

  private whatsappAmbiente(): WhatsappMetaConfiguracao | null {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    if (!accessToken || !phoneNumberId) return null;
    return {
      accessToken,
      phoneNumberId,
      graphVersion: process.env.WHATSAPP_GRAPH_VERSION?.trim() || "v24.0",
      templateName: process.env.WHATSAPP_COTACAO_TEMPLATE?.trim() || "cotacao_fornecedor",
      pedidoTemplateName: process.env.WHATSAPP_PEDIDO_TEMPLATE?.trim() || "pedido_compra",
      templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "pt_BR",
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN?.trim() || "",
      appSecret: process.env.WHATSAPP_APP_SECRET?.trim() || "",
    };
  }

  private async whatsappBanco() {
    const item = await this.prisma.credencialIntegracao.findUnique({ where: { plataforma: WHATSAPP_META } });
    if (!item) return null;
    try {
      const metadados = JSON.parse(item.identificador || "{}") as Partial<WhatsappMetadados>;
      const segredos = JSON.parse(this.decifrar(item.segredoCifrado, item.iv, item.authTag)) as Partial<WhatsappSegredos>;
      if (!metadados.phoneNumberId || !segredos.accessToken) return null;
      return {
        item,
        configuracao: {
          phoneNumberId: metadados.phoneNumberId,
          graphVersion: metadados.graphVersion || "v24.0",
          templateName: metadados.templateName || "cotacao_fornecedor",
          pedidoTemplateName: metadados.pedidoTemplateName || "pedido_compra",
          templateLanguage: metadados.templateLanguage || "pt_BR",
          accessToken: segredos.accessToken,
          verifyToken: segredos.verifyToken || "",
          appSecret: segredos.appSecret || "",
        } satisfies WhatsappMetaConfiguracao,
      };
    } catch {
      throw new UnprocessableEntityException("A configuracao do WhatsApp nao pode ser decifrada com a chave atual.");
    }
  }

  async obterWhatsappConfiguracao(): Promise<WhatsappMetaConfiguracao | null> {
    const banco = await this.whatsappBanco();
    return banco?.configuracao || this.whatsappAmbiente();
  }

  private webhookUrl() {
    return `${(process.env.WEB_ORIGIN || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "")}/api/webhooks/whatsapp`;
  }

  async statusWhatsapp() {
    const banco = await this.whatsappBanco();
    if (banco) {
      const { configuracao, item } = banco;
      return {
        configurada: true,
        fonte: "configuracoes",
        phoneNumberId: configuracao.phoneNumberId,
        graphVersion: configuracao.graphVersion,
        templateName: configuracao.templateName,
        pedidoTemplateName: configuracao.pedidoTemplateName,
        templateLanguage: configuracao.templateLanguage,
        possuiAccessToken: Boolean(configuracao.accessToken),
        possuiVerifyToken: Boolean(configuracao.verifyToken),
        possuiAppSecret: Boolean(configuracao.appSecret),
        webhookUrl: this.webhookUrl(),
        verificadoEm: item.verificadoEm,
        atualizadoEm: item.atualizadoEm,
      };
    }
    const ambiente = this.whatsappAmbiente();
    return {
      configurada: Boolean(ambiente),
      fonte: ambiente ? "render" : null,
      phoneNumberId: ambiente?.phoneNumberId || "",
      graphVersion: ambiente?.graphVersion || "v24.0",
      templateName: ambiente?.templateName || "cotacao_fornecedor",
      pedidoTemplateName: ambiente?.pedidoTemplateName || "pedido_compra",
      templateLanguage: ambiente?.templateLanguage || "pt_BR",
      possuiAccessToken: Boolean(ambiente?.accessToken),
      possuiVerifyToken: Boolean(ambiente?.verifyToken),
      possuiAppSecret: Boolean(ambiente?.appSecret),
      webhookUrl: this.webhookUrl(),
      verificadoEm: null,
      atualizadoEm: null,
    };
  }

  async salvarWhatsapp(dto: SalvarWhatsappMetaDto) {
    const anterior = await this.whatsappBanco();
    const existente = anterior?.configuracao || this.whatsappAmbiente();
    const accessToken = dto.accessToken?.trim() || existente?.accessToken || "";
    const verifyToken = dto.verifyToken?.trim() || existente?.verifyToken || "";
    const appSecret = dto.appSecret?.trim() || existente?.appSecret || "";
    if (!accessToken) throw new BadRequestException("Informe o token permanente da Meta.");
    if (!verifyToken) throw new BadRequestException("Informe um Verify Token para configurar o webhook.");
    if (!appSecret) throw new BadRequestException("Informe o App Secret para validar o webhook.");

    const identificador = JSON.stringify({
      phoneNumberId: dto.phoneNumberId.trim(),
      graphVersion: dto.graphVersion.trim(),
      templateName: dto.templateName.trim(),
      pedidoTemplateName: dto.pedidoTemplateName?.trim() || "pedido_compra",
      templateLanguage: dto.templateLanguage.trim(),
    } satisfies WhatsappMetadados);
    const segredo = this.cifrar(JSON.stringify({ accessToken, verifyToken, appSecret } satisfies WhatsappSegredos));
    await this.prisma.credencialIntegracao.upsert({
      where: { plataforma: WHATSAPP_META },
      create: { plataforma: WHATSAPP_META, identificador, ...segredo },
      update: { identificador, verificadoEm: null, ...segredo },
    });
    return this.statusWhatsapp();
  }

  async verificarWhatsapp() {
    const configuracao = await this.obterWhatsappConfiguracao();
    if (!configuracao) throw new NotFoundException("Configure o WhatsApp antes de testar.");
    const url = `https://graph.facebook.com/${configuracao.graphVersion}/${configuracao.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`;
    const resposta = await fetch(url, { headers: { Authorization: `Bearer ${configuracao.accessToken}` } });
    const corpo = await resposta.json() as any;
    if (!resposta.ok) throw new UnprocessableEntityException(corpo?.error?.message || `A Meta respondeu HTTP ${resposta.status}.`);
    const verificadoEm = new Date();
    await this.prisma.credencialIntegracao.updateMany({ where: { plataforma: WHATSAPP_META }, data: { verificadoEm } });
    return {
      disponivel: true,
      verificadoEm,
      numero: corpo.display_phone_number || null,
      nomeVerificado: corpo.verified_name || null,
      qualidade: corpo.quality_rating || null,
    };
  }

  async removerWhatsapp() {
    const resultado = await this.prisma.credencialIntegracao.deleteMany({ where: { plataforma: WHATSAPP_META } });
    return { removida: resultado.count > 0 };
  }
}
