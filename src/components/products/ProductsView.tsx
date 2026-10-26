"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams, useParams, usePathname } from "next/navigation";
import { StoreLayout } from "../StoreLayout";
import { Container } from "../layout/Container";
import { Button } from "../ui/Button";
import { Drawer } from "../ui/Drawer";
import { EmptyState } from "../ui/EmptyState";
import {
  ProductCard,
  ProductCardSkeleton,
  ProductFilterSidebar,
  SortSelect,
} from "../common";
import { TopContentCard } from "../common/TopContentCard";
import { getCategoryHeroDefaults } from "../common/CategoryHeroBanner/CategoryHeroBanner";
import { CloseIcon, FilterIcon, SortIcon } from "../icons";
import {
  catalogService,
  type Brand,
  offersService,
  type Category,
  type Coupon,
  type Domain,
  type Product,
  type ProductQueryParams,
} from "../../utility/services";
import { findBestDisplayOffer, getComparePrice, getProductOfferLabel, getVisibleOffers, isProductOnOffer } from "../../utility/activeOffers";
import { OffersSection } from "../promotional/OffersSection/OffersSection";
import { useAuth, useWishlist, useInfiniteScroll, useCartQuantity } from "hooks";
import { IMAGES, getGroceryProductImage } from "../../constants/images";
import styles from "../../app/products/products.module.css";
import { variantCardProps } from "utility/variantPricing";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Alphabetical (A-Z)", value: "name-asc" },
  { label: "Newest Arrivals", value: "newest" },
];

const PAGE_SIZE = 10;

