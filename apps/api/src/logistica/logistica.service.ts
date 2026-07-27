import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { IntegracoesService } from "../integracoes/integracoes.service.js";
import { CalcularDistanciaDto } from "./logistica.dto.js";

type GoogleRoutesResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
  }>;
  error?: {
    message?: string;
    status?: string;
  };
};

@Injectable()
export class LogisticaService {
  constructor(private readonly integracoes: IntegracoesService) {}

  async calcularDistancia(dto: CalcularDistanciaDto) {
    const apiKey = await this.integracoes.obterToken("google-maps");
    if (!apiKey) {
      throw new ServiceUnavailableException(
        "Configure a chave do Google Maps em Configurações > Google Maps para calcular a distância automaticamente.",
      );
    }

    let resposta: Response;
    try {
      resposta = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: { address: dto.origem.trim() },
          destination: { address: dto.destino.trim() },
          travelMode: dto.modo || "TWO_WHEELER",
          languageCode: "pt-BR",
          units: "METRIC",
        }),
        signal: AbortSignal.timeout(12_000),
      });
    } catch {
      throw new BadGatewayException("O Google Maps não respondeu ao cálculo da rota.");
    }

    const corpo = await resposta.json().catch(() => ({})) as GoogleRoutesResponse;
    if (!resposta.ok) {
      const detalhe = corpo.error?.message || `Google Maps respondeu HTTP ${resposta.status}.`;
      throw new UnprocessableEntityException(detalhe);
    }

    const rota = corpo.routes?.[0];
    if (!rota?.distanceMeters) {
      throw new UnprocessableEntityException("Não foi possível encontrar uma rota para esse endereço.");
    }

    const duracaoSegundos = Number(String(rota.duration || "0").replace("s", "")) || 0;
    return {
      origem: dto.origem.trim(),
      destino: dto.destino.trim(),
      modo: dto.modo || "TWO_WHEELER",
      distanciaMetros: rota.distanceMeters,
      distanciaKm: Number((rota.distanceMeters / 1000).toFixed(2)),
      duracaoMinutos: Math.max(1, Math.round(duracaoSegundos / 60)),
      provedor: "GOOGLE_MAPS_ROUTES",
      calculadoEm: new Date().toISOString(),
    };
  }
}
