import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Permissions } from "../common/permissions.decorator.js";
import { PermissionsGuard } from "../common/permissions.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { AtualizarFuncionarioDto, CriarFuncionarioDto, ListarFuncionariosDto } from "./funcionarios.dto.js";
import { FuncionariosService } from "./funcionarios.service.js";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Permissions("cadastros")
@Roles(Role.ADMINISTRADOR, Role.GERENTE)
@Controller("funcionarios")
export class FuncionariosController {
  constructor(private readonly funcionarios: FuncionariosService) {}

  @Get("ativos") listarAtivos() { return this.funcionarios.listarAtivos(); }
  @Get() listar(@Query() dto: ListarFuncionariosDto) { return this.funcionarios.listar(dto); }
  @Get(":id") buscar(@Param("id") id: string) { return this.funcionarios.buscar(id); }
  @Post() criar(@Body() dto: CriarFuncionarioDto) { return this.funcionarios.criar(dto); }
  @Patch(":id") atualizar(@Param("id") id: string, @Body() dto: AtualizarFuncionarioDto) { return this.funcionarios.atualizar(id, dto); }
  @Delete(":id") desativar(@Param("id") id: string) { return this.funcionarios.desativar(id); }
}