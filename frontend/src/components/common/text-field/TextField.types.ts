import type { InputHTMLAttributes, ReactNode } from "react";

export type TextFieldVariant = "standard" | "outlined" | "filled";
export type TextFieldSize = "s" | "m";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  id?: string;
  name?: string;

  label?: string;

  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;

  variant?: TextFieldVariant;
  size?: TextFieldSize;

  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
}
