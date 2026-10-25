"use client";

import Link from "next/link";
import { Skeleton } from "../../ui/Skeleton";
import { LeafIcon } from "../../icons";
import type { CategoryTileProps } from "./types";
import styles from "./CategoryTile.module.css";

export function CategoryTile({
  id,
  name,
  image,
  icon,
  itemCount,
  href,
  isActive = false,
  loading = false,
  onClick,
  className = "",
}: CategoryTileProps) {
  if (loading) {
    return <CategoryTileSkeleton className={className} />;
  }

  const destination = href || `/products?categoryId=${id}`;

  const content = (
    <>
      <div className={styles.imageWrapper}>
        {icon ? (
          <div className={styles.iconContainer}>{icon}</div>
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className={styles.image} loading="lazy" />
        ) : (
          <LeafIcon size={28} style={{ color: "var(--color-primary)" }} />
        )}
      </div>
      <span className={styles.name} title={name}>
        {name}
      </span>
      {itemCount !== undefined && (
        <span className={styles.count}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.tile} ${isActive ? styles.active : ""} ${className}`}
        onClick={() => onClick(id)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={destination}
      prefetch={false}
      className={`${styles.tile} ${isActive ? styles.active : ""} ${className}`}
    >
      {content}
    </Link>
  );
}

export function CategoryTileSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonTile} ${className}`}>
      <Skeleton width="64px" height="64px" variant="circular" />
      <Skeleton width="56px" height="14px" />
      <Skeleton width="40px" height="10px" />
    </div>
  );
}
