"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import styles from "./homepage.module.css";

export function SupportCtaPanel({
  displayClassName,
}: {
  displayClassName: string;
}) {
  return (
    <Box
      component="section"
      className={cn(styles.ctaSurface)}
      sx={{ p: { xs: 3, md: 4, lg: 5 } }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
        }}
      >
        <Stack spacing={2}>
          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#5f6d86",
            }}
          >
            Need a faster route?
          </Typography>
          <Typography
            component="h2"
            className={cn(displayClassName)}
            sx={{
              fontSize: { xs: "2rem", md: "2.45rem" },
              color: "#101726",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              fontWeight: 700,
            }}
          >
            Launch faster with direct support and practical docs
          </Typography>
          <Typography
            sx={{
              maxWidth: 760,
              fontSize: { xs: "0.95rem", md: "1rem" },
              lineHeight: 1.75,
              color: "#566680",
            }}
          >
            Ask a question, open a support ticket, or browse docs in one move.
            This panel keeps users in a light, focused flow from homepage to
            resolution.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button
              component={Link}
              href="/support"
              className={cn(styles.prismButton)}
              sx={{ px: 2.2, py: 1.1, borderRadius: 999 }}
            >
              Open support workspace
            </Button>
            <Button
              component={Link}
              href="/help"
              tone="secondary"
              className={cn(styles.secondaryPrismButton)}
              sx={{ px: 2.2, py: 1.1, borderRadius: 999 }}
            >
              Browse help docs
            </Button>
            <Button
              component={Link}
              href="/blog"
              tone="secondary"
              className={cn(styles.secondaryPrismButton)}
              sx={{ px: 2.2, py: 1.1, borderRadius: 999 }}
            >
              Read product blog
            </Button>
          </Stack>
        </Stack>

        <Paper
          className={cn(styles.mixCard)}
          elevation={0}
          sx={{ p: { xs: 2.5, md: 3 } }}
        >
          <Typography
            sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#121a2b" }}
          >
            Quick help search
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: "0.9rem", color: "#566680" }}>
            Type what you are trying to do and jump straight to relevant
            documentation.
          </Typography>

          <Box
            component="form"
            action="/help"
            method="get"
            sx={{ mt: 2, display: "grid", gap: 1.25 }}
          >
            <Input
              name="search"
              type="search"
              placeholder="Example: connect billing webhook"
              className={cn(styles.prismInput)}
              aria-label="Search help docs"
              sx={{
                "& .MuiOutlinedInput-root": {
                  minHeight: 48,
                  borderRadius: "16px",
                },
              }}
            />
            <Button
              type="submit"
              className={cn(styles.prismButton)}
              sx={{ height: 44, width: "100%", borderRadius: "16px" }}
            >
              Find guides
            </Button>
          </Box>

          <Stack
            spacing={1}
            sx={{ mt: 2, color: "#53617a", fontSize: "0.78rem" }}
          >
            <Paper
              component={Link}
              href="/support?priority=HIGH"
              elevation={0}
              sx={{
                borderRadius: 1.5,
                border: "1px solid color-mix(in srgb, black 10%, transparent)",
                backgroundColor: "rgba(255,255,255,0.7)",
                px: 1.5,
                py: 1,
                color: "inherit",
                textDecoration: "none",
                "&:hover": {
                  borderColor: "#1f5ed4",
                  color: "#1f5ed4",
                },
              }}
            >
              Urgent issue? Open a high-priority ticket
            </Paper>
            <Paper
              component={Link}
              href="/blog?tag=guides"
              elevation={0}
              sx={{
                borderRadius: 1.5,
                border: "1px solid color-mix(in srgb, black 10%, transparent)",
                backgroundColor: "rgba(255,255,255,0.7)",
                px: 1.5,
                py: 1,
                color: "inherit",
                textDecoration: "none",
                "&:hover": {
                  borderColor: "#1f5ed4",
                  color: "#1f5ed4",
                },
              }}
            >
              Prefer walkthroughs? Check new guide posts
            </Paper>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
