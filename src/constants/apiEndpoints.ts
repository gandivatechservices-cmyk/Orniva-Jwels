/**
 * Centralized API Endpoints Constants
 * 
 * All backend API routes are declared here dynamically and reusable.
 * Endpoints with dynamic parameters (IDs, query params) are expressed as builder functions.
 */

export type QueryParamValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Serializes an object of parameters into a clean query string.
 * Omits undefined, null, or empty string values.
 */
export function buildQuery(params?: QueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const API_ENDPOINTS = {
  // ---------------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------------
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_RESET_CODE: "/auth/verify-reset-code",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_EMAIL_OTP: "/auth/resend-email-otp",
  },

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------
  USERS: {
    BASE: "/users",
    ME: "/users/me",
    BY_ID: (id: string) => `/users/${encodeURIComponent(id)}`,
  },

  // ---------------------------------------------------------------------------
  // DOMAINS (Proxied catalog domains)
  // ---------------------------------------------------------------------------
  DOMAINS: {
    BASE: (includeInactive = false) =>
      `/domains${includeInactive ? "?includeInactive=true" : ""}`,
    BY_ID: (id: string) => `/domains/${encodeURIComponent(id)}`,
  },

  // ---------------------------------------------------------------------------
  // CATALOGS
  // ---------------------------------------------------------------------------
  CATALOGS: {
    BASE: (domainId?: string) =>
      domainId ? `/catalogs?domainId=${encodeURIComponent(domainId)}` : "/catalogs",
    BY_ID: (id: string) => `/catalogs/${encodeURIComponent(id)}`,
  },

  // ---------------------------------------------------------------------------
  // BRANDS
  // ---------------------------------------------------------------------------
  BRANDS: {
    BASE: (domainId?: string) =>
      domainId ? `/brands?domainId=${encodeURIComponent(domainId)}` : "/brands",
    /** Admin list — includes inactive brands; `deleted` lists the soft-deleted ones instead */
    ADMIN: (domainId?: string, deleted = false) => {
      const query = [domainId ? `domainId=${encodeURIComponent(domainId)}` : "", deleted ? "deleted=true" : ""].filter(Boolean).join("&");
      return `/brands/admin${query ? `?${query}` : ""}`;
    },
    BY_ID: (id: string) => `/brands/${encodeURIComponent(id)}`,
  },

  // ---------------------------------------------------------------------------
  // CATEGORIES
  // ---------------------------------------------------------------------------
  CATEGORIES: {
    BASE: (params?: QueryParams) => `/categories${buildQuery(params)}`,
    /** Admin list of soft-deleted categories */
    DELETED: (params?: QueryParams) => `/categories/deleted${buildQuery(params)}`,
    BY_ID: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },

  // ---------------------------------------------------------------------------
  // PRODUCTS
  // ---------------------------------------------------------------------------
  PRODUCTS: {
    BASE: (params?: QueryParams) => `/products${buildQuery(params)}`,
    PRICE_RANGE: (params?: QueryParams) => `/products/price-range${buildQuery(params)}`,
    SEARCH_SUGGESTIONS: (params?: QueryParams) => `/products/search-suggestions${buildQuery(params)}`,
    POPULAR_SEARCHES: (params?: QueryParams) => `/products/popular-searches${buildQuery(params)}`,
    /** Admin list — includes inactive products */
    ADMIN: (params?: QueryParams) => `/products/admin${buildQuery(params)}`,
    BY_ID: (id: string) => `/products/${encodeURIComponent(id)}`,
  },


  // ---------------------------------------------------------------------------
  // CART
  // ---------------------------------------------------------------------------
  CART: {
    BASE: "/cart",
    ITEMS: "/cart/items",
    ITEM_BY_VARIANT: (variantId: string) => `/cart/items/${encodeURIComponent(variantId)}`,
  },

  // ---------------------------------------------------------------------------
  // WISHLIST
  // ---------------------------------------------------------------------------
  WISHLIST: {
    BASE: "/wishlist",
    ITEMS: "/wishlist/items",
    ITEM_BY_PRODUCT: (productId: string) => `/wishlist/items/${encodeURIComponent(productId)}`,
  },

  // ---------------------------------------------------------------------------
  // REVIEWS
  // ---------------------------------------------------------------------------
  REVIEWS: {
    BASE: (params?: QueryParams) => `/reviews${buildQuery(params)}`,
    MINE: "/reviews/mine",
    ADMIN: (params?: QueryParams) => `/reviews/admin${buildQuery(params)}`,
    BY_ID: (id: string) => `/reviews/${encodeURIComponent(id)}`,
    IMAGE_STATUS: (id: string, imageId: string) =>
      `/reviews/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}`,
  },

  // ---------------------------------------------------------------------------
  // ORDERS
  // ---------------------------------------------------------------------------
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id: string) => `/orders/${encodeURIComponent(id)}`,
    ADMIN: "/orders/admin",
    ACCEPT: (id: string) => `/orders/${encodeURIComponent(id)}/accept`,
    CANCEL: (id: string) => `/orders/${encodeURIComponent(id)}/cancel`,
    SHIP: (id: string) => `/orders/${encodeURIComponent(id)}/ship`,
    UNDO_SHIP: (id: string) => `/orders/${encodeURIComponent(id)}/undo-ship`,
    DELIVER: (id: string) => `/orders/${encodeURIComponent(id)}/deliver`,
    UNDO_DELIVER: (id: string) => `/orders/${encodeURIComponent(id)}/undo-deliver`,
    REFUNDS: (id: string) => `/orders/${encodeURIComponent(id)}/refunds`,
    INVOICE: (id: string) => `/orders/${encodeURIComponent(id)}/invoice`,
  },

  // ---------------------------------------------------------------------------
  // OFFERS & COUPONS
  // ---------------------------------------------------------------------------
  OFFERS: {
    BASE: (domainId?: string) =>
      domainId ? `/offers?domainId=${encodeURIComponent(domainId)}` : "/offers",
    ACTIVE: (domainId: string) => `/offers/active?domainId=${encodeURIComponent(domainId)}`,
    VALIDATE: "/offers/validate",
    ELIGIBILITY: "/offers/eligibility",
    BY_ID: (id: string) => `/offers/${encodeURIComponent(id)}`,
  },

  // ---------------------------------------------------------------------------
  // PAYMENTS
  // ---------------------------------------------------------------------------
  PAYMENTS: {
    CHECKOUT_SESSION: "/payments/checkout-session",
    VERIFY_SESSION: "/payments/verify-session",
    CANCEL_SESSION: "/payments/cancel-session",
  },

  // ---------------------------------------------------------------------------
  // UPLOADS
  // ---------------------------------------------------------------------------
  UPLOADS: {
    PRESIGN: "/uploads/presign",
  },

  // ---------------------------------------------------------------------------
  // ADDRESS / POSTCODES (UK Delivery)
  // ---------------------------------------------------------------------------
  ADDRESS: {
    NOMINATIM_SEARCH: (params?: QueryParams) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_NOMINATIM_URL ||
        "https://nominatim.openstreetmap.org/search";
      return `${baseUrl}${buildQuery(params)}`;
    },
    POSTCODE_LOOKUP: (postcode: string) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_POSTCODES_URL || "https://api.postcodes.io";
      return `${baseUrl}/postcodes/${encodeURIComponent(postcode)}`;
    },
    POSTCODE_VALIDATE: (postcode: string) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_POSTCODES_URL || "https://api.postcodes.io";
      return `${baseUrl}/postcodes/${encodeURIComponent(postcode)}/validate`;
    },
  },

  // ---------------------------------------------------------------------------
  // POLICIES & LEGAL
  // ---------------------------------------------------------------------------
  POLICIES: {
    BASE: "/policies",
    BY_SLUG: (slug: string) => `/policies/${encodeURIComponent(slug)}`,
  },

  // ---------------------------------------------------------------------------
  // SETTINGS & CONFIG
  // ---------------------------------------------------------------------------
  SETTINGS: {
    BASE: "/settings",
    DELIVERY: "/settings/delivery",
    STORE: "/settings/store",
  },
} as const;

