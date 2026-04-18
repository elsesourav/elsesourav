import { cn } from "@/lib/cn";
import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ReactNode } from "react";

type ButtonTone = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const sizeByTone: Record<ButtonSize, MuiButtonProps["size"]> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

const toneStyle: Record<ButtonTone, MuiButtonProps> = {
  primary: {
    variant: "contained",
    color: "primary",
  },
  secondary: {
    variant: "outlined",
    color: "inherit",
  },
  danger: {
    variant: "contained",
    color: "error",
  },
  ghost: {
    variant: "text",
    color: "primary",
  },
};

type ButtonProps = Omit<MuiButtonProps, "variant" | "color" | "size"> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
};

export function Button({
  tone = "primary",
  size = "md",
  loading = false,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const toneProps = toneStyle[tone];

  return (
    <MuiButton
      type={type}
      variant={toneProps.variant}
      color={toneProps.color}
      size={sizeByTone[size]}
      disabled={loading || props.disabled}
      className={cn("ui-btn-base font-medium", className)}
      sx={{
        borderRadius: 999,
        boxShadow: "none",
        ...(tone === "primary"
          ? {
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 84%, black 16%), color-mix(in srgb, var(--brand-secondary) 62%, var(--brand-primary) 38%))",
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 70%, black 30%)",
            }
          : {}),
      }}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress size={16} color="inherit" />
          Processing...
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
}
