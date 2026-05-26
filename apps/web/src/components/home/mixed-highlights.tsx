"use client";

import { cn } from "@/lib/cn";
import { formatPrice, type PublicApp } from "@/lib/view-models";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { formatRating } from "./home-utils";
import styles from "./homepage.module.css";
import type { SupportOverviewPayload } from "./types";

export function MixedHighlights({
  supportOverview,
  featuredApps,
  displayClassName,
}: {
  supportOverview: SupportOverviewPayload | null;
  featuredApps: PublicApp[];
  displayClassName: string;
}) {
  return (
    <Box component="section" sx={{ display: "grid", gap: 2.5 }}>
      <Stack spacing={1}>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#5b6680",
          }}
        >
          Cross-page highlights
        </Typography>
        <Typography
          component="h2"
          className={cn(displayClassName)}
          sx={{
            fontSize: { xs: "2rem", md: "2.5rem" },
            letterSpacing: "-0.03em",
            color: "#101726",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Apps, help docs, and post updates in one glance
        </Typography>
        <Typography
          sx={{
            maxWidth: 980,
            fontSize: { xs: "0.95rem", md: "1rem" },
            color: "#586782",
          }}
        >
          A mixed section built from multiple routes so users can discover
          launches, get answers, and stay updated without extra clicks.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3,minmax(0,1fr))" },
        }}
      >
        <Paper className={cn(styles.mixCard)} elevation={0} sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#5b6680",
            }}
          >
            Featured apps
          </Typography>
          <Stack
            component="ul"
            spacing={1.5}
            sx={{ mt: 1.5, m: 0, p: 0, listStyle: "none" }}
          >
            {featuredApps.slice(0, 4).map((app) => (
              <li key={app.id}>
                <Paper
                  component={Link}
                  href={`/apps/${app.slug}`}
                  elevation={0}
                  sx={{
                    display: "block",
                    borderRadius: 2,
                    border:
                      "1px solid color-mix(in srgb, black 10%, transparent)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    p: 1.5,
                    textDecoration: "none",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#101726",
                          fontSize: "0.95rem",
                        }}
                      >
                        {app.title}
                      </Typography>
                      <Typography
                        sx={{ mt: 0.35, fontSize: "0.75rem", color: "#5b6680" }}
                      >
                        {app.category?.name ?? app.appCategory ?? "App"}
                      </Typography>
                    </Box>
                    <Chip
                      label={app.isPaid ? formatPrice(app.price) : "Free"}
                      size="small"
                      sx={{
                        border:
                          "1px solid color-mix(in srgb, black 10%, transparent)",
                        backgroundColor: "#f8faff",
                        color: "#15213a",
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{ mt: 1, fontSize: "0.86rem", color: "#4f5e78" }}
                    className="line-clamp-2"
                  >
                    {app.shortDescription}
                  </Typography>
                  <Typography
                    sx={{ mt: 1, fontSize: "0.72rem", color: "#47566f" }}
                  >
                    Rating {formatRating(app.aggregateStat?.averageRating)}
                  </Typography>
                </Paper>
              </li>
            ))}
          </Stack>
        </Paper>

        <Paper className={cn(styles.mixCard)} elevation={0} sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#5b6680",
              }}
            >
              Help center picks
            </Typography>
            <Button
              component={Link}
              href="/help"
              variant="text"
              size="small"
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              View all
            </Button>
          </Stack>

          <Stack
            component="ul"
            spacing={1.5}
            sx={{ mt: 1.5, m: 0, p: 0, listStyle: "none" }}
          >
            {(supportOverview?.featuredHelp ?? [])
              .slice(0, 4)
              .map((article) => (
                <li key={article.id}>
                  <Paper
                    component={Link}
                    href={`/help/${article.slug}`}
                    elevation={0}
                    sx={{
                      display: "block",
                      borderRadius: 2,
                      border:
                        "1px solid color-mix(in srgb, black 10%, transparent)",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      p: 1.5,
                      textDecoration: "none",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#101726",
                        fontSize: "0.94rem",
                      }}
                    >
                      {article.title}
                    </Typography>
                    <Typography
                      sx={{ mt: 0.6, fontSize: "0.84rem", color: "#4f5e78" }}
                      className="line-clamp-2"
                    >
                      {article.summary ??
                        "Practical steps and troubleshooting guidance."}
                    </Typography>
                    <Typography
                      sx={{ mt: 1, fontSize: "0.72rem", color: "#5b6680" }}
                    >
                      {article.category?.name ?? "General"}
                    </Typography>
                  </Paper>
                </li>
              ))}
            {(supportOverview?.featuredHelp ?? []).length === 0 ? (
              <li>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border:
                      "1px dashed color-mix(in srgb, black 15%, transparent)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    p: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.86rem", color: "#4f5e78" }}>
                    Help articles will appear here once published.
                  </Typography>
                </Paper>
              </li>
            ) : null}
          </Stack>
        </Paper>

        <Paper className={cn(styles.mixCard)} elevation={0} sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#5b6680",
              }}
            >
              Latest posts
            </Typography>
            <Button
              component={Link}
              href="/posts"
              variant="text"
              size="small"
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Read all
            </Button>
          </Stack>

          <Stack
            component="ul"
            spacing={1.5}
            sx={{ mt: 1.5, m: 0, p: 0, listStyle: "none" }}
          >
            {(supportOverview?.latestPosts ?? []).slice(0, 4).map((post) => (
              <li key={post.id}>
                <Paper
                  component={Link}
                  href={`/posts/${post.slug}`}
                  elevation={0}
                  sx={{
                    display: "block",
                    borderRadius: 2,
                    border:
                      "1px solid color-mix(in srgb, black 10%, transparent)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    p: 1.5,
                    textDecoration: "none",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#101726",
                      fontSize: "0.94rem",
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    sx={{ mt: 0.6, fontSize: "0.84rem", color: "#4f5e78" }}
                    className="line-clamp-2"
                  >
                    {post.excerpt ??
                      "Insights and updates from the product ecosystem."}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ mt: 1, flexWrap: "wrap", gap: 0.75 }}
                  >
                    {post.tags.slice(0, 2).map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        sx={{
                          borderRadius: 999,
                          border:
                            "1px solid color-mix(in srgb, black 10%, transparent)",
                          backgroundColor: "#f8faff",
                          color: "#4b5a72",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </li>
            ))}
            {(supportOverview?.latestPosts ?? []).length === 0 ? (
              <li>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border:
                      "1px dashed color-mix(in srgb, black 15%, transparent)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    p: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.86rem", color: "#4f5e78" }}>
                    New posts will appear here when available.
                  </Typography>
                </Paper>
              </li>
            ) : null}
          </Stack>
        </Paper>
      </Box>

      {(supportOverview?.categories ?? []).length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {supportOverview?.categories.slice(0, 6).map((category) => (
            <Button
              key={category.id}
              component={Link}
              href={`/help?category=${encodeURIComponent(category.slug)}`}
              variant="outlined"
              size="small"
              className={cn(styles.chipLink)}
              sx={{
                px: 1.6,
                py: 0.65,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#182238",
                borderColor: "color-mix(in srgb, black 12%, transparent)",
              }}
            >
              {category.name}
              {typeof category._count?.articles === "number"
                ? ` (${category._count.articles})`
                : ""}
            </Button>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
