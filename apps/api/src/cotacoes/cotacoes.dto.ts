import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CriarCotacaoInteligenteDto {
  @IsString() insumoCodigo!: string;
  @IsOptional() @IsNumber() @IsPositive() quantidade?: number;
  @IsArray() @ArrayMinSize(1) @IsString({ each: true }) fornecedorIds!: string[];
  @IsOptional() @IsNumber() @Min(0) saldoCaixa?: number;
}

export class RegistrarRespostaCotacaoDto {
  @IsString() fornecedorId!: string;
  @IsNumber() @IsPositive() precoUnitario!: number;
  @IsOptional() @IsNumber() @Min(0) frete?: number;
  @IsOptional() @IsNumber() @Min(0) prazoDias?: number;
  @IsOptional() @IsString() condicoes?: string;
  @IsOptional() @IsString() formaPagamento?: string;
  @IsOptional() @IsBoolean() impostoIncluso?: boolean;
  @IsOptional() @IsString() respostaOriginal?: string;
}
export class CadastrarFornecedorCotacaoDto {
  @IsString() @MinLength(3) nome!: string;
  @IsString() @MinLength(10) telefone!: string;
  @IsOptional() @IsString() cnpj?: string;
}
