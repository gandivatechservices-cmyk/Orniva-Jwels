import type { ReactNode } from "react";

export type CategoryVisual = {
  icon?: ReactNode;
  bgTint: string;
  ctaColor: string;
  isPopular?: boolean;
};

/**
 * Category Visual Details Map
 */
const CATEGORY_META: Record<string, { bgTint: string; ctaColor: string; isPopular?: boolean }> = {
  bakery: {
    bgTint: "#fef7ec",
    ctaColor: "#ea580c",
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
    bgTint: "#edf7ee",
    ctaColor: "#16a34a",
  },
  "fruits-vegetables": {
    bgTint: "#edf7ee",
    ctaColor: "#16a34a",
  },
  "fruit-veg": {
    bgTint: "#edf7ee",
    ctaColor: "#16a34a",
  },
  "fresh-food": {
    bgTint: "#edf7ee",
    ctaColor: "#16a34a",
  },
  produce: {
    bgTint: "#edf7ee",
    ctaColor: "#16a34a",
  },
  food: {
    bgTint: "#edf7ee",
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
    bgTint: "#edf7ee",
    ctaColor: "#16a34a",
  };
}
