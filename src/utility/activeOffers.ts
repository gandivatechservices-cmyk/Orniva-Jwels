import { formatPrice } from "utility/formatMoney";
import type { Coupon, OfferTarget } from "utility/services/offers";
import type { Product } from "utility/services/catalog";

function isOfferCurrentlyValid(offer: Coupon, now: Date): boolean {
  if (!offer.isActive) return false;
  if (now < new Date(offer.validFrom) || now > new Date(offer.validTo)) return false;
  if (offer.daysOfWeek?.length && !offer.daysOfWeek.includes(now.getDay())) return false;
  if (offer.timeWindow) {
    const hour = now.getHours();
    if (hour < offer.timeWindow.startHour || hour >= offer.timeWindow.endHour) return false;
  }
  return true;
}

function targetMatchesProduct(target: OfferTarget, product: Product): boolean {
  if (target.scope === "cart") return true;
  if (target.scope === "category") return target.categoryId === product.categoryId;
  return target.productId === product._id; // product / variant
}

function isCartWide(offer: Coupon): boolean {
  return offer.targets.length === 0 || offer.targets.every((target) => target.scope === "cart");
}

function offerMatchesProduct(offer: Coupon, product: Product): boolean {
  if (offer.excludeTargets?.some((target) => targetMatchesProduct(target, product))) return false;
  if (offer.discountType === "buy_x_get_y" && offer.bxgy) {
    return targetMatchesProduct(offer.bxgy.buyTarget, product) || targetMatchesProduct(offer.bxgy.getTarget, product);
  }
  if (offer.targets.length === 0) return true; // cart-wide offer applies to everything
  return offer.targets.some((target) => targetMatchesProduct(target, product));
}

/** Whether the offer can be used by this shopper (specific-user offers are hidden from everyone else). */
export function isOfferEligibleForUser(offer: Coupon, userId?: string | null): boolean {
  if (offer.usageLimit && offer.timesUsed >= offer.usageLimit) return false;
  if (offer.eligibility === "specific_users") return Boolean(userId && offer.eligibleUserIds?.includes(userId));
  return true;
}

/** Offers that are live right now and usable by this shopper, for the offers section. */
export function getVisibleOffers(offers: Coupon[], userId?: string | null, now: Date = new Date()): Coupon[] {
  return offers.filter((offer) => isOfferCurrentlyValid(offer, now) && isOfferEligibleForUser(offer, userId));
}

