import type { ReactNode } from "react";

export type PromoBannerVariant =
  | "offers"
  | "buy-again"
  | "fresh-today"
  | "indian-grocery"
  | "pink"
  | "green"
  | "primary"
  | "cream"
  | "terracotta"
  | "peach";

export type PromoBannerProps = {
  title: ReactNode;
  description?: ReactNode;
  subtitle?: ReactNode;
  label?: string;
  labelIcon?: ReactNode;
  discountBadge?: string;
  cornerBadge?: string;
  buttonText?: string;
  ctaText?: string;
  href?: string;
  onClick?: () => void;
  variant?: PromoBannerVariant;
  image?: string | ReactNode;
  imageAlt?: string;
  /** "cover" crops the picture into a uniform rounded square (for photos); default "contain" suits cut-out artwork. */
  imageFit?: "contain" | "cover";
  badge?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};
