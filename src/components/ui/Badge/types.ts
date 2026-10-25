import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "discount" | "success" | "warning" | "danger" | "neutral" | "primary" | "info";
export type BadgeSize = "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  pill?: boolean;
};
