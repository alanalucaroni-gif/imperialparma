import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "node:crypto";
import { EntradaOrigem, LogisticaPedidoStatus, MovimentacaoTipo, PedidoStatus, Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { IntegracoesService } from "./integracoes.service.js";

type EventoIfood = {
  id?: string;
  code?: string;
  orderId?: string;
  merchantId?: string;
  metadata?: { orderId?: string };
  [chave: string]: unknown;
};

type ItemIfood = {
  id?: string;
  externalCode?: string;
  name?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  options?: ItemIfood[];
};

type PedidoIfood = {
  id: string;
  displayId?: string;
  orderType?: string;
  customer?: { name?: string; phone?: { number?: string } };
  items?: ItemIfood[];
  total?: { orderAmount?: number; deliveryFee?: number };
  payments?: { methods?: Array<{ method?: string; type?: string }> };
  delivery?: {
    deliveryAddress?: {
      formattedAddress?: string;
      streetName?: string;
      streetNumber?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      complement?: string;
      reference?: string;
    };
  };
};

const CODIGOS_CONFIRMAR = new Set(["PLC", "PLACED"]);
const CODIGOS_CONFIRMADOS = new Set(["CFM", "CONFIRMED"]);
const CODIGOS_PRONTO = new Set(["RTP", "READY_TO_PICKUP", "READY_FOR_PICKUP"]);
const CODIGOS_EM_ROTA = new Set(["DSP", "DISPATCHED"]);
const CODIGOS_ENTREGUE = new Set(["CON", "CONCLUDED", "DELIVERED"]);
const CODIGOS_CANCELADO = new Set(["CAN", "CANCELLED", "CANCELED"]);

const numero = (valor: unknown) => Number(valor || 0);
const texto = (valor: unknown) => typeof valor === "string" ? valor.trim() : "";
const arredondar = (valor: number) => Number(valor.toFixed(3));

@Injectable()
export class IfoodPedidosService {
  private readonly logger = new Logger(IfoodPedidosService.name);
  private tokenCache: { valor: string; expiraEm: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly integracoes: IntegracoesService,
  ) {}

  async registrarEvento(payload: EventoIfood) {
    const codigo = texto(payload.code).toUpperCase();
    const pedidoIdExterno = texto(payload.orderId || payload.metadata?.orderId);
    if (!codigo || !pedidoIdExterno) return { registrado: false };

    const id = texto(payload.id) || createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");

    const existente = await this.prisma.ifoodEvento.findUnique({ where: { id } });
    await this.prisma.ifoodEvento.upsert({
      where: { id },
      create: {
        id,
        codigo,
        pedidoIdExterno,
        payload: payload as Prisma.InputJsonValue,
        status: "PENDENTE",
      },
      update: {
        payload: payload as Prisma.InputJsonValue,
        ...(existente?.status === "CONCLUIDO" ? {} : { status: "PENDENTE", erro: null }),
      },
    });

    setImmediate(() => {
      void this.processarEvento(id).catch((erro) => {
        this.logger.error(`Falha ao processar evento iFood ${id}: ${erro instanceof Error ? erro.message : erro}`);
      });
    });
    return { registrado: true, id };
  }

  private async processarEvento(id: string) {
    const reservado = await this.prisma.ifoodEvento.updateMany({
      where: { id, status: { in: ["PENDENTE", "ERRO"] } },
      data: { status: "PROCESSANDO", tentativas: { increment: 1 }, erro: null },
    });
    if (!reservado.count) return;

    const evento = await this.prisma.ifoodEvento.findUniqueOrThrow({ where: { id } });
    try {
      if (CODIGOS_CONFIRMAR.has(evento.codigo)) {
        await this.confirmarPedido(evento.pedidoIdExterno);
      } else if (CODIGOS_CONFIRMADOS.has(evento.codigo)) {
        const pedido = await this.obterPedido(evento.pedidoIdExterno);
        await this.registrarPedidoConfirmado(pedido);
      } else {
        await this.sincronizarStatus(evento.pedidoIdExterno, evento.codigo);
      }
      await this.prisma.ifoodEvento.update({
        where: { id },
        data: { status: "CONCLUIDO", processadoEm: new Date(), erro: null },
      });
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      await this.prisma.ifoodEvento.update({
        where: { id },
        data: { status: "ERRO", erro: mensagem.slice(0, 2000) },
      });
      throw erro;
    }
  }

  private async credenciais() {
    const registro = await this.prisma.credencialIntegracao.findUnique({
      where: { plataforma: "ifood" },
      select: { identificador: true },
    });
    const clientId = process.env.IFOOD_CLIENT_ID?.trim() || registro?.identificador?.trim();
    const clientSecret = process.env.IFOOD_CLIENT_SECRET?.trim()
      || process.env.IFOOD_WEBHOOK_CLIENT_SECRET?.trim()
      || await this.integracoes.obterToken("ifood");
    if (!clientId || !clientSecret) {
      throw new Error("Configure clientId e clientSecret do iFood antes de receber pedidos.");
    }
    return { clientId, clientSecret };
  }

  private async token() {
    if (this.tokenCache && this.tokenCache.expiraEm > Date.now() + 60_000) return this.tokenCache.valor;
    const { clientId, clientSecret } = await this.credenciais();
    const corpo = new URLSearchParams({
      grantType: "client_credentials",
      clientId,
      clientSecret,
    });
    const resposta = await fetch(
      process.env.IFOOD_AUTH_URL || "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: corpo,
        signal: AbortSignal.timeout(10_000),
      },
    );
    const dados = await resposta.json().catch(() => ({})) as { accessToken?: string; expiresIn?: number; error?: string };
    if (!resposta.ok || !dados.accessToken) {
      throw new Error(dados.error || `O iFood recusou a autenticação (HTTP ${resposta.status}).`);
    }
    this.tokenCache = {
      valor: dados.accessToken,
      expiraEm: Date.now() + Math.max(60, numero(dados.expiresIn) || 3600) * 1000,
    };
    return dados.accessToken;
  }

  private async requisitar(caminho: string, init?: RequestInit) {
    const token = await this.token();
    const resposta = await fetch(
      `${process.env.IFOOD_API_URL || "https://merchant-api.ifood.com.br"}${caminho}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
        signal: AbortSignal.timeout(12_000),
      },
    );
    if (!resposta.ok) {
      const corpo = await resposta.text().catch(() => "");
      throw new Error(`iFood respondeu HTTP ${resposta.status}: ${corpo.slice(0, 500)}`);
    }
    return resposta;
  }

  private async confirmarPedido(orderId: string) {
    await this.requisitar(`/order/v1.0/orders/${encodeURIComponent(orderId)}/confirm`, {
      method: "POST",
      body: "{}",
    });
  }

  private async obterPedido(orderId: string): Promise<PedidoIfood> {
    const resposta = await this.requisitar(
      `/order/v1.0/orders/${encodeURIComponent(orderId)}`,
      { method: "GET" },
    );
    return resposta.json() as Promise<PedidoIfood>;
  }

  private itensComOpcoes(itens: ItemIfood[]): ItemIfood[] {
    return itens.flatMap((item) => [item, ...this.itensComOpcoes(item.options || [])]);
  }

  private enderecoPedido(pedido: PedidoIfood) {
    const endereco = pedido.delivery?.deliveryAddress;
    if (!endereco) return null;
    const completo = texto(endereco.formattedAddress) || [
      texto(endereco.streetName),
      texto(endereco.streetNumber),
      texto(endereco.neighborhood),
      texto(endereco.city),
      texto(endereco.state),
      texto(endereco.postalCode),
    ].filter(Boolean).join(", ");
    return completo ? {
      completo,
      bairro: texto(endereco.neighborhood) || "Não informado",
      complemento: texto(endereco.complement),
      referencia: texto(endereco.reference),
    } : null;
  }

  private async registrarPedidoConfirmado(pedidoIfood: PedidoIfood) {
    const codigo = texto(pedidoIfood.displayId) || pedidoIfood.id;
    const itens = this.itensComOpcoes(pedidoIfood.items || []).filter((item) => numero(item.quantity) > 0);
    if (!itens.length) throw new Error("O pedido confirmado não possui itens para registrar.");

    await this.prisma.$transaction(async (tx) => {
      const existente = await tx.pedido.findFirst({
        where: { OR: [{ idExterno: pedidoIfood.id }, { codigo }] },
      });
      if (existente) return;

      const receitas = [];
      for (const item of itens) {
        const externalCode = texto(item.externalCode);
        const nome = texto(item.name);
        const receita = await tx.receita.findFirst({
          where: {
            ativo: true,
            OR: [
              ...(externalCode ? [
                { codigo: { equals: externalCode, mode: "insensitive" as const } },
                { produtoFinal: { is: { codigo: { equals: externalCode, mode: "insensitive" as const } } } },
              ] : []),
              ...(nome ? [
                { nome: { equals: nome, mode: "insensitive" as const } },
                { produtoFinal: { is: { nome: { equals: nome, mode: "insensitive" as const } } } },
              ] : []),
            ],
          },
          include: { itens: { include: { insumo: true } } },
        });
        if (!receita) {
          throw new Error(`Produto do iFood sem ficha técnica vinculada: ${nome || externalCode || item.id}.`);
        }
        receitas.push({ item, receita });
      }

      const pedido = await tx.pedido.create({
        data: {
          codigo,
          idExterno: pedidoIfood.id,
          clienteNome: texto(pedidoIfood.customer?.name) || "Cliente iFood",
          endereco: this.enderecoPedido(pedidoIfood)?.completo || null,
          formaPagamento: texto(pedidoIfood.payments?.methods?.[0]?.method)
            || texto(pedidoIfood.payments?.methods?.[0]?.type)
            || "iFood",
          canal: "iFood",
          valorTotal: numero(pedidoIfood.total?.orderAmount)
            || itens.reduce((total, item) => total + numero(item.totalPrice), 0),
          status: PedidoStatus.EM_PREPARO,
          itens: {
            create: itens.map((item) => ({
              produto: texto(item.name) || texto(item.externalCode) || "Item iFood",
              quantidade: numero(item.quantity),
              valorUnitario: numero(item.unitPrice)
                || (numero(item.totalPrice) / Math.max(1, numero(item.quantity))),
            })),
          },
        },
      });

      const consumos = new Map<string, { quantidade: number; nome: string }>();
      for (const { item, receita } of receitas) {
        const rendimento = numero(receita.rendimento);
        if (rendimento <= 0) throw new Error(`A ficha técnica ${receita.nome} está com rendimento inválido.`);
        const fator = numero(item.quantity) / rendimento;
        for (const ingrediente of receita.itens) {
          if (!ingrediente.insumoId || !ingrediente.insumo?.ativo) {
            throw new Error(`Vincule todos os ingredientes de ${receita.nome} ao estoque.`);
          }
          const quantidade = arredondar(numero(ingrediente.quantidade) * fator);
          const atual = consumos.get(ingrediente.insumoId);
          consumos.set(ingrediente.insumoId, {
            quantidade: arredondar((atual?.quantidade || 0) + quantidade),
            nome: ingrediente.insumo.nome,
          });
        }
      }

      for (const [insumoId, consumo] of consumos) {
        if (consumo.quantidade <= 0) continue;
        const insumo = await tx.insumo.findUniqueOrThrow({ where: { id: insumoId } });
        const saldoAnterior = numero(insumo.quantidade);
        const atualizado = await tx.insumo.updateMany({
          where: { id: insumoId, quantidade: { gte: consumo.quantidade } },
          data: { quantidade: { decrement: consumo.quantidade } },
        });
        if (!atualizado.count) {
          throw new Error(`Estoque insuficiente de ${consumo.nome} para confirmar o pedido ${codigo}.`);
        }
        const saldoPosterior = arredondar(saldoAnterior - consumo.quantidade);
        await tx.movimentacao.create({
          data: {
            insumoId,
            tipo: MovimentacaoTipo.SAIDA,
            origem: EntradaOrigem.VENDA,
            quantidade: -consumo.quantidade,
            saldoAnterior,
            saldoPosterior,
            custoUnitario: insumo.custoUnitario,
            referenciaId: pedido.id,
            descricao: `Baixa automática do pedido iFood ${codigo}`,
          },
        });
      }

      const endereco = this.enderecoPedido(pedidoIfood);
      if (endereco) {
        const configuracao = await tx.logisticaConfiguracao.findUnique({ where: { id: "principal" } });
        const origem = configuracao?.enderecoOrigem
          || "Rua Assis Figueiredo, 555, Loja 2, Centro, Poços de Caldas - MG";
        const entrega = await tx.logisticaPedido.create({
          data: {
            idExterno: pedidoIfood.id,
            codigoPedido: codigo,
            clienteNome: texto(pedidoIfood.customer?.name) || "Cliente iFood",
            clienteTelefone: texto(pedidoIfood.customer?.phone?.number) || null,
            endereco: endereco.completo,
            complemento: endereco.complemento || null,
            referencia: endereco.referencia || null,
            bairro: endereco.bairro,
            canal: "iFood",
            formaPagamento: texto(pedidoIfood.payments?.methods?.[0]?.method) || "iFood",
            valorPedido: numero(pedidoIfood.total?.orderAmount),
            taxaEntregaCliente: numero(pedidoIfood.total?.deliveryFee),
            distanciaKm: 0,
            enderecoOrigem: origem,
            tipoCalculoDistancia: configuracao?.tipoCalculoDistancia || "ida",
            origemDistancia: "IFOOD",
            custoEstimado: 0,
            origem: "IFOOD",
            status: LogisticaPedidoStatus.EM_PREPARO,
          },
        });
        await tx.logisticaPedidoEtapa.create({
          data: {
            pedidoId: entrega.id,
            status: LogisticaPedidoStatus.EM_PREPARO,
            descricao: "Pedido iFood confirmado automaticamente e enviado à logística.",
            dados: { pedidoId: pedido.id, orderId: pedidoIfood.id },
          },
        });
      }
    }, { timeout: 20_000 });
  }

  private async sincronizarStatus(orderId: string, codigoEvento: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { idExterno: orderId } });
    const entrega = await this.prisma.logisticaPedido.findFirst({
      where: { canal: "iFood", idExterno: orderId },
    });

    let statusLogistica: LogisticaPedidoStatus | null = null;
    let statusPedido: PedidoStatus | null = null;
    if (CODIGOS_PRONTO.has(codigoEvento)) statusLogistica = LogisticaPedidoStatus.PRONTO;
    if (CODIGOS_EM_ROTA.has(codigoEvento)) {
      statusLogistica = LogisticaPedidoStatus.EM_ROTA;
      statusPedido = PedidoStatus.SAIU_ENTREGA;
    }
    if (CODIGOS_ENTREGUE.has(codigoEvento)) {
      statusLogistica = LogisticaPedidoStatus.ENTREGUE;
      statusPedido = PedidoStatus.ENTREGUE;
    }
    if (CODIGOS_CANCELADO.has(codigoEvento)) {
      statusLogistica = LogisticaPedidoStatus.CANCELADO;
      statusPedido = PedidoStatus.CANCELADO;
    }

    await this.prisma.$transaction(async (tx) => {
      if (pedido && statusPedido) {
        await tx.pedido.update({ where: { id: pedido.id }, data: { status: statusPedido } });
      }
      if (entrega && statusLogistica && entrega.status !== statusLogistica) {
        await tx.logisticaPedido.update({
          where: { id: entrega.id },
          data: {
            status: statusLogistica,
            ...(statusLogistica === LogisticaPedidoStatus.EM_ROTA ? { saiuEntregaEm: new Date(), coletadoEm: new Date() } : {}),
            ...(statusLogistica === LogisticaPedidoStatus.ENTREGUE ? { entregueEm: new Date() } : {}),
            ...(statusLogistica === LogisticaPedidoStatus.CANCELADO ? { canceladoEm: new Date() } : {}),
          },
        });
        await tx.logisticaPedidoEtapa.create({
          data: {
            pedidoId: entrega.id,
            status: statusLogistica,
            descricao: `Status sincronizado automaticamente pelo iFood (${codigoEvento}).`,
          },
        });
      }
    });
  }
}
