import {
  BadRequestException,
  Optional,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LogisticaPedidoStatus } from "../generated/prisma/enums.js";
import { IntegracoesService, type WhatsappMetaConfiguracao } from "../integracoes/integracoes.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AtualizarEtapaEntregadorDto,
  RegistrarLocalizacaoLogisticaDto,
} from "./logistica.dto.js";
import { LogisticaOperacaoService } from "./logistica-operacao.service.js";

type FinalidadeLink = "entregador" | "rastreio";

type LinkLogisticaPayload = {
  sub: string;
  finalidade: FinalidadeLink;
  entregadorId?: string;
};

const STATUS_FINAIS = new Set<LogisticaPedidoStatus>([
  LogisticaPedidoStatus.ENTREGUE,
  LogisticaPedidoStatus.CANCELADO,
]);

const STATUS_VALOR_LIBERADO = new Set<LogisticaPedidoStatus>([
  LogisticaPedidoStatus.EM_ROTA,
  LogisticaPedidoStatus.NO_DESTINO,
  LogisticaPedidoStatus.ENTREGUE,
  LogisticaPedidoStatus.PROBLEMA,
  LogisticaPedidoStatus.RETORNANDO,
]);

const STATUS_ROTA_ATIVA: LogisticaPedidoStatus[] = [
  LogisticaPedidoStatus.COLETA,
  LogisticaPedidoStatus.NA_LOJA,
  LogisticaPedidoStatus.EM_ROTA,
  LogisticaPedidoStatus.NO_DESTINO,
  LogisticaPedidoStatus.PROBLEMA,
  LogisticaPedidoStatus.RETORNANDO,
];

const FLUXO_ENTREGADOR: Partial<Record<LogisticaPedidoStatus, LogisticaPedidoStatus[]>> = {
  COLETA: [
    LogisticaPedidoStatus.NA_LOJA,
    LogisticaPedidoStatus.EM_ROTA,
    LogisticaPedidoStatus.PROBLEMA,
  ],
  NA_LOJA: [
    LogisticaPedidoStatus.EM_ROTA,
    LogisticaPedidoStatus.PROBLEMA,
  ],
  EM_ROTA: [
    LogisticaPedidoStatus.NO_DESTINO,
    LogisticaPedidoStatus.ENTREGUE,
    LogisticaPedidoStatus.PROBLEMA,
  ],
  NO_DESTINO: [
    LogisticaPedidoStatus.ENTREGUE,
    LogisticaPedidoStatus.PROBLEMA,
  ],
  PROBLEMA: [
    LogisticaPedidoStatus.EM_ROTA,
    LogisticaPedidoStatus.RETORNANDO,
  ],
  RETORNANDO: [
    LogisticaPedidoStatus.ENTREGUE,
    LogisticaPedidoStatus.PROBLEMA,
  ],
};

export function podeAtualizarStatusEntregador(
  atual: LogisticaPedidoStatus,
  proximo: LogisticaPedidoStatus,
) {
  return atual === proximo || (FLUXO_ENTREGADOR[atual] || []).includes(proximo);
}

const descricoesEtapas: Partial<Record<LogisticaPedidoStatus, string>> = {
  NA_LOJA: "Entregador chegou à loja.",
  EM_ROTA: "Pedido coletado e saiu para entrega.",
  NO_DESTINO: "Entregador chegou ao destino.",
  ENTREGUE: "Entrega confirmada pelo entregador.",
  PROBLEMA: "Entregador informou um problema.",
  RETORNANDO: "Entregador está retornando à loja.",
};

