import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { EstoqueController } from "./estoque.controller.js";
import { EstoqueService } from "./estoque.service.js";

@Module({ imports: [AuthModule], controllers: [EstoqueController], providers: [EstoqueService] })
export class EstoqueModule {}
