import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client.js";
import {
  LogisticaOcorrenciaStatus,
  LogisticaPedidoStatus,
} from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AtualizarStatusPedidoLogisticaDto,
  CriarOcorrenciaLogisticaDto,
  CriarPedidoLogisticaDto,
  EntregadorLogisticaDto,
  ImportarLogisticaDto,
  ImportarPedidoLogisticaDto,
  ListarPedidosLogisticaDto,
  ResolverOcorrenciaLogisticaDto,
  SalvarConfiguracaoLogisticaDto,
} from "./logistica.dto.js";

const CONFIGURACAO_PADRAO = {
  id: "principal",
  enderecoOrigem: "Rua Assis Figueiredo, 555, Loja 2, Centro, Poços de Caldas - MG",
  tipoCalculoDistancia: "ida",
  valorKm: 2.5,
  valorMinimo: 8,
  raioMaximoKm: 12,
};

const TRANSICOES: Record<LogisticaPedidoStatus, LogisticaPedidoStatus[]> = {
  AGUARDANDO: [
    LogisticaPedidoStatus.EM_PREPARO,
    LogisticaPedidoStatus.PRONTO,
    LogisticaPedidoStatus.COLETA,
    LogisticaPedidoStatus.PROBLEMA,
    LogisticaPedidoStatus.CANCELADO,
  ],
  EM_PREPARO: [
    LogisticaPedidoStatus.PRONTO,
    LogisticaPedidoStatus.PROBLEMA,
    LogisticaPedidoStatus.CANCELADO,
  ],
  PRONTO: [
    LogisticaPedidoStatus.COLETA,
    LogisticaPedidoStatus.PROBLEMA,
    LogisticaPedidoStatus.CANCELADO,
  ],
  COLETA: [
    LogisticaPedidoStatus.NA_LOJA,
    LogisticaPedidoStatus.EM_ROTA,
    LogisticaPedidoStatus.PROBLEMA,
    LogisticaPedidoStatus.CANCELADO,
  ],
  NA_LOJA: [
    LogisticaPedidoStatus.EM_ROTA,
    LogisticaPedidoStatus.PROBLEMA,
    LogisticaPedidoStatus.CANCELADO,
  ],
  EM_ROTA: [
    LogisticaPedidoStatus.NO_DESTINO,
    LogisticaPedidoStatus.ENTREGUE,
    LogisticaPedidoStatus.PROBLEMA,
    LogisticaPedidoStatus.RETORNANDO,
  ],
  NO_DESTINO: [
    LogisticaPedidoStatus.ENTREGUE,
    LogisticaPedidoStatus.PROBLEMA,
    LogisticaPedidoStatus.RETORNANDO,
  ],
  PROBLEMA: [
    LogisticaPedidoStatus.AGUARDANDO,
    LogisticaPedidoStatus.COLETA,
    LogisticaPedidoStatus.EM_ROTA,
    LogisticaPedidoStatus.CANCELADO,
  ],
  RETORNANDO: [
    LogisticaPedidoStatus.ENTREGUE,
    LogisticaPedidoStatus.PROBLEMA,
  ],
  ENTREGUE: [],
  CANCELADO: [],
};

export function podeAlterarStatusLogistica(
  atual: LogisticaPedidoStatus,
  proximo: LogisticaPedidoStatus,
) {
  return atual === proximo || (TRANSICOES[atual] || []).includes(proximo);
}

const incluirPedido = {
  entregador: true,
  etapas: { orderBy: { criadoEm: "asc" as const } },
  ocorrencias: { orderBy: { criadoEm: "desc" as const } },
  localizacoes: { orderBy: { registradoEm: "desc" as const }, take: 1 },
};

const texto = (valor?: string | null) => valor?.trim() || null;
const STATUS_ROTA_ATIVA: LogisticaPedidoStatus[] = [
  LogisticaPedidoStatus.COLETA,
  LogisticaPedidoStatus.NA_LOJA,
  LogisticaPedidoStatus.EM_ROTA,
  LogisticaPedidoStatus.NO_DESTINO,
  LogisticaPedidoStatus.PROBLEMA,
  LogisticaPedidoStatus.RETORNANDO,
];
const LIMITE_PEDIDOS_ROTA = 4;

