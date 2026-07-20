import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ProducoesReceitasController, ReceitasController } from "./receitas.controller.js";
import { ReceitasService } from "./receitas.service.js";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReceitasController, ProducoesReceitasController],
  providers: [ReceitasService],
})
export class ReceitasModule {}