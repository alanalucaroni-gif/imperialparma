import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  AtualizarEtapaEntregadorDto,
  RegistrarLocalizacaoLogisticaDto,
} from "./logistica.dto.js";
import { LogisticaRastreamentoService } from "./logistica-rastreamento.service.js";

@Controller("logistica-entregador")
export class LogisticaEntregadorController {
  constructor(private readonly rastreamento: LogisticaRastreamentoService) {}

  @Get(":token")
  obter(@Param("token") token: string) {
    return this.rastreamento.obterPainelEntregador(token);
  }

  @Post(":token/localizacao")
  registrarLocalizacao(
    @Param("token") token: string,
    @Body() dto: RegistrarLocalizacaoLogisticaDto,
  ) {
    return this.rastreamento.registrarLocalizacao(token, dto);
  }

  @Patch(":token/status")
  atualizarEtapa(
    @Param("token") token: string,
    @Body() dto: AtualizarEtapaEntregadorDto,
  ) {
    return this.rastreamento.atualizarEtapa(token, dto);
  }
}

@Controller("logistica-publica")
export class LogisticaPublicaController {
  constructor(private readonly rastreamento: LogisticaRastreamentoService) {}

  @Get("rastreio/:token")
  obter(@Param("token") token: string) {
    return this.rastreamento.obterRastreioCliente(token);
  }
}
