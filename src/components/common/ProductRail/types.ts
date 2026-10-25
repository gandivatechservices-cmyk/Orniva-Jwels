import type { ProductCardProps } from "../ProductCard/types";

export interface ProductRailProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  products: ProductCardProps[];
  loading?: boolean;
  emptyText?: string;
  onAddToCart?: (id: string) => void;
  onUpdateQty?: (id: string, qty: number) => void;
  onToggleWishlist?: (id: string) => void;
  className?: string;
}
