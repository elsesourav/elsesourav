import express from "express";
import { attachRequestId } from "./lib/http";
import { requireAdminRole, requireInternalToken } from "./lib/internal-auth";
import { healthRouter } from "./routes/health";
import { adminUserRouter, userRouter } from "./routes/user";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(attachRequestId);

  app.use(healthRouter);

  app.use("/v1", requireInternalToken);
  app.use("/v1/user", userRouter);
  app.use("/v1/admin/user", requireAdminRole, adminUserRouter);

  return app;
}
