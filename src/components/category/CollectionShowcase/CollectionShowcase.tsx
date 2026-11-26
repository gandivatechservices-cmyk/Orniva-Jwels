"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "components/icons";
import { getCategoryVisual } from "components/icons/categoryIconMap";
import { Reveal } from "components/common/Reveal";
import type { Category } from "utility/services";
import styles from "./CollectionShowcase.module.css";

export type CollectionShowcaseProps = {
  title?: string;
  subtitle?: string;
  viewAllText?: string;
  viewAllHref?: string;
  categories: Category[];
  /** How many collections to show (the first one is the large feature tile). */
  limit?: number;
  loading?: boolean;
  error?: string | null;
  className?: string;
};

/** Feature tile + 5 small tiles; the odd last one spans the full width, like the loaded grid. */
const SKELETON_COUNT = 6;

const pad = (n: number) => String(n).padStart(2, "0");

function Tile({ category, index, feature }: { category: Category; index: number; feature: boolean }) {
  const visual = getCategoryVisual(category.slug, category.name);
  const primary = category.imageUrl || visual.fallbackImage || "";
  const [src, setSrc] = useState(primary);
  const count = category.productCount;
  const label = typeof count === "number" ? `${count} ${count === 1 ? "Piece" : "Pieces"}` : "Collection";

  return (
    <Link
      href={`/category/${category.slug}`}
      prefetch={false}
      className={`${styles.tile} ${feature ? styles.tileFeature : ""}`}
      aria-label={`${category.name}, ${label}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={styles.image}
          loading={index < 2 ? "eager" : "lazy"}
          onError={() => visual.fallbackImage && src !== visual.fallbackImage && setSrc(visual.fallbackImage)}
        />
      ) : (
        <span className={styles.imageFallback} aria-hidden="true" />
      )}
      <span className={styles.shade} aria-hidden="true" />

      <span className={styles.caption}>
        <span className={styles.text}>
          <span className={styles.eyebrow}>
            {pad(index + 1)} / {label}
          </span>
          <span className={styles.name}>{category.name}</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">
          <ArrowRightIcon size={14} />
        </span>
      </span>
    </Link>
  );
}

/** Bento-style "Explore the collection" grid: one large feature tile and smaller category tiles. */
export function CollectionShowcase({
  title = "Explore the collection",
  subtitle = "Discover our exquisite collections",
  viewAllText = "View all collections",
  viewAllHref = "/categories",
  categories = [],
  limit = 6,
  loading = false,
  error = null,
  className = "",
}: CollectionShowcaseProps) {
  const items = limit > 0 ? categories.slice(0, limit) : categories;
  const small = Math.max(0, items.length - 1);
  const rows = Math.max(1, Math.ceil(small / 2));
  const oddLast = small > 1 && small % 2 === 1;

  return (
    <section className={`${styles.section} ${className}`} aria-label={title}>
      <Reveal>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} prefetch={false} className={styles.viewAll}>
              <span>{viewAllText}</span>
              <ArrowRightIcon size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </Reveal>

      {loading ? (
        <div className={styles.grid} style={{ "--rows": 3 } as CSSProperties} aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className={`${styles.skeleton} ${i === 0 ? styles.tileFeature : ""} ${i === SKELETON_COUNT - 1 ? styles.skeletonWide : ""}`} />
          ))}
        </div>
      ) : error ? (
        <p className={styles.message} role="alert">{error}</p>
      ) : items.length === 0 ? (
        <p className={styles.message}>No collections available at the moment.</p>
      ) : (
        <div className={styles.grid} style={{ "--rows": rows } as CSSProperties}>
          {items.map((category, i) => (
            <Reveal
              key={category._id}
              delay={Math.min(i, 6) * 0.09}
              className={`${styles.cell} ${i === 0 ? styles.cellFeature : ""} ${oddLast && i === items.length - 1 ? styles.cellWide : ""}`}
            >
              <Tile category={category} index={i} feature={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
