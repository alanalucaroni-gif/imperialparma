import { Controller, HttpCode, Post, RawBodyRequest, Req, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { IfoodPedidosService } from "./ifood-pedidos.service.js";

function assinaturaValida(rawBody: Buffer, assinatura: string, segredo: string): boolean {
  if (!/^[a-f\d]{64}$/i.test(assinatura)) return false;

  const assinaturaEsperada = createHmac("sha256", segredo).update(rawBody).digest();
  const assinaturaRecebida = Buffer.from(assinatura, "hex");

  return timingSafeEqual(assinaturaEsperada, assinaturaRecebida);
}

@Controller("webhooks/ifood")
export class IfoodWebhookController {
  constructor(private readonly pedidos: IfoodPedidosService) {}

  @Post()
  @HttpCode(202)
  async receber(@Req() request: RawBodyRequest<Request>) {
    const segredo = process.env.IFOOD_WEBHOOK_CLIENT_SECRET;
    if (!segredo) {
      throw new ServiceUnavailableException("Webhook do iFood não configurado");
    }

    const assinaturaHeader = request.headers["x-ifood-signature"];
    const assinatura = Array.isArray(assinaturaHeader) ? assinaturaHeader[0] : assinaturaHeader;

    if (!assinatura || !request.rawBody || !assinaturaValida(request.rawBody, assinatura, segredo)) {
      throw new UnauthorizedException("Assinatura do iFood inválida");
    }

    const payload = JSON.parse(request.rawBody.toString("utf8")) as Record<string, unknown>;
    await this.pedidos.registrarEvento(payload);
    return { recebido: true };
  }
}
