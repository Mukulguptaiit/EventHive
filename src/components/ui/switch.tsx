"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-input",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "block h-5 w-5 rounded-full bg-background shadow-lg transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";

export default Switch;
