import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type Domain = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  currency: string;
  attributeKeys: string[];
  metadata: Record<string, string>;
};

export type Catalog = {
  _id: string;
  name: string;
  domainId: string;
  sellerId: string;
  description?: string;
  /** Cover image shown on the storefront catalog banners */
  imageUrl?: string;
  isActive: boolean;
};

export type Category = {
  _id: string;
  domainId: string;
  name: string;
  slug: string;
  type: string;
  parentCategoryId?: string | null;
  imageUrl?: string;
  description?: string;
  productCount?: number;
  /** Soft-deleted: only listed in the admin "Deleted" tab */
  isDeleted?: boolean;
};

export type Brand = {
  _id: string;
  domainId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  /** Optional wide banner for the brand page */
  bannerUrl?: string;
  isActive: boolean;
  /** Soft-deleted: only listed in the admin "Deleted" tab */
  isDeleted?: boolean;
};

export type BrandPayload = {
  domainId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive?: boolean;
};

export type NutritionRow = { name: string; amount: string; indented?: boolean };
export type Nutrition = { basis?: string; rows: NutritionRow[] };
export type Sourcing = { ingredients?: string; allergenAdvice?: string; origin?: string };

export type Variant = {
  _id?: string;
  sku: string;
  name?: string;
  attributes?: Record<string, string>;
  price: number;
  prices?: Record<string, number>;
  stock: number;
  images?: string[];
  /** Inactive variants stay on the product but can't be bought (missing = active) */
  isActive?: boolean;
  /** Overrides the product's nutrition facts / sourcing text for this variant (null = use the product's) */
  nutrition?: Nutrition | null;
  sourcing?: Sourcing | null;
};

export type Product = {
  _id: string;
  domainId: string;
  catalogId: string;
  categoryId: string;
  name: string;
  description?: string;
  images: string[];
  brand?: string;
  /** Populated by the API as { _id, name, slug, logoUrl } when a brand is set */
  brandId?: Pick<Brand, "_id" | "name" | "slug" | "logoUrl"> | string | null;
  nutrition?: Nutrition | null;
  sourcing?: Sourcing | null;
  basePrice: number;
  mrp?: number;
  isActive: boolean;
  /** Soft-deleted: kept for order/review history, only listed in the admin "Deleted products" tab */
  isDeleted?: boolean;
  attributes: Record<string, string>;
  variants: Variant[];
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  minPrice?: number;
  maxPrice?: number;
};

export type SearchSuggestionProduct = {
  _id: string;
  name: string;
  brand?: string;
  basePrice: number;
  mrp?: number;
  images: string[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
};

export type SearchSuggestionsResult = {
  query: string;
  products: SearchSuggestionProduct[];
  categories: { _id: string; name: string; slug: string }[];
  brands: string[];
  popularTags: string[];
};



export type CategoryPayload = {
  domainId: string;
  name: string;
  slug?: string;
  type: string;
  parentCategoryId?: string;
  imageUrl?: string;
};

export type ProductPayload = {
  domainId: string;
  catalogId: string;
  categoryId: string;
  name: string;
  description?: string;
  images?: string[];
  brandId?: string;
  /** null clears it */
  nutrition?: Nutrition | null;
  sourcing?: Sourcing | null;
  basePrice: number;
  mrp?: number;
  isActive?: boolean;
  attributes?: Record<string, string>;
  variants: Variant[];
};

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  domainId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  /** Attribute filters: key=attributes.color, value=red */
  [attributeFilter: string]: string | number | undefined;
};

export type CategoryQueryParams = {
  domainId?: string;
  type?: string;
  parentCategoryId?: string;
};

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

// In-flight deduplication and short-term cache for categories and domains
const categoryCache = new Map<string, { data: Category[]; expiresAt: number }>();
const categoryInFlight = new Map<string, Promise<Category[]>>();

const domainCache = new Map<string, { data: Domain[]; expiresAt: number }>();
const domainInFlight = new Map<string, Promise<Domain[]>>();

const productInFlight = new Map<string, Promise<PaginatedProducts>>();

const suggestionsCache = new Map<string, { data: SearchSuggestionsResult; expiresAt: number }>();
const suggestionsInFlight = new Map<string, Promise<SearchSuggestionsResult>>();


