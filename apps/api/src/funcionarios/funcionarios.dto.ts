import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEmail, IsIn, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength } from "class-validator";
import { PageDto } from "../common/page.dto.js";

export class ListarFuncionariosDto extends PageDto {
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @IsString() setor?: string;
  @IsOptional() @IsString() cargo?: string;
  @IsOptional() @IsIn(["ativo", "inativo", "todos"]) status: "ativo" | "inativo" | "todos" = "ativo";
  @IsOptional() @IsIn(["codigo", "nome", "setor", "cargo", "dataAdmissao", "criadoEm"]) ordenarPor: "codigo" | "nome" | "setor" | "cargo" | "dataAdmissao" | "criadoEm" = "nome";
  @IsOptional() @IsIn(["asc", "desc"]) direcao: "asc" | "desc" = "asc";
}

export class CriarFuncionarioDto {
  @IsString() @MinLength(2) nome!: string;
  @IsOptional() @IsString() cpf?: string;
  @IsOptional() @IsString() rg?: string;
  @IsOptional() @IsDateString() dataNascimento?: string;
  @IsOptional() @IsDateString() dataAdmissao?: string;
  @IsString() @MinLength(2) cargo!: string;
  @IsString() @MinLength(2) setor!: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() endereco?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) salario?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsUrl({ require_tld: false }) fotoUrl?: string;
}

export class AtualizarFuncionarioDto extends CriarFuncionarioDto {}