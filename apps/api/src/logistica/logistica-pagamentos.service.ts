import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  LogisticaOrdemPagamentoStatus,
  LogisticaPedidoStatus,
} from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  GerarOrdensPagamentoLogisticaDto,
  ListarOrdensPagamentoLogisticaDto,
} from "./logistica.dto.js";

@Injectable()
export class LogisticaPagamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async gerar(dto: GerarOrdensPagamentoLogisticaDto, usuarioId: string) {
    const periodo = this.periodo(dto.data);
    const pedidos = await this.prisma.logisticaPedido.findMany({
      where: {
        status: LogisticaPedidoStatus.ENTREGUE,
        entregueEm: { gte: periodo.inicio, lt: periodo.fim },
        entregadorId: { not: null },
      },
      include: {
        entregador: true,
        ordemPagamentoItem: { select: { ordemPagamentoId: true } },
      },
      orderBy: { entregueEm: "asc" },
    });

    const grupos = new Map<string, typeof pedidos>();
    for (const pedido of pedidos) {
      const itens = grupos.get(pedido.entregadorId!) || [];
      itens.push(pedido);
      grupos.set(pedido.entregadorId!, itens);
    }

    const ordens = [];
    for (const [entregadorId, itens] of grupos) {
      const existente = await this.prisma.logisticaOrdemPagamento.findUnique({
        where: {
          entregadorId_dataReferencia: {
            entregadorId,
            dataReferencia: periodo.referencia,
          },
        },
      });
      if (existente?.status === LogisticaOrdemPagamentoStatus.PAGA) {
        ordens.push(existente);
        continue;
      }

      const total = itens.reduce(
        (soma, pedido) => soma + Number(pedido.custoReal ?? pedido.custoEstimado),
        0,
      );
      const totalTaxasCliente = itens.reduce(
        (soma, pedido) => soma + Number(pedido.taxaEntregaCliente),
        0,
      );

      const ordem = await this.prisma.$transaction(async (tx) => {
        const salva = await tx.logisticaOrdemPagamento.upsert({
          where: {
            entregadorId_dataReferencia: {
              entregadorId,
              dataReferencia: periodo.referencia,
            },
          },
          create: {
            codigo: `OP-${dto.data.replace(/-/g, "")}-${entregadorId}`,
            entregadorId,
            dataReferencia: periodo.referencia,
            quantidadeCorridas: itens.length,
            total,
            totalTaxasCliente,
            geradaPorUsuarioId: usuarioId,
          },
          update: {
            quantidadeCorridas: itens.length,
            total,
            totalTaxasCliente,
            geradaPorUsuarioId: usuarioId,
          },
        });
        await tx.logisticaOrdemPagamentoItem.deleteMany({
          where: { ordemPagamentoId: salva.id },
        });
        await tx.logisticaOrdemPagamentoItem.createMany({
          data: itens.map((pedido) => ({
            ordemPagamentoId: salva.id,
            pedidoId: pedido.id,
            valorCorrida: Number(pedido.custoReal ?? pedido.custoEstimado),
            taxaCliente: Number(pedido.taxaEntregaCliente),
          })),
        });
        return salva;
      });
      ordens.push(ordem);
    }

    return {
      data: await this.buscarPorData(periodo.referencia),
      resumo: {
        entregadores: grupos.size,
        corridas: pedidos.length,
        total: pedidos.reduce(
          (soma, pedido) => soma + Number(pedido.custoReal ?? pedido.custoEstimado),
          0,
        ),
      },
    };
  }

  async listar(dto: ListarOrdensPagamentoLogisticaDto) {
    const where: any = {};
    if (dto.status) where.status = dto.status;
    if (dto.dataInicio || dto.dataFim) {
      where.dataReferencia = {
        ...(dto.dataInicio ? { gte: this.periodo(dto.dataInicio).referencia } : {}),
        ...(dto.dataFim ? { lte: this.periodo(dto.dataFim).referencia } : {}),
      };
    }
    const ordens = await this.prisma.logisticaOrdemPagamento.findMany({
      where,
      include: {
        entregador: true,
        itens: {
          include: {
            pedido: {
              select: {
                codigoPedido: true,
                bairro: true,
                entregueEm: true,
              },
            },
          },
          orderBy: { criadoEm: "asc" },
        },
      },
      orderBy: [{ dataReferencia: "desc" }, { criadoEm: "desc" }],
    });
    return { data: ordens.map((ordem) => this.serializar(ordem)) };
  }

  async pagar(id: string, usuarioId: string) {
    const ordem = await this.prisma.logisticaOrdemPagamento.findUnique({
      where: { id },
    });
    if (!ordem) throw new NotFoundException("Ordem de pagamento não encontrada.");
    if (ordem.status === LogisticaOrdemPagamentoStatus.CANCELADA) {
      throw new BadRequestException("Uma ordem cancelada não pode ser paga.");
    }
    await this.prisma.logisticaOrdemPagamento.update({
      where: { id },
      data: {
        status: LogisticaOrdemPagamentoStatus.PAGA,
        pagaPorUsuarioId: usuarioId,
        pagaEm: new Date(),
      },
    });
    return (await this.listar({})).data.find((item: any) => item.id === id);
  }

  private async buscarPorData(dataReferencia: Date) {
    const resultado = await this.listar({
      dataInicio: dataReferencia.toISOString().slice(0, 10),
      dataFim: dataReferencia.toISOString().slice(0, 10),
    });
    return resultado.data;
  }

  private periodo(data: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      throw new BadRequestException("Informe a data no formato AAAA-MM-DD.");
    }
    const inicio = new Date(`${data}T00:00:00-03:00`);
    if (Number.isNaN(inicio.getTime())) throw new BadRequestException("Data inválida.");
    return {
      inicio,
      fim: new Date(inicio.getTime() + 86_400_000),
      referencia: new Date(`${data}T12:00:00.000Z`),
    };
  }

  private serializar(ordem: any) {
    return {
      ...ordem,
      total: Number(ordem.total),
      totalTaxasCliente: Number(ordem.totalTaxasCliente),
      saldoTaxas: Number(ordem.totalTaxasCliente) - Number(ordem.total),
      itens: (ordem.itens || []).map((item: any) => ({
        ...item,
        valorCorrida: Number(item.valorCorrida),
        taxaCliente: Number(item.taxaCliente),
      })),
    };
  }
}
