"use client";

import Link from "next/link";
import { Skeleton } from "../../ui/Skeleton";
import type { BrandChipProps } from "./types";
import styles from "./BrandChip.module.css";

export function BrandChip({
  id,
  name,
  logo,
  itemCount,
  isActive = false,
  href,
  onClick,
  loading = false,
  className = "",
}: BrandChipProps) {
  if (loading) {
    return <BrandChipSkeleton className={className} />;
  }

  const destination = href || `/products?brand=${encodeURIComponent(name)}`;

  const content = (
    <>
      {logo && (
        <div className={styles.logoWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={name} className={styles.logo} loading="lazy" />
        </div>
      )}
      <span>{name}</span>
      {itemCount !== undefined && (
        <span className={styles.count}>({itemCount})</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.chip} ${isActive ? styles.active : ""} ${className}`}
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
      className={`${styles.chip} ${isActive ? styles.active : ""} ${className}`}
    >
      {content}
    </Link>
  );
}

export function BrandChipSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonChip} ${className}`}>
      <Skeleton width="24px" height="24px" variant="circular" />
      <Skeleton width="64px" height="14px" />
    </div>
  );
}