const data = (valor?: string | null) => valor ? new Date(valor) : null;
const numero = (valor: unknown) => valor == null ? null : Number(valor);

@Injectable()
export class LogisticaOperacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(dto: ListarPedidosLogisticaDto) {
    const where: any = dto.status ? { status: dto.status } : {};
    if (dto.busca?.trim()) {
      const busca = dto.busca.trim();
      where.OR = [
        { codigoPedido: { contains: busca, mode: "insensitive" } },
        { clienteNome: { contains: busca, mode: "insensitive" } },
        { endereco: { contains: busca, mode: "insensitive" } },
        { bairro: { contains: busca, mode: "insensitive" } },
        { entregador: { is: { nome: { contains: busca, mode: "insensitive" } } } },
      ];
    }

    const [pedidos, total] = await this.prisma.$transaction([
      this.prisma.logisticaPedido.findMany({
        where,
        include: incluirPedido,
        orderBy: { atualizadoEm: "desc" },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),
      this.prisma.logisticaPedido.count({ where }),
    ]);

    return {
      data: pedidos.map((pedido) => this.serializarPedido(pedido)),
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        pages: Math.max(1, Math.ceil(total / dto.limit)),
      },
    };
  }

  async buscar(id: string) {
    return this.serializarPedido(await this.buscarRegistro(id));
  }

  async criar(dto: CriarPedidoLogisticaDto, usuarioId: string) {
    const canal = texto(dto.canal) || "Direto";
    const idExterno = texto(dto.idExterno);
    if (idExterno) {
      const existente = await this.prisma.logisticaPedido.findFirst({
        where: { canal, idExterno },
        include: incluirPedido,
      });
      if (existente) return this.serializarPedido(existente);
    }

    const codigoPedido = texto(dto.codigoPedido)
      || `MAN-${String(Date.now()).slice(-8)}`;
    const pedido = await this.prisma.$transaction(async (tx) => {
      const criado = await tx.logisticaPedido.create({
        data: {
          ...this.dadosPedido(dto),
          canal,
          idExterno,
          codigoPedido,
          status: LogisticaPedidoStatus.AGUARDANDO,
          criadoPorUsuarioId: usuarioId,
          atualizadoPorUsuarioId: usuarioId,
        },
      });
      await tx.logisticaPedidoEtapa.create({
        data: {
          pedidoId: criado.id,
          status: LogisticaPedidoStatus.AGUARDANDO,
          descricao: "Pedido criado manualmente.",
          usuarioId,
        },
      });
      return tx.logisticaPedido.findUniqueOrThrow({
        where: { id: criado.id },
        include: incluirPedido,
      });
    });
    return this.serializarPedido(pedido);
  }

  async atualizarStatus(
    id: string,
    dto: AtualizarStatusPedidoLogisticaDto,
    usuarioId: string,
  ) {
    const atual = await this.buscarRegistro(id);
    if (atual.status === dto.status) return this.serializarPedido(atual);
    if (!podeAlterarStatusLogistica(atual.status, dto.status)) {
      throw new BadRequestException(
        `Não é permitido alterar a entrega de ${atual.status} para ${dto.status}.`,
      );
    }

    const agora = new Date();
    const atualizado = await this.prisma.$transaction(async (tx) => {
      const entregadorId = dto.entregador === null
        ? null
        : dto.entregador
          ? (await this.garantirEntregador(tx, dto.entregador)).id
          : undefined;
      const timestamps = this.timestampsParaStatus(dto.status, agora);
      let rota: { rotaId: string; ordemNaRota: number } | null = null;
      if (dto.status === LogisticaPedidoStatus.COLETA && entregadorId) {
        const pedidosAtivos = await tx.logisticaPedido.findMany({
          where: {
            entregadorId,
            id: { not: id },
            status: { in: STATUS_ROTA_ATIVA },
          },
          select: { rotaId: true, ordemNaRota: true },
          orderBy: { ordemNaRota: "desc" },
        });
        if (pedidosAtivos.length >= LIMITE_PEDIDOS_ROTA) {
          throw new BadRequestException(
            `Este entregador já está com ${LIMITE_PEDIDOS_ROTA} pedidos na rota.`,
          );
        }
        const rotaId = pedidosAtivos.find((item: any) => item.rotaId)?.rotaId
          || `ROTA-${entregadorId}-${Date.now()}`;
        const maiorOrdem = pedidosAtivos.reduce(
          (maior: number, item: any) => Math.max(maior, item.ordemNaRota || 0),
          0,
        );
        rota = { rotaId, ordemNaRota: maiorOrdem + 1 };
      }
      const dados: any = {
        status: dto.status,
        atualizadoPorUsuarioId: usuarioId,
        ...timestamps,
        ...(entregadorId === undefined ? {} : { entregadorId }),
        ...(rota || {}),
        ...(dto.custoEstimado === undefined ? {} : { custoEstimado: dto.custoEstimado }),
        ...(dto.custoReal === undefined ? {} : { custoReal: dto.custoReal }),
        ...(dto.origemValor === undefined ? {} : { origemValor: texto(dto.origemValor) }),
        ...(dto.tabelaEmpresa === undefined ? {} : { tabelaEmpresa: texto(dto.tabelaEmpresa) }),
        ...(dto.distanciaCobradaKm === undefined ? {} : { distanciaCobradaKm: dto.distanciaCobradaKm }),
      };

      await tx.logisticaPedido.update({ where: { id }, data: dados });
      await tx.logisticaPedidoEtapa.create({
        data: {
          pedidoId: id,
          status: dto.status,
          descricao: texto(dto.descricao),
          usuarioId,
          dados: {
            ...(dto.entregador ? {
              entregador: {
                codigo: dto.entregador.id || null,
                nome: dto.entregador.nome,
                empresa: dto.entregador.empresa,
              },
            } : {}),
            ...(dto.custoEstimado === undefined ? {} : { custoEstimado: dto.custoEstimado }),
            ...(dto.custoReal === undefined ? {} : { custoReal: dto.custoReal }),
          },
        },
      });

      if (dto.status === LogisticaPedidoStatus.PROBLEMA && texto(dto.ocorrencia)) {
        await tx.logisticaOcorrencia.create({
          data: {
            pedidoId: id,
            descricao: texto(dto.ocorrencia)!,
            abertaPorUsuarioId: usuarioId,
          },
        });
      } else if (
        atual.status === LogisticaPedidoStatus.PROBLEMA
        && dto.status !== LogisticaPedidoStatus.PROBLEMA
      ) {
        await tx.logisticaOcorrencia.updateMany({
          where: {
            pedidoId: id,
            status: LogisticaOcorrenciaStatus.ABERTA,
          },
          data: {
            status: LogisticaOcorrenciaStatus.RESOLVIDA,
            resolucao: texto(dto.descricao) || "Operação retomada.",
            resolvidaPorUsuarioId: usuarioId,
            resolvidaEm: agora,
          },
        });
      }

      return tx.logisticaPedido.findUniqueOrThrow({
        where: { id },
        include: incluirPedido,
      });
    });
    return this.serializarPedido(atualizado);
  }

  async criarOcorrencia(
    pedidoId: string,
    dto: CriarOcorrenciaLogisticaDto,
    usuarioId: string,
  ) {
    const pedido = await this.buscarRegistro(pedidoId);
    if (
      pedido.status === LogisticaPedidoStatus.ENTREGUE
      || pedido.status === LogisticaPedidoStatus.CANCELADO
    ) {
      throw new BadRequestException("Não é possível abrir ocorrência em uma entrega finalizada.");
    }

    const atualizado = await this.prisma.$transaction(async (tx) => {
      const ocorrencia = await tx.logisticaOcorrencia.create({
        data: {
          pedidoId,
          tipo: texto(dto.tipo) || "OPERACIONAL",
          descricao: dto.descricao.trim(),
          abertaPorUsuarioId: usuarioId,
        },
      });
      await tx.logisticaPedido.update({
        where: { id: pedidoId },
        data: {
          status: LogisticaPedidoStatus.PROBLEMA,
          atualizadoPorUsuarioId: usuarioId,
        },
      });
      await tx.logisticaPedidoEtapa.create({
        data: {
          pedidoId,
          status: LogisticaPedidoStatus.PROBLEMA,
          descricao: dto.descricao.trim(),
          usuarioId,
          dados: { ocorrenciaId: ocorrencia.id, tipo: ocorrencia.tipo },
        },
      });
      return tx.logisticaPedido.findUniqueOrThrow({
        where: { id: pedidoId },
        include: incluirPedido,
      });
    });
    return this.serializarPedido(atualizado);
  }

  async resolverOcorrencia(
    id: string,
    dto: ResolverOcorrenciaLogisticaDto,
    usuarioId: string,
  ) {
    const ocorrencia = await this.prisma.logisticaOcorrencia.findUnique({ where: { id } });
    if (!ocorrencia) throw new NotFoundException("Ocorrência não encontrada.");
    if (ocorrencia.status === LogisticaOcorrenciaStatus.RESOLVIDA) return ocorrencia;
    return this.prisma.logisticaOcorrencia.update({
      where: { id },
      data: {
        status: LogisticaOcorrenciaStatus.RESOLVIDA,
        resolucao: dto.resolucao.trim(),
        resolvidaPorUsuarioId: usuarioId,
        resolvidaEm: new Date(),
      },
    });
  }

  async obterConfiguracao() {
    const configuracao = await this.prisma.logisticaConfiguracao.upsert({
      where: { id: CONFIGURACAO_PADRAO.id },
      create: CONFIGURACAO_PADRAO,
      update: {},
    });
    return this.serializarConfiguracao(configuracao);
  }

  async salvarConfiguracao(dto: SalvarConfiguracaoLogisticaDto, usuarioId: string) {
    const configuracao = await this.prisma.logisticaConfiguracao.upsert({
      where: { id: CONFIGURACAO_PADRAO.id },
      create: {
        id: CONFIGURACAO_PADRAO.id,
        enderecoOrigem: dto.enderecoOrigem.trim(),
        tipoCalculoDistancia: dto.tipoCalculoDistancia,
        valorKm: dto.valorKm,
        valorMinimo: dto.valorMinimo,
        raioMaximoKm: dto.raioMaximoKm,
        atualizadoPorUsuarioId: usuarioId,
      },
      update: {
        enderecoOrigem: dto.enderecoOrigem.trim(),
        tipoCalculoDistancia: dto.tipoCalculoDistancia,
        valorKm: dto.valorKm,
        valorMinimo: dto.valorMinimo,
        raioMaximoKm: dto.raioMaximoKm,
        atualizadoPorUsuarioId: usuarioId,
      },
    });
    return this.serializarConfiguracao(configuracao);
  }

  async importar(dto: ImportarLogisticaDto, usuarioId: string) {
    if (dto.configuracao) await this.salvarConfiguracao(dto.configuracao, usuarioId);
    let importados = 0;
    let ignorados = 0;

    for (const legado of dto.pedidos) {
      const existente = await this.prisma.logisticaPedido.findUnique({
        where: { idLegado: legado.idLegado },
        select: { id: true },
      });
      if (existente) {
        ignorados += 1;
        continue;
      }

      const duplicadoExterno = legado.idExterno
        ? await this.prisma.logisticaPedido.findFirst({
            where: {
              canal: texto(legado.canal) || "Direto",
              idExterno: legado.idExterno.trim(),
            },
            select: { id: true, idLegado: true },
          })
        : null;
      if (duplicadoExterno) {
        if (!duplicadoExterno.idLegado) {
          await this.prisma.logisticaPedido.update({
            where: { id: duplicadoExterno.id },
            data: {
              idLegado: legado.idLegado,
              atualizadoPorUsuarioId: usuarioId,
            },
          });
        }
        ignorados += 1;
        continue;
      }

      await this.importarPedido(legado, usuarioId);
      importados += 1;
    }
    return { importados, ignorados, total: dto.pedidos.length };
  }

  private async importarPedido(legado: ImportarPedidoLogisticaDto, usuarioId: string) {
    return this.prisma.$transaction(async (tx) => {
      const entregador = legado.entregador
        ? await this.garantirEntregador(tx, legado.entregador)
        : null;
      const status = legado.status || LogisticaPedidoStatus.AGUARDANDO;
      const criadoEm = data(legado.criadoEm) || new Date();
      const atualizadoEm = data(legado.atualizadoEm) || criadoEm;
      const pedido = await tx.logisticaPedido.create({
        data: {
          ...this.dadosPedido(legado),
          idLegado: legado.idLegado,
          idExterno: texto(legado.idExterno),
          codigoPedido: texto(legado.codigoPedido) || `LEG-${String(Date.now()).slice(-8)}`,
          status,
          entregadorId: entregador?.id || null,
          atribuidoEm: data(legado.atribuidoEm),
          coletadoEm: data(legado.coletadoEm),
          saiuEntregaEm: data(legado.saiuEntregaEm),
          entregueEm: data(legado.entregueEm),
          canceladoEm: data(legado.canceladoEm),
          criadoPorUsuarioId: usuarioId,
          atualizadoPorUsuarioId: usuarioId,
          criadoEm,
          atualizadoEm,
        },
      });

      const etapas = legado.historico?.length
        ? legado.historico
        : [{ status, descricao: "Pedido migrado do armazenamento local.", em: legado.criadoEm }];
      await tx.logisticaPedidoEtapa.createMany({
        data: etapas.map((etapa) => ({
          pedidoId: pedido.id,
          status: etapa.status,
          descricao: texto(etapa.descricao),
          dados: etapa.dados as Prisma.InputJsonValue | undefined,
          usuarioId,
          criadoEm: data(etapa.em) || criadoEm,
        })),
      });
      if (texto(legado.ocorrencia)) {
        await tx.logisticaOcorrencia.create({
          data: {
            pedidoId: pedido.id,
            descricao: texto(legado.ocorrencia)!,
            abertaPorUsuarioId: usuarioId,
            criadoEm: atualizadoEm,
          },
        });
      }
    });
  }

  private dadosPedido(dto: CriarPedidoLogisticaDto) {
    return {
      clienteNome: dto.clienteNome.trim(),
      clienteTelefone: texto(dto.clienteTelefone),
      endereco: dto.endereco.trim(),
      complemento: texto(dto.complemento),
      referencia: texto(dto.referencia),
      bairro: dto.bairro.trim(),
      canal: texto(dto.canal) || "Direto",
      formaPagamento: texto(dto.formaPagamento) || "PIX",
      valorPedido: dto.valorPedido || 0,
      taxaEntregaCliente: dto.taxaEntregaCliente || 0,
      distanciaKm: dto.distanciaKm,
      distanciaCobradaKm: dto.distanciaCobradaKm ?? null,
      duracaoEstimadaMinutos: dto.duracaoEstimadaMinutos ?? null,
      enderecoOrigem: dto.enderecoOrigem.trim(),
      tipoCalculoDistancia: dto.tipoCalculoDistancia || "ida",
      origemDistancia: texto(dto.origemDistancia) || "MANUAL",
      rotaCalculada: dto.rotaCalculada as Prisma.InputJsonValue | undefined,
      custoEstimado: dto.custoEstimado || 0,
      custoReal: dto.custoReal ?? null,
      origemValor: texto(dto.origemValor),
      tabelaEmpresa: texto(dto.tabelaEmpresa),
      observacoes: texto(dto.observacoes),
      origem: texto(dto.origem) || "MANUAL",
    };
  }

  private timestampsParaStatus(status: LogisticaPedidoStatus, agora: Date) {
    if (status === LogisticaPedidoStatus.COLETA) return { atribuidoEm: agora };
    if (status === LogisticaPedidoStatus.NA_LOJA) return { chegouLojaEm: agora };
    if (status === LogisticaPedidoStatus.EM_ROTA) {
      return { coletadoEm: agora, saiuEntregaEm: agora };
    }
    if (status === LogisticaPedidoStatus.NO_DESTINO) return { chegouDestinoEm: agora };
    if (status === LogisticaPedidoStatus.ENTREGUE) return { entregueEm: agora };
    if (status === LogisticaPedidoStatus.CANCELADO) return { canceladoEm: agora };
    return {};
  }

  private async garantirEntregador(tx: any, dto: EntregadorLogisticaDto) {
    const codigoExterno = texto(dto.id);
    if (codigoExterno) {
      const existente = await tx.logisticaEntregador.findFirst({
        where: { OR: [{ id: codigoExterno }, { codigoExterno }] },
      });
      if (existente) {
        return tx.logisticaEntregador.update({
          where: { id: existente.id },
          data: {
            nome: dto.nome.trim(),
            empresa: dto.empresa.trim(),
            telefone: texto(dto.telefone),
            ...(dto.ativo === undefined ? {} : { ativo: dto.ativo }),
          },
        });
      }
    }

    const existente = await tx.logisticaEntregador.findFirst({
      where: {
        nome: { equals: dto.nome.trim(), mode: "insensitive" },
        empresa: { equals: dto.empresa.trim(), mode: "insensitive" },
      },
    });
    if (existente) return existente;
    return tx.logisticaEntregador.create({
      data: {
        codigoExterno,
        nome: dto.nome.trim(),
        telefone: texto(dto.telefone),
        empresa: dto.empresa.trim(),
        ativo: dto.ativo ?? true,
      },
    });
  }

  private async buscarRegistro(id: string) {
    const pedido = await this.prisma.logisticaPedido.findUnique({
      where: { id },
      include: incluirPedido,
    });
    if (!pedido) throw new NotFoundException("Pedido logístico não encontrado.");
    return pedido;
  }

  private serializarConfiguracao(configuracao: any) {
    return {
      id: configuracao.id,
      enderecoOrigem: configuracao.enderecoOrigem,
      tipoCalculoDistancia: configuracao.tipoCalculoDistancia,
      valorKm: Number(configuracao.valorKm),
      valorMinimo: Number(configuracao.valorMinimo),
      raioMaximoKm: Number(configuracao.raioMaximoKm),
      atualizadoEm: configuracao.atualizadoEm,
    };
  }

  private serializarPedido(pedido: any) {
    const ocorrenciaAberta = pedido.ocorrencias?.find(
      (item: any) => item.status === LogisticaOcorrenciaStatus.ABERTA,
    );
    return {
      ...pedido,
      valorPedido: numero(pedido.valorPedido) || 0,
      taxaEntregaCliente: numero(pedido.taxaEntregaCliente) || 0,
      distanciaKm: numero(pedido.distanciaKm) || 0,
      distanciaCobradaKm: numero(pedido.distanciaCobradaKm),
      custoEstimado: numero(pedido.custoEstimado) || 0,
      custoReal: numero(pedido.custoReal),
      ultimaLocalizacao: pedido.localizacoes?.length ? {
        latitude: Number(pedido.localizacoes[0].latitude),
        longitude: Number(pedido.localizacoes[0].longitude),
        precisaoMetros: pedido.localizacoes[0].precisaoMetros,
        velocidadeKmh: pedido.localizacoes[0].velocidadeKmh,
        direcaoGraus: pedido.localizacoes[0].direcaoGraus,
        registradoEm: pedido.localizacoes[0].registradoEm,
      } : null,
      entregador: pedido.entregador ? {
        id: pedido.entregador.codigoExterno || pedido.entregador.id,
        bancoId: pedido.entregador.id,
        nome: pedido.entregador.nome,
        empresa: pedido.entregador.empresa,
        telefone: pedido.entregador.telefone,
        ativo: pedido.entregador.ativo,
      } : null,
      historico: (pedido.etapas || []).map((etapa: any) => ({
        id: etapa.id,
        status: etapa.status,
        em: etapa.criadoEm,
        descricao: etapa.descricao,
        dados: etapa.dados,
      })),
      ocorrencia: ocorrenciaAberta?.descricao || null,
      ocorrencias: pedido.ocorrencias || [],
      etapas: undefined,
      localizacoes: undefined,
    };
  }
}
