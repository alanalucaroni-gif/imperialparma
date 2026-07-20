import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { Role } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AtualizarUsuarioDto, CriarUsuarioDto, ListarUsuariosDto, RedefinirSenhaUsuarioDto } from "./usuarios.dto.js";

const usuarioSeguro = {
  id: true,
  nome: true,
  login: true,
  email: true,
  role: true,
  permissoes: true,
  ativo: true,
  ultimoAcesso: true,
  criadoEm: true,
  atualizadoEm: true,
  funcionario: { select: { id: true, codigo: true, nome: true, cargo: true, setor: true } },
} as const;

const normalizar = (valor?: string) => valor?.trim() || null;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(dto: ListarUsuariosDto) {
    const where: any = {
      ...(dto.status === "ativo" ? { ativo: true } : dto.status === "inativo" ? { ativo: false } : {}),
      ...(dto.perfil ? { role: dto.perfil } : {}),
    };
    if (dto.busca?.trim()) {
      const busca = dto.busca.trim();
      where.OR = [
        { nome: { contains: busca, mode: "insensitive" } },
        { login: { contains: busca, mode: "insensitive" } },
        { email: { contains: busca, mode: "insensitive" } },
        { funcionario: { is: { nome: { contains: busca, mode: "insensitive" } } } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where,
        select: usuarioSeguro,
        orderBy: { [dto.ordenarPor]: dto.direcao },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),
      this.prisma.usuario.count({ where }),
    ]);
    return { data, meta: { page: dto.page, limit: dto.limit, total, pages: Math.max(1, Math.ceil(total / dto.limit)) } };
  }

  async criar(dto: CriarUsuarioDto) {
    const email = dto.email.trim().toLowerCase();
    const login = dto.login.trim().toLowerCase();
    await this.garantirEmailDisponivel(email);
    await this.garantirLoginDisponivel(login);
    if (dto.funcionarioId) await this.garantirFuncionarioDisponivel(dto.funcionarioId);
    return this.prisma.usuario.create({
      data: {
        nome: dto.nome.trim(),
        login,
        email,
        role: dto.role,
        permissoes: dto.permissoes ?? [],
        funcionarioId: normalizar(dto.funcionarioId),
        ativo: dto.ativo ?? true,
        senhaHash: await hash(dto.senha, 12),
      },
      select: usuarioSeguro,
    });
  }

  async atualizar(id: string, dto: AtualizarUsuarioDto, solicitanteId: string) {
    const usuario = await this.buscar(id);
    const email = dto.email?.trim().toLowerCase();
    const login = dto.login?.trim().toLowerCase();
    if (email && email !== usuario.email) await this.garantirEmailDisponivel(email, id);
    if (login && login !== usuario.login) await this.garantirLoginDisponivel(login, id);
    if (dto.funcionarioId) await this.garantirFuncionarioDisponivel(dto.funcionarioId, id);
    if (id === solicitanteId && dto.role && dto.role !== usuario.role) {
      throw new ForbiddenException("Não é possível alterar o seu próprio perfil de acesso.");
    }
    await this.garantirAdministradorAtivo(usuario, dto);

    const atualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome.trim() } : {}),
        ...(email ? { email } : {}),
        ...(login ? { login } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.permissoes !== undefined ? { permissoes: dto.permissoes } : {}),
        ...(dto.funcionarioId !== undefined ? { funcionarioId: normalizar(dto.funcionarioId) } : {}),
        ...(dto.ativo !== undefined ? { ativo: dto.ativo } : {}),
      },
      select: usuarioSeguro,
    });
    if (dto.ativo === false) {
      await this.prisma.refreshToken.updateMany({ where: { usuarioId: id, revogadoEm: null }, data: { revogadoEm: new Date() } });
    }
    return atualizado;
  }

  async redefinirSenha(id: string, dto: RedefinirSenhaUsuarioDto) {
    await this.buscar(id);
    const agora = new Date();
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id }, data: { senhaHash: await hash(dto.senha, 12) } }),
      this.prisma.refreshToken.updateMany({ where: { usuarioId: id, revogadoEm: null }, data: { revogadoEm: agora } }),
    ]);
    return { message: "Senha redefinida. Os acessos anteriores foram encerrados." };
  }

  async desativar(id: string, solicitanteId: string) {
    if (id === solicitanteId) throw new ForbiddenException("Não é possível desativar a sua própria conta.");
    const usuario = await this.buscar(id);
    await this.garantirAdministradorAtivo(usuario, { ativo: false });
    return this.atualizar(id, { ativo: false }, solicitanteId);
  }

  private async buscar(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException("Usuário não encontrado.");
    return usuario;
  }

  private async garantirEmailDisponivel(email: string, ignorarId?: string) {
    const existente = await this.prisma.usuario.findUnique({ where: { email }, select: { id: true } });
    if (existente && existente.id !== ignorarId) throw new ConflictException("Já existe um usuário com este e-mail.");
  }

  private async garantirLoginDisponivel(login: string, ignorarId?: string) {
    const existente = await this.prisma.usuario.findUnique({ where: { login }, select: { id: true } });
    if (existente && existente.id !== ignorarId) throw new ConflictException("Este login já está em uso.");
  }

  private async garantirFuncionarioDisponivel(funcionarioId: string, usuarioAtualId?: string) {
    const funcionario = await this.prisma.funcionario.findUnique({ where: { id: funcionarioId }, include: { usuario: true } });
    if (!funcionario) throw new BadRequestException("Funcionário vinculado não encontrado.");
    if (funcionario.usuario && funcionario.usuario.id !== usuarioAtualId) {
      throw new ConflictException("Este funcionário já está vinculado a outro usuário.");
    }
  }

  private async garantirAdministradorAtivo(usuario: { role: Role; ativo: boolean }, dto: Pick<AtualizarUsuarioDto, "role" | "ativo">) {
    const deixaDeSerAdministrador = usuario.role === Role.ADMINISTRADOR
      && usuario.ativo
      && ((dto.role !== undefined && dto.role !== Role.ADMINISTRADOR) || dto.ativo === false);
    if (!deixaDeSerAdministrador) return;
    const administradoresAtivos = await this.prisma.usuario.count({ where: { role: Role.ADMINISTRADOR, ativo: true } });
    if (administradoresAtivos <= 1) {
      throw new BadRequestException("O sistema precisa manter ao menos um administrador ativo.");
    }
  }
}