import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string | number;
  deltaType?: "positive" | "negative" | "neutral";
  period?: string;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}
