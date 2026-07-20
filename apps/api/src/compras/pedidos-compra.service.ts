import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CompraStatus, EntradaOrigem, MovimentacaoTipo, Prisma, RecebimentoItemStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CancelarPedidoCompraDto, CriarRecebimentoCompraDto } from "./recebimentos.dto.js";

const n = (valor: unknown) => Number(valor || 0);
const limpo = (valor?: string | null) => valor?.trim() || null;
const dataOuNull = (valor?: string) => valor ? new Date(valor) : null;
const divergente = (situacao: string) => !["PENDENTE", "RECEBIDO_CORRETAMENTE", "RECEBIDO_PARCIALMENTE"].includes(situacao);

@Injectable()
export class PedidosCompraService {
  constructor(private readonly prisma: PrismaService) {}

  async listarRecebimentos() {
    const itens = await this.prisma.recebimentoCompra.findMany({ include: this.incluirRecebimento(), orderBy: { criadoEm: "desc" } });
    return { data: itens.map(item => this.apresentar(item)) };
  }

  async buscarRecebimento(id: string) {
    const item = await this.prisma.recebimentoCompra.findUnique({ where: { id }, include: this.incluirRecebimento() });
    if (!item) throw new NotFoundException("Recebimento não encontrado.");
    return this.apresentar(item);
  }

  async criarRecebimento(pedidoId: string, dto: CriarRecebimentoCompraDto, usuarioId?: string) {
    const pedido = await this.prisma.pedidoCompra.findUnique({ where: { id: pedidoId }, include: { fornecedor: true, itens: true, recebimentos: { include: { itens: true } } } });
    if (!pedido) throw new NotFoundException("Pedido de compra não encontrado.");
    if ([CompraStatus.CANCELADO, CompraStatus.RECEBIDO].includes(pedido.status as any)) throw new BadRequestException("Este pedido não aceita novos recebimentos.");
    const porId = new Map(pedido.itens.map(item => [item.id, item]));
    if (new Set(dto.itens.map(item => item.pedidoCompraItemId)).size !== dto.itens.length) throw new BadRequestException("Um item do pedido foi informado mais de uma vez.");
    for (const recebido of dto.itens) {
      const item = porId.get(recebido.pedidoCompraItemId); if (!item) throw new BadRequestException("Um item não pertence a este pedido.");
      const jaRegistrado = pedido.recebimentos.flatMap(r => r.itens).filter(x => x.pedidoCompraItemId === item.id).reduce((total, x) => total + n(x.quantidadeRecebida) + n(x.quantidadeRecusada), 0);
      if (recebido.quantidadeRecebida + (recebido.quantidadeRecusada || 0) > n(item.quantidade) - jaRegistrado + 0.0001) throw new BadRequestException("A quantidade recebida ultrapassa o saldo do pedido.");
    }
    const temDivergencia = dto.itens.some(item => divergente(item.situacao));
    const recebimento: any = await this.prisma.$transaction(async tx => {
      const criado: any = await tx.recebimentoCompra.create({ data: { pedidoCompraId: pedido.id, fornecedorId: pedido.fornecedorId, numeroNotaFiscal: limpo(dto.numeroNotaFiscal), serieNotaFiscal: limpo(dto.serieNotaFiscal), chaveAcesso: limpo(dto.chaveAcesso)?.replace(/\D/g, "") || null, dataEmissao: dataOuNull(dto.dataEmissao), dataEntrada: dataOuNull(dto.dataEntrada) || new Date(), valorProdutos: dto.valorProdutos, frete: dto.frete, desconto: dto.desconto, impostos: dto.impostos, valorTotal: dto.valorTotal, anexosNota: dto.anexosNota ? JSON.parse(JSON.stringify(dto.anexosNota)) : undefined, observacoes: limpo(dto.observacoes), status: temDivergencia ? CompraStatus.DIVERGENTE : CompraStatus.PENDENTE, criadoPorId: usuarioId, itens: { create: dto.itens.map(recebido => { const item = porId.get(recebido.pedidoCompraItemId)!; return { pedidoCompraItemId: item.id, insumoId: item.insumoId, quantidadePedida: item.quantidade, quantidadeRecebida: recebido.quantidadeRecebida, quantidadeRecusada: recebido.quantidadeRecusada || 0, fatorConversaoEstoque: recebido.fatorConversaoEstoque || 1, unidade: recebido.unidade, lote: limpo(recebido.lote), dataFabricacao: dataOuNull(recebido.dataFabricacao), dataValidade: dataOuNull(recebido.dataValidade), valorUnitarioRecebido: recebido.valorUnitarioRecebido, marcaRecebida: limpo(recebido.marcaRecebida), situacao: recebido.situacao as RecebimentoItemStatus, observacoes: limpo(recebido.observacoes) }; }) } }, include: this.incluirRecebimento() });
      await tx.pedidoCompra.update({ where: { id: pedido.id }, data: { status: temDivergencia ? CompraStatus.DIVERGENTE : CompraStatus.CONFIRMADO } });
      await tx.compraAuditoria.create({ data: { entidade: "RECEBIMENTO", entidadeId: criado.id, acao: "CONFERENCIA_REGISTRADA", usuarioId, detalhes: { pedido: pedido.codigo, divergencia: temDivergencia, nota: dto.numeroNotaFiscal } } });
      return criado;
    });
    return { ...this.apresentar(recebimento), divergencias: this.comparar(recebimento as any) };
  }

