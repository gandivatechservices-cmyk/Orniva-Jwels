import type { ReactNode } from "react";

export type CategoryVisual = {
  icon?: ReactNode;
  bgTint: string;
  ctaColor: string;
  isPopular?: boolean;
  fallbackImage?: string;
};

/**
 * Category Visual Details Map
 */
const CATEGORY_META: Record<string, { bgTint: string; ctaColor: string; isPopular?: boolean; fallbackImage?: string }> = {
  rings: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    isPopular: true,
    fallbackImage: "/assets/images/jewelry/category-rings.jpg",
  },
  ring: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    isPopular: true,
    fallbackImage: "/assets/images/jewelry/category-rings.jpg",
  },
  necklaces: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    isPopular: true,
    fallbackImage: "/assets/images/jewelry/category-necklaces.jpg",
  },
  necklace: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-necklaces.jpg",
  },
  earrings: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    isPopular: true,
    fallbackImage: "/assets/images/jewelry/category-earrings.jpg",
  },
  earring: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-earrings.jpg",
  },
  bracelets: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-bracelets.jpg",
  },
  bracelet: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-bracelets.jpg",
  },
  pendants: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-necklaces.jpg",
  },
  pendant: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-necklaces.jpg",
  },
  bangles: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-bangles.jpg",
  },
  bangle: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-bangles.jpg",
  },
  "mens-collection": {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-mens.jpg",
  },
  "wedding-collection": {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    isPopular: true,
    fallbackImage: "/assets/images/jewelry/category-rings.jpg",
  },
  bridal: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    isPopular: true,
    fallbackImage: "/assets/images/jewelry/category-rings.jpg",
  },
  gold: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    fallbackImage: "/assets/images/jewelry/category-bangles.jpg",
  },
  diamond: {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
    isPopular: true,
    fallbackImage: "/assets/images/jewelry/category-rings.jpg",
  },
  bakery: {
    bgTint: "#fef7ec",
    ctaColor: "#A77B3F",
  },
  beauty: {
    bgTint: "#fdf2f4",
    ctaColor: "#e11d48",
    isPopular: true,
  },
  "personal-care": {
    bgTint: "#fdf2f4",
    ctaColor: "#e11d48",
    isPopular: true,
  },
  "dairy-eggs": {
    bgTint: "#edf6fc",
    ctaColor: "#0284c7",
  },
  dairy: {
    bgTint: "#edf6fc",
    ctaColor: "#0284c7",
  },
  drinks: {
    bgTint: "#fef8e8",
    ctaColor: "#d97706",
  },
  beverages: {
    bgTint: "#fef8e8",
    ctaColor: "#d97706",
  },
  "fresh-produce": {
    bgTint: "#FAF5EE",
    ctaColor: "#16a34a",
  },
  "fruits-vegetables": {
    bgTint: "#FAF5EE",
    ctaColor: "#16a34a",
  },
  "fruit-veg": {
    bgTint: "#FAF5EE",
    ctaColor: "#16a34a",
  },
  "fresh-food": {
    bgTint: "#FAF5EE",
    ctaColor: "#16a34a",
  },
  produce: {
    bgTint: "#FAF5EE",
    ctaColor: "#16a34a",
  },
  food: {
    bgTint: "#FAF5EE",
    ctaColor: "#16a34a",
  },
  frozen: {
    bgTint: "#edf5fa",
    ctaColor: "#0284c7",
  },
  "frozen-food": {
    bgTint: "#edf5fa",
    ctaColor: "#0284c7",
  },
  household: {
    bgTint: "#f3effc",
    ctaColor: "#7c3aed",
  },
  "indian-grocery": {
    bgTint: "#fdf6ea",
    ctaColor: "#d97706",
  },
  "indian-asian": {
    bgTint: "#fdf6ea",
    ctaColor: "#d97706",
  },
  "meat-seafood": {
    bgTint: "#fdf0f0",
    ctaColor: "#e11d48",
  },
  meat: {
    bgTint: "#fdf0f0",
    ctaColor: "#e11d48",
  },
  "rice-grains": {
    bgTint: "#fbf5eb",
    ctaColor: "#b45309",
  },
  grains: {
    bgTint: "#fbf5eb",
    ctaColor: "#b45309",
  },
  spices: {
    bgTint: "#fdf2ee",
    ctaColor: "#dc2626",
  },
  snacks: {
    bgTint: "#fef7ed",
    ctaColor: "#ea580c",
  },
  "grocery-snacks": {
    bgTint: "#fef7ed",
    ctaColor: "#ea580c",
  },
};

