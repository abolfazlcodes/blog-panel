import classNames from "classnames";
import React from "react";
import { ClipLoader } from "react-spinners";

import { twMerge } from "tailwind-merge";
import type { TButtonProps } from "./button.types";

export const Button: React.FC<TButtonProps> = ({
  variant = "contained",
  size = "md",
  icon,
  shape = "normal",
  isLoading = false,
  disabled = false,
  className,
  colorType = "primary",
  loaderCm,
  children,
  ...restProps
}) => {
  const buttonClasses = twMerge(
    classNames(
      "btn whitespace-nowrap transition duration-500",
      `btn-${variant}`,
      `btn-${size}`,
      `btn-${shape}`,
      {
        [`btn-${variant}-global`]: !disabled && !colorType,
        [`btn-${variant}-primary`]: !disabled && colorType === "primary",
        [`btn-${variant}-secondary`]: !disabled && colorType === "secondary",
        [`btn-${variant}-info`]: !disabled && colorType === "info",
        [`btn-${variant}-success`]: !disabled && colorType === "success",
        [`btn-${variant}-warning`]: !disabled && colorType === "warning",
        [`btn-${variant}-error`]: !disabled && colorType === "error",
      },
      { "opacity-50 cursor-not-allowed": disabled }
    ),
    className
  );

  return (
    <button className={buttonClasses} disabled={disabled} {...restProps}>
      {!isLoading && (
        <span className={classNames("inline-flex items-center gap-x-2")}>
          {icon && <span className="">{icon}</span>}
          {children}
        </span>
      )}
      {isLoading && (
        <div className="flex !w-full items-center justify-center">
          {loaderCm || <ClipLoader color="var(--color-primary)" size={10} />}
        </div>
      )}
    </button>
  );
};
