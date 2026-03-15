import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "auth-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});
