import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import { CotacaoStatus } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { CadastrarFornecedorCotacaoDto, CriarCotacaoInteligenteDto, RegistrarRespostaCotacaoDto } from "./cotacoes.dto.js";

const numero = (valor: unknown) => Number(valor || 0);
const telefoneLimpo = (valor: string | null | undefined) => (valor || "").replace(/\D/g, "");

function numeroBrasileiro(valor: string) {
  const limpo = valor.replace(/[^\d,.]/g, "");
  if (limpo.includes(",")) return Number(limpo.replace(/\./g, "").replace(",", "."));
  return Number(limpo);
}

function extrairResposta(texto: string) {
  const codigo = texto.match(/COT-[A-Z0-9-]+/i)?.[0]?.toUpperCase();
  const precoTexto = texto.match(/PRE[CÇ]O(?:\s+UNIT[ÁA]RIO)?\s*[:=]?\s*(?:R\$)?\s*([\d.,]+)/i)?.[1];
  const freteTexto = texto.match(/FRETE\s*[:=]?\s*(?:R\$)?\s*([\d.,]+)/i)?.[1];
  const prazoTexto = texto.match(/PRAZO\s*[:=]?\s*(\d+)/i)?.[1];
  const formaPagamento = texto.match(/(?:PAGAMENTO|FORMA DE PAGAMENTO|CONDI[CÇ][ÕO]ES)\s*[:=]?\s*([^|\n]+)/i)?.[1]?.trim();
  const impostoTexto = texto.match(/IMPOSTOS?(?:\s+INCLUSOS?)?\s*[:=]?\s*(SIM|N[ÃA]O|INCLUSOS?|SEM)/i)?.[1];
  const impostoIncluso = impostoTexto == null ? undefined : !/N[ÃA]O|SEM/i.test(impostoTexto);
  const precoUnitario = precoTexto ? numeroBrasileiro(precoTexto) : NaN;
  if (!codigo || !Number.isFinite(precoUnitario) || precoUnitario <= 0) return null;
  return {
    codigo,
    precoUnitario,
    frete: freteTexto ? numeroBrasileiro(freteTexto) : 0,
    prazoDias: prazoTexto ? Number(prazoTexto) : undefined,
    condicoes: formaPagamento,
    formaPagamento,
    impostoIncluso,
  };
}

