import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EntradaOrigem, MovimentacaoTipo, Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AtualizarInsumoDto, CadastrarInsumoDto, ListarInsumosDto, ListarMovimentacoesDto, RegistrarMovimentacaoEstoqueDto } from "./estoque.dto.js";

const n = (value: unknown) => Number(value);
const status = (quantidade: number, minimo: number) => minimo <= 0 ? "pendente" : quantidade <= 0 || quantidade < minimo * 0.5 ? "critico" : quantidade < minimo ? "baixo" : "ok";

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(dto: ListarInsumosDto) {
    const where: Prisma.InsumoWhereInput = {
      ativo: true,
      ...(dto.busca ? { OR: [{ nome: { contains: dto.busca, mode: "insensitive" } }, { codigo: { contains: dto.busca, mode: "insensitive" } }] } : {}),
      ...(dto.categoria ? { categoria: dto.categoria } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.insumo.findMany({ where, orderBy: { nome: "asc" }, skip: (dto.page - 1) * dto.limit, take: dto.limit }),
      this.prisma.insumo.count({ where }),
    ]);
    const mapped = items.map((item) => ({
      id: item.id, cod: item.codigo, nome: item.nome, cat: item.categoria, un: item.unidade,
      qtd: n(item.quantidade), min: n(item.estoqueMinimo), custo: n(item.custoUnitario),
      status: status(n(item.quantidade), n(item.estoqueMinimo)),
    })).filter((item) => !dto.status || item.status === dto.status);
    return { data: mapped, meta: { page: dto.page, limit: dto.limit, total } };
  }

  async cadastrar(dto: CadastrarInsumoDto) {
    const codigo = (dto.codigo?.trim() || ("INS-" + Date.now().toString(36))).toUpperCase();
    const existente = await this.prisma.insumo.findUnique({ where: { codigo } });
    if (existente) throw new BadRequestException("Já existe um item com este código.");
    const item = await this.prisma.insumo.create({
      data: {
        codigo,
        nome: dto.nome.trim().toUpperCase(),
        categoria: dto.categoria.trim(),
        unidade: dto.unidade.trim().toLowerCase(),
        quantidade: dto.quantidade ?? 0,
        estoqueMinimo: dto.estoqueMinimo ?? 0,
        custoUnitario: dto.custoUnitario ?? 0,
      },
    });
    return {
      id: item.id,
      cod: item.codigo,
      nome: item.nome,
      cat: item.categoria,
      un: item.unidade,
      qtd: n(item.quantidade),
      min: n(item.estoqueMinimo),
      custo: n(item.custoUnitario),
      status: status(n(item.quantidade), n(item.estoqueMinimo)),
    };
  }
  async excluir(codigo: string) {
    const existente = await this.prisma.insumo.findUnique({ where: { codigo } });
    if (!existente || !existente.ativo) throw new NotFoundException("Item de estoque não encontrado.");
    const item = await this.prisma.insumo.update({ where: { codigo }, data: { ativo: false } });
    return { cod: item.codigo, nome: item.nome, excluido: true };
  }
  async atualizar(codigo: string, dto: AtualizarInsumoDto) {
    const existente = await this.prisma.insumo.findUnique({ where: { codigo } });
    if (!existente) throw new NotFoundException("Item de estoque não encontrado.");
    const saldoAnterior = n(existente.quantidade);
    const saldoPosterior = dto.quantidade ?? saldoAnterior;
    const atualizado = await this.prisma.$transaction(async tx => {
      const item = await tx.insumo.update({
        where: { codigo },
        data: {
          ...(dto.nome != null ? { nome: dto.nome.trim().toUpperCase() } : {}),
          ...(dto.categoria != null ? { categoria: dto.categoria.trim() } : {}),
          ...(dto.unidade != null ? { unidade: dto.unidade.trim().toLowerCase() } : {}),
          ...(dto.quantidade != null ? { quantidade: dto.quantidade } : {}),
          ...(dto.estoqueMinimo != null ? { estoqueMinimo: dto.estoqueMinimo } : {}),
          ...(dto.custoUnitario != null ? { custoUnitario: dto.custoUnitario } : {}),
        },
      });
      if (saldoPosterior !== saldoAnterior) {
        await tx.movimentacao.create({
          data: {
            insumoId: item.id,
            tipo: MovimentacaoTipo.AJUSTE,
            origem: EntradaOrigem.AJUSTE,
            quantidade: saldoPosterior - saldoAnterior,
            saldoAnterior,
            saldoPosterior,
            custoUnitario: dto.custoUnitario ?? n(existente.custoUnitario),
            descricao: "Ajuste realizado pela edição do cadastro do item",
          },
        });
      }
      return item;
    });
    return {
      id: atualizado.id,
      cod: atualizado.codigo,
      nome: atualizado.nome,
      cat: atualizado.categoria,
      un: atualizado.unidade,
      qtd: n(atualizado.quantidade),
      min: n(atualizado.estoqueMinimo),
      custo: n(atualizado.custoUnitario),
      status: status(n(atualizado.quantidade), n(atualizado.estoqueMinimo)),
    };
  }
  async atualizarMinimo(codigo: string, minimo: number) {
    const item = await this.prisma.insumo.update({ where: { codigo }, data: { estoqueMinimo: minimo } });
    return {
      cod: item.codigo,
      nome: item.nome,
      qtd: n(item.quantidade),
      min: n(item.estoqueMinimo),
      status: status(n(item.quantidade), n(item.estoqueMinimo)),
    };
  }
  async registrarMovimentacao(dto: RegistrarMovimentacaoEstoqueDto) {
    const insumo = await this.prisma.insumo.findUnique({ where: { codigo: dto.insumoCodigo } });
    if (!insumo) throw new NotFoundException("Insumo não encontrado.");
    const saldoAnterior = n(insumo.quantidade);
    if (dto.tipo === "saida" && dto.quantidade > saldoAnterior) {
      throw new BadRequestException("A saída excede o saldo disponível.");
    }
    const entrada = dto.tipo === "entrada";
    const saldoPosterior = saldoAnterior + (entrada ? dto.quantidade : -dto.quantidade);
    const custoUnitario = entrada && dto.custoUnitario != null ? dto.custoUnitario : n(insumo.custoUnitario);
    const resultado = await this.prisma.$transaction(async tx => {
      const atualizado = await tx.insumo.update({
        where: { id: insumo.id },
        data: {
          quantidade: saldoPosterior,
          ...(entrada && dto.custoUnitario != null ? { custoUnitario: dto.custoUnitario } : {}),
        },
      });
      const movimentacao = await tx.movimentacao.create({
        data: {
          insumoId: insumo.id,
          tipo: entrada ? MovimentacaoTipo.ENTRADA : MovimentacaoTipo.SAIDA,
          origem: EntradaOrigem.MANUAL,
          quantidade: entrada ? dto.quantidade : -dto.quantidade,
          saldoAnterior,
          saldoPosterior,
          custoUnitario,
          descricao: dto.motivo + " · Responsável: " + dto.responsavel,
        },
      });
      return { atualizado, movimentacao };
    });
    return {
      id: resultado.movimentacao.id,
      item: {
        cod: resultado.atualizado.codigo,
        qtd: n(resultado.atualizado.quantidade),
        min: n(resultado.atualizado.estoqueMinimo),
        custo: n(resultado.atualizado.custoUnitario),
        status: status(n(resultado.atualizado.quantidade), n(resultado.atualizado.estoqueMinimo)),
      },
    };
  }

  async movimentacoes(dto: ListarMovimentacoesDto) {
    const where = dto.insumoId ? { insumoId: dto.insumoId } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.movimentacao.findMany({ where, include: { insumo: true }, orderBy: { criadoEm: "desc" }, skip: (dto.page - 1) * dto.limit, take: dto.limit }),
      this.prisma.movimentacao.count({ where }),
    ]);
    return {
      data: items.map((m) => ({ id: m.id, tipo: m.tipo.toLowerCase(), origem: m.origem, desc: m.descricao, qtd: `${n(m.quantidade) > 0 ? "+" : ""}${n(m.quantidade)} ${m.insumo.unidade}`, criadoEm: m.criadoEm })),
      meta: { page: dto.page, limit: dto.limit, total },
    };
  }
}
