import { type ButtonHTMLAttributes, type Ref } from "react";

type TButtonVariants = "contained" | "outlined" | "text" | "soft";
type TButtonSizes = "lg" | "sm" | "md";
type TColorType =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error";

export type TButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  TLoadingBehavior & {
    variant?: TButtonVariants;
    size?: TButtonSizes;
    icon?: React.ReactNode;
    ref?: Ref<HTMLButtonElement>;
    shape?: "normal" | "full";
    colorType?: TColorType;
    loaderCm?: React.ReactNode;
  };
