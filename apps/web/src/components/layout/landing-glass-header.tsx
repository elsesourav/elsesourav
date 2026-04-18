"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { keyframes } from "@mui/material/styles";
import Image from "next/image";
import NextLink from "next/link";
import type { MouseEvent } from "react";

type HeaderNavItem = {
  href: string;
  label: string;
};

type SessionNavUser = {
  id: string;
  role: "ADMIN" | "USER";
  name: string | null;
  email: string | null;
};

type LandingGlassHeaderProps = {
  pathname: string;
  navItems: ReadonlyArray<HeaderNavItem>;
  sessionUser: SessionNavUser | null;
  accountHref: string;
  accountLabel: string;
  isNavigating: boolean;
  onAnchorNavigation: (event: MouseEvent<HTMLElement>, href: string) => void;
  onNavigation: (href: string) => void;
  onSignOut: () => void;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

const springIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-18px) scale(0.985);
  }

  70% {
    opacity: 1;
    transform: translateY(2px) scale(1.006);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const springTransition = "560ms cubic-bezier(0.22, 1.4, 0.36, 1)";

const glassNavSx: SxProps<Theme> = {
  display: { xs: "none", md: "inline-flex" },
  alignItems: "center",
  gap: 0.5,
  borderRadius: 999,
  px: 0.65,
  py: 0.55,
  border: "1px solid color-mix(in srgb, var(--foreground) 8%, transparent)",
  backgroundColor: "color-mix(in srgb, var(--background) 74%, white 26%)",
  backdropFilter: "blur(16px)",
};

export function LandingGlassHeader({
  pathname,
  navItems,
  sessionUser,
  accountHref,
  accountLabel,
  isNavigating,
  onAnchorNavigation,
  onNavigation,
  onSignOut,
}: LandingGlassHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        px: { xs: 1.2, sm: 1.8 },
        pt: { xs: 1.1, sm: 1.4 },
        pb: 1,
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 999,
            border:
              "1px solid color-mix(in srgb, var(--foreground) 12%, transparent)",
            backgroundColor:
              "color-mix(in srgb, var(--background) 78%, white 22%)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 24px 44px -34px rgba(20,23,31,0.82)",
            px: { xs: 1.1, sm: 1.5, md: 1.8 },
            py: { xs: 0.95, md: 1.1 },
            animation: `${springIn} 760ms cubic-bezier(0.22, 1.4, 0.36, 1) both`,
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 0.75, md: 1.2 }}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Button
              component={NextLink}
              href="/"
              onClick={(event) => onAnchorNavigation(event, "/")}
              variant="text"
              sx={{
                minWidth: 0,
                borderRadius: 999,
                px: { xs: 0.9, sm: 1.15 },
                py: 0.55,
                color: "var(--foreground)",
                fontWeight: 800,
                letterSpacing: "0.01em",
                textTransform: "none",
                transition: `transform ${springTransition}`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  backgroundColor:
                    "color-mix(in srgb, var(--background) 86%, white 14%)",
                },
              }}
            >
              <Box
                sx={{
                  mr: 0.8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  border:
                    "1px solid color-mix(in srgb, var(--foreground) 14%, transparent)",
                  backgroundColor:
                    "color-mix(in srgb, var(--background) 90%, white 10%)",
                  p: 0.4,
                }}
              >
                <Image
                  src="/img/icon.png"
                  alt="ElseSourav"
                  width={22}
                  height={22}
                  priority
                />
              </Box>
              ElseSourav
            </Button>

            <Paper
              component="nav"
              aria-label="Landing primary"
              elevation={0}
              sx={glassNavSx}
            >
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Button
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    onClick={(event) => onAnchorNavigation(event, item.href)}
                    aria-current={active ? "page" : undefined}
                    variant="text"
                    size="small"
                    sx={{
                      position: "relative",
                      borderRadius: 999,
                      px: 1.5,
                      py: 0.65,
                      fontWeight: active ? 700 : 500,
                      textTransform: "none",
                      color: active
                        ? "color-mix(in srgb, var(--brand-secondary) 85%, var(--foreground) 15%)"
                        : "color-mix(in srgb, var(--foreground) 72%, var(--background) 28%)",
                      transition: `color ${springTransition}, background-color ${springTransition}, transform ${springTransition}`,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: 14,
                        right: 14,
                        bottom: 6,
                        height: 2,
                        borderRadius: 999,
                        background:
                          "linear-gradient(90deg, var(--brand-secondary), color-mix(in srgb, var(--brand-accent) 70%, var(--brand-secondary) 30%))",
                        transform: active ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "center",
                        transition: `transform ${springTransition}`,
                      },
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--brand-secondary) 14%, transparent)"
                        : "transparent",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-secondary) 10%, transparent)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Paper>

            <Stack direction="row" spacing={0.85} sx={{ alignItems: "center" }}>
              {sessionUser ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => onNavigation(accountHref)}
                    disabled={isNavigating}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    {accountLabel}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={onSignOut}
                    disabled={isNavigating}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 74%, white 26%), color-mix(in srgb, var(--brand-secondary) 70%, var(--brand-accent) 30%))",
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => onNavigation("/login")}
                    disabled={isNavigating}
                    sx={{
                      borderRadius: 999,
                      px: 1.1,
                      textTransform: "none",
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => onNavigation("/register")}
                    disabled={isNavigating}
                    sx={{
                      borderRadius: 2.2,
                      px: 2.4,
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#2d1029",
                      background:
                        "linear-gradient(135deg, #f9d7df, #f6b4eb 62%, #f1c98e)",
                      boxShadow: "0 10px 22px -16px rgba(211, 89, 171, 0.9)",
                    }}
                  >
                    Create account
                  </Button>
                </>
              )}
            </Stack>
          </Stack>

          <Box sx={{ mt: 1.1, display: { xs: "block", md: "none" } }}>
            <Stack
              component="nav"
              aria-label="Landing primary mobile"
              direction="row"
              spacing={0.75}
              sx={{ overflowX: "auto", pb: 0.2 }}
            >
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Button
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    onClick={(event) => onAnchorNavigation(event, item.href)}
                    aria-current={active ? "page" : undefined}
                    variant={active ? "contained" : "text"}
                    size="small"
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius: 999,
                      px: 1.25,
                      textTransform: "none",
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--brand-secondary) 20%, var(--background) 80%)"
                        : "transparent",
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {isNavigating ? (
            <LinearProgress
              sx={{
                mt: 1,
                height: 3,
                borderRadius: 999,
                backgroundColor: "transparent",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, var(--brand-secondary), color-mix(in srgb, var(--brand-accent) 72%, var(--brand-secondary) 28%))",
                },
              }}
            />
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
}
