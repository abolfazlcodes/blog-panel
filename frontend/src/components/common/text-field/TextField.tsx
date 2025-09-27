"use client";

import { customTwMerge } from "@/utils/custom-tailwind-merge";
import { useEffect, useId, useRef, useState } from "react";
import { HelperText } from "../HelperText";
import type { TextFieldProps } from "./TextField.types";

/* ------------------------- helpers ------------------------- */
function getSizeClasses(size: NonNullable<TextFieldProps["size"]>) {
  // heights: s=45px, m=54px
  if (size === "s")
    return {
      wrapper: "h-[45px]",
      label: "text-m-body2",
      input: "text-m-body2",
      pb: "pb-1",
      inputH: "h-[45px]",
    } as const;
  return {
    wrapper: "h-[54px]",
    label: "text-d-body2",
    input: "text-d-body2",
    pb: "pb-1",
    inputH: "h-[54px]",
  } as const;
}

function baseContainerClasses(disabled?: boolean, error?: boolean) {
  return customTwMerge(
    "group relative inline-flex w-full flex-col text-primary-text transition-all",
    disabled && "opacity-80 cursor-not-allowed",
    ""
  );
}

function variantWrapperClasses(
  variant: NonNullable<TextFieldProps["variant"]>,
  error?: boolean,
  disabled?: boolean,
  size: NonNullable<TextFieldProps["size"]> = "m"
) {
  const s = getSizeClasses(size);
  const base =
    "relative flex dark:!bg-gray-900 rounded-lg transition-all focus-within:outline-hidden";
  const alignment = variant === "outlined" ? "items-center" : "items-end";
  const height = variant === "outlined" ? undefined : s.wrapper;
  const container = customTwMerge(base, alignment, height);

  if (variant === "filled") {
    return customTwMerge(
      container,
      "bg-gray-500/8 hover:bg-gray-500/16 focus-within:bg-gray-500/16 rounded-lg",
      error && "bg-error/8",
      disabled && "bg-disabled/20"
    );
  }

  if (variant === "outlined") {
    return customTwMerge(container);
  }

  // standard
  return customTwMerge(
    container,
    "border-b border-gray-500/32 hover:border-primary-text focus-within:border-b-2 focus-within:border-primary-text",
    error && "border-error hover:border-error focus-within:border-error",
    disabled && "border-disabled/80 border-dashed "
  );
}

function labelBaseClasses(
  variant: NonNullable<TextFieldProps["variant"]>,
  size: NonNullable<TextFieldProps["size"]>,
  error?: boolean,
  disabled?: boolean
) {
  const s = getSizeClasses(size);
  const base =
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 origin-left transition-all duration-200 z-10 opacity-100";
  if (variant === "outlined") {
    return customTwMerge(base, "text-d-body2");
  }
  const colorBase = disabled ? "text-disabled/80" : "text-disabled";
  return customTwMerge(base, s.label, colorBase);
}

function floatedLabelClasses(
  variant: NonNullable<TextFieldProps["variant"]>,
  error?: boolean,
  disabled?: boolean
) {
  if (variant === "outlined") {
    return [
      "peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0",
      "peer-focus:-translate-y-1/2 peer-[:not(:placeholder-shown)]:-translate-y-1/2",
      disabled
        ? "peer-[:placeholder-shown]:text-disabled/80"
        : "peer-[:placeholder-shown]:text-disabled",
      error
        ? "peer-focus:!text-error peer-[:not(:placeholder-shown)]:text-error"
        : "peer-focus:!text-secondary-text peer-[:not(:placeholder-shown)]:text-secondary-text",
      "peer-focus:text-d-overline peer-[:not(:placeholder-shown)]:text-d-overline",
      "peer-focus:font-semibold peer-[:not(:placeholder-shown)]:font-semibold",
      "peer-focus:px-1 peer-[:not(:placeholder-shown)]:px-1",
    ].join(" ");
  }
  // standard & filled
  return [
    "peer-focus:top-3 peer-[:not(:placeholder-shown)]:top-3",
    "peer-focus:!text-primary-text peer-[:not(:placeholder-shown)]:!text-primary-text",
    error &&
      "peer-focus:!text-error peer-[:not(:placeholder-shown)]:!text-error",
    "peer-focus:text-d-overline peer-[:not(:placeholder-shown)]:text-d-overline",
    "peer-focus:font-semibold peer-[:not(:placeholder-shown)]:font-semibold",
  ].join(" ");
}

