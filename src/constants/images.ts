/**
 * ATLAS Image & Asset Registry
 * All components must import image paths from this barrel. Never hardcode paths inline.
 */

export const IMAGES = {
  // Hero Assets
  hero: {
    background: "/assets/images/hero/hero-background.jpg",
    produceBasket: "/assets/images/hero/hero-produce-fresh.png",
    produceHarvest: "/assets/images/hero/hero-packaged-food.png",
    packagedFood: "/assets/images/hero/hero-packaged-food.png",
  },

  // Promo Cards
  promo: {
    weeklyOffers: "/assets/images/promo/promo-weekly-offers-fresh.png",
    buyAgain: "/assets/images/promo/promo-buy-again-staples.png",
  },

  // Banners
  banners: {
    freshToday: "/assets/images/banners/fresh-today.png",
    indianAsian: "/assets/images/banners/indian-asian-grocery.png",
    shopAll: "/assets/images/banners/shop-all-packaged-food.png",
    packagedFood: "/assets/images/banners/shop-all-packaged-food.png",
  },

  // Recipe Cards
  recipes: {
    butterChicken: "/assets/images/recipes/recipe-butter-chicken.jpg",
    biryani: "/assets/images/recipes/recipe-biryani.jpg",
    pasta: "/assets/images/recipes/recipe-pasta.jpg",
    healthyLunch: "/assets/images/recipes/recipe-healthy-lunch.jpg",
    mexicanNight: "/assets/images/recipes/recipe-mexican-night.jpg",
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
    product: "/assets/images/placeholders/product-placeholder.svg",
    avatar: "/assets/images/placeholders/avatar-placeholder.svg",
  },
} as const;

export type ImageRegistry = typeof IMAGES;

/**
 * The picture shown for a product: its own image from the database, then its first variant's image.
 * The generic placeholder is used only when the product has no picture at all.
 */
export function getGroceryProductImage(
  p?: { images?: string[]; variants?: Array<{ images?: string[] }> } | null
): string {
  return p?.images?.[0] || p?.variants?.find((v) => v.images && v.images.length > 0)?.images?.[0] || IMAGES.placeholders.product;
}
