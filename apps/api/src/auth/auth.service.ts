import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { createHash, randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import type { LoginDto } from "./auth.dto.js";

const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!usuario?.ativo || !(await compare(dto.senha, usuario.senhaHash))) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }
    return this.issueTokens(usuario);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; jti: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
      });
      const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash: tokenHash(payload.jti) }, include: { usuario: true } });
      if (!stored || stored.revogadoEm || stored.expiraEm < new Date() || !stored.usuario.ativo) throw new Error();
      await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revogadoEm: new Date() } });
      return this.issueTokens(stored.usuario);
    } catch {
      throw new UnauthorizedException("Refresh token inválido ou expirado.");
    }
  }

  private async issueTokens(usuario: { id: string; nome: string; email: string; role: any }) {
    const payload = { sub: usuario.id, email: usuario.email, role: usuario.role };
    const jti = randomUUID();
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET || "dev-access-secret-change-me",
      expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any,
    });
    const refreshToken = await this.jwt.signAsync({ sub: usuario.id, jti }, {
      secret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
    });
    await this.prisma.refreshToken.create({
      data: { tokenHash: tokenHash(jti), usuarioId: usuario.id, expiraEm: new Date(Date.now() + 7 * 86400000) },
    });
    return { accessToken, refreshToken, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role } };
  }
}
