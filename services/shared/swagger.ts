import type { Express, Router } from "express";
import swaggerUi from "swagger-ui-express";

type RouterLayer = {
  route?: {
    path: string | string[];
    methods: Record<string, boolean>;
  };
};

type RouterMount = {
  basePath: string;
  router: Router;
  tag: string;
};

type RegisterSwaggerDocsOptions = {
  title: string;
  serviceName: string;
  description: string;
  version?: string;
  mounts: RouterMount[];
};

type OpenApiPathItem = Record<string, unknown>;

function normalizePath(path: string): string {
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  return prefixed.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function toOpenApiPath(path: string): string {
  return normalizePath(path).replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

function extractPathParams(path: string) {
  const matches = [...path.matchAll(/:([A-Za-z0-9_]+)/g)];

  return matches.map((match) => ({
    name: match[1],
    in: "path",
    required: true,
    schema: {
      type: "string",
    },
  }));
}

function collectMountedRoutes(mount: RouterMount) {
  const stack = (mount.router as unknown as { stack?: RouterLayer[] }).stack;
  const layers = stack ?? [];

  const routes: Array<{
    method: string;
    path: string;
    tag: string;
  }> = [];

  for (const layer of layers) {
    if (!layer.route) {
      continue;
    }

    const routePaths = Array.isArray(layer.route.path)
      ? layer.route.path
      : [layer.route.path];

    const methods = Object.entries(layer.route.methods)
      .filter(([, enabled]) => enabled)
      .map(([method]) => method.toLowerCase());

    for (const routePath of routePaths) {
      const fullPath = normalizePath(`${mount.basePath}/${routePath}`);

      for (const method of methods) {
        routes.push({
          method,
          path: fullPath,
          tag: mount.tag,
        });
      }
    }
  }

  return routes;
}

function buildOpenApiDocument(
  options: RegisterSwaggerDocsOptions,
  serverUrl: string,
) {
  const paths: Record<string, OpenApiPathItem> = {};
  const allRoutes = options.mounts.flatMap(collectMountedRoutes);

  for (const route of allRoutes) {
    const openApiPath = toOpenApiPath(route.path);
    const pathParams = extractPathParams(route.path);
    const secured = route.path.startsWith("/v1");
    const operationId = `${route.method}_${openApiPath
      .replace(/[{}]/g, "")
      .replace(/\//g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")}`;

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    paths[openApiPath][route.method] = {
      tags: [route.tag],
      operationId,
      summary: `${route.method.toUpperCase()} ${openApiPath}`,
      parameters: pathParams,
      security: secured ? [{ InternalToken: [] }] : undefined,
      responses: {
        200: { description: "Success" },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        500: { description: "Internal server error" },
      },
    };
  }

  return {
    openapi: "3.0.3",
    info: {
      title: options.title,
      version: options.version ?? "1.0.0",
      description: options.description,
    },
    servers: [{ url: serverUrl }],
    tags: Array.from(new Set(options.mounts.map((mount) => mount.tag))).map(
      (name) => ({ name }),
    ),
    components: {
      securitySchemes: {
        InternalToken: {
          type: "apiKey",
          in: "header",
          name: "x-internal-token",
          description: "Internal service token for privileged endpoints.",
        },
      },
    },
    paths,
  };
}

export function registerSwaggerDocs(
  app: Express,
  options: RegisterSwaggerDocsOptions,
) {
  app.get("/openapi.json", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const document = buildOpenApiDocument(options, baseUrl);

    res.json(document);
  });

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: "/openapi.json",
      },
      customSiteTitle: `${options.serviceName} API Docs`,
    }),
  );
}
