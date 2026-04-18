"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import type { ReactNode } from "react";

type Align = "left" | "center";
type PageShellWidth = "narrow" | "content" | "wide";

const shellWidthClass: Record<PageShellWidth, "sm" | "lg" | "xl"> = {
  narrow: "sm",
  content: "lg",
  wide: "xl",
};

function cn(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PageShell({
  children,
  width = "content",
  center = false,
  className,
}: {
  children: ReactNode;
  width?: PageShellWidth;
  center?: boolean;
  className?: string;
}) {
  return (
    <Container
      component="main"
      maxWidth={shellWidthClass[width]}
      className={cn("ui-text-primary", className)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        py: { xs: 8, sm: 10 },
        px: { xs: 3, sm: 5 },
        minHeight: center ? "100dvh" : undefined,
        justifyContent: center ? "center" : undefined,
      }}
    >
      {children}
    </Container>
  );
}

export function PageHeader({
  title,
  eyebrow,
  description,
  align = "left",
  actions,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  align?: Align;
  actions?: ReactNode;
}) {
  const textAlign = align === "center" ? "text-center" : "text-left";
  const leftAlignedWithActions = Boolean(actions) && align === "left";

  return (
    <Box
      component="header"
      className={cn(
        "space-y-2",
        leftAlignedWithActions && "flex items-start justify-between gap-4",
      )}
    >
      <Box className={textAlign}>
        {eyebrow ? (
          <Typography
            variant="caption"
            className="ui-text-muted"
            sx={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography
          variant="h3"
          className="ui-text-heading"
          sx={{ fontWeight: 600, letterSpacing: "-0.03em" }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="body2"
            className="ui-text-muted"
            sx={{ marginTop: 1, maxWidth: "42rem" }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box>{actions}</Box> : null}
    </Box>
  );
}

export function LinkCard({
  href,
  title,
  description,
  className,
}: {
  href: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Link
      component={NextLink}
      href={href}
      underline="none"
      color="inherit"
      className={cn("ui-card block", className)}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          transition: "all 180ms ease",
          "&:hover": {
            borderColor:
              "color-mix(in srgb, var(--foreground) 22%, transparent)",
            backgroundColor:
              "color-mix(in srgb, var(--background) 84%, var(--brand-secondary) 16%)",
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography
            className="ui-text-heading"
            variant="subtitle2"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              className="ui-text-muted"
              variant="caption"
              sx={{ marginTop: 0.75, display: "block" }}
            >
              {description}
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card variant="outlined" className="ui-card" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography
          className="ui-text-muted"
          variant="caption"
          sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          {label}
        </Typography>
        <Typography
          className="ui-text-heading"
          variant="h5"
          sx={{ marginTop: 0.5, fontWeight: 600 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