function inputBaseClasses(
  size: NonNullable<TextFieldProps["size"]>,
  variant: NonNullable<TextFieldProps["variant"]>
) {
  const s = getSizeClasses(size);
  return customTwMerge(
    "peer w-full bg-transparent rounded-lg outline-hidden px-3",
    s.input,
    variant === "outlined" ? s.inputH : s.pb
  );
}

/** fieldset for outlined - with control over focus/hover/error/disabled */
function outlinedFieldsetClasses(error?: boolean, disabled?: boolean) {
  return customTwMerge(
    "pointer-events-none absolute inset-0 h-full w-full box-border rounded-lg border transition-all",
    "border-gray-500/20",
    "group-hover:border-input-focused",
    "peer-focus:border-2 peer-focus:border-input-focused",
    error &&
      "border-2 border-error group-hover:border-error peer-focus:border-error",
    disabled && "border-disabled/20 border-dashed",

    "[&>legend]:mx-3 [&>legend]:px-0 [&>legend]:h-0 [&>legend]:leading-[0] [&>legend]:whitespace-nowrap [&>legend]:text-transparent [&>legend]:transition-[max-width] [&>legend]:ease-out",
    "[&>legend]:[max-width:0.001px]",
    "peer-focus:[&>legend]:[max-width:var(--label-width)]",
    "peer-[:not(:placeholder-shown)]:[&>legend]:[max-width:var(--label-width)]"
  );
}

/* ------------------------- component ------------------------- */

export default function TextField({
  id,
  name,
  label,
  placeholder,
  helperText,
  error = false,
  disabled = false,
  required = false,
  variant = "standard",
  size = "m",
  value,
  defaultValue,
  onChange,
  startAdornment,
  endAdornment,
  containerClassName,
  inputClassName,
  labelClassName,
  helperClassName,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? `tf-${autoId}`;

  const labelText = label ?? placeholder ?? "";

  const measureRef = useRef<HTMLLabelElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!measureRef.current || !wrapperRef.current) return;
    const update = () => {
      setLabelWidth(
        Math.ceil(measureRef.current!.getBoundingClientRect().width)
      );
    };
    update();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(measureRef.current);
    return () => ro?.disconnect();
  }, [labelText, size]);

  const container = baseContainerClasses(disabled, error);
  const wrapper = variantWrapperClasses(variant, error, disabled, size);

  return (
    <div className={customTwMerge(container, containerClassName)}>
      <div
        ref={wrapperRef}
        className={wrapper}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
        }}
        style={
          variant === "outlined"
            ? ({
                ["--label-width" as string]: `${labelWidth || 8}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {startAdornment && (
          <span
            className={customTwMerge(
              "text-secondary-text inline-flex items-center self-center px-3",
              disabled && "bg-disabled/30"
            )}
          >
            {startAdornment}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          disabled={disabled}
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder=" "
          className={customTwMerge(
            inputBaseClasses(size, variant),
            "placeholder:text-disabled text-field-input disabled:bg-disabled/30 peer-focus:placeholder-transparent peer-[:not(:placeholder-shown)]:placeholder-transparent",
            inputClassName
          )}
          aria-invalid={error || undefined}
          {...rest}
        />
        {/* will be shown from beginning and used in place of placeholder */}
        {labelText && (
          <label
            htmlFor={inputId}
            ref={measureRef}
            className={customTwMerge(
              labelBaseClasses(variant, size, error, disabled),
              floatedLabelClasses(variant, error, disabled),
              labelClassName
            )}
          >
            {labelText}
            {required && <span className="text-error pl-1">*</span>}
          </label>
        )}
        {variant === "outlined" && (
          <fieldset
            className={outlinedFieldsetClasses(error, disabled)}
            aria-hidden="true"
          >
            <legend>
              <span className="invisible">
                {labelText}
                {required ? " *" : ""}
              </span>
            </legend>
          </fieldset>
        )}
        {endAdornment && (
          <span
            className={customTwMerge(
              "text-secondary-text inline-flex items-center self-center px-3",
              disabled && "bg-disabled/30"
            )}
          >
            {endAdornment}
          </span>
        )}
        {variant === "outlined" && labelText && (
          <span
            aria-hidden="true"
            className="text-m-overline pointer-events-none invisible absolute top-0 right-3 px-1"
          >
            {labelText}
            {required ? " *" : ""}
          </span>
        )}
      </div>

      {helperText && (
        <HelperText
          customClassName={helperClassName}
          text={helperText}
          status={error ? "error" : "active"}
        />
      )}
    </div>
  );
}