/**
 * Resolves category visual details (image URL, background tint color, CTA text color, popular badge)
 */
export function getCategoryVisual(slug?: string, name?: string): CategoryVisual {
  const normalizedSlug = (slug || "").toLowerCase().trim();
  const normalizedName = (name || "").toLowerCase().trim();

  // Direct key matches
  if (CATEGORY_META[normalizedSlug]) {
    return CATEGORY_META[normalizedSlug];
  }
  if (CATEGORY_META[normalizedName]) {
    return CATEGORY_META[normalizedName];
  }

  // Jewelry Category Keyword Matching
  if (normalizedSlug.includes("ring") || normalizedName.includes("ring")) {
    return CATEGORY_META["rings"];
  }
  if (
    normalizedSlug.includes("neck") ||
    normalizedName.includes("neck") ||
    normalizedSlug.includes("chain") ||
    normalizedName.includes("chain") ||
    normalizedSlug.includes("choker")
  ) {
    return CATEGORY_META["necklaces"];
  }
  if (
    normalizedSlug.includes("ear") ||
    normalizedName.includes("ear") ||
    normalizedSlug.includes("stud") ||
    normalizedName.includes("stud") ||
    normalizedSlug.includes("jhumka")
  ) {
    return CATEGORY_META["earrings"];
  }
  if (normalizedSlug.includes("brace") || normalizedName.includes("brace")) {
    return CATEGORY_META["bracelets"];
  }
  if (normalizedSlug.includes("pendant") || normalizedName.includes("pendant") || normalizedSlug.includes("locket")) {
    return CATEGORY_META["pendants"];
  }
  if (
    normalizedSlug.includes("bangle") ||
    normalizedName.includes("bangle") ||
    normalizedSlug.includes("kada") ||
    normalizedName.includes("kada")
  ) {
    return CATEGORY_META["bangles"];
  }
  if (normalizedSlug.includes("men") || normalizedName.includes("men")) {
    return CATEGORY_META["mens-collection"];
  }
  if (
    normalizedSlug.includes("wed") ||
    normalizedName.includes("wed") ||
    normalizedSlug.includes("bride") ||
    normalizedName.includes("bride") ||
    normalizedSlug.includes("bridal")
  ) {
    return CATEGORY_META["wedding-collection"];
  }
  if (
    normalizedSlug.includes("jewel") ||
    normalizedName.includes("jewel") ||
    normalizedSlug.includes("gold") ||
    normalizedName.includes("gold") ||
    normalizedSlug.includes("diamond") ||
    normalizedName.includes("diamond") ||
    normalizedSlug.includes("silver") ||
    normalizedName.includes("platinum")
  ) {
    return CATEGORY_META["rings"];
  }

  // Keyword matching
  if (
    normalizedSlug.includes("fruit") ||
    normalizedName.includes("fruit") ||
    normalizedSlug.includes("veg") ||
    normalizedName.includes("veg") ||
    normalizedSlug.includes("produce") ||
    normalizedName.includes("fresh")
  ) {
    return CATEGORY_META["fresh-produce"];
  }

  if (
    normalizedSlug.includes("dairy") ||
    normalizedName.includes("dairy") ||
    normalizedSlug.includes("milk") ||
    normalizedName.includes("milk") ||
    normalizedSlug.includes("egg") ||
    normalizedName.includes("egg") ||
    normalizedSlug.includes("cheese") ||
    normalizedName.includes("butter")
  ) {
    return CATEGORY_META["dairy-eggs"];
  }

  if (
    normalizedSlug.includes("meat") ||
    normalizedName.includes("meat") ||
    normalizedSlug.includes("seafood") ||
    normalizedName.includes("seafood") ||
    normalizedSlug.includes("fish") ||
    normalizedName.includes("chicken") ||
    normalizedName.includes("beef") ||
    normalizedName.includes("pork") ||
    normalizedName.includes("lamb")
  ) {
    return CATEGORY_META["meat-seafood"];
  }

  if (
    normalizedSlug.includes("frozen") ||
    normalizedName.includes("frozen") ||
    normalizedSlug.includes("ice") ||
    normalizedName.includes("ice")
  ) {
    return CATEGORY_META["frozen"];
  }

  if (
    normalizedSlug.includes("bake") ||
    normalizedName.includes("bakery") ||
    normalizedSlug.includes("bread") ||
    normalizedName.includes("bread") ||
    normalizedSlug.includes("croissant") ||
    normalizedName.includes("cake") ||
    normalizedName.includes("pastry")
  ) {
    return CATEGORY_META["bakery"];
  }

  if (
    normalizedSlug.includes("grain") ||
    normalizedName.includes("grain") ||
    normalizedSlug.includes("rice") ||
    normalizedName.includes("rice") ||
    normalizedSlug.includes("pasta") ||
    normalizedName.includes("flour") ||
    normalizedName.includes("pulse") ||
    normalizedName.includes("dal")
  ) {
    return CATEGORY_META["rice-grains"];
  }

  if (
    normalizedSlug.includes("spice") ||
    normalizedName.includes("spice") ||
    normalizedName.includes("masala") ||
    normalizedName.includes("seasoning") ||
    normalizedName.includes("herb")
  ) {
    return CATEGORY_META["spices"];
  }

  if (
    normalizedSlug.includes("snack") ||
    normalizedName.includes("snack") ||
    normalizedSlug.includes("chip") ||
    normalizedName.includes("crisp") ||
    normalizedName.includes("biscuit") ||
    normalizedName.includes("namkeen") ||
    normalizedName.includes("sweet")
  ) {
    return CATEGORY_META["snacks"];
  }

  if (
    normalizedSlug.includes("drink") ||
    normalizedName.includes("drink") ||
    normalizedSlug.includes("beverage") ||
    normalizedName.includes("beverage") ||
    normalizedName.includes("juice") ||
    normalizedName.includes("soda") ||
    normalizedName.includes("water") ||
    normalizedName.includes("tea") ||
    normalizedName.includes("coffee")
  ) {
    return CATEGORY_META["drinks"];
  }

  if (
    normalizedSlug.includes("house") ||
    normalizedName.includes("household") ||
    normalizedSlug.includes("clean") ||
    normalizedName.includes("detergent") ||
    normalizedName.includes("laundry") ||
    normalizedName.includes("paper")
  ) {
    return CATEGORY_META["household"];
  }

  if (
    normalizedSlug.includes("beauty") ||
    normalizedName.includes("beauty") ||
    normalizedSlug.includes("cosmetic") ||
    normalizedName.includes("shampoo") ||
    normalizedName.includes("soap") ||
    normalizedName.includes("skincare") ||
    normalizedName.includes("hair")
  ) {
    return CATEGORY_META["beauty"];
  }

  if (
    normalizedSlug.includes("indian") ||
    normalizedName.includes("indian") ||
    normalizedSlug.includes("asian") ||
    normalizedName.includes("asian") ||
    normalizedName.includes("ethnic")
  ) {
    return CATEGORY_META["indian-grocery"];
  }

  // Fallback defaults
  return {
    bgTint: "#FAF5EE",
    ctaColor: "#A77B3F",
  };
}
