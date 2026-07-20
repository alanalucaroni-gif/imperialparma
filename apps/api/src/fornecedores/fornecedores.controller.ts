import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Permissions } from "../common/permissions.decorator.js";
import { PermissionsGuard } from "../common/permissions.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { AtualizarFornecedorDto, CriarFornecedorDto, ListarFornecedoresDto } from "./fornecedores.dto.js";
import { FornecedoresService } from "./fornecedores.service.js";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Permissions("cadastros")
@Roles(Role.ADMINISTRADOR, Role.GERENTE, Role.COMPRAS)
@Controller("fornecedores")
export class FornecedoresController {
  constructor(private readonly fornecedores: FornecedoresService) {}

  @Post() criar(@Body() dto: CriarFornecedorDto) { return this.fornecedores.criar(dto); }
  @Get() listar(@Query() dto: ListarFornecedoresDto) { return this.fornecedores.listar(dto); }
  @Get(":id") buscar(@Param("id") id: string) { return this.fornecedores.buscarPorId(id); }
  @Patch(":id") atualizar(@Param("id") id: string, @Body() dto: AtualizarFornecedorDto) { return this.fornecedores.atualizar(id, dto); }
  @Delete(":id") desativar(@Param("id") id: string) { return this.fornecedores.desativar(id); }
}