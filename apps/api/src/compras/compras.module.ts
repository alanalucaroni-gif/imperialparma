import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { ComprasController } from "./compras.controller.js";
import { PurchaseEntryService } from "./purchase-entry.service.js";

@Module({ imports: [AuthModule], controllers: [ComprasController], providers: [PurchaseEntryService] })
export class ComprasModule {}
