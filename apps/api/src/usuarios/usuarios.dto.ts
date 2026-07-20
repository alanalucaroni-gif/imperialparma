import { IsArray, IsBoolean, IsEmail, IsEnum, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../generated/prisma/enums.js";
import { PageDto } from "../common/page.dto.js";

export const PERMISSOES_PADRAO = [
  "receitas.visualizar", "receitas.criar", "receitas.editar", "receitas.excluir",
  "financeiro", "estoque", "compras", "cadastros", "relatorios",
] as const;

export class ListarUsuariosDto extends PageDto {
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @IsEnum(Role) perfil?: Role;
  @IsOptional() @IsIn(["ativo", "inativo", "todos"]) status: "ativo" | "inativo" | "todos" = "todos";
  @IsOptional() @IsIn(["nome", "login", "role", "criadoEm", "ultimoAcesso"]) ordenarPor: "nome" | "login" | "role" | "criadoEm" | "ultimoAcesso" = "nome";
  @IsOptional() @IsIn(["asc", "desc"]) direcao: "asc" | "desc" = "asc";
}

export class CriarUsuarioDto {
  @IsString() @MinLength(2) nome!: string;
  @IsString() @MinLength(3) login!: string;
  @IsEmail() email!: string;
  @IsEnum(Role) role!: Role;
  @IsString() @MinLength(8) senha!: string;
  @IsOptional() @IsString() funcionarioId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) permissoes?: string[];
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class AtualizarUsuarioDto {
  @IsOptional() @IsString() @MinLength(2) nome?: string;
  @IsOptional() @IsString() @MinLength(3) login?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsString() funcionarioId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) permissoes?: string[];
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class RedefinirSenhaUsuarioDto {
  @IsString() @MinLength(8) senha!: string;
}