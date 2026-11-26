"use client";

import Link from "next/link";
import { memo } from "react";
import { IMAGES } from "../../../constants/images";
import type { TopContentCardProps } from "./types";
import styles from "./TopContentCard.module.css";

export const TopContentCard = memo(function TopContentCard({
  eyebrow,
  title,
  subtitle,
  image = IMAGES.jewelry.heroModel,
  imageAlt,
  breadcrumbs,
  badge,
  actions,
  ariaLabel,
  className = "",
  children,
  align = "center",
  size = "md",
  variant = "split",
}: TopContentCardProps) {
  const computedAriaLabel =
    ariaLabel || (typeof title === "string" ? title : "Hero Banner");

  const renderBreadcrumbs = () =>
    breadcrumbs && breadcrumbs.length > 0 ? (
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        {breadcrumbs.map((b, idx) => (
          <span key={idx} className={styles.breadcrumbItem}>
            {b.href ? (
              <Link href={b.href} className={styles.breadcrumbLink}>
                {b.label}
              </Link>
            ) : (
              <span className={styles.breadcrumbCurrent}>{b.label}</span>
            )}
            {idx < breadcrumbs.length - 1 && <span className={styles.breadcrumbSeparator}>/</span>}
          </span>
        ))}
      </nav>
    ) : null;

  if (variant === "split") {
    return (
      <section className={`${styles.heroSplit} ${className}`} aria-label={computedAriaLabel}>
        <div className={styles.splitContent}>
          <div className={styles.splitTop}>{renderBreadcrumbs()}</div>
          <div className={styles.splitBody}>
            {eyebrow && <span className={styles.splitEyebrow}>{eyebrow}</span>}
            <h1 className={styles.splitTitle}>{title}</h1>
            {subtitle && <p className={styles.splitSubtitle}>{subtitle}</p>}
            {(badge || actions) && (
              <div className={styles.splitMeta}>
                {badge}
                {actions}
              </div>
            )}
            {children}
          </div>
        </div>
        <div className={styles.splitMedia}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt || (typeof title === "string" ? title : "Hero Image")}
            className={styles.splitImage}
            loading="eager"
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.heroBanner} ${styles[size]} ${className}`}
      aria-label={computedAriaLabel}
    >
      {/* Background Photography */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={imageAlt || (typeof title === "string" ? title : "Hero Background")}
        className={styles.heroBg}
      />

      {/* Luxury Dark Radial Gradient Overlay */}
      <div className={styles.heroOverlay} />

      {/* Hero Foreground Content */}
      <div className={`${styles.heroContent} ${styles[align]}`}>
        {/* Optional Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((b, idx) => (
              <span key={idx} className={styles.breadcrumbItem}>
                {b.href ? (
                  <Link href={b.href} className={styles.breadcrumbLink}>
                    {b.label}
                  </Link>
                ) : (
                  <span className={styles.breadcrumbCurrent}>{b.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className={styles.breadcrumbSeparator}>/</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Optional Eyebrow */}
        {eyebrow && <span className={styles.heroEyebrow}>{eyebrow}</span>}

        {/* Main Title */}
        <h1 className={styles.heroTitle}>{title}</h1>

        {/* Optional Subtitle */}
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}

        {/* Optional Badge & Actions Row */}
        {(badge || actions) && (
          <div className={styles.metaRow}>
            {badge}
            {actions}
          </div>
        )}

        {/* Optional Children */}
        {children}
      </div>
    </section>
  );
});
