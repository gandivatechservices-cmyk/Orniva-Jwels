import type { ReactNode } from "react";

export type CategoryCardProps = {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  icon?: ReactNode;
  bgTint?: string;
  ctaColor?: string;
  isPopular?: boolean;
  href?: string;
  isActive?: boolean;
  loading?: boolean;
  onClick?: (id: string) => void;
  className?: string;
};
