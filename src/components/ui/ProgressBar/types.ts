import type { HTMLAttributes } from "react";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number; // 0 to 100
  height?: number;
  variant?: "primary" | "accent" | "gradient";
  showLabel?: boolean;
};
