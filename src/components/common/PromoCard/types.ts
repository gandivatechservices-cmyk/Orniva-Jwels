import type { ReactNode } from "react";

export type PromoCardVariant = "primary" | "cream" | "terracotta" | "dark" | "accent";

export interface PromoCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  href?: string;
  onClick?: () => void;
  variant?: PromoCardVariant;
  art?: ReactNode;
  artImage?: string;
  backgroundImage?: string;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}
