import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Permissions } from "../common/permissions.decorator.js";
import { PermissionsGuard } from "../common/permissions.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { AdicionarObservacaoProducaoDto, AtualizarProducaoReceitaDto, AtualizarReceitaDto, CancelarProducaoReceitaDto, CriarProducaoReceitaDto, CriarReceitaDto, InformarPerdaProducaoDto, ListarProducoesReceitasDto, ListarReceitasDto, RankingProducoesDto } from "./receitas.dto.js";
import { ReceitasService } from "./receitas.service.js";

const rolesReceitas = [Role.ADMINISTRADOR, Role.GERENTE, Role.PRODUCAO, Role.COZINHA];

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(...rolesReceitas)
@Controller("receitas")
export class ReceitasController {
  constructor(private readonly receitas: ReceitasService) {}

  @Get("ativas") @Permissions("receitas.visualizar") listarAtivas() { return this.receitas.listarAtivas(); }
  @Get() @Permissions("receitas.visualizar") listar(@Query() dto: ListarReceitasDto) { return this.receitas.listar(dto); }
  @Get(":id") @Permissions("receitas.visualizar") buscar(@Param("id") id: string) { return this.receitas.buscar(id); }
  @Post() @Permissions("receitas.criar") criar(@Body() dto: CriarReceitaDto) { return this.receitas.criar(dto); }
  @Patch(":id") @Permissions("receitas.editar") atualizar(@Param("id") id: string, @Body() dto: AtualizarReceitaDto) { return this.receitas.atualizar(id, dto); }
  @Post(":id/duplicar") @Permissions("receitas.criar") duplicar(@Param("id") id: string) { return this.receitas.duplicar(id); }
  @Delete(":id") @Permissions("receitas.excluir") excluir(@Param("id") id: string) { return this.receitas.excluir(id); }
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(...rolesReceitas)
@Controller("producoes-receitas")
export class ProducoesReceitasController {
  constructor(private readonly receitas: ReceitasService) {}

  @Get("indicadores") @Permissions("receitas.visualizar") indicadores(@Query() dto: ListarProducoesReceitasDto) { return this.receitas.indicadores(dto); }
  @Get("ranking") @Permissions("receitas.visualizar") ranking(@Query() dto: RankingProducoesDto) { return this.receitas.ranking(dto); }
  @Get() @Permissions("receitas.visualizar") listar(@Query() dto: ListarProducoesReceitasDto) { return this.receitas.listarProducoes(dto); }
  @Get(":id") @Permissions("receitas.visualizar") buscar(@Param("id") id: string) { return this.receitas.buscarProducao(id); }
  @Post() @Permissions("receitas.criar") criar(@Body() dto: CriarProducaoReceitaDto) { return this.receitas.criarProducao(dto); }
  @Patch(":id") @Permissions("receitas.editar") atualizar(@Param("id") id: string, @Body() dto: AtualizarProducaoReceitaDto) { return this.receitas.atualizarProducao(id, dto); }
  @Post(":id/processar-estoque") @Permissions("receitas.editar") processarEstoque(@Param("id") id: string) { return this.receitas.processarEstoquePendente(id); }
  @Delete(":id") @Permissions("receitas.excluir") estornar(@Param("id") id: string, @Body() dto: CancelarProducaoReceitaDto) { return this.receitas.estornarProducao(id, dto.motivo); }
  @Post(":id/cancelar") @Permissions("receitas.editar") cancelar(@Param("id") id: string, @Body() dto: CancelarProducaoReceitaDto) { return this.receitas.cancelarProducao(id, dto.motivo); }
  @Post(":id/pausar") @Permissions("receitas.editar") pausar(@Param("id") id: string) { return this.receitas.pausarProducao(id); }
  @Post(":id/continuar") @Permissions("receitas.editar") continuar(@Param("id") id: string) { return this.receitas.continuarProducao(id); }
  @Post(":id/perda") @Permissions("receitas.editar") perda(@Param("id") id: string, @Body() dto: InformarPerdaProducaoDto) { return this.receitas.informarPerda(id, dto); }
  @Post(":id/observacao") @Permissions("receitas.editar") observacao(@Param("id") id: string, @Body() dto: AdicionarObservacaoProducaoDto) { return this.receitas.adicionarObservacao(id, dto.observacao); }
}