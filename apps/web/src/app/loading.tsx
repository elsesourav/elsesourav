import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function RootLoading() {
  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: { xs: 3, sm: 5 },
        py: { xs: 8, md: 12 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 980,
          borderRadius: 4,
          border: "1px solid color-mix(in srgb, black 10%, transparent)",
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--background) 90%, white 10%), color-mix(in srgb, var(--background) 85%, var(--brand-secondary) 15%))",
          boxShadow: "0 28px 70px -54px rgba(20,23,31,0.9)",
          p: { xs: 3, md: 4 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Stack spacing={0.75}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#5a6781",
                fontWeight: 700,
              }}
            >
              Preparing your workspace
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.2rem", md: "1.45rem" },
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#111827",
              }}
            >
              Loading apps, support docs, and homepage highlights...
            </Typography>
          </Stack>
          <CircularProgress size={32} thickness={4.5} />
        </Stack>

        <LinearProgress sx={{ mt: 2.5, height: 7, borderRadius: 99 }} />

        <Box
          sx={{
            mt: 2.5,
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          }}
        >
          <Box
            className="ui-skeleton"
            sx={{ borderRadius: 2.5, minHeight: 120 }}
          />
          <Box
            className="ui-skeleton"
            sx={{ borderRadius: 2.5, minHeight: 120 }}
          />
          <Box
            className="ui-skeleton"
            sx={{ borderRadius: 2.5, minHeight: 82 }}
          />
          <Box
            className="ui-skeleton"
            sx={{ borderRadius: 2.5, minHeight: 82 }}
          />
        </Box>
      </Paper>
    </Container>
  );
}
