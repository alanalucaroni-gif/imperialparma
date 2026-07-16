import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { PageDto } from "../common/page.dto.js";

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}
  async contasPagar(dto: PageDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contaPagar.findMany({ orderBy: [{ vencimento: "asc" }, { criadoEm: "desc" }], skip: (dto.page - 1) * dto.limit, take: dto.limit }),
      this.prisma.contaPagar.count(),
    ]);
    return {
      data: items.map((item) => ({
        id: item.id, desc: item.descricao,
        venc: item.vencimento?.toLocaleDateString("pt-BR") || "A definir",
        valor: Number(item.valor), status: item.status.toLowerCase(),
      })),
      meta: { page: dto.page, limit: dto.limit, total },
    };
  }
}
