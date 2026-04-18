"use client";

import { cn } from "@/lib/cn";
import { formatPrice, type PublicApp } from "@/lib/view-models";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Link from "next/link";
import { formatCompactCount, formatRating } from "./home-utils";
import styles from "./homepage.module.css";

export function DiscoveryCard({
  app,
  compact = false,
}: {
  app: PublicApp;
  compact?: boolean;
}) {
  const media = app.media?.[0];
  const tags = app.tags ?? [];

  return (
    <Paper
      component="article"
      className={cn(styles.mixCard, "group")}
      elevation={0}
      sx={{ overflow: "hidden" }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16/10",
          overflow: "hidden",
          background: "linear-gradient(130deg,#f4f8ff,#e4edff 50%,#dce8ff)",
        }}
      >
        {media ? (
          media.type === "VIDEO" ? (
            <video
              src={media.url}
              className="h-full w-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              controls={false}
              preload="metadata"
            />
          ) : (
            <Image
              src={media.url}
              alt={media.alt ?? app.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
          )
        ) : app.iconUrl ? (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
            }}
          >
            <Image
              src={app.iconUrl}
              alt={`${app.title} icon`}
              width={120}
              height={120}
              className="h-20 w-20 rounded-3xl border border-black/10 bg-white object-cover shadow-sm"
              unoptimized
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "flex-end",
              p: 2,
              color: "#fff",
              background: "linear-gradient(135deg,#1a2232,#1f5ed4 45%,#f59e0b)",
            }}
          >
            <Typography
              sx={{ fontSize: "1.2rem", lineHeight: 1.2, fontWeight: 700 }}
            >
              {app.title}
            </Typography>
          </Box>
        )}
      </Box>

      <Stack spacing={compact ? 1.6 : 2} sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.62rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#667187",
              }}
            >
              {app.category.name}
            </Typography>
            <Typography
              sx={{
                mt: 0.35,
                fontSize: "1rem",
                fontWeight: 700,
                color: "#101522",
              }}
            >
              {app.title}
            </Typography>
          </Box>
          <Chip
            label={app.isPaid ? formatPrice(app.price) : "Free"}
            size="small"
            sx={{
              border: "1px solid color-mix(in srgb, black 10%, transparent)",
              backgroundColor: "#fff",
              color: "#1c2436",
              fontWeight: 700,
            }}
          />
        </Stack>

        <Typography
          className={cn(compact ? "line-clamp-2" : "line-clamp-3")}
          sx={{ color: "#47566d", fontSize: "0.9rem" }}
        >
          {app.shortDescription}
        </Typography>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ flexWrap: "wrap", gap: 0.75 }}
        >
          {tags.slice(0, compact ? 2 : 3).map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              sx={{
                borderRadius: 999,
                border: "1px solid color-mix(in srgb, black 10%, transparent)",
                backgroundColor: "#f8faff",
                color: "#4b5a72",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 1,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1.5,
              backgroundColor: "#f8fafe",
              px: 1,
              py: 1.1,
              textAlign: "center",
              color: "#5b6980",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: "#151b28", fontSize: "0.8rem" }}
            >
              {formatCompactCount(app.aggregateStat?.downloadCount ?? 0)}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>DL</Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1.5,
              backgroundColor: "#f8fafe",
              px: 1,
              py: 1.1,
              textAlign: "center",
              color: "#5b6980",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: "#151b28", fontSize: "0.8rem" }}
            >
              {formatCompactCount(app.aggregateStat?.viewCount ?? 0)}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>Views</Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1.5,
              backgroundColor: "#f8fafe",
              px: 1,
              py: 1.1,
              textAlign: "center",
              color: "#5b6980",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: "#151b28", fontSize: "0.8rem" }}
            >
              {formatRating(app.aggregateStat?.averageRating)}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>Rate</Typography>
          </Paper>
        </Box>

        <Button
          component={Link}
          href={`/apps/${app.slug}`}
          variant="outlined"
          size="small"
          sx={{
            width: "fit-content",
            borderRadius: 999,
            borderColor: "color-mix(in srgb, black 15%, transparent)",
            color: "#111827",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              borderColor: "#1f5ed4",
              color: "#1f5ed4",
            },
          }}
        >
          Open details
        </Button>
      </Stack>
    </Paper>
  );
}
