import express from "express";
import { attachRequestId } from "./lib/http";
import { requireAdminRole, requireInternalToken } from "./lib/internal-auth";
import { adminThemeRouter } from "./routes/admin";
import { healthRouter } from "./routes/health";
import { publicThemeRouter } from "./routes/public";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(attachRequestId);

  app.use(healthRouter);

  app.use("/v1", requireInternalToken);
  app.use("/v1/theme", publicThemeRouter);
  app.use("/v1/admin/theme", requireAdminRole, adminThemeRouter);

  return app;
}
