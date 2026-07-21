import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";

export class CotacaoItemSolicitadoDto {
  @IsString() insumoCodigo!: string;
  @IsNumber() @IsPositive() quantidade!: number;
  @IsOptional() @IsString() marcaPreferencial?: string;
  @IsOptional() @IsString() embalagemSolicitada?: string;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsDateString() dataDesejadaEntrega?: string;
}

export class CriarCotacaoInteligenteDto {
  @IsOptional() @IsString() insumoCodigo?: string;
  @IsOptional() @IsNumber() @IsPositive() quantidade?: number;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CotacaoItemSolicitadoDto)
  itens?: CotacaoItemSolicitadoDto[];
  @IsArray() @ArrayMinSize(1) @IsString({ each: true }) fornecedorIds!: string[];
  @IsOptional() @IsDateString() prazoResposta?: string;
  @IsOptional() @IsString() @MaxLength(2000) observacoes?: string;
  @IsOptional() @IsNumber() @Min(0) saldoCaixa?: number;
}

export class PropostaItemDto {
  @IsString() cotacaoItemId!: string;
  @IsBoolean() disponivel!: boolean;
  @IsOptional() @IsNumber() @Min(0) precoUnitario?: number;
  @IsOptional() @IsString() marcaOferecida?: string;
  @IsOptional() @IsString() embalagem?: string;
  @IsOptional() @IsNumber() @Min(0) quantidadeEmbalagem?: number;
  @IsOptional() @IsNumber() @Min(0) quantidadeMinima?: number;
  @IsOptional() @IsNumber() @Min(0) quantidadeMinimaEmbalagem?: number;
  @IsOptional() @IsInt() @Min(0) prazoDias?: number;
  @IsOptional() @IsDateString() dataPrevistaEntrega?: string;
  @IsOptional() @IsString() @MaxLength(1000) observacoes?: string;
}

export class AnexoCotacaoDto {
  @IsString() @MinLength(1) nome!: string;
  @IsString() tipo!: string;
  @IsNumber() @Min(0) tamanho!: number;
  @IsOptional() @IsString() conteudo?: string;
}

export class RespostaPublicaCotacaoDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => PropostaItemDto)
  itens!: PropostaItemDto[];
  @IsOptional() @IsNumber() @Min(0) frete?: number;
  @IsOptional() @IsNumber() @Min(0) desconto?: number;
  @IsOptional() @IsNumber() @Min(0) acrescimos?: number;
  @IsOptional() @IsNumber() @Min(0) valorMinimoPedido?: number;
  @IsOptional() @IsNumber() @Min(0) freteGratisAcima?: number;
  @IsOptional() @IsString() condicaoPagamento?: string;
  @IsOptional() @IsIn(["PIX", "BOLETO", "CARTAO"]) formaPagamento?: string;
  @IsOptional() @IsObject() detalhesPagamento?: Record<string, unknown>;
  @IsOptional() @IsInt() @Min(0) prazoPagamento?: number;
  @IsOptional() @IsDateString() validadeProposta?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) diasEntrega?: string[];
  @IsOptional() @IsIn(["MANHA", "TARDE", "NOITE", "HORARIO_COMERCIAL", "A_COMBINAR"]) periodoEntrega?: string;
  @IsOptional() @IsDateString() dataMaisProximaEntrega?: string;
  @IsOptional() @IsDateString() dataLimitePedido?: string;
  @IsOptional() @IsString() responsavelNome?: string;
  @IsOptional() @IsString() responsavelTelefone?: string;
  @IsOptional() @IsString() @MaxLength(3000) observacoesGerais?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AnexoCotacaoDto)
  anexos?: AnexoCotacaoDto[];
}

export class RecusarCotacaoDto {
  @IsOptional() @IsIn(["PRODUTO_INDISPONIVEL", "QUANTIDADE_INSUFICIENTE", "NAO_ATENDE_REGIAO", "PRAZO_INCOMPATIVEL", "OUTRO"])
  motivo?: string;
  @IsOptional() @IsString() @MaxLength(1000) detalhe?: string;
}

export class SelecionarPropostaItemDto {
  @IsString() cotacaoItemId!: string;
  @IsString() propostaItemId!: string;
}

export class FinalizarCotacaoDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => SelecionarPropostaItemDto)
  selecoes!: SelecionarPropostaItemDto[];
  @IsOptional() @IsString() @MaxLength(2000) justificativa?: string;
}

export class ProrrogarCotacaoDto {
  @IsDateString() prazoResposta!: string;
}

export class EncerrarCotacaoDto {
  @IsOptional() @IsString() @MaxLength(1000) motivo?: string;
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
