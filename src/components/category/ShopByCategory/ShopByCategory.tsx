"use client";

import Link from "next/link";
import { CategoryCard, CategoryCardSkeleton } from "../CategoryCard";
import { ArrowRightIcon } from "components/icons";
import { getCategoryVisual } from "components/icons/categoryIconMap";
import type { Category } from "utility/services";
import styles from "./ShopByCategory.module.css";

export type ShopByCategoryProps = {
  title?: string;
  subtitle?: string;
  viewAllText?: string;
  viewAllHref?: string;
  categories: Category[];
  limit?: number;
  loading?: boolean;
  error?: string | null;
  activeCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  className?: string;
};

export function ShopByCategory({
  title = "Shop by Category",
  subtitle = "Everything you need, all in one place",
  viewAllText = "View All",
  viewAllHref = "/categories",
  categories = [],
  limit = 5,
  loading = false,
  error = null,
  activeCategoryId,
  onSelectCategory,
  className = "",
}: ShopByCategoryProps) {
  // Limit to top 5 categories on homepage if limit is provided
  const displayCategories = limit && limit > 0 ? categories.slice(0, limit) : categories;

  return (
    <section className={`${styles.section} ${className}`} aria-label={title}>
      {/* SECTION HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTitles}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} prefetch={false} className={styles.viewAllBtn}>
            <span>{viewAllText}</span>
            <ArrowRightIcon size={14} className={styles.viewAllArrow} aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* 5-COLUMN CATEGORY GRID */}
      <div className={styles.categoryGrid} role="region" aria-label="Category list">
        {loading ? (
          Array.from({ length: limit || 5 }).map((_, index) => (
            <CategoryCardSkeleton key={index} />
          ))
        ) : error ? (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        ) : displayCategories.length === 0 ? (
          <div className={styles.emptyMessage}>
            No categories available at the moment.
          </div>
        ) : (
          displayCategories.map((category) => {
            const visual = getCategoryVisual(category.slug, category.name);
            const isActive = activeCategoryId === category._id;
            // Image comes from category record, falling back gracefully to jewelry visual asset if missing
            const resolvedImage = category.imageUrl || visual.fallbackImage || undefined;

            return (
              <CategoryCard
                key={category._id}
                id={category._id}
                name={category.name}
                slug={category.slug}
                image={resolvedImage}
                icon={resolvedImage ? undefined : visual.icon}
                bgTint={visual.bgTint}
                isPopular={visual.isPopular}
                isActive={isActive}
                onClick={onSelectCategory}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

