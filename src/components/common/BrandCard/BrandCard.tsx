"use client";

import Link from "next/link";
import styles from "./BrandCard.module.css";

export type BrandCardProps = {
  id: string;
  name: string;
  logo?: string;
  href?: string;
  className?: string;
};

export function BrandCard({
  name,
  logo,
  href,
  className = "",
}: BrandCardProps) {
  const destination = href || `/products?brand=${encodeURIComponent(name)}`;

  return (
    <Link href={destination} prefetch={false} className={`${styles.card} ${className}`} aria-label={`Brand: ${name}`}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} className={styles.logo} loading="lazy" />
      ) : (
        <span className={styles.brandText}>{name}</span>
      )}
    </Link>
  );
}
