"use client";

import { useRef } from "react";
import Link from "next/link";
import { ProductCard, ProductCardSkeleton } from "../ProductCard";
import { ArrowLeftIcon, ArrowRightIcon } from "../../icons";
import { EmptyState } from "../../ui/EmptyState";
import type { ProductRailProps } from "./types";
import styles from "./ProductRail.module.css";

export function ProductRail({
  title,
  subtitle,
  viewAllHref,
  products,
  loading = false,
  emptyText = "No products available in this section.",
  onAddToCart,
  onUpdateQty,
  onToggleWishlist,
  className = "",
}: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  return (
    <section className={`${styles.rail} ${className}`} aria-label={title}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <div className={styles.actionsArea}>
          {viewAllHref && (
            <Link href={viewAllHref} prefetch={false} className={styles.viewAllLink}>
              <span>View All</span>
              <ArrowRightIcon size={14} />
            </Link>
          )}

          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={scrollLeft}
              aria-label={`Previous items in ${title}`}
            >
              <ArrowLeftIcon size={16} />
            </button>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={scrollRight}
              aria-label={`Next items in ${title}`}
            >
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.carouselContainer}>
        {loading ? (
          <div className={styles.track}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.cardItem}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No items" description={emptyText} />
        ) : (
          <div className={styles.track} ref={trackRef}>
            {products.map((product) => (
              <div key={product.id} className={styles.cardItem}>
                <ProductCard
                  {...product}
                  onAddToCart={onAddToCart}
                  onUpdateQty={onUpdateQty}
                  onToggleWishlist={onToggleWishlist}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
