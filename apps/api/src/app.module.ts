import { Controller, Get, Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { ComprasModule } from "./compras/compras.module.js";
import { CotacoesModule } from "./cotacoes/cotacoes.module.js";
import { EstoqueModule } from "./estoque/estoque.module.js";
import { FinanceiroModule } from "./financeiro/financeiro.module.js";
import { IntegracoesModule } from "./integracoes/integracoes.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { FornecedoresModule } from "./fornecedores/fornecedores.module.js";
import { FuncionariosModule } from "./funcionarios/funcionarios.module.js";
import { UsuariosModule } from "./usuarios/usuarios.module.js";

@Controller("health")
class HealthController {
  @Get()
  health() { return { status: "ok", service: "imperial-erp-api", timestamp: new Date().toISOString() }; }
}

@Module({
  imports: [PrismaModule, AuthModule, EstoqueModule, ComprasModule, CotacoesModule, FinanceiroModule, IntegracoesModule, FornecedoresModule, FuncionariosModule, UsuariosModule],
  controllers: [HealthController],
})
export class AppModule {}
