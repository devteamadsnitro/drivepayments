import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { ENV } from "./env";
import { registerCrmRoutes } from "../crm/routes";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  const server = createServer(app);
  // Los expedientes llegan cifrados e incluyen documentos: límite amplio solo
  // para esa ruta. El resto de la API trabaja con cuerpos pequeños.
  app.use("/api/submissions", express.json({ limit: "46mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  registerCrmRoutes(app);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
    const storageReady = Boolean(ENV.s3Bucket && ENV.s3AccessKeyId && ENV.s3SecretAccessKey);
    const endpointHost = ENV.s3Endpoint ? new URL(ENV.s3Endpoint).host : "aws-default";
    if (!ENV.sessionSecret) console.warn("[CRM] SESSION_SECRET is not set: CRM login is disabled.");
    console.log(`[Storage] ${storageReady ? "configured" : "NOT configured"} (endpoint ${endpointHost})`);
  });
}

startServer().catch(error => { console.error(error); process.exit(1); });
