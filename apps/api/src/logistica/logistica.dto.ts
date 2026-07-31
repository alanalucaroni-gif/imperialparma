import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { LogisticaOrdemPagamentoStatus, LogisticaPedidoStatus } from "../generated/prisma/enums.js";
import { PageDto } from "../common/page.dto.js";

export class CalcularDistanciaDto {
  @IsString()
  @MinLength(5)
  origem!: string;

  @IsString()
  @MinLength(3)
  destino!: string;

  @IsOptional()
  @IsString()
  @IsIn(["TWO_WHEELER", "DRIVE"])
  modo?: "TWO_WHEELER" | "DRIVE";
}

export class ListarPedidosLogisticaDto extends PageDto {
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsEnum(LogisticaPedidoStatus)
  status?: LogisticaPedidoStatus;
}

export class EntregadorLogisticaDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  nome!: string;

  @IsString()
  @MinLength(2)
  empresa!: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class CriarPedidoLogisticaDto {
  @IsOptional()
  @IsString()
  idExterno?: string;

  @IsOptional()
  @IsString()
  codigoPedido?: string;

  @IsString()
  @MinLength(2)
  clienteNome!: string;

  @IsOptional()
  @IsString()
  clienteTelefone?: string;

  @IsString()
  @MinLength(3)
  endereco!: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsString()
  @MinLength(2)
  bairro!: string;

  @IsOptional()
  @IsString()
  canal?: string;

  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorPedido?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxaEntregaCliente?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  distanciaKm!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanciaCobradaKm?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duracaoEstimadaMinutos?: number;

  @IsString()
  @MinLength(5)
  enderecoOrigem!: string;

  @IsOptional()
  @IsIn(["ida", "ida_volta"])
  tipoCalculoDistancia?: "ida" | "ida_volta";

  @IsOptional()
  @IsString()
  origemDistancia?: string;

  @IsOptional()
  @IsObject()
  rotaCalculada?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custoEstimado?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custoReal?: number | null;

  @IsOptional()
  @IsString()
  origemValor?: string;

  @IsOptional()
  @IsString()
  tabelaEmpresa?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  origem?: string;
}

export class AtualizarStatusPedidoLogisticaDto {
  @IsEnum(LogisticaPedidoStatus)
  status!: LogisticaPedidoStatus;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EntregadorLogisticaDto)
  entregador?: EntregadorLogisticaDto | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custoEstimado?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custoReal?: number | null;

  @IsOptional()
  @IsString()
  origemValor?: string;

  @IsOptional()
  @IsString()
  tabelaEmpresa?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanciaCobradaKm?: number | null;

  @IsOptional()
  @IsString()
  ocorrencia?: string | null;
}

export class RegistrarLocalizacaoLogisticaDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precisaoMetros?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  velocidadeKmh?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(360)
  direcaoGraus?: number;
}

export class AtualizarEtapaEntregadorDto {
  @IsEnum(LogisticaPedidoStatus)
  status!: LogisticaPedidoStatus;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class SalvarConfiguracaoLogisticaDto {
  @IsString()
  @MinLength(5)
  enderecoOrigem!: string;

  @IsIn(["ida", "ida_volta"])
  tipoCalculoDistancia!: "ida" | "ida_volta";

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorKm!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorMinimo!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  raioMaximoKm!: number;
}

export class CriarOcorrenciaLogisticaDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsString()
  @MinLength(3)
  descricao!: string;
}

export class ResolverOcorrenciaLogisticaDto {
  @IsString()
  @MinLength(3)
  resolucao!: string;
}

export class GerarOrdensPagamentoLogisticaDto {
  @IsDateString()
  data!: string;
}

export class ListarOrdensPagamentoLogisticaDto {
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsEnum(LogisticaOrdemPagamentoStatus)
  status?: LogisticaOrdemPagamentoStatus;
}

export class PagarOrdemPagamentoLogisticaDto {
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class ImportarEtapaLogisticaDto {
  @IsEnum(LogisticaPedidoStatus)
  status!: LogisticaPedidoStatus;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsDateString()
  em?: string;

  @IsOptional()
  @IsObject()
  dados?: Record<string, unknown>;
}

export class ImportarPedidoLogisticaDto extends CriarPedidoLogisticaDto {
  @IsString()
  @MinLength(3)
  idLegado!: string;

  @IsOptional()
  @IsEnum(LogisticaPedidoStatus)
  status?: LogisticaPedidoStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => EntregadorLogisticaDto)
  entregador?: EntregadorLogisticaDto | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ImportarEtapaLogisticaDto)
  historico?: ImportarEtapaLogisticaDto[];

  @IsOptional()
  @IsString()
  ocorrencia?: string;

  @IsOptional()
  @IsDateString()
  criadoEm?: string;

  @IsOptional()
  @IsDateString()
  atualizadoEm?: string;

  @IsOptional()
  @IsDateString()
  atribuidoEm?: string;

  @IsOptional()
  @IsDateString()
  coletadoEm?: string;

  @IsOptional()
  @IsDateString()
  saiuEntregaEm?: string;

  @IsOptional()
  @IsDateString()
  entregueEm?: string;

  @IsOptional()
  @IsDateString()
  canceladoEm?: string;
}

export class ImportarLogisticaDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ImportarPedidoLogisticaDto)
  pedidos!: ImportarPedidoLogisticaDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SalvarConfiguracaoLogisticaDto)
  configuracao?: SalvarConfiguracaoLogisticaDto;
}
