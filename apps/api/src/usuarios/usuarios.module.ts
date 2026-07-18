import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { UsuariosController } from "./usuarios.controller.js";
import { UsuariosService } from "./usuarios.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
