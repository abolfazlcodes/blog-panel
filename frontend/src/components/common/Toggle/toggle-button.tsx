"use client";
import classNames from "classnames";
import { useState, forwardRef, useEffect } from "react";
import type { TToggleButtonProps } from "./toggle-button.types";

export const ToggleButton = forwardRef<HTMLDivElement, TToggleButtonProps>(
  (
    {
      label,
      defaultValue = false,
      onChange,
      size = "medium",
      disabled = false,
      activeText = "",
      inactiveText = "",
      dynamicTextClassName = "",
    },
    ref
  ) => {
    const [isActive, setIsActive] = useState(defaultValue);

    const toggleClasses = classNames("toggle", size, {
      "toggle-disabled": disabled,
    });

    const circleClasses = classNames("toggle-circle", size, {
      "-translate-x-full": isActive,
      "translate-x-0": !isActive,
    });

    const circleHoverClasses = classNames("toggle-circle-hover", {
      "bg-success/12": isActive,
      "bg-gray-500/12": !isActive,
    });

    const bgClasses = classNames("toggle-bg", {
      "bg-success": isActive,
      "bg-error": !isActive,
    });

    const labelClasses = classNames("toggle-label", {
      "text-gray-800 dark:text-primary-text": !isActive,
      "text-primary-text": isActive,
      "cursor-not-allowed text-gray-500": disabled,
    });

    const handleToggle = () => {
      if (disabled) return;
      const newValue = !isActive;
      setIsActive(newValue);
      if (onChange) {
        onChange(newValue);
      }
    };

    useEffect(() => {
      setIsActive(defaultValue);
    }, [defaultValue]);

    return (
      <div ref={ref} className="toggle-wrapper group flex items-center">
        <span className={labelClasses}>{label}</span>

        <div
          className={toggleClasses}
          onClick={handleToggle}
          role="switch"
          aria-checked={isActive}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          <div className={bgClasses}></div>

          <div className={circleClasses}>
            <span className={circleHoverClasses}></span>
          </div>
        </div>

        <span
          className={`toggle-dynamic-text text-secondary-text ml-2 ${dynamicTextClassName}`}
        >
          {isActive ? activeText : inactiveText}
        </span>
      </div>
    );
  }
);

ToggleButton.displayName = "ToggleButton";