@Injectable()
export class CotacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async painel() {
    const [insumos, cotacoes, fornecedores] = await Promise.all([
      this.prisma.insumo.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
      this.prisma.cotacao.findMany({ include: { propostas: { include: { fornecedor: true } } }, orderBy: { criadoEm: "desc" }, take: 30 }),
      this.prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    ]);
    const sugestoes = insumos.map(item => {
      const atual = numero(item.quantidade);
      const minimo = numero(item.estoqueMinimo);
      const alvo = minimo;
      const quantidadeSugerida = Math.max(0, alvo - atual);
      return {
        codigo: item.codigo,
        nome: item.nome,
        unidade: item.unidade,
        estoqueAtual: atual,
        estoqueMinimo: minimo,
        alvo,
        quantidadeSugerida,
        custoUnitarioAtual: numero(item.custoUnitario),
        custoEstimado: quantidadeSugerida * numero(item.custoUnitario),
        prioridade: atual <= 0 ? "critica" : atual < minimo * 0.5 ? "alta" : "normal",
      };
    }).filter(item => item.estoqueMinimo > 0 && item.estoqueAtual < item.estoqueMinimo);
    return {
      atualizadoEm: new Date(),
      sugestoes,
      cotacoes: cotacoes.map(cotacao => this.apresentar(cotacao)),
      fornecedores: fornecedores.map(f => ({ id: f.id, nome: f.nome, telefone: f.telefone })),
    };
  }

  async listarFornecedores() {
    const itens = await this.prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } });
    return { data: itens.map(item => ({ id: item.id, nome: item.nome, telefone: item.telefone, cnpj: item.cnpj })) };
  }

  async cadastrarFornecedor(dto: CadastrarFornecedorCotacaoDto) {
    const telefone = telefoneLimpo(dto.telefone);
    if (telefone.length < 10) throw new BadRequestException("Informe o WhatsApp com DDD e número.");
    const existente = dto.cnpj ? await this.prisma.fornecedor.findUnique({ where: { cnpj: dto.cnpj } }) : null;
    const item = existente
      ? await this.prisma.fornecedor.update({ where: { id: existente.id }, data: { nome: dto.nome.trim(), telefone, ativo: true } })
      : await this.prisma.fornecedor.create({ data: { nome: dto.nome.trim(), telefone, cnpj: dto.cnpj?.trim() || null } });
    return { id: item.id, nome: item.nome, telefone: item.telefone, cnpj: item.cnpj };
  }
  async criar(dto: CriarCotacaoInteligenteDto) {
    const [insumo, fornecedores] = await Promise.all([
      this.prisma.insumo.findUnique({ where: { codigo: dto.insumoCodigo } }),
      this.prisma.fornecedor.findMany({ where: { id: { in: dto.fornecedorIds }, ativo: true } }),
    ]);
    if (!insumo) throw new NotFoundException("Insumo não encontrado.");
    if (fornecedores.length !== new Set(dto.fornecedorIds).size) throw new BadRequestException("Um ou mais fornecedores não estão disponíveis.");
    const atual = numero(insumo.quantidade);
    const minimo = numero(insumo.estoqueMinimo);
    if (minimo <= 0) throw new BadRequestException("Configure o estoque mínimo antes de abrir a cotação.");
    const quantidade = dto.quantidade ?? Math.max(0, minimo - atual);
    if (quantidade <= 0) throw new BadRequestException("O estoque atual não exige reposição.");
    const codigo = `COT-${Date.now().toString(36).toUpperCase()}`;
    const cotacao = await this.prisma.cotacao.create({
      data: {
        codigo,
        descricao: insumo.nome,
        quantidade,
        unidade: insumo.unidade,
        insumoCodigo: insumo.codigo,
        estoqueAtual: atual,
        estoqueMinimo: minimo,
        propostas: { create: fornecedores.map(fornecedor => ({ fornecedorId: fornecedor.id })) },
      },
      include: { propostas: { include: { fornecedor: true } } },
    });
    return this.apresentar(cotacao);
  }

  async registrarResposta(codigo: string, dto: RegistrarRespostaCotacaoDto, origemResposta: "WHATSAPP" | "MANUAL" = "MANUAL") {
    const cotacao = await this.prisma.cotacao.findUnique({ where: { codigo }, include: { propostas: true } });
    if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    const proposta = cotacao.propostas.find(p => p.fornecedorId === dto.fornecedorId);
    if (!proposta) throw new BadRequestException("Fornecedor não participa desta cotação.");
    await this.prisma.$transaction([
      this.prisma.cotacaoFornecedor.update({
        where: { id: proposta.id },
        data: {
          precoUnitario: dto.precoUnitario,
          frete: dto.frete ?? 0,
          prazoDias: dto.prazoDias,
          condicoes: dto.condicoes ?? dto.formaPagamento,
          formaPagamento: dto.formaPagamento ?? dto.condicoes,
          impostoIncluso: dto.impostoIncluso,
          origemResposta,
          respostaOriginal: dto.respostaOriginal,
          respondidaEm: new Date(),
        },
      }),
      this.prisma.cotacao.update({ where: { id: cotacao.id }, data: { status: CotacaoStatus.RESPONDIDA } }),
    ]);
    return this.buscar(codigo);
  }

  async buscar(codigo: string) {
    const cotacao = await this.prisma.cotacao.findUnique({ where: { codigo }, include: { propostas: { include: { fornecedor: true } } } });
    if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    return this.apresentar(cotacao);
  }

  async enviarWhatsapp(codigo: string) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const graphVersion = process.env.WHATSAPP_GRAPH_VERSION;
    const templateName = process.env.WHATSAPP_COTACAO_TEMPLATE;
    if (!accessToken || !phoneNumberId || !graphVersion || !templateName) {
      throw new BadRequestException("Configure WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_GRAPH_VERSION e WHATSAPP_COTACAO_TEMPLATE.");
    }
    const cotacao = await this.prisma.cotacao.findUnique({ where: { codigo }, include: { propostas: { include: { fornecedor: true } } } });
    if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    const resultados = [];
    for (const proposta of cotacao.propostas) {
      const destino = telefoneLimpo(proposta.fornecedor.telefone);
      if (!destino) {
        resultados.push({ fornecedor: proposta.fornecedor.nome, enviada: false, erro: "Telefone não cadastrado" });
        continue;
      }
      const resposta = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: destino,
          type: "template",
          template: {
            name: templateName,
            language: { code: "pt_BR" },
            components: [{
              type: "body",
              parameters: [
                { type: "text", text: cotacao.codigo },
                { type: "text", text: cotacao.descricao },
                { type: "text", text: numero(cotacao.quantidade).toLocaleString("pt-BR") },
                { type: "text", text: cotacao.unidade },
              ],
            }],
          },
        }),
      });
      const corpo = await resposta.json() as { messages?: Array<{ id: string }>; error?: { message?: string } };
      if (!resposta.ok || !corpo.messages?.[0]?.id) {
        resultados.push({ fornecedor: proposta.fornecedor.nome, enviada: false, erro: corpo.error?.message || `HTTP ${resposta.status}` });
        continue;
      }
      await this.prisma.cotacaoFornecedor.update({ where: { id: proposta.id }, data: { whatsappMensagemId: corpo.messages[0].id, enviadaEm: new Date() } });
      resultados.push({ fornecedor: proposta.fornecedor.nome, enviada: true, mensagemId: corpo.messages[0].id });
    }
    return { codigo, resultados };
  }

  validarAssinatura(rawBody: Buffer | undefined, assinatura: string | undefined) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret || !rawBody || !assinatura) throw new UnauthorizedException("Assinatura do webhook ausente.");
    const esperada = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    const recebidaBuffer = Buffer.from(assinatura);
    const esperadaBuffer = Buffer.from(esperada);
    if (recebidaBuffer.length !== esperadaBuffer.length || !timingSafeEqual(recebidaBuffer, esperadaBuffer)) {
      throw new UnauthorizedException("Assinatura do webhook inválida.");
    }
  }

  async processarWebhook(payload: any) {
    const mensagens = (payload?.entry || []).flatMap((entry: any) =>
      (entry?.changes || []).flatMap((change: any) => change?.value?.messages || [])
    );
    const resultados = [];
    for (const mensagem of mensagens) {
      const texto = mensagem?.text?.body || mensagem?.button?.text || mensagem?.interactive?.button_reply?.title || "";
      const telefone = telefoneLimpo(mensagem?.from);
      if (!mensagem?.id || !telefone) continue;
      try {
        await this.prisma.webhookWhatsapp.create({ data: { mensagemId: mensagem.id, telefone, texto: texto || null, payload: mensagem as Prisma.InputJsonValue } });
      } catch (error: any) {
        if (error?.code === "P2002") continue;
        throw error;
      }
      const dados = extrairResposta(texto);
      if (!dados) {
        resultados.push({ mensagemId: mensagem.id, processada: false, motivo: "Formato de resposta não reconhecido" });
        continue;
      }
      const cotacao = await this.prisma.cotacao.findUnique({ where: { codigo: dados.codigo }, include: { propostas: { include: { fornecedor: true } } } });
      const proposta = cotacao?.propostas.find(item => telefoneLimpo(item.fornecedor.telefone) === telefone);
      if (!cotacao || !proposta) {
        resultados.push({ mensagemId: mensagem.id, processada: false, motivo: "Cotação ou fornecedor não localizado" });
        continue;
      }
      await this.registrarResposta(cotacao.codigo, {
        fornecedorId: proposta.fornecedorId,
        precoUnitario: dados.precoUnitario,
        frete: dados.frete,
        prazoDias: dados.prazoDias,
        condicoes: dados.condicoes,
        formaPagamento: dados.formaPagamento,
        impostoIncluso: dados.impostoIncluso,
        respostaOriginal: texto,
      }, "WHATSAPP");
      resultados.push({ mensagemId: mensagem.id, processada: true, cotacao: cotacao.codigo });
    }
    return { recebidas: mensagens.length, resultados };
  }

  private apresentar(cotacao: any) {
    const quantidade = numero(cotacao.quantidade);
    const propostas = cotacao.propostas.map((p: any) => ({
      id: p.id,
      fornecedorId: p.fornecedorId,
      fornecedor: p.fornecedor.nome,
      telefone: p.fornecedor.telefone,
      precoUnitario: p.precoUnitario == null ? null : numero(p.precoUnitario),
      frete: p.frete == null ? 0 : numero(p.frete),
      prazoDias: p.prazoDias,
      condicoes: p.condicoes,
      formaPagamento: p.formaPagamento ?? p.condicoes,
      impostoIncluso: p.impostoIncluso,
      origemResposta: p.origemResposta,
      enviadaEm: p.enviadaEm,
      respondidaEm: p.respondidaEm,
      total: p.precoUnitario == null ? null : numero(p.precoUnitario) * quantidade + numero(p.frete),
    }));
    const respondidas = propostas.filter((p: any) => p.total != null).sort((a: any, b: any) => a.total - b.total || (a.prazoDias ?? 999) - (b.prazoDias ?? 999));
    const melhor = respondidas[0] || null;
    return {
      id: cotacao.id,
      codigo: cotacao.codigo,
      item: cotacao.descricao,
      quantidade,
      unidade: cotacao.unidade,
      insumoCodigo: cotacao.insumoCodigo,
      estoqueAtual: cotacao.estoqueAtual == null ? null : numero(cotacao.estoqueAtual),
      estoqueMinimo: cotacao.estoqueMinimo == null ? null : numero(cotacao.estoqueMinimo),
      status: cotacao.status.toLowerCase(),
      propostas,
      melhor,
      criadoEm: cotacao.criadoEm,
      atualizadoEm: cotacao.atualizadoEm,
    };
  }
}
