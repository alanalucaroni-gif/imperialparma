import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Role } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";

export type JwtPayload = { sub: string; email: string; role: Role };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev-access-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, permissoes: true, ativo: true },
    });
    if (!usuario?.ativo) throw new UnauthorizedException("Sess?o inv?lida ou usu?rio desativado.");
    return { id: usuario.id, email: usuario.email, role: usuario.role, permissoes: usuario.permissoes };
  }
}
