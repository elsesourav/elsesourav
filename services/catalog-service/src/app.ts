import express from "express";
import { registerSwaggerDocs } from "../../shared/swagger";
import { attachRequestId } from "./lib/http";
import { requireAdminRole, requireInternalToken } from "./lib/internal-auth";
import { adminCatalogRouter } from "./routes/admin";
import { healthRouter } from "./routes/health";
import { publicCatalogRouter } from "./routes/public";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(attachRequestId);

  registerSwaggerDocs(app, {
    title: "ElseSourav Catalog Service API",
    serviceName: "catalog-service",
    description:
      "Catalog, categories, tags, sliders, sections, banners, and admin inventory operations.",
    mounts: [
      { basePath: "", router: healthRouter, tag: "health" },
      {
        basePath: "/v1/catalog",
        router: publicCatalogRouter,
        tag: "catalog-public",
      },
      {
        basePath: "/v1/admin/catalog",
        router: adminCatalogRouter,
        tag: "catalog-admin",
      },
    ],
  });

  app.use(healthRouter);

  app.use("/v1", requireInternalToken);
  app.use("/v1/catalog", publicCatalogRouter);
  app.use("/v1/admin/catalog", requireAdminRole, adminCatalogRouter);

  return app;
}
