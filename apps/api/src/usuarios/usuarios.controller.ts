import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { AtualizarUsuarioDto, CriarUsuarioDto, ListarUsuariosDto, RedefinirSenhaUsuarioDto } from "./usuarios.dto.js";
import { UsuariosService } from "./usuarios.service.js";

type RequestWithUser = { user: { id: string } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get() listar(@Query() dto: ListarUsuariosDto) { return this.usuarios.listar(dto); }
  @Post() criar(@Body() dto: CriarUsuarioDto) { return this.usuarios.criar(dto); }
  @Patch(":id") atualizar(@Param("id") id: string, @Body() dto: AtualizarUsuarioDto, @Req() req: RequestWithUser) { return this.usuarios.atualizar(id, dto, req.user.id); }
  @Patch(":id/senha") redefinirSenha(@Param("id") id: string, @Body() dto: RedefinirSenhaUsuarioDto) { return this.usuarios.redefinirSenha(id, dto); }
  @Delete(":id") desativar(@Param("id") id: string, @Req() req: RequestWithUser) { return this.usuarios.desativar(id, req.user.id); }
}