@Injectable()
export class LogisticaRastreamentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly operacao: LogisticaOperacaoService,
    @Optional()
    private readonly integracoes?: IntegracoesService,
  ) {}

  async gerarLinksTemporarios(pedidoId: string, origemRequisicao?: string) {
    const pedido = await this.prisma.logisticaPedido.findUnique({
      where: { id: pedidoId },
      include: { entregador: true },
    });
    if (!pedido) throw new NotFoundException("Pedido logístico não encontrado.");
    if (!pedido.entregadorId || !pedido.entregador) {
      throw new BadRequestException("Selecione o entregador antes de gerar os links.");
    }
    if (STATUS_FINAIS.has(pedido.status)) {
      throw new BadRequestException("A entrega já foi finalizada.");
    }

    const [tokenEntregador, tokenRastreio] = await Promise.all([
      this.assinar({
        sub: pedido.id,
        finalidade: "entregador",
        entregadorId: pedido.entregadorId,
      }, 48 * 60 * 60),
      this.assinar({
        sub: pedido.id,
        finalidade: "rastreio",
      }, 7 * 24 * 60 * 60),
    ]);
    const origem = this.origemWeb(origemRequisicao);
    const links = {
      pedidoId: pedido.id,
      codigoPedido: pedido.codigoPedido,
      entregador: pedido.entregador.nome,
      entregadorUrl: `${origem}/entregador/${encodeURIComponent(tokenEntregador)}`,
      rastreioUrl: `${origem}/rastreio/${encodeURIComponent(tokenRastreio)}`,
      entregadorExpiraEm: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      rastreioExpiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const envios = await this.enviarLinksAutomaticamente(pedido, links);
    return { ...links, envios };

  }

  async obterPainelEntregador(token: string) {
    const { pedido } = await this.pedidoDoToken(token, "entregador");
    const pedidosRota = pedido.rotaId
      ? await this.prisma.logisticaPedido.findMany({
          where: {
            rotaId: pedido.rotaId,
            entregadorId: pedido.entregadorId,
            status: { not: LogisticaPedidoStatus.CANCELADO },
          },
          orderBy: [{ ordemNaRota: "asc" }, { criadoEm: "asc" }],
          select: {
            id: true,
            codigoPedido: true,
            bairro: true,
            endereco: true,
            status: true,
            ordemNaRota: true,
            custoEstimado: true,
            custoReal: true,
          },
        })
      : [pedido];
    const rotaPedidos = pedidosRota.map((item: any) => ({
      id: item.id,
      codigoPedido: item.codigoPedido,
      bairro: item.bairro,
      endereco: item.endereco,
      status: item.status,
      ordemNaRota: item.ordemNaRota || 1,
      valorCorrida: STATUS_VALOR_LIBERADO.has(item.status)
        ? Number(item.custoReal ?? item.custoEstimado)
        : null,
    }));
    return {
      codigoPedido: pedido.codigoPedido,
      status: pedido.status,
      clienteNome: pedido.clienteNome,
      clienteTelefone: pedido.clienteTelefone,
      endereco: pedido.endereco,
      complemento: pedido.complemento,
      referencia: pedido.referencia,
      bairro: pedido.bairro,
      formaPagamento: pedido.formaPagamento,
      valorPedido: Number(pedido.valorPedido),
      taxaEntregaCliente: Number(pedido.taxaEntregaCliente),
      distanciaKm: Number(pedido.distanciaKm),
      valorCorrida: STATUS_VALOR_LIBERADO.has(pedido.status)
        ? Number(pedido.custoReal ?? pedido.custoEstimado)
        : null,
      observacoes: pedido.observacoes,
      entregador: {
        nome: pedido.entregador!.nome,
        empresa: pedido.entregador!.empresa,
      },
      navegacaoUrl: this.urlNavegacao(pedido),
      ultimaLocalizacao: this.serializarLocalizacao(pedido.localizacoes[0]),
      rotaId: pedido.rotaId,
      ordemNaRota: pedido.ordemNaRota || 1,
      rotaPedidos,
      totalRota: rotaPedidos.reduce((soma: number, item: any) => soma + Number(item.valorCorrida || 0), 0),
      historico: pedido.etapas.map((etapa) => ({
        status: etapa.status,
        descricao: etapa.descricao,
        em: etapa.criadoEm,
      })),
      atualizadoEm: pedido.atualizadoEm,
      atribuidoEm: pedido.atribuidoEm,
      chegouLojaEm: pedido.chegouLojaEm,
      saiuEntregaEm: pedido.saiuEntregaEm,
      chegouDestinoEm: pedido.chegouDestinoEm,
      entregueEm: pedido.entregueEm,
    };
  }

  async obterRastreioCliente(token: string) {
    const { pedido } = await this.pedidoDoToken(token, "rastreio");
    return {
      codigoPedido: pedido.codigoPedido,
      status: pedido.status,
      bairro: pedido.bairro,
      distanciaKm: Number(pedido.distanciaKm),
      duracaoEstimadaMinutos: pedido.duracaoEstimadaMinutos,
      entregador: pedido.entregador ? {
        nome: pedido.entregador.nome,
        empresa: pedido.entregador.empresa,
      } : null,
      ultimaLocalizacao: STATUS_FINAIS.has(pedido.status)
        ? null
        : this.serializarLocalizacao(pedido.localizacoes[0]),
      historico: pedido.etapas.map((etapa) => ({
        status: etapa.status,
        em: etapa.criadoEm,
      })),
      atualizadoEm: pedido.atualizadoEm,
      atribuidoEm: pedido.atribuidoEm,
      chegouLojaEm: pedido.chegouLojaEm,
      saiuEntregaEm: pedido.saiuEntregaEm,
      chegouDestinoEm: pedido.chegouDestinoEm,
      entregueEm: pedido.entregueEm,
    };
  }

  async registrarLocalizacao(
    token: string,
    dto: RegistrarLocalizacaoLogisticaDto,
  ) {
    const { payload, pedido } = await this.pedidoDoToken(token, "entregador");
    if (STATUS_FINAIS.has(pedido.status)) {
      throw new BadRequestException("Esta entrega já foi finalizada.");
    }
    const ultimaLocalizacao = pedido.localizacoes[0];
    if (
      ultimaLocalizacao
      && Date.now() - ultimaLocalizacao.registradoEm.getTime() < 5_000
    ) {
      return {
        registrado: false,
        ignorado: "INTERVALO_MINIMO",
        localizacao: this.serializarLocalizacao(ultimaLocalizacao),
      };
    }
    const pedidosDaRota = pedido.rotaId
      ? await this.prisma.logisticaPedido.findMany({
          where: {
            rotaId: pedido.rotaId,
            entregadorId: payload.entregadorId,
            status: { in: STATUS_ROTA_ATIVA },
          },
          select: { id: true },
        })
      : [{ id: pedido.id }];
    const registradoEm = new Date();
    await this.prisma.logisticaLocalizacao.createMany({
      data: pedidosDaRota.map((item: { id: string }) => ({
        pedidoId: item.id,
        entregadorId: payload.entregadorId!,
        latitude: dto.latitude,
        longitude: dto.longitude,
        precisaoMetros: dto.precisaoMetros,
        velocidadeKmh: dto.velocidadeKmh,
        direcaoGraus: dto.direcaoGraus,
        registradoEm,
      })),
    });
    return {
      registrado: true,
      localizacao: this.serializarLocalizacao({ ...dto, registradoEm }),
    };
  }

  async atualizarEtapa(token: string, dto: AtualizarEtapaEntregadorDto) {
    const { payload, pedido } = await this.pedidoDoToken(token, "entregador");
    if (!podeAtualizarStatusEntregador(pedido.status, dto.status)) {
      throw new BadRequestException(
        `O entregador não pode alterar a entrega de ${pedido.status} para ${dto.status}.`,
      );
    }
    const descricao = dto.descricao?.trim()
      || descricoesEtapas[dto.status]
      || "Etapa atualizada pelo entregador.";
    return this.operacao.atualizarStatus(
      pedido.id,
      {
        status: dto.status,
        descricao,
        ...(dto.status === LogisticaPedidoStatus.PROBLEMA
          ? { ocorrencia: descricao }
          : {}),
      },
      `entregador:${payload.entregadorId}`,
    );
  }

  private async pedidoDoToken(token: string, finalidade: FinalidadeLink) {
    const payload = await this.verificar(token, finalidade);
    const pedido = await this.prisma.logisticaPedido.findUnique({
      where: { id: payload.sub },
      include: {
        entregador: true,
        etapas: { orderBy: { criadoEm: "asc" } },
        localizacoes: { orderBy: { registradoEm: "desc" }, take: 1 },
      },
    });
    if (!pedido) throw new NotFoundException("Entrega não encontrada.");
    if (
      finalidade === "entregador"
      && (!payload.entregadorId || pedido.entregadorId !== payload.entregadorId)
    ) {
      throw new UnauthorizedException("Este link não pertence ao entregador atual.");
    }
    return { payload, pedido };
  }

  private async assinar(payload: LinkLogisticaPayload, expiresIn: number) {
    return this.jwt.signAsync(payload, {
      secret: this.segredo(),
      expiresIn,
    });
  }

  private async verificar(token: string, finalidade: FinalidadeLink) {
    try {
      const payload = await this.jwt.verifyAsync<LinkLogisticaPayload>(token, {
        secret: this.segredo(),
      });
      if (payload.finalidade !== finalidade || !payload.sub) {
        throw new Error("finalidade inválida");
      }
      return payload;
    } catch {
      throw new UnauthorizedException("Link inválido ou expirado.");
    }
  }
  private async enviarLinksAutomaticamente(pedido: any, links: {
    entregadorUrl: string;
    rastreioUrl: string;
  }) {
    if (!this.integracoes) {
      return {
        entregador: { status: "NAO_CONFIGURADO" },
        cliente: { status: "NAO_CONFIGURADO" },
      };
    }
    let configuracao: WhatsappMetaConfiguracao | null = null;
    try {
      configuracao = await this.integracoes.obterWhatsappConfiguracao();
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Configuração indisponível.";
      return {
        entregador: { status: "FALHA_CONFIGURACAO", mensagem },
        cliente: { status: "FALHA_CONFIGURACAO", mensagem },
      };
    }
    if (!configuracao) {
      return {
        entregador: { status: "NAO_CONFIGURADO" },
        cliente: { status: "NAO_CONFIGURADO" },
      };
    }

    const [entregador, cliente] = await Promise.all([
      this.enviarLinkWhatsapp({
        pedido,
        configuracao,
        destinatario: "entregador",
        nome: pedido.entregador.nome,
        telefone: pedido.entregador.telefone,
        link: links.entregadorUrl,
        enviadoEm: pedido.linkEntregadorEnviadoEm,
      }),
      this.enviarLinkWhatsapp({
        pedido,
        configuracao,
        destinatario: "cliente",
        nome: pedido.clienteNome,
        telefone: pedido.clienteTelefone,
        link: links.rastreioUrl,
        enviadoEm: pedido.linkClienteEnviadoEm,
      }),
    ]);
    return { entregador, cliente };
  }

  private async enviarLinkWhatsapp({
    pedido,
    configuracao,
    destinatario,
    nome,
    telefone,
    link,
    enviadoEm,
  }: {
    pedido: any;
    configuracao: WhatsappMetaConfiguracao;
    destinatario: "entregador" | "cliente";
    nome: string;
    telefone?: string | null;
    link: string;
    enviadoEm?: Date | null;
  }) {
    if (enviadoEm) return { status: "JA_ENVIADO", enviadoEm };
    const numero = this.normalizarTelefone(telefone);
    const campoData = destinatario === "entregador"
      ? "linkEntregadorEnviadoEm"
      : "linkClienteEnviadoEm";
    const campoFalha = destinatario === "entregador"
      ? "falhaEnvioEntregador"
      : "falhaEnvioCliente";
    if (!numero) {
      const mensagem = `Telefone do ${destinatario} não informado.`;
      await this.prisma.logisticaPedido.update({
        where: { id: pedido.id },
        data: { [campoFalha]: mensagem },
      });
      return { status: "SEM_TELEFONE", mensagem };
    }
    try {
      const resposta = await fetch(
        `https://graph.facebook.com/${configuracao.graphVersion}/${configuracao.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${configuracao.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: numero,
            type: "template",
            template: {
              name: configuracao.logisticaTemplateName,
              language: { code: configuracao.templateLanguage },
              components: [{
                type: "body",
                parameters: [
                  { type: "text", text: nome },
                  { type: "text", text: pedido.codigoPedido },
                  { type: "text", text: link },
                ],
              }],
            },
          }),
          signal: AbortSignal.timeout(12_000),
        },
      );
      const corpo = await resposta.json().catch(() => ({})) as any;
      if (!resposta.ok) {
        throw new Error(corpo?.error?.message || `A Meta respondeu HTTP ${resposta.status}.`);
      }
      const agora = new Date();
      await this.prisma.logisticaPedido.update({
        where: { id: pedido.id },
        data: { [campoData]: agora, [campoFalha]: null },
      });
      return { status: "ENVIADO", enviadoEm: agora, mensagemId: corpo?.messages?.[0]?.id || null };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Falha ao enviar pelo WhatsApp.";
      await this.prisma.logisticaPedido.update({
        where: { id: pedido.id },
        data: { [campoFalha]: mensagem.slice(0, 500) },
      });
      return { status: "FALHA", mensagem };
    }
  }

  private normalizarTelefone(telefone?: string | null) {
    const digitos = String(telefone || "").replace(/\D/g, "");
    if (!digitos) return null;
    return digitos.length === 10 || digitos.length === 11 ? `55${digitos}` : digitos;
  }


  private segredo() {
    return process.env.LOGISTICA_LINK_SECRET
      || process.env.JWT_SECRET
      || "dev-logistica-link-secret-change-me";
  }

  private origemWeb(origemRequisicao?: string) {
    const configurada = process.env.PUBLIC_WEB_URL
      || process.env.WEB_ORIGIN?.split(",")[0]
      || origemRequisicao
      || "http://localhost:5173";
    return configurada.trim().replace(/\/$/, "");
  }

  private serializarLocalizacao(localizacao?: any) {
    if (!localizacao) return null;
    return {
      latitude: Number(localizacao.latitude),
      longitude: Number(localizacao.longitude),
      precisaoMetros: localizacao.precisaoMetros,
      velocidadeKmh: localizacao.velocidadeKmh,
      direcaoGraus: localizacao.direcaoGraus,
      registradoEm: localizacao.registradoEm,
    };
  }

  private urlNavegacao(pedido: {
    endereco: string;
    complemento: string | null;
    bairro: string;
  }) {
    const destino = [
      pedido.endereco,
      pedido.complemento,
      pedido.bairro,
      "Poços de Caldas - MG",
    ].filter(Boolean).join(", ");
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=two-wheeler`;
  }
}
