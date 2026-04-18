import { cn } from "@/lib/cn";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  fullWidth?: boolean;
  sx?: TextFieldProps["sx"];
};

export function Input({ className, fullWidth, sx, ...props }: InputProps) {
  const {
    type,
    name,
    id,
    value,
    defaultValue,
    placeholder,
    onChange,
    onBlur,
    onFocus,
    autoComplete,
    autoFocus,
    disabled,
    required,
    readOnly,
    min,
    max,
    minLength,
    maxLength,
    step,
    pattern,
    inputMode,
    ...nativeInputProps
  } = props;

  return (
    <TextField
      fullWidth={fullWidth ?? true}
      size="small"
      variant="outlined"
      type={type}
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      disabled={disabled}
      required={required}
      slotProps={{
        htmlInput: {
          readOnly,
          min,
          max,
          minLength,
          maxLength,
          step,
          pattern,
          inputMode,
          ...nativeInputProps,
        },
      }}
      className={cn("ui-input", className)}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
          backgroundColor:
            "color-mix(in srgb, var(--background) 94%, white 6%)",
        },
        "& .MuiInputBase-input": {
          fontSize: "0.92rem",
        },
        ...sx,
      }}
    />
  );
}
