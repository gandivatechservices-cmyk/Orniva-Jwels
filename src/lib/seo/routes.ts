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

export type StaticPageKey = "products" | "categories" | "catalogs" | "brands" | "recipes" | "terms" | "refund-policy";

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
      "Shop the full Atlas Groceries range: fresh produce, pantry staples, spices, snacks and drinks, delivered across the UK.",
    path: "/products",
    changeFrequency: "daily",
    priority: 0.9,
  },
  categories: {
    title: "Shop by Category",
    description:
      "Browse all grocery categories at Atlas Groceries: fresh produce, pantry staples, spices, snacks and more, delivered across the UK.",
    path: "/categories",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  catalogs: {
    title: "Catalogs",
    description: "Browse every Atlas Groceries catalog and shop the full range.",
    path: "/catalogs",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  brands: {
    title: "Shop by Brand",
    description:
      "Explore trusted grocery brands at Atlas Groceries, including Tilda, Haldiram's, Shan, MDH and Amul, with UK delivery.",
    path: "/brands",
    changeFrequency: "weekly",
    priority: 0.6,
  },
  recipes: {
    title: "Recipes & Cooking Ideas",
    description:
      "Easy recipes and cooking ideas, with the ingredients you need available to order from Atlas Groceries.",
    path: "/recipes",
    changeFrequency: "weekly",
    priority: 0.5,
  },
  terms: {
    title: "Terms & Conditions",
    description:
      "Read the Atlas Groceries terms and conditions covering ordering, delivery and customer accounts.",
    path: "/terms",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  "refund-policy": {
    title: "Refund & Return Policy",
    description:
      "Learn how returns and refunds work at Atlas Groceries, including eligibility, timeframes and food-safety rules.",
    path: "/refund-policy",
    changeFrequency: "yearly",
    priority: 0.2,
  },
};
