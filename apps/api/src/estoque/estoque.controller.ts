import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../common/roles.guard.js";
import { EstoqueService } from "./estoque.service.js";
import { AtualizarEstoqueMinimoDto, AtualizarInsumoDto, CadastrarInsumoDto, ListarInsumosDto, ListarMovimentacoesDto, RegistrarMovimentacaoEstoqueDto } from "./estoque.dto.js";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("estoque")
export class EstoqueController {
  constructor(private readonly estoque: EstoqueService) {}
  @Get("insumos") listar(@Query() dto: ListarInsumosDto) { return this.estoque.listar(dto); }
  @Post("insumos") cadastrar(@Body() dto: CadastrarInsumoDto) { return this.estoque.cadastrar(dto); }
  @Patch("insumos/:codigo") atualizar(@Param("codigo") codigo: string, @Body() dto: AtualizarInsumoDto) { return this.estoque.atualizar(codigo, dto); }
  @Delete("insumos/:codigo") excluir(@Param("codigo") codigo: string) { return this.estoque.excluir(codigo); }
  @Get("movimentacoes") movimentacoes(@Query() dto: ListarMovimentacoesDto) { return this.estoque.movimentacoes(dto); }
  @Post("movimentacoes") registrarMovimentacao(@Body() dto: RegistrarMovimentacaoEstoqueDto) { return this.estoque.registrarMovimentacao(dto); }
  @Patch("insumos/:codigo/minimo") atualizarMinimo(@Param("codigo") codigo: string, @Body() dto: AtualizarEstoqueMinimoDto) { return this.estoque.atualizarMinimo(codigo, dto.minimo); }
}
