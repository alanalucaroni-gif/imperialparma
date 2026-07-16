import { IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { PageDto } from "../common/page.dto.js";

export class ListarInsumosDto extends PageDto {
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() status?: "ok" | "baixo" | "critico" | "pendente";
}

export class ListarMovimentacoesDto extends PageDto {
  @IsOptional() @IsString() insumoId?: string;
}
export class AtualizarEstoqueMinimoDto {
  @IsNumber() @Min(0) minimo!: number;
}
export class RegistrarMovimentacaoEstoqueDto {
  @IsIn(["entrada", "saida"]) tipo!: "entrada" | "saida";
  @IsString() insumoCodigo!: string;
  @IsNumber() @Min(0.001) quantidade!: number;
  @IsOptional() @IsNumber() @Min(0) custoUnitario?: number;
  @IsString() @MinLength(2) motivo!: string;
  @IsString() @MinLength(2) responsavel!: string;
}
export class CadastrarInsumoDto {
  @IsOptional() @IsString() codigo?: string;
  @IsString() @MinLength(2) nome!: string;
  @IsString() @MinLength(2) categoria!: string;
  @IsString() @MinLength(1) unidade!: string;
  @IsOptional() @IsNumber() @Min(0) quantidade?: number;
  @IsOptional() @IsNumber() @Min(0) estoqueMinimo?: number;
  @IsOptional() @IsNumber() @Min(0) custoUnitario?: number;
}
export class AtualizarInsumoDto {
  @IsOptional() @IsString() @MinLength(2) nome?: string;
  @IsOptional() @IsString() @MinLength(2) categoria?: string;
  @IsOptional() @IsString() @MinLength(1) unidade?: string;
  @IsOptional() @IsNumber() @Min(0) quantidade?: number;
  @IsOptional() @IsNumber() @Min(0) estoqueMinimo?: number;
  @IsOptional() @IsNumber() @Min(0) custoUnitario?: number;
}