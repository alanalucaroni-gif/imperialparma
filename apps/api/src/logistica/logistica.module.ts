import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { IntegracoesModule } from "../integracoes/integracoes.module.js";
import { LogisticaController } from "./logistica.controller.js";
import { LogisticaService } from "./logistica.service.js";

@Module({
  imports: [AuthModule, IntegracoesModule],
  controllers: [LogisticaController],
  providers: [LogisticaService],
})
export class LogisticaModule {}
