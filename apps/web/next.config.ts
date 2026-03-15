import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
