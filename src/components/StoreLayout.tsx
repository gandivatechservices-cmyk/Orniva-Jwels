"use client";

import type { ReactNode } from "react";
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

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <TopAnnouncementBar message="Free Delivery on Orders Over £40 | UK Wide" />
      <div className={styles.stickyHeaderArea}>
        <Header />
        <MobileHeader />
      </div>
      <main className={styles.main}>{children}</main>
      <Footer />
      <MobileBottomNav />
      <BackToTop />
      <AuthModal />
    </div>
  );
}
