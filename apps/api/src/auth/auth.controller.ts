import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { LoginDto, RefreshDto } from "./auth.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("login") login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post("refresh") refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }
}
