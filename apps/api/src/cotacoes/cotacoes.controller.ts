import { Body, Controller, Get, Headers, Ip, Param, Patch, Post, Query, RawBodyRequest, Req, Res, StreamableFile, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { CotacoesService } from "./cotacoes.service.js";
import { CadastrarFornecedorCotacaoDto, CriarCotacaoInteligenteDto, EncerrarCotacaoDto, FinalizarCotacaoDto, ProrrogarCotacaoDto, RecusarCotacaoDto, RegistrarRespostaCotacaoDto, RespostaPublicaCotacaoDto } from "./cotacoes.dto.js";

type RequestWithUser = { user: { id: string } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.GERENTE, Role.COMPRAS, Role.ESTOQUE)
@Controller("cotacoes")
export class CotacoesController {
  constructor(private readonly cotacoes: CotacoesService) {}

  @Get("painel") painel() { return this.cotacoes.painel(); }
  @Get("fornecedores/ativos") fornecedores() { return this.cotacoes.listarFornecedores(); }
  @Post("fornecedores") cadastrarFornecedor(@Body() dto: CadastrarFornecedorCotacaoDto) { return this.cotacoes.cadastrarFornecedor(dto); }
  @Get("pedidos/lista") pedidos() { return this.cotacoes.listarPedidos(); }
  @Get("pedidos/:id/pdf") async pdf(@Param("id") id: string, @Res({ passthrough: true }) resposta: Response) { const pdf = await this.cotacoes.pdfPedido(id); resposta.setHeader("Content-Type", "application/pdf"); resposta.setHeader("Content-Disposition", `inline; filename="${pdf.nome}"`); return new StreamableFile(pdf.arquivo); }
  @Post() criar(@Body() dto: CriarCotacaoInteligenteDto, @Req() req: RequestWithUser) { return this.cotacoes.criar(dto, req.user.id); }
  @Get(":codigo") buscar(@Param("codigo") codigo: string) { return this.cotacoes.buscar(codigo); }
  @Post(":codigo/respostas") responder(@Param("codigo") codigo: string, @Body() dto: RegistrarRespostaCotacaoDto) { return this.cotacoes.registrarResposta(codigo, dto); }
  @Post(":codigo/enviar-whatsapp") enviar(@Param("codigo") codigo: string) { return this.cotacoes.enviarWhatsapp(codigo); }
  @Post(":codigo/fornecedores/:participacaoId/novo-link") novoLink(@Param("codigo") codigo: string, @Param("participacaoId") participacaoId: string) { return this.cotacoes.gerarNovoLink(codigo, participacaoId); }
  @Post(":codigo/prorrogar") prorrogar(@Param("codigo") codigo: string, @Body() dto: ProrrogarCotacaoDto, @Req() req: RequestWithUser) { return this.cotacoes.prorrogar(codigo, dto, req.user.id); }
  @Post(":codigo/encerrar") encerrar(@Param("codigo") codigo: string, @Body() dto: EncerrarCotacaoDto, @Req() req: RequestWithUser) { return this.cotacoes.encerrar(codigo, dto, req.user.id); }
  @Post(":codigo/finalizar") finalizar(@Param("codigo") codigo: string, @Body() dto: FinalizarCotacaoDto, @Req() req: RequestWithUser) { return this.cotacoes.finalizar(codigo, dto, req.user.id); }
}

@Controller("cotacoes-publicas")
export class CotacoesPublicasController {
  constructor(private readonly cotacoes: CotacoesService) {}
  @Get(":token") buscar(@Param("token") token: string, @Ip() ip: string, @Headers("user-agent") userAgent?: string) { return this.cotacoes.obterPublica(token, ip, userAgent); }
  @Patch(":token/rascunho") rascunho(@Param("token") token: string, @Body() dto: RespostaPublicaCotacaoDto, @Ip() ip: string) { return this.cotacoes.salvarRascunho(token, dto, ip); }
  @Post(":token/enviar") enviar(@Param("token") token: string, @Body() dto: RespostaPublicaCotacaoDto, @Ip() ip: string) { return this.cotacoes.enviarRespostaPublica(token, dto, ip); }
  @Post(":token/recusar") recusar(@Param("token") token: string, @Body() dto: RecusarCotacaoDto, @Ip() ip: string) { return this.cotacoes.recusar(token, dto, ip); }
}

@Controller("webhooks/whatsapp")
export class WhatsappWebhookController {
  constructor(private readonly cotacoes: CotacoesService) {}
  @Get() verificar(@Query("hub.mode") modo: string, @Query("hub.verify_token") token: string, @Query("hub.challenge") desafio: string, @Res() resposta: Response) { if (modo === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) return resposta.status(200).send(desafio); return resposta.status(403).send("Token de verificação inválido"); }
  @Post() receber(@Req() requisicao: RawBodyRequest<Request>, @Headers("x-hub-signature-256") assinatura: string | undefined, @Body() payload: any) { this.cotacoes.validarAssinatura(requisicao.rawBody, assinatura); return this.cotacoes.processarWebhook(payload); }
}
