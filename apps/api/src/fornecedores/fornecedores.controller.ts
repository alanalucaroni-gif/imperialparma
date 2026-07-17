import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FornecedoresService } from './fornecedores.service.js';
import { CriarFornecedorDto, AtualizarFornecedorDto } from './fornecedores.dto.js';

@Controller('api/fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Post()
  criar(@Body() criarFornecedorDto: CriarFornecedorDto) {
    return this.fornecedoresService.criar(criarFornecedorDto);
  }

  @Get()
  listarTodos(@Query('busca') busca?: string, @Query('ativo') ativo?: string) {
    return this.fornecedoresService.listarTodos(busca, ativo);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.fornecedoresService.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() atualizarFornecedorDto: AtualizarFornecedorDto) {
    return this.fornecedoresService.atualizar(id, atualizarFornecedorDto);
  }

  @Delete(':id')
  desativar(@Param('id') id: string) {
    return this.fornecedoresService.desativar(id);
  }
}
