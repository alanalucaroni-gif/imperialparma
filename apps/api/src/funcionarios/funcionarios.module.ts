import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { FuncionariosController } from "./funcionarios.controller.js";
import { FuncionariosService } from "./funcionarios.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [FuncionariosController],
  providers: [FuncionariosService],
})
export class FuncionariosModule {}