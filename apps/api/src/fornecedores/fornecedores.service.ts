import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AtualizarFornecedorDto, CriarFornecedorDto, ListarFornecedoresDto } from "./fornecedores.dto.js";

const normalizar = (valor?: string) => valor?.trim() || null;
const normalizarCnpj = (valor?: string) => valor?.replace(/\D/g, "") || null;

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(dto: ListarFornecedoresDto) {
    const where: any = {
      ...(dto.status === "ativo" ? { ativo: true } : dto.status === "inativo" ? { ativo: false } : {}),
      ...(dto.categoria ? { categoria: { equals: dto.categoria, mode: "insensitive" } } : {}),
      ...(dto.estado ? { estado: { equals: dto.estado, mode: "insensitive" } } : {}),
    };
    if (dto.busca?.trim()) {
      const busca = dto.busca.trim();
      where.OR = [
        { nome: { contains: busca, mode: "insensitive" } },
        { razaoSocial: { contains: busca, mode: "insensitive" } },
        { nomeFantasia: { contains: busca, mode: "insensitive" } },
        { cnpj: { contains: busca.replace(/\D/g, "") } },
        { cidade: { contains: busca, mode: "insensitive" } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.fornecedor.findMany({ where, orderBy: { [dto.ordenarPor]: dto.direcao }, skip: (dto.page - 1) * dto.limit, take: dto.limit }),
      this.prisma.fornecedor.count({ where }),
    ]);
    return { data, meta: { page: dto.page, limit: dto.limit, total, pages: Math.max(1, Math.ceil(total / dto.limit)) } };
  }

  async buscarPorId(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
      include: {
        pedidos: { orderBy: { criadoEm: "desc" }, take: 5 },
        comprasManuais: { orderBy: { criadoEm: "desc" }, take: 5, include: { insumo: true } },
        entradasBoleto: { orderBy: { criadoEm: "desc" }, take: 5, include: { insumo: true } },
        notasFiscais: { orderBy: { criadoEm: "desc" }, take: 5 },
      },
    });
    if (!fornecedor) throw new NotFoundException("Fornecedor não encontrado.");
    return fornecedor;
  }

  async criar(dto: CriarFornecedorDto) {
    const dados = this.dados(dto);
    if (!dados.nome) throw new BadRequestException("Informe a razão social ou o nome fantasia do fornecedor.");
    if (dados.cnpj) await this.garantirCnpjDisponivel(dados.cnpj);
    return this.prisma.fornecedor.create({ data: dados });
  }

  async atualizar(id: string, dto: AtualizarFornecedorDto) {
    const atual = await this.buscarPorId(id);
    const dados = this.dados(dto, atual.nome);
    if (dados.cnpj && dados.cnpj !== atual.cnpj) await this.garantirCnpjDisponivel(dados.cnpj, id);
    return this.prisma.fornecedor.update({ where: { id }, data: dados });
  }

  async desativar(id: string) {
    await this.buscarPorId(id);
    return this.prisma.fornecedor.update({ where: { id }, data: { ativo: false } });
  }

  private dados(dto: CriarFornecedorDto | AtualizarFornecedorDto, nomeAtual?: string) {
    const razaoSocial = normalizar(dto.razaoSocial);
    const nomeFantasia = normalizar(dto.nomeFantasia);
    const nomeInformado = normalizar(dto.nome);
    const nome = nomeInformado || nomeFantasia || razaoSocial || nomeAtual;
    const campo = <T>(nomeCampo: keyof typeof dto, valor: T) => dto[nomeCampo] === undefined ? {} : { [nomeCampo]: valor };
    return {
      ...(nome ? { nome } : {}),
      ...campo("razaoSocial", razaoSocial),
      ...campo("nomeFantasia", nomeFantasia),
      ...campo("cnpj", normalizarCnpj(dto.cnpj)),
      ...campo("inscricaoEstadual", normalizar(dto.inscricaoEstadual)),
      ...campo("telefone", normalizar(dto.telefone)),
      ...campo("whatsapp", normalizar(dto.whatsapp)),
      ...campo("email", normalizar(dto.email)?.toLowerCase() || null),
      ...campo("site", normalizar(dto.site)),
      ...campo("endereco", normalizar(dto.endereco)),
      ...campo("cidade", normalizar(dto.cidade)),
      ...campo("estado", normalizar(dto.estado)?.toUpperCase() || null),
      ...campo("cep", normalizar(dto.cep)),
      ...campo("contatoPrincipal", normalizar(dto.contatoPrincipal)),
      ...campo("categoria", normalizar(dto.categoria)),
      ...campo("formaPagamento", normalizar(dto.formaPagamento)),
      ...campo("prazoPagamento", dto.prazoPagamento ?? null),
      ...campo("ativo", dto.ativo),
      ...campo("observacao", normalizar(dto.observacao)),
    } as any;
  }

  private async garantirCnpjDisponivel(cnpj: string, ignorarId?: string) {
    const existente = await this.prisma.fornecedor.findUnique({ where: { cnpj }, select: { id: true } });
    if (existente && existente.id !== ignorarId) throw new ConflictException("Já existe um fornecedor com este CNPJ.");
  }
}