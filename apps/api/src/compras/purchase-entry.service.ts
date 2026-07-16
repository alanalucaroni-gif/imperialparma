import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { EntradaOrigem, MovimentacaoTipo, Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CompraManualDto, EntradaBoletoDto, EntradaXmlDto } from "./compras.dto.js";

@Injectable()
export class PurchaseEntryService {
  constructor(private readonly prisma: PrismaService) {}

  async manual(dto: CompraManualDto, usuarioId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const insumo = await this.insumo(tx, dto.insumoCodigo);
      const compra = await tx.compraManual.create({ data: {
        insumoId: insumo.id, quantidade: dto.quantidade, custoUnitario: dto.custoUnitario,
        fornecedorNome: dto.fornecedor, formaPagamento: dto.formaPagamento, observacao: dto.observacao,
      }});
      const atualizado = await this.entradaEstoque(tx, insumo, dto.quantidade, dto.custoUnitario, EntradaOrigem.MANUAL, compra.id, `Compra manual — ${insumo.nome} · ${dto.fornecedor}`, usuarioId);
      return { compra, insumo: atualizado };
    });
  }

  async boleto(dto: EntradaBoletoDto, usuarioId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const insumo = await this.insumo(tx, dto.insumoCodigo);
      const entrada = await tx.entradaBoleto.create({ data: {
        insumoId: insumo.id, quantidade: dto.quantidade, fornecedorNome: dto.fornecedor,
        linhaDigitavel: dto.linhaDigitavel, valor: dto.valor, vencimento: new Date(dto.vencimento),
      }});
      const atualizado = await this.entradaEstoque(tx, insumo, dto.quantidade, Number(insumo.custoUnitario), EntradaOrigem.BOLETO, entrada.id, `Entrada por boleto — ${insumo.nome} · ${dto.fornecedor}`, usuarioId);
      const conta = await tx.contaPagar.create({ data: {
        descricao: `Boleto — ${dto.fornecedor} (${insumo.nome})`, fornecedorNome: dto.fornecedor,
        valor: dto.valor, vencimento: new Date(dto.vencimento), linhaDigitavel: dto.linhaDigitavel,
        entradaBoletoId: entrada.id,
      }});
      return { entrada, insumo: atualizado, contaPagar: conta };
    });
  }

  async xml(dto: EntradaXmlDto, usuarioId?: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (await tx.notaFiscalXml.findUnique({ where: { chave: dto.chave } })) {
          throw new ConflictException("Esta NF-e já foi importada.");
        }
        const nota = await tx.notaFiscalXml.create({ data: {
          chave: dto.chave, fornecedorNome: dto.fornecedor, cnpj: dto.cnpj,
          valorTotal: dto.valorTotal, xmlOriginal: dto.xmlOriginal,
        }});
        const insumos = [];
        for (const item of dto.itens) {
          const insumo = await this.insumo(tx, item.insumoCodigo);
          await tx.notaFiscalItem.create({ data: {
            notaFiscalId: nota.id, insumoId: insumo.id, codigoProduto: item.codigoProduto,
            descricao: item.descricao, unidade: item.unidade, quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
          }});
          insumos.push(await this.entradaEstoque(tx, insumo, item.quantidade, item.valorUnitario, EntradaOrigem.XML, nota.id, `NF-e ${dto.chave} — ${item.descricao} · ${dto.fornecedor}`, usuarioId));
        }
        const parcelas = dto.duplicatas.length ? dto.duplicatas : [{ numero: "1", valor: dto.valorTotal }];
        const contasPagar = [];
        for (const [index, parcela] of parcelas.entries()) {
          contasPagar.push(await tx.contaPagar.create({ data: {
            descricao: `NF-e ${dto.fornecedor} — parcela ${parcela.numero || index + 1}`,
            fornecedorNome: dto.fornecedor, valor: parcela.valor,
            vencimento: parcela.vencimento ? new Date(parcela.vencimento) : null,
            notaFiscalId: nota.id,
          }}));
        }
        return { nota, insumos, contasPagar };
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictException("Esta NF-e já foi importada.");
      throw error;
    }
  }

  private async insumo(tx: Prisma.TransactionClient, codigo: string) {
    const insumo = await tx.insumo.findUnique({ where: { codigo } });
    if (!insumo?.ativo) throw new NotFoundException(`Insumo ${codigo} não encontrado ou inativo.`);
    return insumo;
  }

  private async entradaEstoque(
    tx: Prisma.TransactionClient,
    insumo: Awaited<ReturnType<PurchaseEntryService["insumo"]>>,
    quantidade: number,
    custoUnitario: number,
    origem: EntradaOrigem,
    referenciaId: string,
    descricao: string,
    usuarioId?: string,
  ) {
    const saldoAnterior = insumo.quantidade;
    const atualizado = await tx.insumo.update({
      where: { id: insumo.id },
      data: { quantidade: { increment: quantidade }, custoUnitario },
    });
    await tx.movimentacao.create({ data: {
      insumoId: insumo.id, tipo: MovimentacaoTipo.ENTRADA, origem,
      quantidade, saldoAnterior, saldoPosterior: atualizado.quantidade,
      custoUnitario, referenciaId, descricao, usuarioId,
    }});
    return atualizado;
  }
}
