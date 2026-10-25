"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CartIcon, HeartIcon, UserIcon } from "components/icons";
import { useAuth, useCart, useWishlist } from "hooks";
import type { MobileBottomNavProps } from "./types";
import styles from "./MobileBottomNav.module.css";

export function MobileBottomNav({ onOpenCart, className = "" }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { productIds } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthed = mounted && isAuthenticated;

  return (
    <nav className={`${styles.bottomNav} ${className}`} aria-label="Mobile navigation">
      {/* 1. HOME */}
      <Link
        href="/"
        prefetch={false}
        className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}
      >
        <div className={styles.iconWrap}>
          <HomeIcon size={20} />
        </div>
        <span className={styles.label}>Home</span>
      </Link>

      {/* 2. BASKET */}
      {onOpenCart ? (
        <button
          type="button"
          onClick={onOpenCart}
          className={`${styles.navItem} ${pathname === "/cart" ? styles.active : ""}`}
        >
          <div className={styles.iconWrap}>
            <CartIcon size={20} />
            {mounted && totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </div>
          <span className={styles.label}>Basket</span>
        </button>
      ) : (
        <Link
          href="/cart"
          prefetch={false}
          className={`${styles.navItem} ${pathname === "/cart" ? styles.active : ""}`}
        >
          <div className={styles.iconWrap}>
            <CartIcon size={20} />
            {mounted && totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </div>
          <span className={styles.label}>Basket</span>
        </Link>
      )}

      {/* 3. WISHLIST */}
      <Link
        href="/wishlist"
        prefetch={false}
        className={`${styles.navItem} ${pathname === "/wishlist" ? styles.active : ""}`}
      >
        <div className={styles.iconWrap}>
          <HeartIcon size={20} />
          {mounted && productIds.length > 0 && <span className={styles.badge}>{productIds.length}</span>}
        </div>
        <span className={styles.label}>Wishlist</span>
      </Link>

      {/* 4. ACCOUNT */}
      <Link
        href={isAuthed ? "/account" : "/login"}
        prefetch={false}
        className={`${styles.navItem} ${
          pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register")
            ? styles.active
            : ""
        }`}
      >
        <div className={styles.iconWrap}>
          <UserIcon size={20} />
        </div>
        <span className={styles.label}>Account</span>
      </Link>
    </nav>
  );
}
