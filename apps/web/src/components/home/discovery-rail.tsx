"use client";

import { cn } from "@/lib/cn";
import type { PublicApp } from "@/lib/view-models";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { DiscoveryCard } from "./discovery-card";
import styles from "./homepage.module.css";

export function DiscoveryRail({
  title,
  subtitle,
  apps,
  href,
  compact = false,
}: {
  title: string;
  subtitle: string;
  apps: PublicApp[];
  href: string;
  compact?: boolean;
}) {
  if (apps.length === 0) {
    return null;
  }

  return (
    <Box component="section" sx={{ display: "grid", gap: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          justifyContent: "space-between",
          alignItems: { sm: "flex-end" },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#0f1420",
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ mt: 0.4, fontSize: "0.92rem", color: "#5a6881" }}>
            {subtitle}
          </Typography>
        </Box>

        <Button
          component={Link}
          href={href}
          variant="outlined"
          size="small"
          className={cn(styles.chipLink)}
          sx={{
            px: 1.8,
            py: 0.7,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#182238",
            borderColor: "color-mix(in srgb, black 12%, transparent)",
          }}
        >
          View all
        </Button>
      </Stack>

      <Box className={cn(styles.railMask)} sx={{ overflowX: "auto", pb: 0.5 }}>
        <Box sx={{ display: "flex", minWidth: "max-content", gap: 2 }}>
          {apps.map((app) => (
            <Box key={app.id} sx={{ width: { xs: 280, sm: 310, lg: 340 } }}>
              <DiscoveryCard app={app} compact={compact} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