  async confirmarEstoque(id: string, usuarioId?: string) {
    return this.prisma.$transaction(async tx => {
      const recebimento: any = await tx.recebimentoCompra.findUnique({ where: { id }, include: this.incluirRecebimento() });
      if (!recebimento) throw new NotFoundException("Recebimento não encontrado.");
      if (recebimento.estoqueConfirmadoEm) return { ...this.apresentar(recebimento), idempotente: true, mensagem: "Esta entrada já havia sido confirmada; nenhum saldo foi duplicado." };
      const processadoEm = new Date();
      const reserva = await tx.recebimentoCompra.updateMany({ where: { id, estoqueConfirmadoEm: null }, data: { estoqueConfirmadoEm: processadoEm, estoqueConfirmadoPorId: usuarioId } });
      if (!reserva.count) { const atual: any = await tx.recebimentoCompra.findUniqueOrThrow({ where: { id }, include: this.incluirRecebimento() }); return { ...this.apresentar(atual), idempotente: true, mensagem: "Esta entrada ja havia sido confirmada; nenhum saldo foi duplicado." }; }
      const aceitos = recebimento.itens.filter((item: any) => n(item.quantidadeRecebida) > 0 && item.situacao !== RecebimentoItemStatus.PRODUTO_RECUSADO);
      if (!aceitos.length) throw new BadRequestException("Não há quantidade aceita para entrada no estoque.");
      const baseTotal = aceitos.reduce((total: number, item: any) => total + n(item.quantidadeRecebida) * n(item.valorUnitarioRecebido), 0) || 1;
      const receitasAfetadas = new Set<string>();
      for (const item of aceitos) {
        const insumo = await tx.insumo.findUnique({ where: { id: item.insumoId } }); if (!insumo?.ativo) throw new BadRequestException("Um produto recebido não está ativo no estoque.");
        const quantidadeEntrada = n(item.quantidadeRecebida) * n(item.fatorConversaoEstoque), saldoAnterior = n(insumo.quantidade), saldoPosterior = saldoAnterior + quantidadeEntrada;
        const proporcao = (n(item.quantidadeRecebida) * n(item.valorUnitarioRecebido)) / baseTotal, freteRateado = n(recebimento.frete ?? recebimento.pedidoCompra.frete) * proporcao, descontoRateado = n(recebimento.desconto ?? recebimento.pedidoCompra.desconto) * proporcao;
        const custoFinalUnitario = quantidadeEntrada > 0 ? Math.max(0, n(item.quantidadeRecebida) * n(item.valorUnitarioRecebido) + freteRateado - descontoRateado) / quantidadeEntrada : n(item.valorUnitarioRecebido);
        const custoMedio = saldoPosterior > 0 ? (saldoAnterior * n(insumo.custoUnitario) + quantidadeEntrada * custoFinalUnitario) / saldoPosterior : custoFinalUnitario;
        await tx.insumo.update({ where: { id: insumo.id }, data: { quantidade: saldoPosterior, custoUnitario: custoMedio, ultimoCustoCompra: custoFinalUnitario, ultimoFornecedorId: recebimento.fornecedorId, ultimaCompraEm: new Date() } });
        await tx.movimentacao.create({ data: { insumoId: insumo.id, tipo: MovimentacaoTipo.ENTRADA, origem: EntradaOrigem.PEDIDO_COMPRA, quantidade: quantidadeEntrada, saldoAnterior, saldoPosterior, custoUnitario: custoFinalUnitario, referenciaId: recebimento.id, descricao: "Recebimento " + recebimento.pedidoCompra.codigo + " · " + recebimento.fornecedor.nome + (recebimento.numeroNotaFiscal ? " · NF " + recebimento.numeroNotaFiscal : ""), usuarioId } });
        await tx.historicoPrecoCompra.create({ data: { insumoId: insumo.id, fornecedorId: recebimento.fornecedorId, quantidade: quantidadeEntrada, unidade: insumo.unidade, precoUnitario: item.valorUnitarioRecebido, frete: freteRateado, desconto: descontoRateado, custoFinal: custoFinalUnitario, cotacaoCodigo: recebimento.pedidoCompra.cotacao?.codigo, pedidoCodigo: recebimento.pedidoCompra.codigo, notaFiscalNumero: recebimento.numeroNotaFiscal, usuarioId } });
        const receitas = await tx.itemReceita.findMany({ where: { insumoId: insumo.id }, select: { receitaId: true } }); receitas.forEach(r => receitasAfetadas.add(r.receitaId));
        await tx.itemReceita.updateMany({ where: { insumoId: insumo.id }, data: { custoUnitario: custoMedio } });
      }
      for (const receitaId of receitasAfetadas) { const itens = await tx.itemReceita.findMany({ where: { receitaId }, select: { quantidade: true, custoUnitario: true } }); await tx.receita.update({ where: { id: receitaId }, data: { custoEstimado: itens.reduce((total, item) => total + n(item.quantidade) * n(item.custoUnitario), 0) } }); }
      await tx.recebimentoCompra.update({ where: { id }, data: { status: CompraStatus.RECEBIDO } });
      const processados = await tx.recebimentoCompraItem.findMany({ where: { recebimento: { pedidoCompraId: recebimento.pedidoCompraId, estoqueConfirmadoEm: { not: null } } } });
      const completo = recebimento.pedidoCompra.itens.every((pedidoItem: any) => processados.filter(item => item.pedidoCompraItemId === pedidoItem.id).reduce((total, item) => total + n(item.quantidadeRecebida), 0) >= n(pedidoItem.quantidade) - 0.0001);
      await tx.pedidoCompra.update({ where: { id: recebimento.pedidoCompraId }, data: { status: completo ? CompraStatus.RECEBIDO : CompraStatus.RECEBIDO_PARCIALMENTE, ...(completo ? { recebidoEm: new Date() } : {}) } });
      await tx.compraAuditoria.create({ data: { entidade: "RECEBIMENTO", entidadeId: id, acao: "ENTRADA_ESTOQUE_CONFIRMADA", usuarioId, detalhes: { itens: aceitos.length, pedido: recebimento.pedidoCompra.codigo, completo } } });
      const atualizado: any = await tx.recebimentoCompra.findUniqueOrThrow({ where: { id }, include: this.incluirRecebimento() });
      return { ...this.apresentar(atualizado), idempotente: false, mensagem: "Entrada confirmada e estoque atualizado com sucesso." };
    });
  }

