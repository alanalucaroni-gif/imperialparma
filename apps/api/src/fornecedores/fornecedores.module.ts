import { Module } from '@nestjs/common';
import { FornecedoresService } from './fornecedores.service.js';
import { FornecedoresController } from './fornecedores.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [FornecedoresController],
  providers: [FornecedoresService],
})
export class FornecedoresModule {}
