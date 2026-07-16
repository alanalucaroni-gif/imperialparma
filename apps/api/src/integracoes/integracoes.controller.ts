import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { SalvarCredencialDto } from "./integracoes.dto.js";
import { IntegracoesService } from "./integracoes.service.js";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.GERENTE)
@Controller("integracoes/credenciais")
export class IntegracoesController {
  constructor(private readonly integracoes: IntegracoesService) {}

  @Get()
  listar() { return this.integracoes.listar(); }

  @Put(":plataforma")
  salvar(@Param("plataforma") plataforma: string, @Body() dto: SalvarCredencialDto) {
    return this.integracoes.salvar(plataforma, dto);
  }

  @Post(":plataforma/verificar")
  verificar(@Param("plataforma") plataforma: string) { return this.integracoes.verificar(plataforma); }

  @Delete(":plataforma")
  remover(@Param("plataforma") plataforma: string) { return this.integracoes.remover(plataforma); }
}