  async cancelarPedido(id: string, dto: CancelarPedidoCompraDto, usuarioId?: string) {
    const pedido = await this.prisma.pedidoCompra.findUnique({ where: { id }, include: { recebimentos: true } }); if (!pedido) throw new NotFoundException("Pedido não encontrado.");
    if (pedido.recebimentos.some(item => item.estoqueConfirmadoEm)) throw new BadRequestException("Não é possível cancelar um pedido que já movimentou o estoque.");
    const atualizado = await this.prisma.$transaction(async tx => { const item = await tx.pedidoCompra.update({ where: { id }, data: { status: CompraStatus.CANCELADO, canceladoEm: new Date(), motivoCancelamento: dto.motivo.trim() } }); await tx.compraAuditoria.create({ data: { entidade: "PEDIDO_COMPRA", entidadeId: id, acao: "CANCELADO", usuarioId, detalhes: { motivo: dto.motivo } } }); return item; });
    return { id: atualizado.id, codigo: atualizado.codigo, status: atualizado.status.toLowerCase() };
  }

  async historicoPrecos() {
    const data = await this.prisma.historicoPrecoCompra.findMany({ include: { insumo: true, fornecedor: true }, orderBy: { criadoEm: "desc" }, take: 500 });
    return { data: data.map(item => ({ id: item.id, codigo: item.insumo.codigo, produto: item.insumo.nome, fornecedor: item.fornecedor.nome, quantidade: n(item.quantidade), unidade: item.unidade, precoUnitario: n(item.precoUnitario), custoFinal: n(item.custoFinal), pedido: item.pedidoCodigo, cotacao: item.cotacaoCodigo, notaFiscal: item.notaFiscalNumero, criadoEm: item.criadoEm })) };
  }

