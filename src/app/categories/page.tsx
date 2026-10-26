"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "components/StoreLayout";
import { Container } from "components/layout/Container";
import { Breadcrumb } from "components/ui/Breadcrumb";
import { Button } from "components/ui/Button";
import { CategoryCard, CategoryCardSkeleton } from "components/category/CategoryCard";
import { IMAGES } from "constants/images";
import {
  DiamondIcon,
  SparklesIcon,
  TagIcon,
  SearchIcon,
  ArrowRightIcon,
} from "components/icons";
import { catalogService, type Category } from "utility/services";
import styles from "./categories.module.css";

interface DynamicCategoryGroup {
  root: Category;
  items: Category[];
}

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
        // Single dynamic API call to catalogService — results are deduplicated & cached
        const data = await catalogService.listCategories();
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load categories from server."
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

  // 1. Identify Root Categories dynamically from backend (type === 'root' or parentCategoryId is null)
  const rootCategories = useMemo(() => {
    return categories.filter((c) => c.type === "root" || !c.parentCategoryId);
  }, [categories]);

  // 2. Build purely dynamic hierarchy based on parentCategoryId from backend API
  const dynamicGroups = useMemo<DynamicCategoryGroup[]>(() => {
    if (categories.length === 0) return [];

    // Map parentCategoryId -> child categories
    const childrenByParent = new Map<string, Category[]>();
    categories.forEach((cat) => {
      if (cat.parentCategoryId) {
        const list = childrenByParent.get(cat.parentCategoryId) || [];
        list.push(cat);
        childrenByParent.set(cat.parentCategoryId, list);
      }
    });

    const groups: DynamicCategoryGroup[] = [];
    const assignedIds = new Set<string>();

    rootCategories.forEach((root) => {
      assignedIds.add(root._id);

      // Collect direct subcategories
      const directChildren = childrenByParent.get(root._id) || [];
      directChildren.forEach((c) => assignedIds.add(c._id));

      // Collect deeper sub-subcategories if any exist
      const allDescendants: Category[] = [...directChildren];
      directChildren.forEach((child) => {
        const grandChildren = childrenByParent.get(child._id) || [];
        grandChildren.forEach((gc) => {
          assignedIds.add(gc._id);
          allDescendants.push(gc);
        });
      });

      // Include all categories in this department (root + child subcategories)
      const departmentItems: Category[] =
        allDescendants.length > 0 ? [root, ...allDescendants] : [root];

      groups.push({
        root,
        items: departmentItems,
      });
    });

    // Collect any orphan categories whose parentId doesn't match known roots
    const unassigned = categories.filter((c) => !assignedIds.has(c._id));
    if (unassigned.length > 0) {
      groups.push({
        root: {
          _id: "other",
          name: "Other Categories",
          slug: "other",
          type: "root",
          domainId: "",
        },
        items: unassigned,
      });
    }

    return groups;
  }, [categories, rootCategories]);

  // 3. Dynamic client-side filtering for instant search & department tab selection
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return dynamicGroups
      .filter((group) => {
        if (selectedDepartmentId === "all") return true;
        return group.root._id === selectedDepartmentId;
      })
      .map((group) => {
        if (!q) return group;
        const matchingItems = group.items.filter((item) => {
          const nameMatch = item.name.toLowerCase().includes(q);
          const slugMatch = (item.slug || "").toLowerCase().includes(q);
          return nameMatch || slugMatch;
        });
        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [dynamicGroups, searchQuery, selectedDepartmentId]);

  const totalVisibleCategories = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.items.length, 0);
  }, [filteredGroups]);

  return (
    <StoreLayout>
      <Container>
        <main className={styles.pageContainer}>
          {/* BREADCRUMB NAVIGATION */}
          <div className={styles.breadcrumbRow}>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "All Categories" },
              ]}
            />
          </div>

          {/* PAGE HERO HEADER */}
          <header className={styles.headerCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.jewelry.categories.necklaces} alt="" className={styles.headerImage} aria-hidden="true" />
            <div className={styles.headerShade} aria-hidden="true" />
            <div className={styles.headerContent}>
              <div className={styles.eyebrowBadge}>
                <DiamondIcon size={13} className={styles.eyebrowIcon} />
                <span>Our Collections</span>
              </div>
              <h1 className={styles.title}>All Categories</h1>
              <p className={styles.description}>
                Rings, necklaces, earrings and more, each crafted with certified gold and hand-selected stones.
              </p>
            </div>

            <div className={styles.headerMeta}>
              {!loading && categories.length > 0 && (
                <div className={styles.metaChip}>
                  <TagIcon size={14} className={styles.metaChipIcon} />
                  <span>
                    <strong>{categories.length}</strong> Categories in{" "}
                    <strong>{rootCategories.length}</strong> Departments
                  </span>
                </div>
              )}
              <div className={styles.metaChip}>
                <SparklesIcon size={14} className={styles.metaChipIcon} />
                <span>100% Quality Checked</span>
              </div>
            </div>
          </header>

          {/* ERROR ALERT IF OCCURRED */}
          {error && (
            <div className={styles.errorCard} role="alert">
              <p>{error}</p>
              <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* DYNAMIC SEARCH & DEPARTMENT CONTROLS */}
          {!loading && categories.length > 0 && (
            <div className={styles.controlsBar}>
              <div className={styles.searchWrap}>
                <SearchIcon size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Filter categories by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Filter categories by name"
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

              {/* Dynamic Department Pills */}
              <div
                className={styles.departmentPills}
                role="tablist"
                aria-label="Filter by department"
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
                  All Departments{" "}
                  <span className={styles.pillBadge}>({categories.length})</span>
                </button>

                {rootCategories.map((root) => {
                  const group = dynamicGroups.find((g) => g.root._id === root._id);
                  const count = group ? group.items.length : 1;
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

          {/* LOADING STATE */}
          {loading ? (
            Array.from({ length: 3 }).map((_, sectionIdx) => (
              <section key={sectionIdx} className={styles.groupSection} aria-hidden="true">
                <div className={styles.groupHeader}>
                  <div className={styles.groupTitleArea}>
                    <div
                      style={{
                        width: "160px",
                        height: "24px",
                        background: "#F3EFE9",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                </div>
                <div className={styles.categoryGrid}>
                  {Array.from({ length: 5 }).map((_, cardIdx) => (
                    <CategoryCardSkeleton key={cardIdx} />
                  ))}
                </div>
              </section>
            ))
          ) : filteredGroups.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>No categories match your search</h3>
              <p className={styles.emptyStateDesc}>
                We couldn&apos;t find any categories matching &ldquo;{searchQuery}&rdquo;. Try another
                keyword or clear the search.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartmentId("all");
                }}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            /* DYNAMIC CATEGORY GROUPS RENDERED 100% FROM BACKEND DATA */
            filteredGroups.map(({ root, items }) => (
              <section
                key={root._id}
                className={styles.groupSection}
                aria-label={`${root.name} Department`}
              >
                <div className={styles.groupHeader}>
                  <div className={styles.groupTitleArea}>
                    <h2 className={styles.groupTitle}>
                      <span>{root.name}</span>
                      <span className={styles.groupBadge}>
                        {items.length} {items.length === 1 ? "category" : "categories"}
                      </span>
                    </h2>
                    <p className={styles.groupDesc}>
                      Explore all {root.name.toLowerCase()} products and essentials.
                    </p>
                  </div>

                  {root.slug && root._id !== "other" && (
                    <Link
                      href={`/category/${encodeURIComponent(root.slug)}`}
                      className={styles.viewAllLink}
                    >
                      <span>Shop All {root.name}</span>
                      <ArrowRightIcon size={13} aria-hidden="true" />
                    </Link>
                  )}
                </div>

                <div
                  className={styles.categoryGrid}
                  role="region"
                  aria-label={`${root.name} items`}
                >
                  {items.map((cat) => (
                    <CategoryCard
                      key={cat._id}
                      id={cat._id}
                      name={cat.name}
                      slug={cat.slug}
                      image={cat.imageUrl}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </Container>
    </StoreLayout>
  );
}
