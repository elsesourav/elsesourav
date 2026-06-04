import express from "express";
import { registerSwaggerDocs } from "../../shared/swagger";
import { attachRequestId } from "./lib/http";
import { requireAdminRole, requireInternalToken } from "./lib/internal-auth";
import { adminThemeRouter, adminImageRouter } from "./routes/admin";
import { healthRouter } from "./routes/health";
import { publicThemeRouter } from "./routes/public";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(attachRequestId);

  registerSwaggerDocs(app, {
    title: "ElseSourav Theme Service API",
    serviceName: "theme-service",
    description:
      "Theme config retrieval and administrative theme management endpoints.",
    mounts: [
      { basePath: "", router: healthRouter, tag: "health" },
      { basePath: "/v1/theme", router: publicThemeRouter, tag: "theme" },
      {
        basePath: "/v1/admin/theme",
        router: adminThemeRouter,
        tag: "theme-admin",
      },
      {
        basePath: "/v1/admin/images",
        router: adminImageRouter,
        tag: "image-admin",
      },
    ],
  });

  app.use(healthRouter);

  app.use("/v1", requireInternalToken);
  app.use("/v1/theme", publicThemeRouter);
  app.use("/v1/admin/theme", requireAdminRole, adminThemeRouter);
  app.use("/v1/admin/images", requireAdminRole, adminImageRouter);

  return app;
}
