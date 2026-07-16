import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../generated/prisma/enums.js";

export class CriarUsuarioDto {
  @IsString() @MinLength(2) nome!: string;
  @IsEmail() email!: string;
  @IsEnum(Role) role!: Role;
  @IsString() @MinLength(6) senha!: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class AtualizarUsuarioDto {
  @IsOptional() @IsString() @MinLength(2) nome?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class RedefinirSenhaUsuarioDto {
  @IsString() @MinLength(6) senha!: string;
}
