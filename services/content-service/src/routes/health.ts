import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "content-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});