function isValidMongoId(id?: string | null): boolean {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

function getProductWeight(p: Product): string {
  if (p.attributes?.weight) return p.attributes.weight;
  if (p.attributes?.unit) return p.attributes.unit;
  if (p.attributes?.packSize) return p.attributes.packSize;
  const nameLower = (p.name || "").toLowerCase();
  if (
    nameLower.includes("almond") ||
    nameLower.includes("cashew") ||
    nameLower.includes("trail")
  )
    return "250g";
  if (nameLower.includes("chip")) return "150g";
  if (nameLower.includes("banana")) return "1 kg";
  if (nameLower.includes("apple")) return "6 pack";
  if (nameLower.includes("tomato")) return "500g";
  if (nameLower.includes("milk")) return "1 Litre";
  return "Pack";
}

export interface ProductsViewProps {
  initialCategorySlug?: string;
}

function ProductsViewContent({ initialCategorySlug }: ProductsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ slug?: string }>();
  const pathname = usePathname();

  // Dedicated category route (/category/[slug]) accessed when clicking a category card
  const isCategoryRoute = Boolean(
    initialCategorySlug || (pathname && pathname.startsWith("/category/"))
  );

  // Raw category identifier: either route prop, URL param (/category/[slug]), or search params (?categoryId=... or ?category=...)
  const rawCategoryParam = isCategoryRoute
    ? initialCategorySlug || params?.slug || ""
    : searchParams.get("categoryId") || searchParams.get("category") || "";

  // URL Query Parameters
  const searchQuery = searchParams.get("search") || "";
  const brandParam = searchParams.get("brand") || "";
  const sortParam = searchParams.get("sort") || "featured";
  const inStockParam = searchParams.get("inStock") === "true";
  const offersParam = searchParams.get("offers") === "true";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");

  // Initial price range parsed from URL query params
  const initialAppliedPriceRange = useMemo<[number, number] | null>(() => {
    if (minPriceParam !== null && maxPriceParam !== null) {
      const min = Number(minPriceParam);
      const max = Number(maxPriceParam);
      if (!isNaN(min) && !isNaN(max)) {
        return [min, max];
      }
    }
    return null;
  }, [minPriceParam, maxPriceParam]);

  // Brand shown in the hero when the page is opened with ?brand=Name (logo and description come from the database)
  const [brandInfo, setBrandInfo] = useState<Brand | null>(null);

  // Catalog Metadata States
  const [categories, setCategories] = useState<Category[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activeOffers, setActiveOffers] = useState<Coupon[]>([]);

  // Dynamic price bounds loaded from backend
  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number }>({ min: 0, max: 100 });

  // Applied Filter States (determines active product list and URL)
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedBrands, setAppliedBrands] = useState<string[]>(
    brandParam ? [brandParam] : []
  );
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number] | null>(
    initialAppliedPriceRange
  );
  const [appliedInStock, setAppliedInStock] = useState(inStockParam);
  const [appliedOffers, setAppliedOffers] = useState(offersParam);
  const [sortBy, setSortBy] = useState(sortParam);

  // Pending Filter States (staged inside the filter sidebar until "Apply Filters" is clicked)
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [pendingBrands, setPendingBrands] = useState<string[]>(
    brandParam ? [brandParam] : []
  );
  const [pendingPriceRange, setPendingPriceRange] = useState<[number, number]>(
    initialAppliedPriceRange || [0, 100]
  );
  const [pendingInStock, setPendingInStock] = useState(inStockParam);
  const [pendingOffers, setPendingOffers] = useState(offersParam);

  // Mobile Drawers
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  // Product Results & Infinite Scroll States
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store Hooks
  const { productIds: wishlistedIds, toggle: toggleWishlist } = useWishlist();

  // Guard refs to track in-flight requests cleanly and avoid duplicate fetches
  const isFetchingRef = useRef(false);
  const currentFetchIdRef = useRef(0);
  const categoriesRef = useRef<Category[]>([]);
  const appliedCategoriesRef = useRef<string[]>([]);
  const appliedPriceRangeRef = useRef<[number, number] | null>(initialAppliedPriceRange);

  // Update refs when state changes
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    appliedCategoriesRef.current = appliedCategories;
  }, [appliedCategories]);

  useEffect(() => {
    appliedPriceRangeRef.current = appliedPriceRange;
  }, [appliedPriceRange]);

  // In-place URL updater: Updates browser query parameters without triggering full page re-render
  const updateUrlInPlace = useCallback(
    (updates: Record<string, string | null>) => {
      if (typeof window === "undefined") return;
      const currentSearchParams = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          currentSearchParams.delete(key);
        } else {
          currentSearchParams.set(key, value);
        }
      });
      currentSearchParams.delete("page");
      const qs = currentSearchParams.toString();
      const currentPath = window.location.pathname;
      const newUrl = qs ? `${currentPath}?${qs}` : currentPath;
      window.history.replaceState(null, "", newUrl);
    },
    []
  );

  // Currency lookup map
  const { user } = useAuth();
  const userId = user?._id ?? user?.id ?? null;
  // Only offers live now and usable by this shopper drive badges, the filter and the offers section
  const visibleOffers = useMemo(() => getVisibleOffers(activeOffers, userId), [activeOffers, userId]);

  const domainCurrencyMap = useMemo(
    () => Object.fromEntries(domains.map((d) => [d._id, d.currency])),
    [domains]
  );

  // Primary active category for hero banners and single-category route views
  const activeCategory = useMemo(() => {
    const list = categories.length > 0 ? categories : categoriesRef.current;
    if (isCategoryRoute) {
      const slug = initialCategorySlug || params?.slug || "";
      if (slug) {
        const clean = decodeURIComponent(slug).trim().toLowerCase();
        return list.find((c) => c._id === slug || c.slug.toLowerCase() === clean) || null;
      }
    }
    if (appliedCategories.length === 1) {
      return list.find((c) => c._id === appliedCategories[0]) || null;
    }
    if (rawCategoryParam && !rawCategoryParam.includes(",")) {
      const clean = decodeURIComponent(rawCategoryParam).trim().toLowerCase();
      return list.find((c) => c._id === rawCategoryParam || c.slug.toLowerCase() === clean) || null;
    }
    return null;
  }, [isCategoryRoute, initialCategorySlug, params?.slug, appliedCategories, rawCategoryParam, categories]);

  // 1. Category Filter Options: 100% stable productCount from backend
  const categoryOptions = useMemo(() => {
    return categories
      .filter((cat) => (cat.productCount ?? 0) > 0)
      .map((cat) => ({
        label: cat.name,
        value: cat._id,
        count: cat.productCount,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  // Available brands derived from currently loaded products
  const brandOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.brand && p.brand.trim() !== "") {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      label: name,
      value: name,
      count,
    }));
  }, [products]);



  const pageHeading = useMemo(() => {
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }
    if (activeCategory) {
      return activeCategory.name;
    }
    if (appliedCategories.length > 1) {
      return `Filtered Groceries (${appliedCategories.length} Categories)`;
    }
    if (appliedOffers) {
      return "Special Offers & Deals";
    }
    return "Shop All";
  }, [searchQuery, activeCategory, appliedCategories.length, appliedOffers]);

  const activeSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "Featured";
  }, [sortBy]);

  // 2. Core Fetch Logic: Exactly ONE products request per action, with sequential race protection
  const executeProductFetch = useCallback(
    async (
      pageToFetch = 1,
      targetCatIds?: string[],
      currentSearch?: string,
      currentPriceRange?: [number, number] | null
    ) => {
      const fetchId = ++currentFetchIdRef.current;
      isFetchingRef.current = true;

      if (pageToFetch === 1) {
        setIsListingLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const queryParams: ProductQueryParams = {
          page: pageToFetch,
          limit: PAGE_SIZE,
          search: currentSearch !== undefined ? currentSearch.trim() || undefined : searchQuery.trim() || undefined,
          sortBy,
        };

        const activeCatIds = targetCatIds !== undefined
          ? targetCatIds
          : appliedCategoriesRef.current;

        const validCatIds = activeCatIds.filter(isValidMongoId);
        if (validCatIds.length > 0) {
          queryParams.categoryId = validCatIds.join(",");
        }

        // Dynamic price range filtering sent directly to backend
        const priceRangeToUse = currentPriceRange !== undefined ? currentPriceRange : appliedPriceRangeRef.current;
        if (priceRangeToUse) {
          queryParams.minPrice = priceRangeToUse[0];
          queryParams.maxPrice = priceRangeToUse[1];
        }

        // Single clean API call (with in-flight deduplication)
        const res = await catalogService.listProducts(queryParams);

        // Ignore stale responses if another fetch was triggered
        if (fetchId !== currentFetchIdRef.current) return;

        // If backend returns minPrice and maxPrice bounds on page 1, sync bounds
        if (pageToFetch === 1 && res.minPrice !== undefined && res.maxPrice !== undefined && res.maxPrice > 0) {
          const min = Math.floor(res.minPrice);
          const max = Math.ceil(res.maxPrice);
          const safeBounds = { min, max: Math.max(max, min + 10) };
          setPriceBounds((prev) => {
            if (prev.min === safeBounds.min && prev.max === safeBounds.max) {
              return prev;
            }
            return safeBounds;
          });
          if (!appliedPriceRangeRef.current) {
            setPendingPriceRange((prev) => {
              if (prev[0] === safeBounds.min && prev[1] === safeBounds.max) {
                return prev;
              }
              if (prev[0] === 0 && prev[1] === 100) {
                return [safeBounds.min, safeBounds.max];
              }
              return prev;
            });
          }
        }

        const fetchedItems = (res.items || []).filter((p) => p.isActive);

        if (pageToFetch === 1) {
          setProducts(fetchedItems);
          setTotalProducts(res.total ?? fetchedItems.length);
          setPage(1);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((i) => i._id));
            const newItems = fetchedItems.filter((i) => !existingIds.has(i._id));
            return [...prev, ...newItems];
          });
          setPage(pageToFetch);
          if (res.total !== undefined) {
            setTotalProducts(res.total);
          }
        }
      } catch (err: unknown) {
        if (fetchId !== currentFetchIdRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load products.");
      } finally {
        if (fetchId === currentFetchIdRef.current) {
          isFetchingRef.current = false;
          setInitialLoading(false);
          setIsListingLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [searchQuery, sortBy]
  );

  // 3. Unified Mount Loader: Fetches metadata and initial products in ONE coordinated pass (no canceled requests!)
  useEffect(() => {
    let isMounted = true;

    async function initializeCatalogAndProducts() {
      try {
        // Fetch categories & domains (deduplicated & cached in catalogService)
        const [catsRes, domainsRes] = await Promise.all([
          catalogService.listCategories(),
          catalogService.listDomains().catch(() => []),
        ]);

        if (!isMounted) return;

        const filteredCats = (catsRes || []).filter((cat) => {
          const s = (cat.slug || "").toLowerCase();
          const n = (cat.name || "").toLowerCase();
          return ![
            "audio",
            "shirt",
            "fashion",
            "men",
            "device",
            "phone",
            "iphone",
            "jewel",
            "ring",
            "gold",
            "wireless",
          ].some((unrelated) => s.includes(unrelated) || n.includes(unrelated));
        });

        setCategories(filteredCats);
        setDomains(domainsRes || []);
        categoriesRef.current = filteredCats;

        const domainIds = [...new Set((domainsRes || []).map((d) => d._id))];
        Promise.all(domainIds.map((domainId) => offersService.listActive(domainId).catch(() => [])))
          .then((offersByDomain) => {
            if (isMounted) setActiveOffers(offersByDomain.flat());
          })
          .catch(() => {});

        // Resolve category IDs from route/searchParams
        let initialCatIds: string[] = [];
        if (rawCategoryParam) {
          const parts = rawCategoryParam.split(",").map((s) => s.trim()).filter(Boolean);
          parts.forEach((part) => {
            if (isValidMongoId(part)) {
              initialCatIds.push(part);
            } else {
              const clean = decodeURIComponent(part).trim().toLowerCase();
              const matched = filteredCats.find(
                (c) => c._id === part || c.slug.toLowerCase() === clean
              );
              if (matched) initialCatIds.push(matched._id);
            }
          });
        }

        setAppliedCategories(initialCatIds);
        setPendingCategories(initialCatIds);
        appliedCategoriesRef.current = initialCatIds;

        // Check URL for minPrice and maxPrice query parameters
        let initialRange: [number, number] | null = null;
        if (minPriceParam !== null && maxPriceParam !== null) {
          const min = Number(minPriceParam);
          const max = Number(maxPriceParam);
          if (!isNaN(min) && !isNaN(max)) {
            initialRange = [min, max];
          }
        }

        // Fetch dynamic price bounds from backend in parallel
        catalogService
          .getPriceRange({ categoryId: initialCatIds.join(",") })
          .then((bounds) => {
            if (bounds && bounds.maxPrice > 0) {
              const min = Math.floor(bounds.minPrice);
              const max = Math.ceil(bounds.maxPrice);
              const safeBounds = { min, max: Math.max(max, min + 10) };
              setPriceBounds((prev) => {
                if (prev.min === safeBounds.min && prev.max === safeBounds.max) {
                  return prev;
                }
                return safeBounds;
              });
              if (!initialRange) {
                setPendingPriceRange((prev) => {
                  if (prev[0] === safeBounds.min && prev[1] === safeBounds.max) {
                    return prev;
                  }
                  if (prev[0] === 0 && prev[1] === 100) {
                    return [safeBounds.min, safeBounds.max];
                  }
                  return prev;
                });
              }
            }
          })
          .catch(() => {});

        // Single clean products call for initial load
        executeProductFetch(1, initialCatIds, searchQuery, initialRange);
      } catch (err: unknown) {
        console.error("Initialization error:", err);
      }
    }

    initializeCatalogAndProducts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount

  // Sync products when URL search parameter changes or is cleared
  const prevSearchQueryRef = useRef(searchQuery);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (prevSearchQueryRef.current !== searchQuery) {
      prevSearchQueryRef.current = searchQuery;
      const targetCatIds = isCategoryRoute
        ? (activeCategory ? [activeCategory._id] : appliedCategoriesRef.current)
        : appliedCategoriesRef.current;
      executeProductFetch(1, targetCatIds, searchQuery, appliedPriceRangeRef.current);
    }
  }, [searchQuery, isCategoryRoute, activeCategory, executeProductFetch]);


  // 4. Infinite Scroll: Load next batch of products on scroll
  const hasMore = useMemo(() => {
    if (initialLoading || isListingLoading) return false;
    if (products.length >= totalProducts && totalProducts > 0) return false;
    return products.length > 0;
  }, [initialLoading, isListingLoading, products.length, totalProducts]);

  const loadMoreProducts = useCallback(() => {
    if (isFetchingRef.current || isLoadingMore || !hasMore) return;
    executeProductFetch(page + 1, appliedCategoriesRef.current);
  }, [executeProductFetch, page, hasMore, isLoadingMore]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMoreProducts,
    hasMore,
    isLoading: isLoadingMore || initialLoading || isListingLoading,
    rootMargin: "350px",
  });

  // 5. Client Filtering for secondary filters (brand, inStock, offers)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Brand filter
      if (
        appliedBrands.length > 0 &&
        (!product.brand || !appliedBrands.includes(product.brand))
      ) {
        return false;
      }

      // In Stock filter
      if (appliedInStock) {
        const stock = product.variants?.[0]?.stock ?? 10;
        if (stock <= 0) return false;
      }

      // Offers filter — products targeted by a currently-active coupon/offer
      if (appliedOffers && !isProductOnOffer(visibleOffers, product)) {
        return false;
      }

      return true;
    });
  }, [products, appliedBrands, appliedInStock, appliedOffers, visibleOffers]);

  // 6. Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "newest") {
      list.reverse();
    }
    return list;
  }, [filteredProducts, sortBy]);

  const isPriceFilterActive = Boolean(
    appliedPriceRange &&
    (appliedPriceRange[0] > priceBounds.min || appliedPriceRange[1] < priceBounds.max)
  );

  const isPriceFilterPending = Boolean(
    pendingPriceRange &&
    (pendingPriceRange[0] > priceBounds.min || pendingPriceRange[1] < priceBounds.max)
  );

  const hasActiveFilters =
    (!isCategoryRoute && appliedCategories.length > 0) ||
    appliedBrands.length > 0 ||
    isPriceFilterActive ||
    appliedInStock ||
    appliedOffers ||
    searchQuery.trim() !== "";

  const hasPendingFilters =
    (!isCategoryRoute && pendingCategories.length > 0) ||
    pendingBrands.length > 0 ||
    isPriceFilterPending ||
    pendingInStock ||
    pendingOffers;

  // Dynamic Quick Category Pills derived 100% from backend data
  const quickCategories = useMemo(() => {
    return [
      { name: "All", slug: "all", id: "" },
      ...categories
        .filter((c) => (c.productCount ?? 0) > 0)
        .slice(0, 10)
        .map((c) => ({
          name: c.name,
          slug: c.slug,
          id: c._id,
        })),
    ];
  }, [categories]);

  // 7. Filter Change Handlers: Stage choices in pending state only (no immediate full re-render)
  const handleCategoryChange = useCallback((values: string[]) => {
    setPendingCategories(values);
  }, []);

  const handleBrandChange = useCallback((values: string[]) => {
    setPendingBrands(values);
  }, []);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setPendingPriceRange(range);
  }, []);

  const handleInStockChange = useCallback((checked: boolean) => {
    setPendingInStock(checked);
  }, []);

  const handleOffersChange = useCallback((checked: boolean) => {
    setPendingOffers(checked);
  }, []);

  // 8. Apply Filters Button: Commits pending filters, updates URL with MongoDB ID(s), and fetches API in-place (SINGLE REQUEST!)
  const handleApplyFilters = useCallback(() => {
    // Check if price range is different from full bounds
    const isPriceChanged =
      pendingPriceRange[0] > priceBounds.min || pendingPriceRange[1] < priceBounds.max;

    const priceToApply = isPriceChanged ? pendingPriceRange : null;

    // Commit pending filters to applied state
    setAppliedCategories(pendingCategories);
    setAppliedBrands(pendingBrands);
    setAppliedPriceRange(priceToApply);
    appliedPriceRangeRef.current = priceToApply;
    setAppliedInStock(pendingInStock);
    setAppliedOffers(pendingOffers);
    appliedCategoriesRef.current = pendingCategories;

    // Update URL query parameters in-place without triggering full Next.js page re-render
    const updates: Record<string, string | null> = {
      brand: pendingBrands.length === 1 ? pendingBrands[0] : null,
      inStock: pendingInStock ? "true" : null,
      offers: pendingOffers ? "true" : null,
      minPrice: priceToApply ? String(priceToApply[0]) : null,
      maxPrice: priceToApply ? String(priceToApply[1]) : null,
    };

    if (!isCategoryRoute) {
      updates.categoryId = pendingCategories.length > 0 ? pendingCategories.join(",") : null;
      updates.category = null;
    }

    updateUrlInPlace(updates);

    // Close mobile filter drawer
    setMobileFilterOpen(false);

    // Fetch product listing in-place (Preserve category on category routes)
    const targetCatIds = isCategoryRoute
      ? (activeCategory ? [activeCategory._id] : appliedCategoriesRef.current)
      : pendingCategories;

    executeProductFetch(1, targetCatIds, undefined, priceToApply);

    // Smooth scroll to product grid
    const gridEl = document.getElementById("products-grid");
    gridEl?.scrollIntoView({ behavior: "smooth" });
  }, [
    pendingCategories,
    pendingBrands,
    pendingPriceRange,
    priceBounds,
    pendingInStock,
    pendingOffers,
    isCategoryRoute,
    activeCategory,
    updateUrlInPlace,
    executeProductFetch,
  ]);

  // 9. Reset All Filters: Clears filters, keeping category intact on category routes
  const handleResetFilters = useCallback(() => {
    const defaultRange: [number, number] = [priceBounds.min, priceBounds.max];
    setPendingPriceRange(defaultRange);
    setAppliedPriceRange(null);
    appliedPriceRangeRef.current = null;
    setPendingBrands([]);
    setAppliedBrands([]);
    setPendingInStock(false);
    setAppliedInStock(false);
    setPendingOffers(false);
    setAppliedOffers(false);

    if (isCategoryRoute) {
      const targetCatIds = activeCategory ? [activeCategory._id] : appliedCategoriesRef.current;
      setPendingCategories(targetCatIds);
      setAppliedCategories(targetCatIds);
      appliedCategoriesRef.current = targetCatIds;
      updateUrlInPlace({ search: null, brand: null, inStock: null, offers: null, minPrice: null, maxPrice: null });
      router.replace(pathname || `/category/${activeCategory?.slug || ""}`);
      executeProductFetch(1, targetCatIds, "", null);
    } else {
      setPendingCategories([]);
      setAppliedCategories([]);
      appliedCategoriesRef.current = [];
      updateUrlInPlace({ search: null, categoryId: null, category: null, brand: null, inStock: null, offers: null, minPrice: null, maxPrice: null });
      router.replace("/products");
      executeProductFetch(1, [], "", null);
    }
  }, [isCategoryRoute, activeCategory, priceBounds, pathname, router, updateUrlInPlace, executeProductFetch]);


  // Unified Dynamic Cart Quantity Hook
  const { getQty, handleAddToCart, handleUpdateQty } = useCartQuantity({
    products,
    domainCurrencyMap,
  });

  // Breadcrumb navigation items
  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Shop All", href: "/products" },
    ];
    if (isCategoryRoute && activeCategory) {
      items.push({
        label: activeCategory.name,
        href: `/category/${encodeURIComponent(activeCategory.slug)}`,
      });
    } else if (activeCategory) {
      items.push({
        label: activeCategory.name,
        href: `/products?categoryId=${encodeURIComponent(activeCategory._id)}`,
      });
    } else if (appliedOffers) {
      items.push({ label: "Offers", href: "/products?offers=true" });
    } else if (searchQuery) {
      items.push({ label: `Search: "${searchQuery}"`, href: "" });
    }
    const lastIdx = items.length - 1;
    return items.map((it, idx) => (idx === lastIdx ? { label: it.label } : it));
  }, [isCategoryRoute, activeCategory, appliedOffers, searchQuery]);

  // Curated dynamic hero presentation data
  const heroData = useMemo(() => {
    if (isCategoryRoute && activeCategory) {
      const defaults = getCategoryHeroDefaults(activeCategory.name || activeCategory.slug);
      return {
        eyebrow: defaults.eyebrow,
        title: activeCategory.name,
        subtitle:
          activeCategory.description || defaults.description,
        image: activeCategory.imageUrl || defaults.fallbackImage || IMAGES.jewelry.heroModel,
        ariaLabel: `${activeCategory.name} Category`,
      };
    }

    if (brandParam) {
      const brandName = brandInfo?.name || brandParam;
      return {
        eyebrow: "EXCLUSIVE BRAND ATELIER",
        title: `${brandName} Collection`,
        subtitle:
          brandInfo?.description ||
          `Explore handcrafted artisanal masterpieces and certified fine jewelry from ${brandName}.`,
        image: brandInfo?.bannerUrl || IMAGES.jewelry.heroModel,
        ariaLabel: `${brandName} Collection`,
      };
    }

    if (appliedOffers) {
      return {
        eyebrow: "EXCLUSIVE PRIVILEGES",
        title: "Special Offers & Privileges",
        subtitle:
          "Discover exceptional privileges and seasonal offerings on certified fine diamonds, gold, and bespoke designs.",
        image: IMAGES.jewelry.designerPromo,
        ariaLabel: "Special Offers",
      };
    }

    if (searchQuery) {
      return {
        eyebrow: "CURATED CATALOGUE",
        title: `Search: "${searchQuery}"`,
        subtitle: `Displaying fine jewelry pieces matching your search inquiry.`,
        image: IMAGES.jewelry.heroModel,
        ariaLabel: `Search results for ${searchQuery}`,
      };
    }

    return {
      eyebrow: "HAUTE JOAILLERIE & BESPOKE CREATIONS",
      title: "All Fine Jewellery",
      subtitle:
        "Explore certified diamond rings, hallmarked 18K and 22K gold, artisanal necklaces, and bespoke fine collections.",
      image: IMAGES.jewelry.heroModel,
      ariaLabel: "All Products Collection",
    };
  }, [isCategoryRoute, activeCategory, brandParam, brandInfo, appliedOffers, searchQuery]);

  useEffect(() => {
    if (!brandParam) return;
    let cancelled = false;
    catalogService
      .listBrands()
      .then((list) => {
        if (cancelled) return;
        const wanted = brandParam.trim().toLowerCase();
        setBrandInfo((list || []).find((b) => b.name.trim().toLowerCase() === wanted) || null);
      })
      .catch(() => !cancelled && setBrandInfo(null));
    return () => {
      cancelled = true;
    };
  }, [brandParam]);

  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        {/* Dynamic Reusable Top Content Card */}
        <TopContentCard
          eyebrow={heroData.eyebrow}
          title={heroData.title}
          subtitle={heroData.subtitle}
          image={heroData.image}
          breadcrumbs={breadcrumbItems}
          badge={
            <span className={styles.headerCountBadge}>
              {totalProducts} {totalProducts === 1 ? "Piece" : "Pieces"} Available
            </span>
          }
          ariaLabel={heroData.ariaLabel}
        />

        <Container size="wide">
          <div className={styles.contentWrapper}>
            <div className={styles.layout}>
            {/* Desktop Filters Sidebar (Constant & Internally Scrollable) */}
            <aside className={styles.sidebar} aria-label="Product filters">
              <ProductFilterSidebar
                showCategoryFilter={!isCategoryRoute}
                categoryOptions={categoryOptions}
                brandOptions={brandOptions}
                priceBounds={priceBounds}
                priceRange={pendingPriceRange}
                currency="£"
                selectedCategories={pendingCategories}
                selectedBrands={pendingBrands}
                inStockOnly={pendingInStock}
                offersOnly={pendingOffers}
                hasActiveFilters={hasPendingFilters || hasActiveFilters}
                onCategoryChange={handleCategoryChange}
                onBrandChange={handleBrandChange}
                onPriceRangeChange={handlePriceRangeChange}
                onInStockChange={handleInStockChange}
                onOffersChange={handleOffersChange}
                onResetFilters={handleResetFilters}
                onApplyFilters={handleApplyFilters}
              />
            </aside>

            {/* Mobile Filters Drawer */}
            <Drawer
              isOpen={mobileFilterOpen}
              onClose={() => {
                setMobileFilterOpen(false);
                // Revert pending choices to applied filters on cancel
                setPendingCategories(appliedCategories);
                setPendingBrands(appliedBrands);
                setPendingPriceRange(
                  appliedPriceRange || [priceBounds.min, priceBounds.max]
                );
                setPendingInStock(appliedInStock);
                setPendingOffers(appliedOffers);
              }}
              title="Filter Products"
              placement="bottom"
            >
              <div className={styles.drawerBody}>
                <ProductFilterSidebar
                  showCategoryFilter={!isCategoryRoute}
                  categoryOptions={categoryOptions}
                  brandOptions={brandOptions}
                  priceBounds={priceBounds}
                  priceRange={pendingPriceRange}
                  currency="£"
                  selectedCategories={pendingCategories}
                  selectedBrands={pendingBrands}
                  inStockOnly={pendingInStock}
                  offersOnly={pendingOffers}
                  hasActiveFilters={hasPendingFilters || hasActiveFilters}
                  onCategoryChange={handleCategoryChange}
                  onBrandChange={handleBrandChange}
                  onPriceRangeChange={handlePriceRangeChange}
                  onInStockChange={handleInStockChange}
                  onOffersChange={handleOffersChange}
                  onResetFilters={handleResetFilters}
                  onApplyFilters={handleApplyFilters}
                />
              </div>
            </Drawer>

            {/* Mobile Sort Drawer */}
            <Drawer
              isOpen={mobileSortOpen}
              onClose={() => setMobileSortOpen(false)}
              title="Sort By"
              placement="bottom"
            >
              <div className={styles.sortDrawerBody}>
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.sortOptionItem} ${
                        isSelected ? styles.sortOptionItemActive : ""
                      }`}
                      onClick={() => {
                        setSortBy(opt.value);
                        updateUrlInPlace({ sort: opt.value });
                        setMobileSortOpen(false);
                      }}
                    >
                      <span className={styles.sortOptionLabel}>{opt.label}</span>
                      <span
                        className={`${styles.sortRadioCircle} ${
                          isSelected ? styles.sortRadioCircleActive : ""
                        }`}
                      >
                        {isSelected && <span className={styles.sortRadioDot} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Drawer>

            {/* Main Product Listing Area (Vertically Scrollable Infinite Feed) */}
            <main className={styles.mainContent}>
              {/* Top Results Bar */}
              <div className={styles.topBar}>
                <div className={styles.titleGroup}>
                  <h1 className={styles.listingTitle}>{pageHeading}</h1>
                  {!initialLoading && !error && (
                    <span className={styles.resultCount}>
                      ({sortedProducts.length}{" "}
                      {totalProducts > sortedProducts.length
                        ? `of ${totalProducts} products`
                        : sortedProducts.length === 1
                        ? "product"
                        : "products"}
                      )
                    </span>
                  )}
                </div>

                <div className={styles.actionsGroup}>
                  <button
                    type="button"
                    className={styles.mobileFilterBtn}
                    onClick={() => setMobileFilterOpen(true)}
                    aria-label="Open filter options"
                  >
                    <FilterIcon size={15} />
                    <span>Filters</span>
                    {hasActiveFilters && <span className={styles.filterDot} />}
                  </button>

                  <SortSelect
                    value={sortBy}
                    onChange={(val) => {
                      setSortBy(val);
                      updateUrlInPlace({ sort: val });
                    }}
                  />
                </div>
              </div>

              {/* 2. Horizontal Quick Category Chips (Only on all products view) */}
              {!isCategoryRoute && (
                <div
                  className={styles.categoryChipsRow}
                  role="tablist"
                  aria-label="Quick Category Filter"
                >
                  {quickCategories.map((chip) => {
                    const isAll = chip.slug === "all";
                    const isActive = isAll
                      ? appliedCategories.length === 0
                      : appliedCategories.includes(chip.id);

                    return (
                      <button
                        key={chip.slug}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`${styles.chipItem} ${
                          isActive ? styles.chipItemActive : ""
                        }`}
                        onClick={() => {
                          if (isAll) {
                            setPendingCategories([]);
                            setAppliedCategories([]);
                            appliedCategoriesRef.current = [];
                            updateUrlInPlace({ categoryId: null, category: null });
                            executeProductFetch(1, []);
                          } else {
                            const newCats = [chip.id];
                            setPendingCategories(newCats);
                            setAppliedCategories(newCats);
                            appliedCategoriesRef.current = newCats;
                            updateUrlInPlace({ categoryId: chip.id, category: null });
                            executeProductFetch(1, newCats);
                          }
                        }}
                      >
                        {chip.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div
                  className={styles.activeChipsContainer}
                  aria-label="Active filters"
                >
                  {searchQuery && (
                    <span className={styles.filterChip}>
                      <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                      <button
                        type="button"
                        className={styles.chipRemoveBtn}
                        onClick={() => {
                          updateUrlInPlace({ search: null });
                          const targetCatIds = isCategoryRoute
                            ? (activeCategory ? [activeCategory._id] : appliedCategoriesRef.current)
                            : appliedCategories;
                          router.replace(isCategoryRoute ? (pathname || "/products") : "/products");
                          executeProductFetch(1, targetCatIds, "", appliedPriceRangeRef.current);
                        }}

                        aria-label={`Remove search filter for ${searchQuery}`}
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  )}

                  {!isCategoryRoute &&
                    appliedCategories.map((catId) => {
                      const cat = categories.find((c) => c._id === catId);
                      const label = cat ? cat.name : catId;
                      return (
                        <span key={catId} className={styles.filterChip}>
                          <span>Category: {label}</span>
                          <button
                            type="button"
                            className={styles.chipRemoveBtn}
                            onClick={() => {
                              const newCats = appliedCategories.filter((id) => id !== catId);
                              setPendingCategories(newCats);
                              setAppliedCategories(newCats);
                              appliedCategoriesRef.current = newCats;
                              updateUrlInPlace({
                                categoryId: newCats.length > 0 ? newCats.join(",") : null,
                                category: null,
                              });
                              executeProductFetch(1, newCats);
                            }}
                            aria-label={`Remove category filter for ${label}`}
                          >
                            <CloseIcon size={12} />
                          </button>
                        </span>
                      );
                    })}

                  {appliedBrands.map((brand) => (
                    <span key={brand} className={styles.filterChip}>
                      <span>Brand: {brand}</span>
                      <button
                        type="button"
                        className={styles.chipRemoveBtn}
                        onClick={() => {
                          const newBrands = appliedBrands.filter((b) => b !== brand);
                          setPendingBrands(newBrands);
                          setAppliedBrands(newBrands);
                          updateUrlInPlace({
                            brand: newBrands.length === 1 ? newBrands[0] : null,
                          });
                        }}
                        aria-label={`Remove brand filter for ${brand}`}
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  ))}

                  {isPriceFilterActive && appliedPriceRange && (
                    <span className={styles.filterChip}>
                      <span>
                        Price: £{appliedPriceRange[0]} — £{appliedPriceRange[1]}
                      </span>
                      <button
                        type="button"
                        className={styles.chipRemoveBtn}
                        onClick={() => {
                          setAppliedPriceRange(null);
                          appliedPriceRangeRef.current = null;
                          setPendingPriceRange([priceBounds.min, priceBounds.max]);
                          updateUrlInPlace({ minPrice: null, maxPrice: null });
                          const targetCatIds = isCategoryRoute
                            ? (activeCategory ? [activeCategory._id] : appliedCategoriesRef.current)
                            : appliedCategories;
                          executeProductFetch(1, targetCatIds, undefined, null);
                        }}
                        aria-label="Remove price filter"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  )}

                  {appliedInStock && (
                    <span className={styles.filterChip}>
                      <span>In Stock Only</span>
                      <button
                        type="button"
                        className={styles.chipRemoveBtn}
                        onClick={() => {
                          setPendingInStock(false);
                          setAppliedInStock(false);
                          updateUrlInPlace({ inStock: null });
                        }}
                        aria-label="Remove in-stock filter"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  )}

                  {appliedOffers && (
                    <span className={styles.filterChip}>
                      <span>Special Offers</span>
                      <button
                        type="button"
                        className={styles.chipRemoveBtn}
                        onClick={() => {
                          setPendingOffers(false);
                          setAppliedOffers(false);
                          updateUrlInPlace({ offers: null });
                        }}
                        aria-label="Remove offers filter"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    className={styles.clearChipsBtn}
                    onClick={handleResetFilters}
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {appliedOffers && !initialLoading && !error && (
                <OffersSection offers={visibleOffers} currencyByDomain={domainCurrencyMap} />
              )}

              {/* 3. Products Infinite Feed Grid: Exact Original Responsive Grid */}
              <div id="products-grid" tabIndex={-1}>
                {initialLoading || isListingLoading ? (
                  <div className={styles.grid} aria-label="Loading products">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : error ? (
                  <EmptyState
                    title="Unable to load products"
                    description={error}
                    action={
                      <Button onClick={() => executeProductFetch(1)}>
                        Try Again
                      </Button>
                    }
                  />
                ) : sortedProducts.length === 0 ? (
                  <EmptyState
                    title="No products found"
                    description={
                      hasActiveFilters
                        ? "We couldn't find any products matching your active filters or search criteria."
                        : "There are currently no products available in this section. Please check back soon!"
                    }
                    action={
                      hasActiveFilters ? (
                        <Button onClick={handleResetFilters}>Clear Filters</Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <>
                    <div className={styles.grid} role="region" aria-label="Products catalog">
                      {sortedProducts.map((p) => {
                        const bestOffer = findBestDisplayOffer(visibleOffers, p);
                        const comparePrice = getComparePrice(p, bestOffer);

                        return (
                          <ProductCard
                            key={p._id}
                            id={p._id}
                            name={p.name}
                            {...variantCardProps(p)}
                            comparePrice={comparePrice}
                            offerLabel={getProductOfferLabel(visibleOffers, p, domainCurrencyMap[p.domainId])}
                            currency={domainCurrencyMap[p.domainId] || "GBP"}
                            image={getGroceryProductImage(p)}
                            brand={p.brand}
                            weight={getProductWeight(p)}
                            
                            isWishlisted={wishlistedIds.includes(p._id)}
                            cartQty={getQty(p._id)}
                            onAddToCart={handleAddToCart}
                            onUpdateQty={handleUpdateQty}
                            onToggleWishlist={(id) => toggleWishlist(id, p)}
                          />
                        );
                      })}
                    </div>

                    {/* Infinite Scroll Bottom Sentinel */}
                    <div
                      ref={sentinelRef}
                      className={styles.infiniteScrollSentinel}
                      aria-hidden="true"
                    />

                    {/* Next Batch Skeletons */}
                    {isLoadingMore && (
                      <div className={styles.infiniteLoaderRow} aria-live="polite">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <ProductCardSkeleton key={`more-skeleton-${i}`} />
                        ))}
                      </div>
                    )}

                    {/* End of Products Indicator */}
                    {!hasMore && sortedProducts.length > 0 && (
                      <div className={styles.endOfListMessage}>
                        <p>
                          You&apos;ve viewed all {sortedProducts.length}{" "}
                          {sortedProducts.length === 1 ? "product" : "products"}
                        </p>
                        <button
                          type="button"
                          className={styles.backToTopBtn}
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          ↑ Back to top
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>

          {/* Mobile Bottom Fixed Floating Filter & Sort Bar */}
          <div
            className={styles.mobileBottomActionBar}
            role="toolbar"
            aria-label="Filters and Sorting"
          >
            <button
              type="button"
              className={styles.mobileActionBtn}
              onClick={() => setMobileSortOpen(true)}
              aria-label="Open sorting options"
            >
              <SortIcon size={16} />
              <span className={styles.mobileActionText}>
                Sort: <strong>{activeSortLabel}</strong>
              </span>
            </button>

            <div className={styles.mobileActionDivider} aria-hidden="true" />

            <button
              type="button"
              className={styles.mobileActionBtn}
              onClick={() => setMobileFilterOpen(true)}
              aria-label="Open filter options"
            >
              <FilterIcon size={16} />
              <span className={styles.mobileActionText}>Filters</span>
              {hasActiveFilters && <span className={styles.mobileFilterBadge} />}
            </button>
          </div>
        </div>
      </Container>
    </div>
  </StoreLayout>
  );
}

export function ProductsView(props: ProductsViewProps) {
  return (
    <Suspense
      fallback={
        <StoreLayout>
          <Container size="wide">
            <div style={{ padding: "40px 0" }}>
              <div
                style={{
                  height: "200px",
                  background: "#F3EFE9",
                  borderRadius: "16px",
                  marginBottom: "24px",
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </Container>
        </StoreLayout>
      }
    >
      <ProductsViewContent {...props} />
    </Suspense>
  );
}
