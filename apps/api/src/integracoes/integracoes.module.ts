import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { IntegracoesController } from "./integracoes.controller.js";
import { IntegracoesService } from "./integracoes.service.js";

@Module({ imports: [AuthModule], controllers: [IntegracoesController], providers: [IntegracoesService] })
export class IntegracoesModule {}