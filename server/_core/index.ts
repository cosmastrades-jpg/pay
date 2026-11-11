import "dotenv/config";
import express, { type Request, type Response } from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { randomUUID } from "crypto";
import { listDarajaRequests, saveDarajaRequest } from "../db";

export type TrackedRequest = {
  id: string; type: string; reference: string; endpoint: string; status: "success" | "pending" | "failed" | "timeout";
  resultCode: string; resultDescription: string; responseMs: number; requestedAt: string; completedAt: string;
  requestMeta: string; responseData: string;
};

const requestLog: TrackedRequest[] = [];
export const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/platform/config.js", (_req, res) => res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript()));
app.get("/api/requests", async (_req: Request, res: Response) => {
  const stored = await listDarajaRequests();
  const data = stored ?? requestLog;
  return res.json({ data, total: data.length });
});
app.post("/api/requests/track", async (req: Request, res: Response) => {
  const input = req.body ?? {};
  const record: TrackedRequest = {
    id: String(input.id || `req_${randomUUID().slice(0, 8)}`), type: String(input.type || "Daraja request"), reference: String(input.reference || "—"),
    endpoint: String(input.endpoint || "unknown"), status: ["success", "pending", "failed", "timeout"].includes(input.status) ? input.status : "failed",
    resultCode: String(input.resultCode || "—"), resultDescription: String(input.resultDescription || "No result description supplied."), responseMs: Number(input.responseMs || 0),
    requestedAt: String(input.requestedAt || new Date().toISOString()), completedAt: String(input.completedAt || new Date().toISOString()),
    requestMeta: typeof input.requestMeta === "string" ? input.requestMeta : JSON.stringify(input.requestMeta || {}, null, 2),
    responseData: typeof input.responseData === "string" ? input.responseData : JSON.stringify(input.responseData || {}, null, 2),
  };
  requestLog.unshift(record);
  if (requestLog.length > 250) requestLog.pop();
  await saveDarajaRequest(record);
  return res.status(201).json({ data: record });
});

registerOAuthRoutes(app);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

export async function startServer() {
  const server = createServer(app);
  if (process.env.NODE_ENV === "development") await setupVite(app, server); else serveStatic(app);
  const port = Number(process.env.PORT || "3000");
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
  return server;
}

if (process.env.VERCEL !== "1") startServer().catch(error => { console.error(error); process.exit(1); });
