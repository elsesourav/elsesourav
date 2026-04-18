import express from "express";
import { registerSwaggerDocs } from "../../shared/swagger";
import { attachRequestId } from "./lib/http";
import { authRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(attachRequestId);

  registerSwaggerDocs(app, {
    title: "ElseSourav Auth Service API",
    serviceName: "auth-service",
    description:
      "Authentication, sessions, user lookups, and admin auth operations.",
    mounts: [
      { basePath: "", router: healthRouter, tag: "health" },
      { basePath: "/v1/auth", router: authRouter, tag: "auth" },
    ],
  });

  app.use(healthRouter);
  app.use("/v1/auth", authRouter);

  return app;
}
