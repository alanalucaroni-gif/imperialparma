import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { IntegracoesController, WhatsappMetaController } from "./integracoes.controller.js";
import { IntegracoesService } from "./integracoes.service.js";

@Module({ imports: [AuthModule], controllers: [IntegracoesController, WhatsappMetaController], providers: [IntegracoesService], exports: [IntegracoesService] })
export class IntegracoesModule {}