import express from "express";
import { attachRequestId } from "./lib/http";
import { requireAdminRole, requireInternalToken } from "./lib/internal-auth";
import { adminContentRouter } from "./routes/admin";
import { healthRouter } from "./routes/health";
import { publicContentRouter } from "./routes/public";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(attachRequestId);

  app.use(healthRouter);

  app.use("/v1", requireInternalToken);
  app.use("/v1/content", publicContentRouter);
  app.use("/v1/admin/content", requireAdminRole, adminContentRouter);

  return app;
}
