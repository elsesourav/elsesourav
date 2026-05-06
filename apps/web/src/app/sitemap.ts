import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    "",
    "/apps",
    "/about",
    "/feedback",
    "/blog",
    "/help",
    "/help-support",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/refund-policy",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));
}
