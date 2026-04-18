import { cn } from "@/lib/cn";
import FormLabel, { type FormLabelProps } from "@mui/material/FormLabel";

export function Label({ className, ...props }: FormLabelProps) {
  return (
    <FormLabel
      className={cn(
        "ui-label text-xs font-semibold uppercase tracking-wide",
        className,
      )}
      sx={{
        marginBottom: "2px",
      }}
      {...props}
    />
  );
}
