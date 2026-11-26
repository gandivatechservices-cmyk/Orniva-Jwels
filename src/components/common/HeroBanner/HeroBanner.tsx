"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { IMAGES } from "constants/images";
import styles from "./HeroBanner.module.css";

export type HeroBannerProps = {
  eyebrowText?: string;
  title?: ReactNode;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function HeroBanner({
  eyebrowText,
  title,
  subtitle = "Premium jewellery for every moment. Tradition. Craftsmanship. Forever.",
  primaryCtaText = "Shop Now",
  primaryCtaHref = "/products",
  secondaryCtaText = "Watch Video",
  secondaryCtaHref = "/manufacturing",
  imageSrc = IMAGES.jewelry.heroModel,
  imageAlt = "Model wearing luxury diamond necklace and earrings",
  className = "",
}: HeroBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Subtle parallax: the image drifts slower than the page while the hero scrolls away.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.min(window.scrollY, el.offsetHeight);
      el.style.setProperty("--hero-shift", `${y * 0.25}px`);
      el.style.setProperty("--hero-fade", String(Math.max(0, 1 - y / (el.offsetHeight * 0.7))));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      data-hero
      className={`${styles.heroSection} ${className}`}
      aria-label="Luxury Jewelry Hero"
    >
      {/* FULL-BLEED BACKGROUND IMAGE */}
      <div className={styles.heroMedia}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={imageAlt} className={styles.heroImage} loading="eager" />
      </div>
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.heroContent}>
          {eyebrowText && <span className={styles.eyebrow}>{eyebrowText}</span>}

          <h1 className={styles.heroTitle}>
            {title || (
              <>
                <span>Timeless Elegance,</span>
                <span>Crafted for You</span>
              </>
            )}
          </h1>

          {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}

          <div className={styles.heroActions}>
            {primaryCtaText && primaryCtaHref && (
              <Link href={primaryCtaHref} prefetch={false} className={styles.primaryBtn}>
                {primaryCtaText}
              </Link>
            )}

            {secondaryCtaText && secondaryCtaHref && (
              <Link href={secondaryCtaHref} prefetch={false} className={styles.secondaryBtn}>
                <span className={styles.playCircle} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="7 4 20 12 7 20 7 4" />
                  </svg>
                </span>
                <span>{secondaryCtaText}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
