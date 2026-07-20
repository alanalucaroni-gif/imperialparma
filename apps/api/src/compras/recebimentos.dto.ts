import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";

export class RecebimentoPedidoItemDto {
  @IsString() pedidoCompraItemId!: string;
  @IsNumber() @Min(0) quantidadeRecebida!: number;
  @IsOptional() @IsNumber() @Min(0) quantidadeRecusada?: number;
  @IsOptional() @IsNumber() @Min(0.0001) fatorConversaoEstoque?: number;
  @IsString() unidade!: string;
  @IsOptional() @IsString() lote?: string;
  @IsOptional() @IsDateString() dataFabricacao?: string;
  @IsOptional() @IsDateString() dataValidade?: string;
  @IsNumber() @Min(0) valorUnitarioRecebido!: number;
  @IsOptional() @IsString() marcaRecebida?: string;
  @IsIn(["PENDENTE", "RECEBIDO_CORRETAMENTE", "RECEBIDO_PARCIALMENTE", "PRODUTO_DIVERGENTE", "QUANTIDADE_DIVERGENTE", "VALOR_DIVERGENTE", "PRODUTO_RECUSADO", "PRODUTO_AVARIADO"])
  situacao!: string;
  @IsOptional() @IsString() @MaxLength(1000) observacoes?: string;
}

export class CriarRecebimentoCompraDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => RecebimentoPedidoItemDto)
  itens!: RecebimentoPedidoItemDto[];
  @IsOptional() @IsString() numeroNotaFiscal?: string;
  @IsOptional() @IsString() serieNotaFiscal?: string;
  @IsOptional() @IsString() chaveAcesso?: string;
  @IsOptional() @IsDateString() dataEmissao?: string;
  @IsOptional() @IsDateString() dataEntrada?: string;
  @IsOptional() @IsNumber() @Min(0) valorProdutos?: number;
  @IsOptional() @IsNumber() @Min(0) frete?: number;
  @IsOptional() @IsNumber() @Min(0) desconto?: number;
  @IsOptional() @IsNumber() @Min(0) impostos?: number;
  @IsOptional() @IsNumber() @Min(0) valorTotal?: number;
  @IsOptional() @IsArray() anexosNota?: Array<{ nome: string; tipo: string; tamanho: number; conteudo?: string }>;
  @IsOptional() @IsString() @MaxLength(2000) observacoes?: string;
}

export class CancelarPedidoCompraDto {
  @IsString() @MaxLength(1000) motivo!: string;
}
