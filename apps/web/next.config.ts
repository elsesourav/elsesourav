import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: path.join(process.cwd(), "../.."),
  },
  transpilePackages: [
    "@elsesourav/cache",
    "@elsesourav/config",
    "@elsesourav/db",
    "@elsesourav/types",
    "@elsesourav/validation",
  ],
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/posts",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/posts/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
