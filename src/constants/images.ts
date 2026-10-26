/**
 * ATLAS Image & Asset Registry
 * All components must import image paths from this barrel. Never hardcode paths inline.
 */

export const IMAGES = {
  // Hero Assets
  hero: {
    background: "/assets/images/hero/hero-background.jpg",
    produceBasket: "/assets/images/hero/hero-produce-fresh.png",
    produceHarvest: "/assets/images/jewelry/hero-model.jpg",
    packagedFood: "/assets/images/jewelry/hero-model.jpg",
    model: "/assets/images/jewelry/hero-model.jpg",
  },

  // Luxury Jewelry Assets
  jewelry: {
    heroModel: "/assets/images/jewelry/hero-model.jpg",
    manufacturingCraftsman: "/assets/images/jewelry/manufacturing-craftsman.jpg",
    designerPromo: "/assets/images/jewelry/designer-promo.jpg",
    customPromo: "/assets/images/jewelry/custom-promo.jpg",
    luxuryTrust: "/assets/images/jewelry/luxury-trust.jpg",
    categories: {
      rings: "/assets/images/jewelry/category-rings.jpg",
      necklaces: "/assets/images/jewelry/category-necklaces.jpg",
      earrings: "/assets/images/jewelry/category-earrings.jpg",
      bracelets: "/assets/images/jewelry/category-bracelets.jpg",
      bangles: "/assets/images/jewelry/category-bangles.jpg",
      mens: "/assets/images/jewelry/category-mens.jpg",
    },
  },

  // Promo Cards
  promo: {
    weeklyOffers: "/assets/images/jewelry/designer-promo.jpg",
    buyAgain: "/assets/images/jewelry/custom-promo.jpg",
  },

  // Banners
  banners: {
    freshToday: "/assets/images/jewelry/luxury-trust.jpg",
    indianAsian: "/assets/images/jewelry/designer-promo.jpg",
    shopAll: "/assets/images/jewelry/hero-model.jpg",
    packagedFood: "/assets/images/jewelry/hero-model.jpg",
  },

  // Recipe & Guide Cards
  recipes: {
    butterChicken: "/assets/images/jewelry/category-rings.jpg",
    biryani: "/assets/images/jewelry/category-necklaces.jpg",
    pasta: "/assets/images/jewelry/category-earrings.jpg",
    healthyLunch: "/assets/images/jewelry/category-bracelets.jpg",
    mexicanNight: "/assets/images/jewelry/category-bangles.jpg",
  },

  // Illustrations & State Graphics
  illustrations: {
    emptyCart: "/assets/images/illustrations/empty-cart.svg",
    emptyWishlist: "/assets/images/illustrations/empty-wishlist.svg",
    noResults: "/assets/images/illustrations/no-results.svg",
    orderSuccess: "/assets/images/illustrations/order-success.svg",
    error404: "/assets/images/illustrations/error-404.svg",
    comingSoon: "/assets/images/illustrations/coming-soon.svg",
  },

  // Fallbacks & Placeholders
  placeholders: {
    product: "/assets/images/placeholders/jewelry-placeholder.jpg",
    avatar: "/assets/images/placeholders/avatar-placeholder.svg",
  },
} as const;

export type ImageRegistry = typeof IMAGES;

/**
 * The picture shown for a product: its own image from the database, then its first variant's image.
 * The fine jewelry placeholder is used when the product has no picture at all.
 */
export function getGroceryProductImage(
  p?: { images?: string[]; variants?: Array<{ images?: string[] }> } | null
): string {
  return p?.images?.[0] || p?.variants?.find((v) => v.images && v.images.length > 0)?.images?.[0] || IMAGES.placeholders.product;
}
