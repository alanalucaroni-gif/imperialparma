import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module.js";
import { IntegracoesModule } from "../integracoes/integracoes.module.js";
import { LogisticaController } from "./logistica.controller.js";
import { LogisticaOperacaoService } from "./logistica-operacao.service.js";
import {
  LogisticaEntregadorController,
  LogisticaPublicaController,
} from "./logistica-publica.controller.js";
import { LogisticaRastreamentoService } from "./logistica-rastreamento.service.js";
import { LogisticaService } from "./logistica.service.js";

@Module({
  imports: [AuthModule, IntegracoesModule, JwtModule.register({})],
  controllers: [
    LogisticaController,
    LogisticaEntregadorController,
    LogisticaPublicaController,
  ],
  providers: [LogisticaService, LogisticaOperacaoService, LogisticaRastreamentoService],
})
export class LogisticaModule {}
