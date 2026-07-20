import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { IntegracoesModule } from "../integracoes/integracoes.module.js";
import { CotacoesController, CotacoesPublicasController, WhatsappWebhookController } from "./cotacoes.controller.js";
import { CotacoesService } from "./cotacoes.service.js";

@Module({ imports: [AuthModule, IntegracoesModule], controllers: [CotacoesController, CotacoesPublicasController, WhatsappWebhookController], providers: [CotacoesService] })
export class CotacoesModule {}