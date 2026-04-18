import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "mono";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "default", className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      data-variant={variant === "mono" ? "mono" : undefined}
      className={cn("xake-input", className)}
      {...rest}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "mono";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { variant = "default", className, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      data-variant={variant === "mono" ? "mono" : undefined}
      className={cn("xake-input", className)}
      {...rest}
    />
  );
});
