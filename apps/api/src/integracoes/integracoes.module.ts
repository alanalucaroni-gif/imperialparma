import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { IfoodPedidosService } from "./ifood-pedidos.service.js";
import { IfoodWebhookController } from "./ifood-webhook.controller.js";
import { IntegracoesController, PedidosVendaController, WhatsappMetaController } from "./integracoes.controller.js";
import { IntegracoesService } from "./integracoes.service.js";

@Module({
  imports: [AuthModule],
  controllers: [IntegracoesController, WhatsappMetaController, PedidosVendaController, IfoodWebhookController],
  providers: [IntegracoesService, IfoodPedidosService],
  exports: [IntegracoesService, IfoodPedidosService],
})
export class IntegracoesModule {}
