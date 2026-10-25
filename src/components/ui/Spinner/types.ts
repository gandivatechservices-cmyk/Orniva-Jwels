import type { HTMLAttributes } from "react";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerVariant = "primary" | "white" | "muted";

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
};
