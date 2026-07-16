import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { PageDto } from "../common/page.dto.js";
import { RolesGuard } from "../common/roles.guard.js";
import { FinanceiroService } from "./financeiro.service.js";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("financeiro")
export class FinanceiroController {
  constructor(private readonly financeiro: FinanceiroService) {}
  @Get("contas-pagar") contasPagar(@Query() dto: PageDto) { return this.financeiro.contasPagar(dto); }
}
