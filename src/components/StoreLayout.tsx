"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  TopAnnouncementBar,
  Header,
  MobileHeader,
  Footer,
  MobileBottomNav,
} from "./layout";
import { AuthModal } from "./common/AuthModal";
import { BackToTop } from "./common/BackToTop";
import styles from "./StoreLayout.module.css";

type HeaderMode = "transparent" | "solid" | "hidden";

export function StoreLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<HeaderMode>("transparent");

  // Home only: header floats over the hero, turns solid after it, and
  // hides on scroll-down / reveals on scroll-up.
  useEffect(() => {
    if (!isHome) return;
    const page = pageRef.current;
    const header = headerRef.current;
    if (!page || !header) return;

    let lastY = window.scrollY;
    let ticking = false;
    let heroBottom = 0;

    const measure = () => {
      const main = page.querySelector("main");
      const hero = page.querySelector<HTMLElement>("[data-hero]");
      const mainTop = main ? main.getBoundingClientRect().top + window.scrollY : 0;
      page.style.setProperty("--hero-offset", `${mainTop}px`);
      page.style.setProperty("--header-h", `${header.offsetHeight}px`);
      heroBottom = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0;
    };

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const passedHero = y > heroBottom - header.offsetHeight - 8;
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      setMode((prev) => {
        if (!passedHero) return y > 24 ? "solid" : "transparent";
        if (goingDown) return "hidden";
        if (goingUp) return "solid";
        return prev === "transparent" ? "solid" : prev;
      });
      if (goingDown || goingUp) lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [isHome]);

  return (
    <div className={styles.page} ref={pageRef}>
      <TopAnnouncementBar message="Free Delivery on Orders Over £40 | UK Wide" />
      <div
        className={isHome ? styles.overlayHeaderArea : styles.stickyHeaderArea}
        data-header-mode={isHome ? mode : undefined}
      >
        <div className={isHome ? styles.overlayHeaderInner : undefined} ref={headerRef}>
          <Header />
          <MobileHeader />
        </div>
      </div>
      <main className={styles.main}>{children}</main>
      <Footer />
      <MobileBottomNav />
      <BackToTop />
      <AuthModal />
    </div>
  );
}
