export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  currency?: string;
  image?: string;
  brand?: string;
  weight?: string;
  unit?: string;
  category?: string;
  comparePrice?: number;
  /** Short tag for an extra offer that applies to this product, e.g. "Extra 10% off" */
  offerLabel?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  /** Product has variants with different prices — show "From £x" */
  priceFrom?: boolean;
  /** Product has several variants — the card links to the product page instead of adding directly */
  selectOptions?: boolean;
  isWishlisted?: boolean;
  cartQty?: number;
  loading?: boolean;
  onAddToCart?: (id: string, qty?: number) => void;
  onUpdateQty?: (id: string, qty: number) => void;
  onToggleWishlist?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}
