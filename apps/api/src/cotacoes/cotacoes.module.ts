import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CotacoesController, WhatsappWebhookController } from "./cotacoes.controller.js";
import { CotacoesService } from "./cotacoes.service.js";

@Module({ imports: [AuthModule], controllers: [CotacoesController, WhatsappWebhookController], providers: [CotacoesService] })
export class CotacoesModule {}