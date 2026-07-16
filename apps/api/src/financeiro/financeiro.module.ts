import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { FinanceiroController } from "./financeiro.controller.js";
import { FinanceiroService } from "./financeiro.service.js";

@Module({ imports: [AuthModule], controllers: [FinanceiroController], providers: [FinanceiroService] })
export class FinanceiroModule {}
