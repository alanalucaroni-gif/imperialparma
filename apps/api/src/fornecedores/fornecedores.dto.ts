import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CriarFornecedorDto {
  @IsString()
  nome!: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}

export class AtualizarFornecedorDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
