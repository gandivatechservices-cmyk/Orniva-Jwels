"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import {
  SearchIcon,
  CloseIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "components/icons";
import { ShoppingBasketIcon } from "components/icons/category";
import { catalogService, type SearchSuggestionsResult, type SearchSuggestionProduct } from "utility/services/catalog";
import { useRecentSearches } from "hooks/useRecentSearches";
import { formatMoney } from "utility/formatMoney";
import styles from "./SearchAutocomplete.module.css";

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={styles.productThumbnailFallback}>
        <ShoppingBasketIcon size={22} className={styles.fallbackIcon} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={44}
      height={44}
      className={styles.thumbnailImg}
      unoptimized
      onError={() => setHasError(true)}
    />
  );
}


export interface SearchAutocompleteProps {
  variant?: "desktop" | "mobile";
  placeholder?: string;
  onSearchSubmit?: () => void;
  className?: string;
}


type NavigableItem =
  | { type: "recent"; value: string }
  | { type: "popular"; value: string }
  | { type: "category"; id: string; name: string; slug: string }
  | { type: "brand"; name: string }
  | { type: "product"; product: SearchSuggestionProduct }
  | { type: "see_all"; query: string };

function SearchAutocompleteContent({
  variant = "desktop",
  placeholder = "Search groceries, brands & more...",
  onSearchSubmit,
  className = "",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResult | null>(null);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRequestIdRef = useRef(0);

  // Load popular tags 100% dynamically from backend database
  useEffect(() => {
    let isMounted = true;
    catalogService
      .getPopularSearches()
      .then((tags) => {
        if (isMounted && Array.isArray(tags) && tags.length > 0) {
          setPopularTags(tags);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync input value when URL search param changes or clears
  // Runs only when the URL value changes, never while the user is typing.
  const urlQuery = searchParams?.get("search") || "";
  useEffect(() => {
    queueMicrotask(() => setQuery(urlQuery));
  }, [urlQuery]);


  // Close dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  // Debounced search suggestions fetch with race-condition protection (no network cancellations)
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!trimmed) {
      queueMicrotask(() => {
        setSuggestions(null);
        setIsLoading(false);
        setHighlightedIndex(-1);
      });
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      const requestId = ++latestRequestIdRef.current;
      setIsLoading(true);
      try {
        const res = await catalogService.getSearchSuggestions(trimmed);
        if (requestId === latestRequestIdRef.current) {
          setSuggestions(res);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        if (requestId === latestRequestIdRef.current) {
          console.error("Search suggestions fetch failed:", err);
          setSuggestions(null);
        }
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);


  // Execute full text search
  const executeSearch = useCallback(
    (searchTerm: string) => {
      const clean = searchTerm.trim();
      if (!clean) return;

      addSearch(clean);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();

      if (onSearchSubmit) {
        onSearchSubmit();
      }

      router.push(`/products?search=${encodeURIComponent(clean)}`);
    },
    [addSearch, onSearchSubmit, router]
  );

  // Handle direct navigation to product
  const handleSelectProduct = useCallback(
    (product: SearchSuggestionProduct) => {
      if (product.name) {
        addSearch(product.name);
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();

      if (onSearchSubmit) {
        onSearchSubmit();
      }

      router.push(`/products/${product._id}`);
    },
    [addSearch, onSearchSubmit, router]
  );

  // Handle category suggestion click
  const handleSelectCategory = useCallback(
    (cat: { _id: string; name: string; slug: string }) => {
      addSearch(cat.name);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();

      if (onSearchSubmit) {
        onSearchSubmit();
      }

      router.push(`/products?categoryId=${cat._id}`);
    },
    [addSearch, onSearchSubmit, router]
  );

  // Handle brand suggestion click
  const handleSelectBrand = useCallback(
    (brandName: string) => {
      addSearch(brandName);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();

      if (onSearchSubmit) {
        onSearchSubmit();
      }

      router.push(`/products?brand=${encodeURIComponent(brandName)}`);
    },
    [addSearch, onSearchSubmit, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && navigableItems[highlightedIndex]) {
      handleItemSelection(navigableItems[highlightedIndex]);
    } else {
      executeSearch(query);
    }
  };

  // Compile navigable items for keyboard navigation
  const navigableItems: NavigableItem[] = [];
  const trimmed = query.trim();

  if (!trimmed) {
    recentSearches.forEach((term) => navigableItems.push({ type: "recent", value: term }));
    popularTags.forEach((term) => navigableItems.push({ type: "popular", value: term }));
  } else if (suggestions) {
    suggestions.categories.forEach((c) =>
      navigableItems.push({ type: "category", id: c._id, name: c.name, slug: c.slug })
    );
    suggestions.brands.forEach((b) => navigableItems.push({ type: "brand", name: b }));
    suggestions.products.forEach((p) => navigableItems.push({ type: "product", product: p }));
    navigableItems.push({ type: "see_all", query: trimmed });
  }


  const handleItemSelection = (item: NavigableItem) => {
    switch (item.type) {
      case "recent":
      case "popular":
        setQuery(item.value);
        executeSearch(item.value);
        break;
      case "category":
        handleSelectCategory({ _id: item.id, name: item.name, slug: item.slug });
        break;
      case "brand":
        handleSelectBrand(item.name);
        break;
      case "product":
        handleSelectProduct(item.product);
        break;
      case "see_all":
        executeSearch(item.query);
        break;
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < navigableItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : navigableItems.length - 1
      );
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Highlight query occurrences in text
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim() || !text) return text;
    const escaped = q.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === q.trim().toLowerCase() ? (
        <mark key={i} className={styles.highlight}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const hasSuggestions =
    suggestions &&
    (suggestions.products.length > 0 ||
      suggestions.categories.length > 0 ||
      suggestions.brands.length > 0);

  const trimmedQuery = query.trim();

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${variant === "mobile" ? styles.mobileContainer : ""} ${className}`}
    >
      <form onSubmit={handleSubmit} className={styles.form} role="search">
        <SearchIcon size={variant === "mobile" ? 17 : 18} className={styles.searchIcon} />

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          role="combobox"
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-controls="search-autocomplete-dropdown"
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
        />

        {isLoading && (
          <div className={styles.loadingSpinner} aria-label="Searching...">
            <span className={styles.spinner} />
          </div>
        )}

        {query && !isLoading && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setQuery("");
              setSuggestions(null);
              inputRef.current?.focus();
            }}
            aria-label="Clear search query"
          >
            <CloseIcon size={12} />
          </button>
        )}

        {variant === "desktop" && (
          <button type="submit" className={styles.submitBtn} aria-label="Submit Search">
            Search
          </button>
        )}
      </form>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div id="search-autocomplete-dropdown" className={styles.dropdown} role="listbox">
          {/* 1. EMPTY QUERY STATE: RECENT SEARCHES & POPULAR TAGS */}
          {!trimmedQuery && (
            <div className={styles.initialContent}>
              {/* RECENT SEARCHES */}
              {recentSearches.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      <ClockIcon size={14} className={styles.sectionIcon} />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAll}
                      className={styles.clearAllBtn}
                    >
                      Clear all
                    </button>
                  </div>

                  <ul className={styles.recentList}>
                    {recentSearches.map((term, index) => {
                      const isHighlighted = highlightedIndex === index;
                      return (
                        <li
                          key={term}
                          className={`${styles.recentItem} ${
                            isHighlighted ? styles.highlighted : ""
                          }`}
                        >
                          <button
                            type="button"
                            className={styles.recentBtn}
                            onClick={() => {
                              setQuery(term);
                              executeSearch(term);
                            }}
                          >
                            <ClockIcon size={13} className={styles.itemIcon} />
                            <span className={styles.itemText}>{term}</span>
                          </button>
                          <button
                            type="button"
                            className={styles.deleteRecentBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSearch(term);
                            }}
                            aria-label={`Remove ${term} from recent searches`}
                          >
                            <CloseIcon size={11} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* DYNAMIC POPULAR SEARCH TAGS FROM BACKEND */}
              {popularTags.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      <SparklesIcon size={14} className={styles.sectionIcon} />
                      <span>Popular Groceries</span>
                    </div>
                  </div>

                  <div className={styles.tagsGrid}>
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.tagBadge}
                        onClick={() => {
                          setQuery(tag);
                          executeSearch(tag);
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. ACTIVE QUERY STATE: MATCHING CATEGORIES, BRANDS, PRODUCTS */}
          {trimmedQuery && (
            <div className={styles.resultsContent}>
              {/* CATEGORIES CHIPS */}
              {suggestions && suggestions.categories.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.categoryChips}>
                    <span className={styles.chipLabel}>Categories:</span>
                    {suggestions.categories.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        className={styles.categoryChip}
                        onClick={() => handleSelectCategory(cat)}
                      >
                        {highlightMatch(cat.name, trimmedQuery)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BRANDS CHIPS */}
              {suggestions && suggestions.brands.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.brandChips}>
                    <span className={styles.chipLabel}>Brands:</span>
                    {suggestions.brands.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        className={styles.brandChip}
                        onClick={() => handleSelectBrand(brand)}
                      >
                        {highlightMatch(brand, trimmedQuery)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCTS LIST */}
              {suggestions && suggestions.products.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitleText}>Suggested Products</span>
                  </div>

                  <ul className={styles.productList}>
                    {suggestions.products.map((product) => {
                      const imageSrc =
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : "/assets/images/placeholder.png";

                      return (
                        <li key={product._id} className={styles.productItem}>
                          <button
                            type="button"
                            className={styles.productRowBtn}
                            onClick={() => handleSelectProduct(product)}
                          >
                            <div className={styles.productThumbnail}>
                              <ProductThumbnail src={imageSrc} alt={product.name} />
                            </div>


                            <div className={styles.productInfo}>
                              <span className={styles.productName}>
                                {highlightMatch(product.name, trimmedQuery)}
                              </span>

                              <div className={styles.productMeta}>
                                {product.brand && (
                                  <span className={styles.productBrand}>
                                    {product.brand}
                                  </span>
                                )}
                                {product.category && (
                                  <span className={styles.productCategory}>
                                    {product.category.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={styles.productPricing}>
                              <span className={styles.price}>
                                {formatMoney(product.basePrice)}
                              </span>
                              {product.mrp && product.mrp > product.basePrice && (
                                <span className={styles.mrp}>
                                  {formatMoney(product.mrp)}
                                </span>
                              )}
                            </div>

                            <ArrowRightIcon size={14} className={styles.rowArrow} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* NO RESULTS FOUND STATE */}
              {!isLoading && suggestions && !hasSuggestions && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>
                    No groceries found for &quot;{trimmedQuery}&quot;
                  </p>
                  <p className={styles.emptySubtitle}>
                    Try checking for typos or search for general essentials like &quot;bread&quot;, &quot;milk&quot;, or &quot;snacks&quot;.
                  </p>
                  {popularTags.length > 0 && (
                    <div className={styles.fallbackTags}>
                      {popularTags.slice(0, 5).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={styles.tagBadge}
                          onClick={() => {
                            setQuery(tag);
                            executeSearch(tag);
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEE ALL FOOTER ACTION */}
              <div className={styles.footerAction}>
                <button
                  type="button"
                  className={styles.seeAllBtn}
                  onClick={() => executeSearch(query)}
                >
                  <span>
                    See all results for &quot;<strong>{trimmedQuery}</strong>&quot;
                  </span>
                  <ArrowRightIcon size={15} />
                </button>
                <div className={styles.keyboardHints}>
                  <span>Press <strong>Enter</strong> to search</span>
                  <span>•</span>
                  <span><strong>Esc</strong> to close</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SearchAutocomplete(props: SearchAutocompleteProps) {
  return (
    <Suspense fallback={null}>
      <SearchAutocompleteContent {...props} />
    </Suspense>
  );
}
