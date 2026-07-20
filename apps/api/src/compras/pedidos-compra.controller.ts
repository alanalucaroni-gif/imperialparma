import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { PedidosCompraService } from "./pedidos-compra.service.js";
import { CancelarPedidoCompraDto, CriarRecebimentoCompraDto } from "./recebimentos.dto.js";

type RequestWithUser = { user: { id: string } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.GERENTE, Role.COMPRAS, Role.ESTOQUE)
@Controller("compras")
export class PedidosCompraController {
  constructor(private readonly pedidos: PedidosCompraService) {}
  @Get("recebimentos") listarRecebimentos() { return this.pedidos.listarRecebimentos(); }
  @Get("recebimentos/:id") buscarRecebimento(@Param("id") id: string) { return this.pedidos.buscarRecebimento(id); }
  @Post("pedidos/:id/recebimentos") receber(@Param("id") id: string, @Body() dto: CriarRecebimentoCompraDto, @Req() req: RequestWithUser) { return this.pedidos.criarRecebimento(id, dto, req.user.id); }
  @Post("recebimentos/:id/confirmar-estoque") confirmar(@Param("id") id: string, @Req() req: RequestWithUser) { return this.pedidos.confirmarEstoque(id, req.user.id); }
  @Post("pedidos/:id/cancelar") cancelar(@Param("id") id: string, @Body() dto: CancelarPedidoCompraDto, @Req() req: RequestWithUser) { return this.pedidos.cancelarPedido(id, dto, req.user.id); }
  @Get("historico-precos") historico() { return this.pedidos.historicoPrecos(); }
}
