import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { Role } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AtualizarUsuarioDto, CriarUsuarioDto, RedefinirSenhaUsuarioDto } from "./usuarios.dto.js";

const usuarioSeguro = {
  id: true,
  nome: true,
  email: true,
  role: true,
  ativo: true,
  criadoEm: true,
  atualizadoEm: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.usuario.findMany({
      select: usuarioSeguro,
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    });
  }

  async criar(dto: CriarUsuarioDto) {
    const email = dto.email.trim().toLowerCase();
    await this.garantirEmailDisponivel(email);
    return this.prisma.usuario.create({
      data: {
        nome: dto.nome.trim(),
        email,
        role: dto.role,
        ativo: dto.ativo ?? true,
        senhaHash: await hash(dto.senha, 12),
      },
      select: usuarioSeguro,
    });
  }

  async atualizar(id: string, dto: AtualizarUsuarioDto, solicitanteId: string) {
    const usuario = await this.buscar(id);
    const email = dto.email?.trim().toLowerCase();

    if (email && email !== usuario.email) await this.garantirEmailDisponivel(email, id);
    if (id === solicitanteId && dto.role && dto.role !== usuario.role) {
      throw new ForbiddenException("Não é possível alterar o seu próprio perfil de acesso.");
    }
    await this.garantirAdministradorAtivo(usuario, dto);

    const atualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome.trim() } : {}),
        ...(email ? { email } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
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
