import { IsOptional, IsString, MinLength } from "class-validator";

export class SalvarCredencialDto {
  @IsOptional() @IsString() identificador?: string;
  @IsString() @MinLength(8) token!: string;
}