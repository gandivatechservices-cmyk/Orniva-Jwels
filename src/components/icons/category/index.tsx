import type { SVGProps, ReactNode } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  className?: string;
};

// 1. Generic Fallback: Shopping Basket
export function ShoppingBasketIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 10 3.8-6.3a1 1 0 0 1 1.7.1L13.8 10" />
      <path d="m19 10-3.8-6.3a1 1 0 0 0-1.7-.1L10.2 10" />
      <path d="M3.5 10h17l-1.5 10a2 2 0 0 1-2 1.8H7a2 2 0 0 1-2-1.8L3.5 10Z" />
      <path d="M8 14v4" />
      <path d="M12 14v4" />
      <path d="M16 14v4" />
    </svg>
  );
}

// 2. Produce / Fruits & Vegetables
export function ProduceIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 19.5c5.5 0 9.5-3.5 11.5-9.5-6 2-9.5 6-11.5 9.5Z" />
      <path d="M14 10c1.5-3.5 4.5-6.5 8-7.5-1 3.5-4 6.5-7.5 8" />
      <path d="M7 15c2.5-2.5 5.5-4.5 8.5-5.5" />
    </svg>
  );
}

// 3. Dairy & Eggs
export function DairyIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z" />
      <path d="M7 8V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" />
      <path d="M6 13h6" />
      <path d="M18 22c2.2 0 4-1.8 4-4 0-2.8-2.2-5-4-7-1.8 2-4 4.2-4 7 0 2.2 1.8 4 4 4Z" />
    </svg>
  );
}

// 4. Meat & Seafood
export function MeatIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 5c-3-2-7-1-9 1l-6 6c-2 2-2 5 0 7s5 2 7 0l6-6c2-2 3-6 2-8Z" />
      <circle cx="8" cy="15.5" r="1.5" />
      <path d="M14 8.5c1 1 2 2.5 2 4.5" />
    </svg>
  );
}

// 5. Bakery
export function BakeryIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 14c0-3.9 3.6-7 8-7s8 3.1 8 7" />
      <path d="M3 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
      <path d="M7 11l1.5 2" />
      <path d="M11 10.5v2.5" />
      <path d="M15 11l-1.5 2" />
      <path d="M4 17h14a2 2 0 0 1 2 2v1H2v-1a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

// 6. Frozen
export function FrozenIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20" />
      <path d="M17 5l-5 5-5-5" />
      <path d="M17 19l-5-5-5 5" />
      <path d="M2 12h20" />
      <path d="M5 7l5 5-5 5" />
      <path d="M19 7l-5 5 5 5" />
    </svg>
  );
}

// 7. Rice & Grains
export function RiceGrainsIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 21c3-4 6-9 8-16 1.5 3 2.5 7 1.5 11" />
      <path d="M10 5c2-1 4-1 6 0 1 2 0 4-2 5-2 1-4 0-4-5Z" />
      <path d="M12 11c2-1 4-1 6 0 1 2 0 4-2 5-2 1-4 0-4-5Z" />
      <path d="M7 9c-2-1-3-3-2-5 2-1 4 0 5 2 1 2 0 4-3 3Z" />
      <path d="M8 15c-2-1-3-3-2-5 2-1 4 0 5 2 1 2 0 4-3 3Z" />
    </svg>
  );
}

// 8. Spices & Seasoning
export function SpicesIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 3c2 2 3 5 1 8l-7 10c-1.5 2-4 1-5 0s-1-3.5 0-5l8-11c1-1.5 2-2 3-2Z" />
      <path d="M14 5c2-3 5-3 7-2" />
      <path d="M8 14c1.5 1.5 3 1 4 0" />
    </svg>
  );
}

// 9. Snacks
export function SnacksIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 7.5a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      <path d="M15 10a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      <path d="M10 15a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      <path d="M18 12a6 6 0 0 1-6 6" />
    </svg>
  );
}

// 10. Drinks & Beverages
export function DrinksIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 8h12l-1.5 12.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 8Z" />
      <path d="M4 8h14" />
      <path d="m14 2-3 6" />
    </svg>
  );
}

// 11. Household & Cleaning
export function HouseholdIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3" />
      <path d="M9 7h6l1.5 3.5a1 1 0 0 1-.5 1.3L15 12v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8l-1-0.2a1 1 0 0 1-.5-1.3L7 7h2Z" />
      <path d="M12 3H8l-2 3" />
    </svg>
  );
}

// 12. Beauty & Personal Care
export function BeautyIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="8" height="12" x="8" y="9" rx="2" />
      <path d="M10 9V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" />
      <path d="M10 4h4" />
      <path d="M12 9v12" />
      <path d="m18 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
    </svg>
  );
}

// 13. Indian & Asian Grocery
export function IndianGroceryIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 11c0 5 3.6 9 8 9s8-4 8-9H4Z" />
      <path d="M3 11h18" />
      <path d="M12 3v8" />
      <path d="M8 7c1.5-2 3-3 4-3s2.5 1 4 3" />
      <circle cx="12" cy="15" r="1.5" />
    </svg>
  );
}

// 14. Fashion / Apparel / Men / Shirts
export function ShirtIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

// 15. Jewellery
export function DiamondIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h12l4 6-10 13L2 9Z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </svg>
  );
}

// 16. Rings
export function RingIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="14" r="7" />
      <path d="m9 7 3-4 3 4" />
      <circle cx="12" cy="4" r="1.5" />
    </svg>
  );
}

// 17. Smartphone
export function SmartphoneIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

