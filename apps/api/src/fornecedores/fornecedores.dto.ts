import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from "class-validator";
import { PageDto } from "../common/page.dto.js";

export class ListarFornecedoresDto extends PageDto {
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsIn(["ativo", "inativo", "todos"]) status: "ativo" | "inativo" | "todos" = "ativo";
  @IsOptional() @IsIn(["nome", "razaoSocial", "cidade", "categoria", "criadoEm"]) ordenarPor: "nome" | "razaoSocial" | "cidade" | "categoria" | "criadoEm" = "nome";
  @IsOptional() @IsIn(["asc", "desc"]) direcao: "asc" | "desc" = "asc";
}

export class CriarFornecedorDto {
  @IsOptional() @IsString() @MinLength(2) nome?: string;
  @IsOptional() @IsString() @MinLength(2) razaoSocial?: string;
  @IsOptional() @IsString() @MinLength(2) nomeFantasia?: string;
  @IsOptional() @IsString() cnpj?: string;
  @IsOptional() @IsString() inscricaoEstadual?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsUrl({ require_tld: false }) site?: string;
  @IsOptional() @IsString() endereco?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() cep?: string;
  @IsOptional() @IsString() contatoPrincipal?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() formaPagamento?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) prazoPagamento?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsString() observacao?: string;
}

export class AtualizarFornecedorDto extends CriarFornecedorDto {}