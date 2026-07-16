import { Body, Controller, Get, Headers, Param, Post, Query, RawBodyRequest, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../common/roles.decorator.js";
import { RolesGuard } from "../common/roles.guard.js";
import { Role } from "../generated/prisma/enums.js";
import { CotacoesService } from "./cotacoes.service.js";
import { CadastrarFornecedorCotacaoDto, CriarCotacaoInteligenteDto, RegistrarRespostaCotacaoDto } from "./cotacoes.dto.js";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.GERENTE, Role.COMPRAS)
@Controller("cotacoes")
export class CotacoesController {
  constructor(private readonly cotacoes: CotacoesService) {}

  @Get("painel") painel() { return this.cotacoes.painel(); }
  @Get(":codigo") buscar(@Param("codigo") codigo: string) { return this.cotacoes.buscar(codigo); }
  @Post() criar(@Body() dto: CriarCotacaoInteligenteDto) { return this.cotacoes.criar(dto); }
  @Post(":codigo/respostas") responder(@Param("codigo") codigo: string, @Body() dto: RegistrarRespostaCotacaoDto) { return this.cotacoes.registrarResposta(codigo, dto); }
  @Post(":codigo/enviar-whatsapp") enviar(@Param("codigo") codigo: string) { return this.cotacoes.enviarWhatsapp(codigo); }
}

@Controller("webhooks/whatsapp")
export class WhatsappWebhookController {
  constructor(private readonly cotacoes: CotacoesService) {}

  @Get()
  verificar(@Query("hub.mode") modo: string, @Query("hub.verify_token") token: string, @Query("hub.challenge") desafio: string, @Res() resposta: Response) {
    if (modo === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) return resposta.status(200).send(desafio);
    return resposta.status(403).send("Token de verificação inválido");
  }

  @Post()
  receber(@Req() requisicao: RawBodyRequest<Request>, @Headers("x-hub-signature-256") assinatura: string | undefined, @Body() payload: any) {
    this.cotacoes.validarAssinatura(requisicao.rawBody, assinatura);
    return this.cotacoes.processarWebhook(payload);
  }
}