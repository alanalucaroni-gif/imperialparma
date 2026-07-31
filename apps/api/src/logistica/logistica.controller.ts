import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import {
  AtualizarStatusPedidoLogisticaDto,
  GerarOrdensPagamentoLogisticaDto,
  ListarOrdensPagamentoLogisticaDto,
  PagarOrdemPagamentoLogisticaDto,
  CalcularDistanciaDto,
  CriarOcorrenciaLogisticaDto,
  CriarPedidoLogisticaDto,
  ImportarLogisticaDto,
  ListarPedidosLogisticaDto,
  ResolverOcorrenciaLogisticaDto,
  SalvarConfiguracaoLogisticaDto,
} from "./logistica.dto.js";
import { LogisticaPagamentosService } from "./logistica-pagamentos.service.js";
import { LogisticaOperacaoService } from "./logistica-operacao.service.js";
import { LogisticaRastreamentoService } from "./logistica-rastreamento.service.js";
import { LogisticaService } from "./logistica.service.js";

@UseGuards(JwtAuthGuard)
@Controller("logistica")
export class LogisticaController {
  constructor(
    private readonly logistica: LogisticaService,
    private readonly operacao: LogisticaOperacaoService,
    private readonly rastreamento: LogisticaRastreamentoService,
    private readonly pagamentos: LogisticaPagamentosService,
  ) {}

  @Post("calcular-distancia")
  calcularDistancia(@Body() dto: CalcularDistanciaDto) {
    return this.logistica.calcularDistancia(dto);
  }

  @Post("ordens-pagamento/gerar")
  gerarOrdensPagamento(
    @Body() dto: GerarOrdensPagamentoLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.pagamentos.gerar(dto, request.user.id);
  }

  @Get("ordens-pagamento")
  listarOrdensPagamento(@Query() dto: ListarOrdensPagamentoLogisticaDto) {
    return this.pagamentos.listar(dto);
  }

  @Patch("ordens-pagamento/:id/pagar")
  pagarOrdem(
    @Param("id") id: string,
    @Body() _dto: PagarOrdemPagamentoLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.pagamentos.pagar(id, request.user.id);
  }

  @Get("configuracao")
  obterConfiguracao() {
    return this.operacao.obterConfiguracao();
  }

  @Put("configuracao")
  salvarConfiguracao(
    @Body() dto: SalvarConfiguracaoLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.operacao.salvarConfiguracao(dto, request.user.id);
  }

  @Post("importar")
  importar(
    @Body() dto: ImportarLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.operacao.importar(dto, request.user.id);
  }

  @Get("pedidos")
  listarPedidos(@Query() dto: ListarPedidosLogisticaDto) {
    return this.operacao.listar(dto);
  }

  @Post("pedidos")
  criarPedido(
    @Body() dto: CriarPedidoLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.operacao.criar(dto, request.user.id);
  }

  @Get("pedidos/:id")
  buscarPedido(@Param("id") id: string) {
    return this.operacao.buscar(id);
  }

  @Post("pedidos/:id/links")
  gerarLinks(
    @Param("id") id: string,
    @Req() request: { headers?: { origin?: string } },
  ) {
    return this.rastreamento.gerarLinksTemporarios(
      id,
      request.headers?.origin,
    );
  }

  @Patch("pedidos/:id/status")
  atualizarStatus(
    @Param("id") id: string,
    @Body() dto: AtualizarStatusPedidoLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.operacao.atualizarStatus(id, dto, request.user.id);
  }

  @Post("pedidos/:id/ocorrencias")
  criarOcorrencia(
    @Param("id") id: string,
    @Body() dto: CriarOcorrenciaLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.operacao.criarOcorrencia(id, dto, request.user.id);
  }

  @Patch("ocorrencias/:id/resolver")
  resolverOcorrencia(
    @Param("id") id: string,
    @Body() dto: ResolverOcorrenciaLogisticaDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.operacao.resolverOcorrencia(id, dto, request.user.id);
  }
}