/** Best currently-valid, price-representable (percent/fixed) auto-offer for a product, for display purposes only. */
export function findBestDisplayOffer(offers: Coupon[], product: Product, now: Date = new Date()): Coupon | null {
  const candidates = offers.filter(
    (offer) =>
      offer.domainId === product.domainId &&
      (offer.discountType === "percent" || offer.discountType === "fixed") &&
      isOfferCurrentlyValid(offer, now) &&
      offerMatchesProduct(offer, product)
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((best, offer) => {
    const bestAmount = best.discountType === "percent" ? (product.basePrice * (best.discountValue || 0)) / 100 : best.discountValue || 0;
    const offerAmount = offer.discountType === "percent" ? (product.basePrice * (offer.discountValue || 0)) / 100 : offer.discountValue || 0;
    return offerAmount > bestAmount ? offer : best;
  });
}

/**
 * Estimated "was / now" pricing for a product badge, based on a currently-active offer.
 * The actual charged price is always basePrice at add-to-cart time — the discount is
 * only really applied once at checkout via the coupon engine — this is illustrative only.
 */
export function estimateDiscountedPrice(product: Product, offer: Coupon): { price: number; comparePrice: number } {
  if (offer.discountType === "percent") {
    const percent = offer.discountValue || 0;
    return { price: product.basePrice, comparePrice: Math.round((product.basePrice / (1 - percent / 100)) * 100) / 100 };
  }
  const amount = offer.discountValue || 0;
  return { price: product.basePrice, comparePrice: Math.round((product.basePrice + amount) * 100) / 100 };
}

export type CartItemRef = { productId: string; variantId?: string; domainId: string; unitPrice: number };

function targetMatchesCartItem(target: OfferTarget, item: CartItemRef): boolean {
  if (target.scope === "product") return target.productId === item.productId;
  if (target.scope === "variant") {
    return target.productId === item.productId && (target.variantIds ?? []).includes(item.variantId ?? "");
  }
  return false; // cart/category-wide offers aren't a per-item "was price" — they show in the cart's offers list instead
}

/**
 * Best currently-valid product/variant-specific auto-offer for a single cart line, so the
 * basket can show "was £X" next to the item — distinct from the cart-wide coupon/offer
 * applied at checkout (that one discounts the order total, not a specific product's price).
 */
export function findBestItemOffer(offers: Coupon[], item: CartItemRef, now: Date = new Date()): Coupon | null {
  const candidates = offers.filter(
    (offer) =>
      offer.domainId === item.domainId &&
      (offer.discountType === "percent" || offer.discountType === "fixed") &&
      isOfferCurrentlyValid(offer, now) &&
      offer.targets.some((target) => targetMatchesCartItem(target, item)) &&
      !offer.excludeTargets?.some((target) => targetMatchesCartItem(target, item))
  );
  if (candidates.length === 0) return null;
  const amountOf = (offer: Coupon) =>
    offer.discountType === "percent" ? (item.unitPrice * (offer.discountValue || 0)) / 100 : offer.discountValue || 0;
  return candidates.reduce((best, offer) => (amountOf(offer) > amountOf(best) ? offer : best));
}

/** was/now price for a single cart line's unit price, based on a product/variant-specific auto-offer. */
export function estimateItemComparePrice(unitPrice: number, offer: Coupon): number {
  if (offer.discountType === "percent") {
    const percent = offer.discountValue || 0;
    return Math.round((unitPrice / (1 - percent / 100)) * 100) / 100;
  }
  const amount = offer.discountValue || 0;
  return Math.round((unitPrice + amount) * 100) / 100;
}

/** True when a visible offer specifically targets this product (cart-wide offers don't count). */
/** Merchant-set MRP (struck-through list price), scaled to a variant price when one is given. */
export function getMrpComparePrice(product: Product, price: number = product.basePrice): number | undefined {
  if (!product.mrp || product.mrp <= product.basePrice || product.basePrice <= 0) return undefined;
  return Math.round(((product.mrp * price) / product.basePrice) * 100) / 100;
}

/** Struck-through price for a product card: the MRP if set, otherwise the estimate from a live offer. */
export function getComparePrice(product: Product, offer?: Coupon | null): number | undefined {
  return getMrpComparePrice(product) ?? (offer ? estimateDiscountedPrice(product, offer).comparePrice : undefined);
}

export function isProductOnOffer(offers: Coupon[], product: Product, now: Date = new Date()): boolean {
  if (getMrpComparePrice(product)) return true;
  return offers.some(
    (offer) =>
      offer.domainId === product.domainId && !isCartWide(offer) && isOfferCurrentlyValid(offer, now) && offerMatchesProduct(offer, product)
  );
}

/** Live, shopper-usable offers that specifically target this product or its category (cart-wide offers excluded). */
export function getApplicableOffers(offers: Coupon[], product: Product, now: Date = new Date()): Coupon[] {
  return offers.filter(
    (offer) =>
      offer.domainId === product.domainId && !isCartWide(offer) && isOfferCurrentlyValid(offer, now) && offerMatchesProduct(offer, product)
  );
}

/** Short tag for a card or list, e.g. "Extra 10% off", "Buy 2 Get 1". */
export function offerShortLabel(offer: Coupon, currency = "GBP"): string {
  switch (offer.discountType) {
    case "percent":
      return `Extra ${offer.discountValue ?? 0}% off`;
    case "fixed":
      return `Extra ${formatPrice(offer.fixedAmountByCurrency?.[currency] ?? offer.discountValue ?? 0, currency)} off`;
    case "free_shipping":
      return "Free delivery";
    case "buy_x_get_y":
      return offer.bxgy ? `Buy ${offer.bxgy.buyQuantity} Get ${offer.bxgy.getQuantity}` : "Buy X Get Y";
  }
}

/** Tag for a product card: the best applicable offer's label, plus "+N more" if several apply. */
export function getProductOfferLabel(offers: Coupon[], product: Product, currency = "GBP"): string | undefined {
  const applicable = getApplicableOffers(offers, product);
  if (applicable.length === 0) return undefined;
  const best = findBestDisplayOffer(applicable, product) ?? applicable[0];
  const extra = applicable.length - 1;
  return extra > 0 ? `${offerShortLabel(best, currency)} +${extra} more` : offerShortLabel(best, currency);
}