  private incluirRecebimento(): any { return { fornecedor: true, pedidoCompra: { include: { fornecedor: true, cotacao: true, itens: { include: { insumo: true } } } }, itens: { include: { insumo: true, pedidoCompraItem: true } } }; }
  private comparar(r: any) { const d: string[] = []; if (r.valorTotal != null && Math.abs(n(r.valorTotal) - n(r.pedidoCompra.valorTotal)) > 0.01) d.push("Valor total da nota diferente do pedido"); for (const item of r.itens) { if (n(item.quantidadeRecebida) + n(item.quantidadeRecusada) !== n(item.quantidadePedida)) d.push("Quantidade divergente em " + item.insumo.nome); if (Math.abs(n(item.valorUnitarioRecebido) - n(item.pedidoCompraItem.custoUnitario)) > 0.0001) d.push("Valor unitário divergente em " + item.insumo.nome); if (divergente(item.situacao)) d.push(item.insumo.nome + ": " + item.situacao.toLowerCase().replaceAll("_", " ")); } return [...new Set(d)]; }
  private apresentar(r: any) { return { id: r.id, pedidoId: r.pedidoCompraId, pedidoCodigo: r.pedidoCompra.codigo, cotacaoCodigo: r.pedidoCompra.cotacao?.codigo, fornecedor: r.fornecedor.nome, status: r.status.toLowerCase(), numeroNotaFiscal: r.numeroNotaFiscal, serieNotaFiscal: r.serieNotaFiscal, chaveAcesso: r.chaveAcesso, dataEmissao: r.dataEmissao, dataEntrada: r.dataEntrada, valorTotal: r.valorTotal == null ? null : n(r.valorTotal), observacoes: r.observacoes, estoqueConfirmadoEm: r.estoqueConfirmadoEm, itens: r.itens.map((item: any) => ({ id: item.id, pedidoCompraItemId: item.pedidoCompraItemId, codigo: item.insumo.codigo, nome: item.insumo.nome, quantidadePedida: n(item.quantidadePedida), quantidadeRecebida: n(item.quantidadeRecebida), quantidadeRecusada: n(item.quantidadeRecusada), fatorConversaoEstoque: n(item.fatorConversaoEstoque), unidade: item.unidade, valorUnitarioRecebido: n(item.valorUnitarioRecebido), situacao: item.situacao.toLowerCase(), lote: item.lote, validade: item.dataValidade, marca: item.marcaRecebida, observacoes: item.observacoes })), criadoEm: r.criadoEm, divergencias: this.comparar(r) }; }
}
