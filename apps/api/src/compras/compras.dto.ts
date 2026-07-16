import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDateString, IsNumber, IsOptional, IsPositive, IsString, Length, ValidateNested } from "class-validator";

export class CompraManualDto {
  @IsString() insumoCodigo!: string;
  @IsNumber() @IsPositive() quantidade!: number;
  @IsNumber() @IsPositive() custoUnitario!: number;
  @IsString() fornecedor!: string;
  @IsString() formaPagamento!: string;
  @IsOptional() @IsString() observacao?: string;
}

export class EntradaBoletoDto {
  @IsString() insumoCodigo!: string;
  @IsNumber() @IsPositive() quantidade!: number;
  @IsString() fornecedor!: string;
  @IsOptional() @IsString() linhaDigitavel?: string;
  @IsNumber() @IsPositive() valor!: number;
  @IsDateString() vencimento!: string;
}

export class NotaItemDto {
  @IsString() insumoCodigo!: string;
  @IsOptional() @IsString() codigoProduto?: string;
  @IsString() descricao!: string;
  @IsString() unidade!: string;
  @IsNumber() @IsPositive() quantidade!: number;
  @IsNumber() @IsPositive() valorUnitario!: number;
}

export class DuplicataDto {
  @IsOptional() @IsString() numero?: string;
  @IsOptional() @IsDateString() vencimento?: string;
  @IsNumber() @IsPositive() valor!: number;
}

export class EntradaXmlDto {
  @IsString() @Length(1, 64) chave!: string;
  @IsString() fornecedor!: string;
  @IsOptional() @IsString() cnpj?: string;
  @IsNumber() @IsPositive() valorTotal!: number;
  @IsOptional() @IsString() xmlOriginal?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => NotaItemDto)
  itens!: NotaItemDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => DuplicataDto)
  duplicatas: DuplicataDto[] = [];
}
