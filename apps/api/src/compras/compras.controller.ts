import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { CompraManualDto, EntradaBoletoDto, EntradaXmlDto } from "./compras.dto.js";
import { PurchaseEntryService } from "./purchase-entry.service.js";

type RequestWithUser = { user: { id: string } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.GERENTE, Role.COMPRAS, Role.ESTOQUE)
@Controller("compras")
export class ComprasController {
  constructor(private readonly entries: PurchaseEntryService) {}
  @Post("manual") manual(@Body() dto: CompraManualDto, @Req() req: RequestWithUser) { return this.entries.manual(dto, req.user.id); }
  @Post("boleto") boleto(@Body() dto: EntradaBoletoDto, @Req() req: RequestWithUser) { return this.entries.boleto(dto, req.user.id); }
  @Post("xml") xml(@Body() dto: EntradaXmlDto, @Req() req: RequestWithUser) { return this.entries.xml(dto, req.user.id); }
}
