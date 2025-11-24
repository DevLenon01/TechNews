import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

/**
 * Testa se uma porta está disponível
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const tester = net.createServer();

    tester.once("error", () => {
      resolve(false);
    });

    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port);
  });
}

/**
 * Encontra a primeira porta livre a partir de uma porta inicial
 */
async function findAvailablePort(start: number = 3000): Promise<number> {
  for (let p = start; p < start + 50; p++) {
    if (await isPortAvailable(p)) {
      return p;
    }
  }
  throw new Error(`Nenhuma porta disponível encontrada a partir de ${start}`);
}

/**
 * Inicialização do servidor Express
 */
async function startServer() {
  const app = express();
  const server = createServer(app);

  // Body parsers adequados para uploads grandes
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Rotas OAuth
  registerOAuthRoutes(app);

  // Rotas tRPC
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Modo desenvolvimento usa Vite
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Iniciando em modo DEV (com Vite HMR)...");
    await setupVite(app, server);
  } else {
    console.log("🚀 Iniciando em modo PRODUÇÃO (servindo build estático)...");
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`⚠️ Porta ${preferredPort} ocupada. Usando porta alternativa ${port}.`);
  }

  server.listen(port, () => {
    console.log(`\n🌐 Servidor rodando em: http://localhost:${port}\n`);
  });
}

startServer().catch(err => {
  console.error("Erro ao iniciar o servidor:", err);
});