export const catalogService = {
  // -------------------------------------------------------------------------
  // Domains
  // -------------------------------------------------------------------------
  listDomains: (includeInactive = false): Promise<Domain[]> => {
    const cacheKey = `domains_${includeInactive}`;
    const cached = domainCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return Promise.resolve(cached.data);
    }
    const inFlight = domainInFlight.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }
    const promise = unwrap(
      apiClient.get<ApiResponse<Domain[]>>(API_ENDPOINTS.DOMAINS.BASE(includeInactive))
    )
      .then((data) => {
        domainCache.set(cacheKey, { data, expiresAt: Date.now() + 60_000 });
        domainInFlight.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        domainInFlight.delete(cacheKey);
        throw err;
      });
    domainInFlight.set(cacheKey, promise);
    return promise;
  },

  getDomain: (id: string) =>
    unwrap(apiClient.get<ApiResponse<Domain>>(API_ENDPOINTS.DOMAINS.BY_ID(id))),

  // -------------------------------------------------------------------------
  // Catalogs
  // -------------------------------------------------------------------------
  listCatalogs: (domainId?: string) =>
    unwrap(apiClient.get<ApiResponse<Catalog[]>>(API_ENDPOINTS.CATALOGS.BASE(domainId))),

  getCatalog: (id: string) =>
    unwrap(apiClient.get<ApiResponse<Catalog>>(API_ENDPOINTS.CATALOGS.BY_ID(id))),

  createCatalog: (payload: { name: string; domainId: string; description?: string; imageUrl: string; isActive?: boolean }) =>
    unwrap(apiClient.post<ApiResponse<Catalog>>(API_ENDPOINTS.CATALOGS.BASE(), payload)),

  updateCatalog: (id: string, payload: Partial<{ name: string; domainId: string; description: string; imageUrl: string; isActive: boolean }>) =>
    unwrap(apiClient.patch<ApiResponse<Catalog>>(API_ENDPOINTS.CATALOGS.BY_ID(id), payload)),

  deleteCatalog: (id: string) => apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.CATALOGS.BY_ID(id)),

  // -------------------------------------------------------------------------
  // Brands
  // -------------------------------------------------------------------------
  listBrands: (domainId?: string) =>
    unwrap(apiClient.get<ApiResponse<Brand[]>>(API_ENDPOINTS.BRANDS.BASE(domainId))),

  /** Admin list — includes inactive brands; `deleted: true` returns the soft-deleted ones instead */
  listAllBrands: (domainId?: string, deleted = false) =>
    unwrap(apiClient.get<ApiResponse<Brand[]>>(API_ENDPOINTS.BRANDS.ADMIN(domainId, deleted))),

  createBrand: (payload: BrandPayload) =>
    unwrap(apiClient.post<ApiResponse<Brand>>(API_ENDPOINTS.BRANDS.BASE(), payload)),

  updateBrand: (id: string, payload: Partial<BrandPayload>) =>
    unwrap(apiClient.patch<ApiResponse<Brand>>(API_ENDPOINTS.BRANDS.BY_ID(id), payload)),

  deleteBrand: (id: string) => apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.BRANDS.BY_ID(id)),

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  listCategories: (params: CategoryQueryParams = {}): Promise<Category[]> => {
    const cacheKey = JSON.stringify(params);
    const cached = categoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return Promise.resolve(cached.data);
    }
    const inFlight = categoryInFlight.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }
    const promise = unwrap(
      apiClient.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.BASE(params))
    )
      .then((data) => {
        categoryCache.set(cacheKey, { data, expiresAt: Date.now() + 60_000 });
        categoryInFlight.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        categoryInFlight.delete(cacheKey);
        throw err;
      });
    categoryInFlight.set(cacheKey, promise);
    return promise;
  },

  /** Admin: soft-deleted categories (not cached) */
  listDeletedCategories: (): Promise<Category[]> =>
    unwrap(apiClient.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.DELETED())),

  clearCategoryCache: () => {
    categoryCache.clear();
  },

  /**
   * Top-level categories (the ones with no parent). The API's "type" filter can't be used for this:
   * root categories are saved with type "category", so asking for type "root" returns nothing.
   */
  listRootCategories: async (params: CategoryQueryParams = {}): Promise<Category[]> => {
    const all = await catalogService.listCategories(params);
    return (all || []).filter((c) => !c.parentCategoryId);
  },

  getCachedCategories: (): Category[] | null => {
    for (const entry of categoryCache.values()) {
      if (entry && entry.data && entry.data.length > 0 && Date.now() < entry.expiresAt) {
        return entry.data;
      }
    }
    return null;
  },

  getCategory: (id: string) =>
    unwrap(apiClient.get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BY_ID(id))),

  createCategory: (payload: CategoryPayload) => {
    categoryCache.clear();
    return unwrap(apiClient.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BASE(), payload));
  },

  updateCategory: (id: string, payload: Partial<CategoryPayload>) => {
    categoryCache.clear();
    return unwrap(apiClient.patch<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BY_ID(id), payload));
  },

  deleteCategory: (id: string) => {
    categoryCache.clear();
    return apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  },

  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------
  listProducts: (params: ProductQueryParams = {}, options?: RequestInit): Promise<PaginatedProducts> => {
    const { page = 1, limit = 20, ...rest } = params;
    const cacheKey = JSON.stringify({ page, limit, ...rest });

    // Deduplicate concurrent in-flight requests with identical query params
    if (!options?.signal) {
      const existing = productInFlight.get(cacheKey);
      if (existing) {
        return existing;
      }
    }

    const promise = unwrap(
      apiClient.get<ApiResponse<PaginatedProducts>>(
        API_ENDPOINTS.PRODUCTS.BASE({ page, limit, ...rest }),
        options
      )
    ).finally(() => {
      productInFlight.delete(cacheKey);
    });

    if (!options?.signal) {
      productInFlight.set(cacheKey, promise);
    }

    return promise;
  },

  /** Fetches all products across pages for admin management without truncation */
  listAllProducts: async (
    params: Omit<ProductQueryParams, "page" | "limit"> = {},
    options?: RequestInit
  ): Promise<Product[]> => {
    const firstPage = await catalogService.listProducts(
      { ...params, page: 1, limit: 100 },
      options
    );
    const allItems = [...(firstPage.items || [])];
    const total = firstPage.total || allItems.length;

    if (allItems.length < total) {
      const totalPages = Math.ceil(total / 100);
      const remainingRequests: Promise<PaginatedProducts>[] = [];
      for (let p = 2; p <= totalPages; p++) {
        remainingRequests.push(
          catalogService.listProducts({ ...params, page: p, limit: 100 }, options)
        );
      }
      const remainingPages = await Promise.all(remainingRequests);
      for (const pageRes of remainingPages) {
        allItems.push(...(pageRes.items || []));
      }
    }

    return allItems;
  },

  /** Admin: every product across pages, including inactive ones. `deleted: true` returns the soft-deleted ones instead. */
  listAllAdminProducts: async (deleted = false): Promise<Product[]> => {
    const fetchPage = (page: number) =>
      unwrap(
        apiClient.get<ApiResponse<PaginatedProducts>>(
          API_ENDPOINTS.PRODUCTS.ADMIN({ page, limit: 100, ...(deleted ? { deleted: true } : {}) })
        )
      );
    const first = await fetchPage(1);
    const items = [...(first.items || [])];
    const totalPages = Math.ceil((first.total || items.length) / 100);
    const rest = await Promise.all(Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => fetchPage(i + 2)));
    rest.forEach((pageRes) => items.push(...(pageRes.items || [])));
    return items;
  },

  /** Paginated product listing with full server-side filtering */
  listProductsPaginated: (params: ProductQueryParams & { page: number; limit: number }, options?: RequestInit) =>
    unwrap(apiClient.get<ApiResponse<PaginatedProducts>>(API_ENDPOINTS.PRODUCTS.BASE(params), options)),

  getPriceRange: (params: { categoryId?: string; domainId?: string } = {}): Promise<{ minPrice: number; maxPrice: number }> =>
    unwrap(apiClient.get<ApiResponse<{ minPrice: number; maxPrice: number }>>(API_ENDPOINTS.PRODUCTS.PRICE_RANGE(params))),

  getSearchSuggestions: async (
    query: string = "",
    domainId?: string
  ): Promise<SearchSuggestionsResult> => {
    const clean = (query || "").trim().toLowerCase();

    const cacheKey = `suggestions_${clean}_${domainId || ""}`;
    const cached = suggestionsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    const inFlight = suggestionsInFlight.get(cacheKey);
    if (inFlight) return inFlight;

    const promise = unwrap(
      apiClient.get<ApiResponse<SearchSuggestionsResult>>(
        API_ENDPOINTS.PRODUCTS.SEARCH_SUGGESTIONS({ q: clean || undefined, domainId })
      )
    )
      .then((res) => {
        if (suggestionsCache.size > 50) {
          const firstKey = suggestionsCache.keys().next().value;
          if (firstKey) suggestionsCache.delete(firstKey);
        }
        suggestionsCache.set(cacheKey, { data: res, expiresAt: Date.now() + 60000 });
        return res;
      })
      .finally(() => {
        suggestionsInFlight.delete(cacheKey);
      });

    suggestionsInFlight.set(cacheKey, promise);

    return promise;
  },

  getPopularSearches: async (domainId?: string): Promise<string[]> => {
    try {
      const res = await unwrap(
        apiClient.get<ApiResponse<SearchSuggestionsResult>>(
          API_ENDPOINTS.PRODUCTS.POPULAR_SEARCHES({ domainId })
        )
      );
      return res.popularTags || [];
    } catch {
      return [];
    }
  },




  getProduct: (id: string) =>
    unwrap(apiClient.get<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BY_ID(id))),

  createProduct: (payload: ProductPayload) =>
    unwrap(apiClient.post<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BASE(), payload)),

  updateProduct: (id: string, payload: Partial<ProductPayload>) =>
    unwrap(apiClient.patch<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BY_ID(id), payload)),

  deleteProduct: (id: string) => apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.PRODUCTS.BY_ID(id)),
};
