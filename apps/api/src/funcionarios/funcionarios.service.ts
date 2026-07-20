import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AtualizarFuncionarioDto, CriarFuncionarioDto, ListarFuncionariosDto } from "./funcionarios.dto.js";

const normalizar = (valor?: string) => valor?.trim() || null;
const normalizarCpf = (valor?: string) => {
  const cpf = valor?.replace(/\D/g, "");
  return cpf || null;
};

@Injectable()
export class FuncionariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(dto: ListarFuncionariosDto) {
    const where: any = {
      ...(dto.status === "ativo" ? { ativo: true } : dto.status === "inativo" ? { ativo: false } : {}),
      ...(dto.setor ? { setor: { equals: dto.setor, mode: "insensitive" } } : {}),
      ...(dto.cargo ? { cargo: { equals: dto.cargo, mode: "insensitive" } } : {}),
    };
    if (dto.busca?.trim()) {
      const busca = dto.busca.trim();
      where.OR = [
        { nome: { contains: busca, mode: "insensitive" } },
        { cpf: { contains: busca.replace(/\D/g, "") } },
        { cargo: { contains: busca, mode: "insensitive" } },
        { setor: { contains: busca, mode: "insensitive" } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.funcionario.findMany({
        where,
        orderBy: { [dto.ordenarPor]: dto.direcao },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
        include: { usuario: { select: { id: true, login: true, email: true, role: true, ativo: true } } },
      }),
      this.prisma.funcionario.count({ where }),
    ]);
    return { data, meta: { page: dto.page, limit: dto.limit, total, pages: Math.max(1, Math.ceil(total / dto.limit)) } };
  }

  async listarAtivos() {
    return this.prisma.funcionario.findMany({
      where: { ativo: true },
      select: { id: true, codigo: true, nome: true, cargo: true, setor: true },
      orderBy: { nome: "asc" },
    });
  }

  async buscar(id: string) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
      include: { usuario: { select: { id: true, login: true, email: true, role: true, ativo: true, ultimoAcesso: true } } },
    });
    if (!funcionario) throw new NotFoundException("Funcionário não encontrado.");
    return funcionario;
  }

  async criar(dto: CriarFuncionarioDto) {
    const cpf = normalizarCpf(dto.cpf);
    if (cpf) await this.garantirCpfDisponivel(cpf);
    return this.prisma.funcionario.create({ data: this.dados(dto, cpf) });
  }

  async atualizar(id: string, dto: AtualizarFuncionarioDto) {
    await this.buscar(id);
    const cpf = dto.cpf === undefined ? undefined : normalizarCpf(dto.cpf);
    if (cpf) await this.garantirCpfDisponivel(cpf, id);
    return this.prisma.funcionario.update({ where: { id }, data: this.dados(dto, cpf) });
  }

  async desativar(id: string) {
    await this.buscar(id);
    return this.prisma.funcionario.update({ where: { id }, data: { ativo: false } });
  }

  private dados(dto: CriarFuncionarioDto | AtualizarFuncionarioDto, cpf?: string | null) {
    const campo = <T>(nome: keyof typeof dto, valor: T) => dto[nome] === undefined ? {} : { [nome]: valor };
    return {
      ...campo("nome", dto.nome?.trim()),
      ...(cpf === undefined ? {} : { cpf }),
      ...campo("rg", normalizar(dto.rg)),
      ...campo("dataNascimento", dto.dataNascimento ? new Date(dto.dataNascimento) : null),
      ...campo("dataAdmissao", dto.dataAdmissao ? new Date(dto.dataAdmissao) : null),
      ...campo("cargo", dto.cargo?.trim()),
      ...campo("setor", dto.setor?.trim()),
      ...campo("telefone", normalizar(dto.telefone)),
      ...campo("email", normalizar(dto.email)?.toLowerCase() || null),
      ...campo("endereco", normalizar(dto.endereco)),
      ...campo("salario", dto.salario ?? null),
      ...campo("ativo", dto.ativo),
      ...campo("observacoes", normalizar(dto.observacoes)),
      ...campo("fotoUrl", normalizar(dto.fotoUrl)),
    } as any;
  }

  private async garantirCpfDisponivel(cpf: string, ignorarId?: string) {
    const existente = await this.prisma.funcionario.findUnique({ where: { cpf }, select: { id: true } });
    if (existente && existente.id !== ignorarId) throw new ConflictException("Já existe um funcionário com este CPF.");
  }
}