// 18. Headphones
export function HeadphonesIcon({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

/**
 * Category Outline Icon Map
 * Maps category slug or normalized name to a clean 24x24 outline SVG icon component
 */
export const CATEGORY_OUTLINE_ICON_MAP: Record<string, (props: IconProps) => ReactNode> = {
  // Live API Slugs
  "fashion-men": ShirtIcon,
  "fashion-shirts": ShirtIcon,
  "jewellery-jewellery": DiamondIcon,
  "jewellery-rings": RingIcon,
  "jewellery-gold-rings": RingIcon,
  "iphone": SmartphoneIcon,
  "electronics-wireless-audio": HeadphonesIcon,
  "grocery-food": ProduceIcon,
  "grocery-snacks": SnacksIcon,
  "grocery-healthy-snacks": ProduceIcon,

  // Standard Grocery Slugs
  "fruits-vegetables": ProduceIcon,
  "fresh-produce": ProduceIcon,
  "produce": ProduceIcon,
  "dairy-eggs": DairyIcon,
  "dairy": DairyIcon,
  "meat-seafood": MeatIcon,
  "meat": MeatIcon,
  "seafood": MeatIcon,
  "bakery": BakeryIcon,
  "bread": BakeryIcon,
  "frozen": FrozenIcon,
  "rice-grains": RiceGrainsIcon,
  "grains": RiceGrainsIcon,
  "rice": RiceGrainsIcon,
  "spices": SpicesIcon,
  "masala": SpicesIcon,
  "snacks": SnacksIcon,
  "drinks": DrinksIcon,
  "beverages": DrinksIcon,
  "household": HouseholdIcon,
  "beauty": BeautyIcon,
  "personal-care": BeautyIcon,
  "indian-grocery": IndianGroceryIcon,
  "asian-grocery": IndianGroceryIcon,
};

/**
 * Resolves an outline icon component for any category slug or name,
 * with ShoppingBasketIcon as the generic fallback.
 */
export function getCategoryIconComponent(slug?: string, name?: string): (props: IconProps) => ReactNode {
  const normalizedSlug = (slug || "").toLowerCase().trim();
  const normalizedName = (name || "").toLowerCase().trim();

  // 1. Direct slug match
  if (CATEGORY_OUTLINE_ICON_MAP[normalizedSlug]) {
    return CATEGORY_OUTLINE_ICON_MAP[normalizedSlug];
  }

  // 2. Slug / Name keyword matching
  if (normalizedSlug.includes("shirt") || normalizedName.includes("shirt") || normalizedSlug.includes("men") || normalizedName === "men") {
    return ShirtIcon;
  }
  if (normalizedSlug.includes("gold") || normalizedName.includes("gold") || normalizedSlug.includes("ring") || normalizedName.includes("ring")) {
    return RingIcon;
  }
  if (normalizedSlug.includes("jewel") || normalizedName.includes("jewel") || normalizedSlug.includes("diamond")) {
    return DiamondIcon;
  }
  if (normalizedSlug.includes("phone") || normalizedName.includes("phone") || normalizedSlug.includes("iphone") || normalizedName.includes("iphone")) {
    return SmartphoneIcon;
  }
  if (normalizedSlug.includes("audio") || normalizedName.includes("audio") || normalizedSlug.includes("headphone") || normalizedName.includes("earbud")) {
    return HeadphonesIcon;
  }
  if (normalizedSlug.includes("snack") || normalizedName.includes("snack") || normalizedSlug.includes("chip")) {
    return SnacksIcon;
  }
  if (normalizedSlug.includes("spice") || normalizedName.includes("spice") || normalizedSlug.includes("masala")) {
    return SpicesIcon;
  }
  if (normalizedSlug.includes("grain") || normalizedName.includes("grain") || normalizedSlug.includes("rice") || normalizedName.includes("flour") || normalizedName.includes("dal")) {
    return RiceGrainsIcon;
  }
  if (normalizedSlug.includes("dairy") || normalizedName.includes("dairy") || normalizedSlug.includes("milk") || normalizedName.includes("egg")) {
    return DairyIcon;
  }
  if (normalizedSlug.includes("meat") || normalizedName.includes("meat") || normalizedSlug.includes("seafood") || normalizedName.includes("fish")) {
    return MeatIcon;
  }
  if (normalizedSlug.includes("bake") || normalizedName.includes("bakery") || normalizedName.includes("bread")) {
    return BakeryIcon;
  }
  if (normalizedSlug.includes("drink") || normalizedName.includes("drink") || normalizedSlug.includes("beverage") || normalizedName.includes("juice")) {
    return DrinksIcon;
  }
  if (normalizedSlug.includes("frozen") || normalizedName.includes("frozen") || normalizedSlug.includes("ice")) {
    return FrozenIcon;
  }
  if (normalizedSlug.includes("house") || normalizedName.includes("household") || normalizedName.includes("clean")) {
    return HouseholdIcon;
  }
  if (normalizedSlug.includes("beauty") || normalizedName.includes("beauty") || normalizedName.includes("cosmetic")) {
    return BeautyIcon;
  }
  if (normalizedSlug.includes("indian") || normalizedName.includes("indian") || normalizedSlug.includes("asian")) {
    return IndianGroceryIcon;
  }
  if (normalizedSlug.includes("food") || normalizedName.includes("food") || normalizedSlug.includes("produce") || normalizedName.includes("fruit") || normalizedName.includes("vegetable")) {
    return ProduceIcon;
  }

  // 3. Fallback to generic shopping basket
  return ShoppingBasketIcon;
}
