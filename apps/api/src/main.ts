import "reflect-metadata";
import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.setGlobalPrefix("api");

  let webDist = join(process.cwd(), "apps", "web", "dist");
  if (!existsSync(join(webDist, "index.html"))) {
    webDist = join(process.cwd(), "..", "web", "dist");
  }
  const webBuildDisponivel = existsSync(join(webDist, "index.html"));
  if (webBuildDisponivel) app.useStaticAssets(webDist, { index: false });

  app.enableCors({
    origin: (process.env.WEB_ORIGIN || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  if (webBuildDisponivel) {
    const expressApp = app.getHttpAdapter().getInstance() as {
      use(handler: (
        request: { method: string; path?: string },
        response: { sendFile(path: string): unknown },
        next: () => unknown,
      ) => unknown): void;
    };
    expressApp.use((request, response, next) => {
      if (request.method === "GET" && !request.path?.startsWith("/api")) {
        return response.sendFile(join(webDist, "index.html"));
      }
      return next();
    });
  }

  await app.init();
  await app.listen(Number(process.env.PORT || 3000), "0.0.0.0");
}

bootstrap();
