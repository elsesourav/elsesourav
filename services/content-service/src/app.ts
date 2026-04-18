import express from "express";
import { registerSwaggerDocs } from "../../shared/swagger";
import { attachRequestId } from "./lib/http";
import { requireAdminRole, requireInternalToken } from "./lib/internal-auth";
import { adminContentRouter } from "./routes/admin";
import { healthRouter } from "./routes/health";
import { publicContentRouter } from "./routes/public";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(attachRequestId);

  registerSwaggerDocs(app, {
    title: "ElseSourav Content Service API",
    serviceName: "content-service",
    description:
      "CMS pages, blog, help center, testimonials, and content administration.",
    mounts: [
      { basePath: "", router: healthRouter, tag: "health" },
      {
        basePath: "/v1/content",
        router: publicContentRouter,
        tag: "content-public",
      },
      {
        basePath: "/v1/admin/content",
        router: adminContentRouter,
        tag: "content-admin",
      },
    ],
  });

  app.use(healthRouter);

  app.use("/v1", requireInternalToken);
  app.use("/v1/content", publicContentRouter);
  app.use("/v1/admin/content", requireAdminRole, adminContentRouter);

  return app;
}
