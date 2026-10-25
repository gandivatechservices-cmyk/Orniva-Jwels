import type { HTMLAttributes } from "react";

export type SkeletonVariant = "text" | "circular" | "rectangular" | "card";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
};
