import { RING_SIZE_PAGE, RING_SIZE_ROUTE } from "../../constants/ringSize";
import { NECKLACE_LENGTH_PAGE, NECKLACE_LENGTH_ROUTE } from "../../constants/necklaceLength";
/** Private or transactional routes that must never be indexed. Used by robots.ts and next.config.ts. */
export const NOINDEX_ROUTES = [
  "admin",
  "account",
  "cart",
  "checkout",
  "orders",
  "wishlist",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "verify-reset-code",
  "search",
];

export type StaticPageKey = "products" | "categories" | "catalogs" | "brands" | "recipes" | "terms" | "refund-policy" | "ring-size-guide" | "necklace-length-guide";

type StaticPage = {
  title: string;
  description: string;
  path: string;
  changeFrequency: "daily" | "weekly" | "yearly";
  priority: number;
};

/** Title, description and sitemap settings for every public page that has no dynamic data. */
export const STATIC_PAGES: Record<StaticPageKey, StaticPage> = {
  products: {
    title: "All Products",
    description:
      "Shop the full Orniva Jewels range: certified diamond rings, gold necklaces, earrings, bracelets and bespoke fine jewellery.",
    path: "/products",
    changeFrequency: "daily",
    priority: 0.9,
  },
  categories: {
    title: "Shop by Category",
    description:
      "Browse all jewellery collections at Orniva Jewels: rings, necklaces, earrings, bracelets, bangles and pendants.",
    path: "/categories",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  catalogs: {
    title: "Catalogs",
    description: "Browse every Orniva Jewels catalog and shop the full range.",
    path: "/catalogs",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  brands: {
    title: "Shop by Brand",
    description:
      "Explore the jewellery brands and ateliers available at Orniva Jewels.",
    path: "/brands",
    changeFrequency: "weekly",
    priority: 0.6,
  },
  recipes: {
    title: "Care & Styling Ideas",
    description:
      "Jewellery care tips and styling ideas from Orniva Jewels.",
    path: "/recipes",
    changeFrequency: "weekly",
    priority: 0.5,
  },
  terms: {
    title: "Terms & Conditions",
    description:
      "Read the Orniva Jewels terms and conditions covering ordering, delivery and customer accounts.",
    path: "/terms",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  "refund-policy": {
    title: "Refund & Return Policy",
    description:
      "Learn how returns and refunds work at Orniva Jewels, including eligibility, timeframes and inspection of your jewellery.",
    path: "/refund-policy",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  "ring-size-guide": {
    title: RING_SIZE_PAGE.seo.title,
    description: RING_SIZE_PAGE.seo.description,
    path: RING_SIZE_ROUTE,
    changeFrequency: "yearly",
    priority: 0.4,
  },
  "necklace-length-guide": {
    title: NECKLACE_LENGTH_PAGE.seo.title,
    description: NECKLACE_LENGTH_PAGE.seo.description,
    path: NECKLACE_LENGTH_ROUTE,
    changeFrequency: "yearly",
    priority: 0.4,
  },
};
