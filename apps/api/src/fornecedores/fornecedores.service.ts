import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CriarFornecedorDto, AtualizarFornecedorDto } from './fornecedores.dto.js';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async listarTodos(busca?: string, ativo?: string) {
    const where: any = {};
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cnpj: { contains: busca } },
      ];
    }
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    return this.prisma.fornecedor.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
  }

  async buscarPorId(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
      include: {
        pedidos: {
          orderBy: { criadoEm: 'desc' },
          take: 5,
        },
        comprasManuais: {
          orderBy: { criadoEm: 'desc' },
          take: 5,
          include: { insumo: true }
        },
        entradasBoleto: {
          orderBy: { criadoEm: 'desc' },
          take: 5,
          include: { insumo: true }
        },
        notasFiscais: {
          orderBy: { criadoEm: 'desc' },
          take: 5,
        }
      }
    });

    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
    }

    return fornecedor;
  }

  async criar(dados: CriarFornecedorDto) {
    return this.prisma.fornecedor.create({
      data: dados,
    });
  }

  async atualizar(id: string, dados: AtualizarFornecedorDto) {
    await this.buscarPorId(id); // verifica existência
    
    return this.prisma.fornecedor.update({
      where: { id },
      data: dados,
    });
  }

  async desativar(id: string) {
    await this.buscarPorId(id);
    
    return this.prisma.fornecedor.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
