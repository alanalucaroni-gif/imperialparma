import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { ComprasController } from "./compras.controller.js";
import { PedidosCompraController } from "./pedidos-compra.controller.js";
import { PedidosCompraService } from "./pedidos-compra.service.js";
import { PurchaseEntryService } from "./purchase-entry.service.js";

@Module({ imports: [AuthModule], controllers: [ComprasController, PedidosCompraController], providers: [PurchaseEntryService, PedidosCompraService] })
export class ComprasModule {}
