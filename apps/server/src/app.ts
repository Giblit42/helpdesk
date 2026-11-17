import express, { type ErrorRequestHandler } from "express";
import type { HealthResponse } from "@helpdesk/shared";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    const body: HealthResponse = {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
    res.json(body);
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Express 5 forwards rejected promises from async handlers here automatically.
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
}
