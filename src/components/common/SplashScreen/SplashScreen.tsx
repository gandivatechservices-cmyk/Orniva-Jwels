"use client";

import { useEffect, useState } from "react";
import { loadHomeData } from "utility/homeData";
import styles from "./SplashScreen.module.css";

const SEEN_KEY = "orniva-splash";
const MIN_VISIBLE_MS = 2200;
const MAX_WAIT_MS = 7000;
const EXIT_MS = 1100;

type Phase = "show" | "leaving" | "gone";

/** Data the storefront needs on first paint. It is stored in memory, so the home page shows it with no extra request. */
const REQUIRED_DATA: Array<() => Promise<unknown>> = [() => loadHomeData()];

const facets = [
  "M30 10 L42 38", "M60 10 L42 38", "M60 10 L78 38", "M90 10 L78 38",
  "M5 38 L60 92", "M42 38 L60 92", "M78 38 L60 92", "M115 38 L60 92",
];

export function SplashScreen({ brand = "Orniva Jewels", tagline = "Timeless Elegance" }: { brand?: string; tagline?: string }) {
  const [phase, setPhase] = useState<Phase>("show");
  const [done, setDone] = useState(0);

  useEffect(() => {
    let alive = true;
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SEEN_KEY);
    } catch {
      /* storage unavailable: show the splash */
    }

    if (seen) {
      Promise.resolve().then(() => alive && setPhase("gone"));
      return () => {
        alive = false;
      };
    }

    document.body.style.overflow = "hidden";
    const started = Date.now();

    const run = async () => {
      const tasks = REQUIRED_DATA.map((load) =>
        load()
          .catch(() => undefined)
          .finally(() => alive && setDone((n) => n + 1))
      );
      const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
      await Promise.race([Promise.all(tasks), timeout]);

      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - started));
      await new Promise((resolve) => setTimeout(resolve, wait));
      if (!alive) return;

      setPhase("leaving");
      document.body.style.overflow = "";
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      await new Promise((resolve) => setTimeout(resolve, EXIT_MS));
      if (alive) setPhase("gone");
    };
    run();

    return () => {
      alive = false;
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "gone") return null;

  const progress = Math.round((done / REQUIRED_DATA.length) * 100);

  return (
    <div
      className={`orniva-splash ${styles.splash} ${phase === "leaving" ? styles.leaving : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`${brand} is loading`}
    >
      <span className={`${styles.curtain} ${styles.curtainTop}`} aria-hidden="true" />
      <span className={`${styles.curtain} ${styles.curtainBottom}`} aria-hidden="true" />

      <div className={styles.glow} aria-hidden="true" />
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className={styles.dust}
          style={{
            left: `${(i * 37 + 8) % 100}%`,
            top: `${(i * 53 + 12) % 100}%`,
            animationDelay: `${(i % 7) * 0.45}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }}
          aria-hidden="true"
        />
      ))}

      <div className={styles.center}>
        <div className={styles.gemWrap}>
          <svg className={styles.gem} viewBox="0 0 120 100" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="splashGold" x1="5" y1="10" x2="115" y2="92" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#F6E3B0" />
                <stop offset="0.5" stopColor="#C5A16B" />
                <stop offset="1" stopColor="#8E662F" />
              </linearGradient>
              <clipPath id="splashClip">
                <polygon points="30 10 90 10 115 38 60 92 5 38" />
              </clipPath>
            </defs>

            <polygon className={styles.gemFill} points="30 10 90 10 115 38 60 92 5 38" fill="url(#splashGold)" />

            <g stroke="url(#splashGold)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
              <polygon className={styles.draw} pathLength={1} points="30 10 90 10 115 38 60 92 5 38" style={{ animationDelay: "0.1s" }} />
              <path className={styles.draw} pathLength={1} d="M5 38 L115 38" style={{ animationDelay: "0.5s" }} />
              {facets.map((d, i) => (
                <path key={d} className={styles.draw} pathLength={1} d={d} style={{ animationDelay: `${0.7 + i * 0.1}s` }} />
              ))}
            </g>

            <g clipPath="url(#splashClip)">
              <rect className={styles.shine} x="-40" y="0" width="28" height="100" fill="#fff" />
            </g>
          </svg>

          <span className={`${styles.spark} ${styles.spark1}`} aria-hidden="true" />
          <span className={`${styles.spark} ${styles.spark2}`} aria-hidden="true" />
          <span className={`${styles.spark} ${styles.spark3}`} aria-hidden="true" />
        </div>

        <h1 className={styles.brand} aria-hidden="true">
          {brand.toUpperCase().split("").map((ch, i) => (
            <span key={i} className={styles.letter} style={{ animationDelay: `${1.4 + i * 0.05}s` }}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
        <p className={styles.tagline}>{tagline}</p>

        <div className={styles.bar} aria-hidden="true">
          <span className={styles.barFill} style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>
      </div>
    </div>
  );
}
