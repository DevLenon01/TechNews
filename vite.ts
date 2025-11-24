import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// Corrige import.meta.dirname (compatível com Vercel e Node >= 18)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    appType: "custom",
    server: {
      middlewareMode: "html",
      hmr: { server },
    },
  });

  // Middleware do Vite
  app.use(vite.middlewares);

  // HTML entrypoint com hot reload
  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;

      const templatePath = path.resolve(
        __dirname,
        "../..",
        "client",
        "index.html"
      );

      let template = await fs.promises.readFile(templatePath, "utf-8");

      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const html = await vite.transformIndexHtml(url, template);

      res.setHeader("Content-Type", "text/html");
      res.status(200).end(html);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      next(err);
    }
  });
}

export function serveStatic(app: Express) {
  // Em produção, serve dist/public corretamente
  const distPath = path.resolve(__dirname, "../..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `❌ Build não encontrado em: ${distPath}\nExecute: pnpm build`
    );
  }

  // Arquivos estáticos
  app.use(express.static(distPath));

  // SPA fallback
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
