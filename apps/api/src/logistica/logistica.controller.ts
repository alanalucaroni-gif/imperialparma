import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CalcularDistanciaDto } from "./logistica.dto.js";
import { LogisticaService } from "./logistica.service.js";

@UseGuards(JwtAuthGuard)
@Controller("logistica")
export class LogisticaController {
  constructor(private readonly logistica: LogisticaService) {}

  @Post("calcular-distancia")
  calcularDistancia(@Body() dto: CalcularDistanciaDto) {
    return this.logistica.calcularDistancia(dto);
  }
}
