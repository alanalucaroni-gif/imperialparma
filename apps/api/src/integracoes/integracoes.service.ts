import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import { SalvarCredencialDto } from "./integracoes.dto.js";

const PLATAFORMAS = new Set(["sichef", "cardapio-web", "ifood", "rappi"]);

@Injectable()
export class IntegracoesService {
  constructor(private readonly prisma: PrismaService) {}

  private plataformaValida(plataforma: string) {
    const normalizada = plataforma.trim().toLowerCase();
    if (!PLATAFORMAS.has(normalizada)) throw new BadRequestException("Plataforma de integração inválida.");
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
    const itens = await this.prisma.credencialIntegracao.findMany({ orderBy: { plataforma: "asc" } });
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
    if (!item) throw new NotFoundException("Credencial não cadastrada.");
    try {
      const token = this.decifrar(item.segredoCifrado, item.iv, item.authTag);
      if (!token) throw new Error("Credencial vazia");
      const verificadoEm = new Date();
      await this.prisma.credencialIntegracao.update({ where: { plataforma: chavePlataforma }, data: { verificadoEm } });
      return { plataforma: chavePlataforma, disponivel: true, verificadoEm };
    } catch {
      throw new UnprocessableEntityException("A credencial existe, mas não pôde ser validada com a chave atual.");
    }
  }

  async remover(plataforma: string) {
    const chavePlataforma = this.plataformaValida(plataforma);
    const resultado = await this.prisma.credencialIntegracao.deleteMany({ where: { plataforma: chavePlataforma } });
    return { removida: resultado.count > 0 };
  }
}