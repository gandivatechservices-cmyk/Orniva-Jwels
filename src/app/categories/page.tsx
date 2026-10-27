"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreLayout } from "components/StoreLayout";
import { Container } from "components/layout/Container";
import { TopContentCard } from "components/common/TopContentCard";
import { Button } from "components/ui/Button";
import { CollectionCard, CollectionCardSkeleton } from "components/category/CollectionCard";
import { SearchIcon } from "components/icons";
import { catalogService, type Category } from "utility/services";
import { IMAGES } from "constants/images";
import styles from "./categories.module.css";

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);
        const data = await catalogService.listCategories();
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load collections from server."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Identify Root Categories (type === 'root' or parentCategoryId is null)
  const rootCategories = useMemo(() => {
    const roots = categories.filter((c) => c.type === "root" || !c.parentCategoryId);
    return roots.length > 0 ? roots : categories;
  }, [categories]);

  // 2. Map subcategories to their parents
  const subcategoriesByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories.forEach((cat) => {
      if (cat.parentCategoryId) {
        const list = map.get(cat.parentCategoryId) || [];
        list.push(cat);
        map.set(cat.parentCategoryId, list);
      }
    });
    return map;
  }, [categories]);

  // 3. Dynamic client-side filtering for instant search & department tab selection
  const filteredCategories = useMemo(() => {
    let list = rootCategories;

    if (selectedDepartmentId !== "all") {
      list = list.filter((c) => c._id === selectedDepartmentId);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const slugMatch = (item.slug || "").toLowerCase().includes(q);
        const subs = subcategoriesByParent.get(item._id) || [];
        const subMatch = subs.some((s) => s.name.toLowerCase().includes(q));
        return nameMatch || slugMatch || subMatch;
      });
    }

    return list;
  }, [rootCategories, selectedDepartmentId, searchQuery, subcategoriesByParent]);

  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        <TopContentCard
          eyebrow="FINE JEWELLERY DIRECTORY"
          title="All Collections"
          subtitle="Discover our certified diamond solitaires, bridal necklaces, handcrafted bangles, and bespoke fine jewelry collections."
          image={IMAGES.jewelry.designerPromo}
          imageAlt="All Fine Jewelry Collections"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "All Categories" },
          ]}
          badge={
            !loading && categories.length > 0 ? (
              <span className={styles.countBadge}>
                {rootCategories.length} Handcrafted Collections
              </span>
            ) : undefined
          }
          ariaLabel="All Collections"
        />

        <Container>
          <main className={styles.mainWrapper}>
            {/* ERROR ALERT IF OCCURRED */}
            {error && (
              <div className={styles.errorCard} role="alert">
                <p>{error}</p>
                <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            )}

            {/* SEARCH & DEPARTMENT CONTROLS */}
            {!loading && categories.length > 0 && (
              <div className={styles.controlsBar}>
                <div className={styles.searchWrap}>
                  <SearchIcon size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search collections by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                    aria-label="Search collections by name"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className={styles.clearSearchBtn}
                      aria-label="Clear filter"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Department Pills */}
                <div
                  className={styles.departmentPills}
                  role="tablist"
                  aria-label="Filter by collection"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedDepartmentId === "all"}
                    onClick={() => setSelectedDepartmentId("all")}
                    className={`${styles.departmentPill} ${
                      selectedDepartmentId === "all" ? styles.departmentPillActive : ""
                    }`}
                  >
                    All Collections{" "}
                    <span className={styles.pillBadge}>({rootCategories.length})</span>
                  </button>

                  {rootCategories.map((root) => {
                    const subs = subcategoriesByParent.get(root._id) || [];
                    const count = subs.length > 0 ? subs.length + 1 : 1;
                    const isActive = selectedDepartmentId === root._id;

                    return (
                      <button
                        key={root._id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedDepartmentId(root._id)}
                        className={`${styles.departmentPill} ${
                          isActive ? styles.departmentPillActive : ""
                        }`}
                      >
                        {root.name} <span className={styles.pillBadge}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RESULTS SUMMARY */}
            {!loading && !error && (
              <div className={styles.summaryRow}>
                <p className={styles.summaryCount}>
                  Showing {filteredCategories.length}{" "}
                  {filteredCategories.length === 1 ? "collection" : "collections"}
                </p>
              </div>
            )}

            {/* LOADING SKELETON STATE */}
            {loading ? (
              <div className={styles.categoryGrid} aria-hidden="true">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <CollectionCardSkeleton key={idx} />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyStateTitle}>No collections match your search</h3>
                <p className={styles.emptyStateDesc}>
                  We couldn&apos;t find any collections matching &ldquo;{searchQuery}&rdquo;. Try
                  another keyword or clear your filter.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartmentId("all");
                  }}
                >
                  Clear Filter
                </Button>
              </div>
            ) : (
              /* LUXURY COLLECTION CARDS GRID */
              <div
                className={styles.categoryGrid}
                role="region"
                aria-label="All Jewelry Collections"
              >
                {filteredCategories.map((cat) => {
                  const subs = (subcategoriesByParent.get(cat._id) || []).map((s) => ({
                    id: s._id,
                    name: s.name,
                    slug: s.slug,
                  }));

                  return (
                    <CollectionCard
                      key={cat._id}
                      id={cat._id}
                      name={cat.name}
                      slug={cat.slug}
                      image={cat.imageUrl}
                      description={cat.description}
                      subcategories={subs}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </Container>
      </div>
    </StoreLayout>
  );
}
