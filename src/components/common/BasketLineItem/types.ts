export interface BasketLineItemProps {
  keyId: string;
  productId: string;
  name: string;
  price: number;
  comparePrice?: number;
  qty: number;
  /** Extra free units auto-granted by a "Buy X Get Y free" offer, on top of `qty`. */
  bonusQty?: number;
  stock?: number;
  variantLabel?: string;
  image?: string;
  currency?: string;
  loading?: boolean;
  onUpdateQty?: (key: string, qty: number) => void;
  onRemove?: (key: string) => void;
  className?: string;
}
