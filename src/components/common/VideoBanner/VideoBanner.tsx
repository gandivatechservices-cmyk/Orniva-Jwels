"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "components/icons";
import styles from "./VideoBanner.module.css";

export type VideoBannerProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Background video (mp4/webm). When missing, the image is used instead. */
  videoSrc?: string;
  /** Background image, also used as the video's poster. */
  imageSrc: string;
  imageAlt?: string;
  ctaText?: string;
  ctaHref?: string;
  /** Short highlights shown along the bottom (e.g. the stages of your process). */
  steps?: string[];
  className?: string;
};

/** Full-width cinematic banner. Plays a muted looping video when given one, otherwise a slow zoom image. */
export function VideoBanner({
  eyebrow,
  title,
  subtitle,
  videoSrc,
  imageSrc,
  imageAlt = "",
  ctaText,
  ctaHref,
  steps = [],
  className = "",
}: VideoBannerProps) {
  const ref = useRef<HTMLElement>(null);

  // Parallax drift + fade-in when the banner scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      el.style.setProperty("--shift", `${(progress - 0.5) * 80}px`);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    if (!reduce) {
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-visible", "true");
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <section ref={ref} className={`${styles.banner} ${className}`} aria-label={title}>
      <div className={styles.media}>
        {videoSrc ? (
          <video
            className={styles.bg}
            src={videoSrc}
            poster={imageSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={imageAlt} className={`${styles.bg} ${styles.kenBurns}`} loading="lazy" />
        )}
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {ctaText && ctaHref && (
            <Link href={ctaHref} className={styles.cta}>
              <span>{ctaText}</span>
              <ArrowRightIcon size={15} aria-hidden="true" />
            </Link>
          )}
        </div>

      </div>

      {steps.length > 0 && (
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step} className={styles.step} style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
              <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.stepName}>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
