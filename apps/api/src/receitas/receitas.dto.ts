import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength, ValidateNested } from "class-validator";
import { PageDto } from "../common/page.dto.js";

export class ItemReceitaDto {
  @IsOptional() @IsString() insumoId?: string;
  @IsString() @MinLength(2) nome!: string;
  @Type(() => Number) @IsNumber() @Min(0.001) quantidade!: number;
  @IsString() @MinLength(1) unidade!: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) custoUnitario?: number;
}

export class EtapaReceitaDto {
  @IsString() @MinLength(1) nome!: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) tempoMinutos?: number;
}

export class CriarReceitaDto {
  @IsString() @MinLength(2) nome!: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @IsUrl({ require_tld: false }) fotoUrl?: string;
  @Type(() => Number) @IsNumber() @Min(0.001) rendimento!: number;
  @IsString() @MinLength(1) unidadeRendimento!: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) tempoPreparoMinutos?: number;
  @IsOptional() @IsString() modoPreparo?: string;
  @IsOptional() @IsString() setorPadrao?: string;
  @IsOptional() @IsString() instrucoesProducao?: string;
  @IsOptional() @IsString() equipamentos?: string;
  @IsOptional() @IsString() responsavelPadrao?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EtapaReceitaDto) etapas?: EtapaReceitaDto[];
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) custoEstimado?: number;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemReceitaDto) itens!: ItemReceitaDto[];
}

export class AtualizarReceitaDto {
  @IsOptional() @IsString() @MinLength(2) nome?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @IsUrl({ require_tld: false }) fotoUrl?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.001) rendimento?: number;
  @IsOptional() @IsString() @MinLength(1) unidadeRendimento?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) tempoPreparoMinutos?: number;
  @IsOptional() @IsString() modoPreparo?: string;
  @IsOptional() @IsString() setorPadrao?: string;
  @IsOptional() @IsString() instrucoesProducao?: string;
  @IsOptional() @IsString() equipamentos?: string;
  @IsOptional() @IsString() responsavelPadrao?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EtapaReceitaDto) etapas?: EtapaReceitaDto[];
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) custoEstimado?: number;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemReceitaDto) itens?: ItemReceitaDto[];
}

export class ListarReceitasDto extends PageDto {
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsIn(["ativo", "inativo", "todos"]) status: "ativo" | "inativo" | "todos" = "ativo";
  @IsOptional() @IsIn(["codigo", "nome", "categoria", "rendimento", "criadoEm", "atualizadoEm"]) ordenarPor: "codigo" | "nome" | "categoria" | "rendimento" | "criadoEm" | "atualizadoEm" = "nome";
  @IsOptional() @IsIn(["asc", "desc"]) direcao: "asc" | "desc" = "asc";
}

export class CriarProducaoReceitaDto {
  @IsString() receitaId!: string;
  @IsString() funcionarioId!: string;
  @IsString() @MinLength(1) setor!: string;
  @Type(() => Number) @IsNumber() @Min(0.001) quantidadeProduzida!: number;
  @IsString() @MinLength(1) unidade!: string;
  @IsDateString() dataProducao!: string;
  @IsOptional() @IsDateString() horaInicio?: string;
  @IsOptional() @IsDateString() horaFim?: string;
  @IsOptional() @IsString() lote?: string;
  @IsOptional() @IsDateString() validade?: string;
  @IsOptional() @IsIn(["EM_ANDAMENTO", "PAUSADA", "CONCLUIDA"]) status?: "EM_ANDAMENTO" | "PAUSADA" | "CONCLUIDA";
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) quantidadePerdida?: number;
  @IsOptional() @IsString() motivoPerda?: string;
  @IsOptional() @IsString() observacoes?: string;
}

export class AtualizarProducaoReceitaDto {
  @IsOptional() @IsString() receitaId?: string;
  @IsOptional() @IsString() funcionarioId?: string;
  @IsOptional() @IsString() @MinLength(1) setor?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.001) quantidadeProduzida?: number;
  @IsOptional() @IsString() @MinLength(1) unidade?: string;
  @IsOptional() @IsDateString() dataProducao?: string;
  @IsOptional() @IsDateString() horaInicio?: string;
  @IsOptional() @IsDateString() horaFim?: string;
  @IsOptional() @IsString() lote?: string;
  @IsOptional() @IsDateString() validade?: string;
  @IsOptional() @IsIn(["EM_ANDAMENTO", "PAUSADA", "CONCLUIDA"]) status?: "EM_ANDAMENTO" | "PAUSADA" | "CONCLUIDA";
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) quantidadePerdida?: number;
  @IsOptional() @IsString() motivoPerda?: string;
  @IsOptional() @IsString() observacoes?: string;
}

export class InformarPerdaProducaoDto {
  @Type(() => Number) @IsNumber() @Min(0) quantidadePerdida!: number;
  @IsString() @MinLength(3) motivo!: string;
}

export class AdicionarObservacaoProducaoDto {
  @IsString() @MinLength(1) observacao!: string;
}

export class CancelarProducaoReceitaDto {
  @IsString() @MinLength(3) motivo!: string;
}

export class ListarProducoesReceitasDto extends PageDto {
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @IsString() funcionarioId?: string;
  @IsOptional() @IsString() setor?: string;
  @IsOptional() @IsString() receitaId?: string;
  @IsOptional() @IsIn(["EM_ANDAMENTO", "PAUSADA", "CONCLUIDA", "CANCELADA"]) status?: "EM_ANDAMENTO" | "PAUSADA" | "CONCLUIDA" | "CANCELADA";
  @IsOptional() @IsIn(["hoje", "semana", "mes", "personalizado", "todos"]) periodo?: "hoje" | "semana" | "mes" | "personalizado" | "todos";
  @IsOptional() @IsDateString() dataInicio?: string;
  @IsOptional() @IsDateString() dataFim?: string;
  @IsOptional() @IsIn(["dataProducao", "criadoEm", "quantidadeProduzida", "status"]) ordenarPor: "dataProducao" | "criadoEm" | "quantidadeProduzida" | "status" = "dataProducao";
  @IsOptional() @IsIn(["asc", "desc"]) direcao: "asc" | "desc" = "desc";
}

export class RankingProducoesDto extends ListarProducoesReceitasDto {
  @IsOptional() @IsIn(["registros", "volume"]) tipo: "registros" | "volume" = "registros";
}