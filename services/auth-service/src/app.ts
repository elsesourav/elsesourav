import express from "express";
import { attachRequestId } from "./lib/http";
import { authRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(attachRequestId);

  app.use(healthRouter);
  app.use("/v1/auth", authRouter);

  return app;
}
