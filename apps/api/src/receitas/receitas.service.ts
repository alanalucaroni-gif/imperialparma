import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProducaoReceitaStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AtualizarProducaoReceitaDto, AtualizarReceitaDto, CriarProducaoReceitaDto, CriarReceitaDto, ItemReceitaDto, ListarProducoesReceitasDto, ListarReceitasDto, RankingProducoesDto } from "./receitas.dto.js";

const numero = (valor: unknown) => Number(valor);
const texto = (valor?: string) => valor?.trim() || null;
const inicioDia = (valor: Date) => { const data = new Date(valor); data.setHours(0, 0, 0, 0); return data; };
const fimDia = (valor: Date) => { const data = new Date(valor); data.setHours(23, 59, 59, 999); return data; };

@Injectable()
export class ReceitasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(dto: ListarReceitasDto) {
    const where: Prisma.ReceitaWhereInput = {
      ...(dto.status === "ativo" ? { ativo: true } : dto.status === "inativo" ? { ativo: false } : {}),
      ...(dto.categoria ? { categoria: { equals: dto.categoria, mode: "insensitive" } } : {}),
    };
    if (dto.busca?.trim()) {
      const busca = dto.busca.trim();
      where.OR = [{ nome: { contains: busca, mode: "insensitive" } }, { codigo: { contains: busca, mode: "insensitive" } }, { categoria: { contains: busca, mode: "insensitive" } }];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.receita.findMany({ where, orderBy: { [dto.ordenarPor]: dto.direcao }, skip: (dto.page - 1) * dto.limit, take: dto.limit, include: { _count: { select: { itens: true, producoes: true } } } }),
      this.prisma.receita.count({ where }),
    ]);
    return { data: data.map(item => this.mapearReceita(item)), meta: { page: dto.page, limit: dto.limit, total, pages: Math.max(1, Math.ceil(total / dto.limit)) } };
  }

  async listarAtivas() {
    const receitas = await this.prisma.receita.findMany({ where: { ativo: true }, select: { id: true, codigo: true, nome: true, categoria: true, rendimento: true, unidadeRendimento: true }, orderBy: { nome: "asc" } });
    return receitas.map(receita => ({ ...receita, rendimento: numero(receita.rendimento) }));
  }

  async buscar(id: string) {
    const receita = await this.prisma.receita.findUnique({ where: { id }, include: { itens: { include: { insumo: { select: { codigo: true, nome: true, custoUnitario: true, unidade: true, ativo: true } } }, orderBy: { nome: "asc" } }, _count: { select: { producoes: true } } } });
    if (!receita) throw new NotFoundException("Receita não encontrada.");
    return this.mapearReceita(receita);
  }

  async criar(dto: CriarReceitaDto) {
    const itens = await this.prepararItens(dto.itens);
    const custoCalculado = itens.reduce((total, item) => total + item.quantidade * (item.custoUnitario ?? 0), 0);
    const receita = await this.prisma.receita.create({ data: {
      codigo: await this.proximoCodigo(), nome: dto.nome.trim(), categoria: texto(dto.categoria), descricao: texto(dto.descricao), fotoUrl: texto(dto.fotoUrl),
      rendimento: dto.rendimento, unidadeRendimento: dto.unidadeRendimento.trim().toLowerCase(), tempoPreparoMinutos: dto.tempoPreparoMinutos ?? null,
      modoPreparo: texto(dto.modoPreparo), custoEstimado: custoCalculado || dto.custoEstimado || null, observacoes: texto(dto.observacoes), ativo: dto.ativo ?? true,
      itens: { create: itens },
    }, include: { itens: true, _count: { select: { producoes: true } } } });
    return this.mapearReceita(receita);
  }

  async atualizar(id: string, dto: AtualizarReceitaDto) {
    await this.buscar(id);
    const itens = dto.itens === undefined ? undefined : await this.prepararItens(dto.itens);
    const custoCalculado = itens?.reduce((total, item) => total + item.quantidade * (item.custoUnitario ?? 0), 0);
    const receita = await this.prisma.receita.update({ where: { id }, data: {
      ...(dto.nome !== undefined ? { nome: dto.nome.trim() } : {}), ...(dto.categoria !== undefined ? { categoria: texto(dto.categoria) } : {}), ...(dto.descricao !== undefined ? { descricao: texto(dto.descricao) } : {}), ...(dto.fotoUrl !== undefined ? { fotoUrl: texto(dto.fotoUrl) } : {}),
      ...(dto.rendimento !== undefined ? { rendimento: dto.rendimento } : {}), ...(dto.unidadeRendimento !== undefined ? { unidadeRendimento: dto.unidadeRendimento.trim().toLowerCase() } : {}), ...(dto.tempoPreparoMinutos !== undefined ? { tempoPreparoMinutos: dto.tempoPreparoMinutos } : {}),
      ...(dto.modoPreparo !== undefined ? { modoPreparo: texto(dto.modoPreparo) } : {}), ...(dto.custoEstimado !== undefined || custoCalculado !== undefined ? { custoEstimado: custoCalculado || dto.custoEstimado || null } : {}), ...(dto.observacoes !== undefined ? { observacoes: texto(dto.observacoes) } : {}), ...(dto.ativo !== undefined ? { ativo: dto.ativo } : {}),
      ...(itens ? { itens: { deleteMany: {}, create: itens } } : {}),
    }, include: { itens: true, _count: { select: { producoes: true } } } });
    return this.mapearReceita(receita);
  }

  async duplicar(id: string) {
    const origem = await this.prisma.receita.findUnique({ where: { id }, include: { itens: true } });
    if (!origem) throw new NotFoundException("Receita não encontrada.");
    const copia = await this.prisma.receita.create({ data: {
      codigo: await this.proximoCodigo(), nome: `${origem.nome} (cópia)`, categoria: origem.categoria, descricao: origem.descricao, fotoUrl: origem.fotoUrl, rendimento: origem.rendimento, unidadeRendimento: origem.unidadeRendimento, tempoPreparoMinutos: origem.tempoPreparoMinutos, modoPreparo: origem.modoPreparo, custoEstimado: origem.custoEstimado, observacoes: origem.observacoes, ativo: true,
      itens: { create: origem.itens.map(item => ({ insumoId: item.insumoId, nome: item.nome, quantidade: item.quantidade, unidade: item.unidade, custoUnitario: item.custoUnitario })) },
    }, include: { itens: true, _count: { select: { producoes: true } } } });
    return this.mapearReceita(copia);
  }

  async excluir(id: string) {
    const receita = await this.prisma.receita.findUnique({ where: { id }, select: { id: true, nome: true, _count: { select: { producoes: true } } } });
    if (!receita) throw new NotFoundException("Receita não encontrada.");
    if (receita._count.producoes) throw new ConflictException("Esta receita possui produções registradas e só pode ser inativada para preservar o histórico.");
    await this.prisma.receita.delete({ where: { id } });
    return { id, nome: receita.nome, excluida: true };
  }

  async listarProducoes(dto: ListarProducoesReceitasDto) {
    const where = this.filtroProducoes(dto);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.producaoReceita.findMany({ where, orderBy: { [dto.ordenarPor]: dto.direcao }, skip: (dto.page - 1) * dto.limit, take: dto.limit, include: { receita: { select: { id: true, codigo: true, nome: true, categoria: true } }, funcionario: { select: { id: true, codigo: true, nome: true, setor: true, cargo: true, ativo: true } } } }),
      this.prisma.producaoReceita.count({ where }),
    ]);
    return { data: data.map(item => this.mapearProducao(item)), meta: { page: dto.page, limit: dto.limit, total, pages: Math.max(1, Math.ceil(total / dto.limit)) } };
  }

  async buscarProducao(id: string) {
    const producao = await this.prisma.producaoReceita.findUnique({ where: { id }, include: { receita: true, funcionario: { select: { id: true, codigo: true, nome: true, setor: true, cargo: true, ativo: true } } } });
    if (!producao) throw new NotFoundException("Produção não encontrada.");
    return this.mapearProducao(producao);
  }

  async criarProducao(dto: CriarProducaoReceitaDto) {
    await this.validarVinculos(dto.receitaId, dto.funcionarioId); this.validarHorario(dto.horaInicio, dto.horaFim);
    const producao = await this.prisma.producaoReceita.create({ data: this.dadosProducao(dto), include: { receita: { select: { id: true, codigo: true, nome: true, categoria: true } }, funcionario: { select: { id: true, codigo: true, nome: true, setor: true, cargo: true, ativo: true } } } });
    return this.mapearProducao(producao);
  }

  async atualizarProducao(id: string, dto: AtualizarProducaoReceitaDto) {
    const atual = await this.buscarProducao(id);
    if (atual.status === ProducaoReceitaStatus.CANCELADA) throw new BadRequestException("Produções canceladas são preservadas e não podem ser alteradas.");
    const receitaId = dto.receitaId ?? atual.receitaId; const funcionarioId = dto.funcionarioId ?? atual.funcionarioId;
    await this.validarVinculos(receitaId, funcionarioId); this.validarHorario(dto.horaInicio ?? atual.horaInicio ?? undefined, dto.horaFim ?? atual.horaFim ?? undefined);
    const producao = await this.prisma.producaoReceita.update({ where: { id }, data: this.dadosProducao(dto), include: { receita: { select: { id: true, codigo: true, nome: true, categoria: true } }, funcionario: { select: { id: true, codigo: true, nome: true, setor: true, cargo: true, ativo: true } } } });
    return this.mapearProducao(producao);
  }

  async cancelarProducao(id: string, motivo: string) {
    const atual = await this.buscarProducao(id);
    if (atual.status === ProducaoReceitaStatus.CANCELADA) throw new BadRequestException("Esta produção já está cancelada.");
    const producao = await this.prisma.producaoReceita.update({ where: { id }, data: { status: ProducaoReceitaStatus.CANCELADA, canceladaEm: new Date(), motivoCancelamento: motivo.trim() }, include: { receita: { select: { id: true, codigo: true, nome: true, categoria: true } }, funcionario: { select: { id: true, codigo: true, nome: true, setor: true, cargo: true, ativo: true } } } });
    return this.mapearProducao(producao);
  }

  async indicadores(dto: ListarProducoesReceitasDto) {
    const todas = await this.buscarParaAnalise(dto, true); const validas = todas.filter(item => item.status !== ProducaoReceitaStatus.CANCELADA); const agora = new Date(); const dia = inicioDia(agora); const semana = inicioDia(agora); semana.setDate(semana.getDate() - ((semana.getDay() + 6) % 7)); const mes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const porFuncionario = this.agrupar(validas, item => item.funcionarioId); const porReceita = this.agrupar(validas, item => item.receitaId);
    const maisRegistros = this.maior(porFuncionario, (_, itens) => itens.length)?.[1][0]?.funcionario ?? null; const maiorVolume = this.maior(porFuncionario, (_, itens) => itens.reduce((total, item) => total + numero(item.quantidadeProduzida), 0))?.[1][0]?.funcionario ?? null; const receitaMais = this.maior(porReceita, (_, itens) => itens.length)?.[1][0]?.receita ?? null;
    const duracoes = validas.map(item => this.duracao(item.horaInicio, item.horaFim)).filter((valor): valor is number => valor !== null); const noPeriodo = (inicio: Date) => validas.filter(item => item.dataProducao >= inicio).length;
    return { totalProducoes: validas.length, receitasDiferentes: new Set(validas.map(item => item.receitaId)).size, quantidadeTotal: validas.reduce((total, item) => total + numero(item.quantidadeProduzida), 0), funcionarioMaisProducoes: maisRegistros ? { id: maisRegistros.id, nome: maisRegistros.nome } : null, funcionarioMaiorQuantidade: maiorVolume ? { id: maiorVolume.id, nome: maiorVolume.nome } : null, receitaMaisProduzida: receitaMais ? { id: receitaMais.id, nome: receitaMais.nome } : null, producoesHoje: noPeriodo(dia), producoesSemana: noPeriodo(semana), producoesMes: noPeriodo(mes), tempoMedioMinutos: duracoes.length ? Math.round(duracoes.reduce((total, valor) => total + valor, 0) / duracoes.length) : 0, concluidas: todas.filter(item => item.status === ProducaoReceitaStatus.CONCLUIDA).length, emAndamento: todas.filter(item => item.status === ProducaoReceitaStatus.EM_ANDAMENTO).length, canceladas: todas.filter(item => item.status === ProducaoReceitaStatus.CANCELADA).length };
  }

  async ranking(dto: RankingProducoesDto) {
    const producoes = (await this.buscarParaAnalise(dto, false)).filter(item => item.status !== ProducaoReceitaStatus.CANCELADA); const totalVolume = producoes.reduce((total, item) => total + numero(item.quantidadeProduzida), 0); const grupos = this.agrupar(producoes, item => item.funcionarioId);
    const ranking = Array.from(grupos.values()).map(itens => { const funcionario = itens[0].funcionario; const duracoes = itens.map(item => this.duracao(item.horaInicio, item.horaFim)).filter((valor): valor is number => valor !== null); const volume = itens.reduce((total, item) => total + numero(item.quantidadeProduzida), 0); return { funcionario: { id: funcionario.id, codigo: funcionario.codigo, nome: funcionario.nome, setor: funcionario.setor }, producoes: itens.length, quantidadeTotal: volume, receitasDiferentes: new Set(itens.map(item => item.receitaId)).size, tempoMedioMinutos: duracoes.length ? Math.round(duracoes.reduce((total, valor) => total + valor, 0) / duracoes.length) : 0, participacao: totalVolume ? Number((volume * 100 / totalVolume).toFixed(1)) : 0 }; }).sort((a, b) => dto.tipo === "volume" ? b.quantidadeTotal - a.quantidadeTotal || b.producoes - a.producoes : b.producoes - a.producoes || b.quantidadeTotal - a.quantidadeTotal);
    return ranking.map((item, index) => ({ posicao: index + 1, ...item }));
  }

  private filtroProducoes(dto: ListarProducoesReceitasDto): Prisma.ProducaoReceitaWhereInput {
    const where: Prisma.ProducaoReceitaWhereInput = { ...(dto.funcionarioId ? { funcionarioId: dto.funcionarioId } : {}), ...(dto.receitaId ? { receitaId: dto.receitaId } : {}), ...(dto.status ? { status: dto.status as ProducaoReceitaStatus } : {}), ...(dto.setor ? { funcionario: { setor: { equals: dto.setor, mode: "insensitive" } } } : {}) };
    const data = this.periodo(dto); if (data) where.dataProducao = data;
    if (dto.busca?.trim()) { const busca = dto.busca.trim(); where.OR = [{ lote: { contains: busca, mode: "insensitive" } }, { receita: { nome: { contains: busca, mode: "insensitive" } } }, { receita: { codigo: { contains: busca, mode: "insensitive" } } }, { funcionario: { nome: { contains: busca, mode: "insensitive" } } }]; }
    return where;
  }

  private periodo(dto: Pick<ListarProducoesReceitasDto, "periodo" | "dataInicio" | "dataFim">): Prisma.DateTimeFilter | undefined {
    const agora = new Date(); let inicio: Date | undefined; let fim: Date | undefined;
    if (dto.periodo === "hoje") { inicio = inicioDia(agora); fim = fimDia(agora); }
    if (dto.periodo === "semana") { inicio = inicioDia(agora); inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7)); fim = fimDia(agora); }
    if (dto.periodo === "mes") { inicio = new Date(agora.getFullYear(), agora.getMonth(), 1); fim = fimDia(agora); }
    if (dto.periodo === "personalizado") { inicio = dto.dataInicio ? inicioDia(new Date(dto.dataInicio)) : undefined; fim = dto.dataFim ? fimDia(new Date(dto.dataFim)) : undefined; }
    return inicio || fim ? { ...(inicio ? { gte: inicio } : {}), ...(fim ? { lte: fim } : {}) } : undefined;
  }

  private async buscarParaAnalise(dto: ListarProducoesReceitasDto, ignorarStatus: boolean) { const where = this.filtroProducoes(ignorarStatus ? { ...dto, status: undefined } : dto); return this.prisma.producaoReceita.findMany({ where, include: { receita: { select: { id: true, codigo: true, nome: true, categoria: true } }, funcionario: { select: { id: true, codigo: true, nome: true, setor: true, cargo: true } } } }); }

  private async prepararItens(itens: ItemReceitaDto[]) {
    if (!itens.length) throw new BadRequestException("Inclua pelo menos um ingrediente na receita.");
    const ids = [...new Set(itens.map(item => item.insumoId).filter((id): id is string => Boolean(id)))]; const insumos = ids.length ? await this.prisma.insumo.findMany({ where: { id: { in: ids } } }) : []; const porId = new Map(insumos.map(item => [item.id, item]));
    return itens.map(item => { const insumo = item.insumoId ? porId.get(item.insumoId) : undefined; if (item.insumoId && !insumo) throw new BadRequestException("Um dos ingredientes selecionados não existe mais no estoque."); return { insumoId: item.insumoId || null, nome: (item.nome || insumo?.nome || "").trim(), quantidade: item.quantidade, unidade: (item.unidade || insumo?.unidade || "").trim().toLowerCase(), custoUnitario: item.custoUnitario ?? (insumo ? numero(insumo.custoUnitario) : null) }; });
  }

  private async validarVinculos(receitaId: string, funcionarioId: string) {
    const [receita, funcionario] = await this.prisma.$transaction([this.prisma.receita.findUnique({ where: { id: receitaId }, select: { id: true, ativo: true } }), this.prisma.funcionario.findUnique({ where: { id: funcionarioId }, select: { id: true, ativo: true } })]);
    if (!receita?.ativo) throw new BadRequestException("Selecione uma receita ativa para registrar a produção."); if (!funcionario?.ativo) throw new BadRequestException("Selecione um funcionário ativo para registrar a produção.");
  }

  private dadosProducao(dto: Partial<CriarProducaoReceitaDto>) {
    const data = <T>(chave: keyof CriarProducaoReceitaDto, valor: T) => dto[chave] === undefined ? {} : { [chave]: valor };
    return { ...data("receitaId", dto.receitaId), ...data("funcionarioId", dto.funcionarioId), ...data("quantidadeProduzida", dto.quantidadeProduzida), ...data("unidade", dto.unidade?.trim().toLowerCase()), ...data("dataProducao", dto.dataProducao ? new Date(dto.dataProducao) : undefined), ...data("horaInicio", dto.horaInicio ? new Date(dto.horaInicio) : null), ...data("horaFim", dto.horaFim ? new Date(dto.horaFim) : null), ...data("lote", texto(dto.lote)), ...data("validade", dto.validade ? new Date(dto.validade) : null), ...data("status", dto.status as ProducaoReceitaStatus | undefined), ...data("observacoes", texto(dto.observacoes)) } as Prisma.ProducaoReceitaUncheckedCreateInput;
  }

  private validarHorario(inicio?: string | Date, fim?: string | Date) { if (inicio && fim && new Date(fim) < new Date(inicio)) throw new BadRequestException("O horário de término não pode ser anterior ao início."); }
  private async proximoCodigo() { for (let tentativa = 0; tentativa < 5; tentativa++) { const codigo = `REC-${Date.now().toString(36).toUpperCase()}${tentativa ? `-${tentativa}` : ""}`; if (!await this.prisma.receita.findUnique({ where: { codigo }, select: { id: true } })) return codigo; } throw new ConflictException("Não foi possível gerar um código único para a receita."); }
  private mapearReceita(receita: any) { return { ...receita, rendimento: numero(receita.rendimento), custoEstimado: receita.custoEstimado == null ? null : numero(receita.custoEstimado), itens: receita.itens?.map((item: any) => ({ ...item, quantidade: numero(item.quantidade), custoUnitario: item.custoUnitario == null ? null : numero(item.custoUnitario), insumo: item.insumo ? { ...item.insumo, custoUnitario: numero(item.insumo.custoUnitario) } : null })) }; }
  private mapearProducao(producao: any) { return { ...producao, quantidadeProduzida: numero(producao.quantidadeProduzida), tempoTotalMinutos: this.duracao(producao.horaInicio, producao.horaFim) }; }
  private duracao(inicio?: Date | null, fim?: Date | null) { return inicio && fim ? Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 60000)) : null; }
  private agrupar<T>(itens: T[], chave: (item: T) => string) { return itens.reduce((grupos, item) => { const id = chave(item); grupos.set(id, [...(grupos.get(id) ?? []), item]); return grupos; }, new Map<string, T[]>()); }
  private maior<T>(grupos: Map<string, T[]>, valor: (id: string, itens: T[]) => number) { return Array.from(grupos.entries()).sort((a, b) => valor(b[0], b[1]) - valor(a[0], a[1]))[0]; }
}