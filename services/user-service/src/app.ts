import express from "express";
import { registerSwaggerDocs } from "../../shared/swagger";
import { attachRequestId } from "./lib/http";
import { requireAdminRole, requireInternalToken } from "./lib/internal-auth";
import { healthRouter } from "./routes/health";
import { adminUserRouter, userRouter } from "./routes/user";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(attachRequestId);

  registerSwaggerDocs(app, {
    title: "ElseSourav User Service API",
    serviceName: "user-service",
    description:
      "User settings, library, history, feedback, analytics, and moderation endpoints.",
    mounts: [
      { basePath: "", router: healthRouter, tag: "health" },
      { basePath: "/v1/user", router: userRouter, tag: "user" },
      {
        basePath: "/v1/admin/user",
        router: adminUserRouter,
        tag: "user-admin",
      },
    ],
  });

  app.use(healthRouter);

  app.use("/v1", requireInternalToken);
  app.use("/v1/user", userRouter);
  app.use("/v1/admin/user", requireAdminRole, adminUserRouter);

  return app;
}
