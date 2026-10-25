import type { ReactNode } from "react";

export interface CategoryTileProps {
  id: string;
  name: string;
  image?: string;
  icon?: ReactNode;
  itemCount?: number;
  href?: string;
  isActive?: boolean;
  loading?: boolean;
  onClick?: (id: string) => void;
  className?: string;
}
