"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AtlasLogo,
  SearchIcon,
  UserIcon,
  HeartIcon,
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
} from "components/icons";
import { SearchAutocomplete } from "components/common/SearchAutocomplete";
import { useAuth, useCart, useWishlist } from "hooks";
import { formatMoney } from "utility/formatMoney";
import styles from "./Header.module.css";

export type HeaderProps = {
  onOpenCart?: () => void;
};

export function Header({ onOpenCart }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const { productIds } = useWishlist();

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [mounted, setMounted] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* LEFT: BRAND LOGO */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logoLink} aria-label="Atlas Grocery Home">
            <AtlasLogo height={32} />
          </Link>
        </div>

        {/* CENTER: LARGE PROMINENT SEARCH */}
        <div className={styles.searchSection}>
          <SearchAutocomplete variant="desktop" />
        </div>


        {/* RIGHT: ACTION CONTROLS (ACCOUNT, WISHLIST, BASKET) */}
        <div className={styles.actions}>
          {/* 1. ACCOUNT */}
          <div className={styles.accountWrapper} ref={accountRef}>
            {mounted && isAuthenticated ? (
              <button
                type="button"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className={`${styles.iconActionBtn} ${showAccountMenu ? styles.actionBtnActive : ""}`}
                aria-label={`My Account (${user?.name})`}
                aria-expanded={showAccountMenu}
                title={user?.name || "Account"}
              >
                <UserIcon size={21} className={styles.actionIcon} />
                <ChevronDownIcon
                  size={12}
                  className={`${styles.accountChevron} ${showAccountMenu ? styles.chevronRotated : ""}`}
                />
              </button>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className={styles.iconActionBtn}
                aria-label="Sign In to Account"
                title="Sign In"
              >
                <UserIcon size={21} className={styles.actionIcon} />
              </Link>
            )}

            {mounted && showAccountMenu && isAuthenticated && (
              <div className={styles.accountMenu}>
                <div className={styles.accountHeader}>
                  <strong className={styles.userName}>{user?.name}</strong>
                  <span className={styles.userEmail}>{user?.email}</span>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    prefetch={false}
                    className={styles.menuItem}
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Admin Console
                  </Link>
                )}
                <Link
                  href="/orders"
                  prefetch={false}
                  className={styles.menuItem}
                  onClick={() => setShowAccountMenu(false)}
                >
                  My Orders
                </Link>
                <Link
                  href="/wishlist"
                  prefetch={false}
                  className={styles.menuItem}
                  onClick={() => setShowAccountMenu(false)}
                >
                  My Wishlist ({mounted ? productIds.length : 0})
                </Link>
                <Link
                  href="/account"
                  prefetch={false}
                  className={styles.menuItem}
                  onClick={() => setShowAccountMenu(false)}
                >
                  Account Settings
                </Link>
                <div className={styles.menuDivider} />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowAccountMenu(false);
                    router.push("/");
                  }}
                  className={`${styles.menuItem} ${styles.dangerItem}`}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* 2. WISHLIST */}
          <Link
            href="/wishlist"
            prefetch={false}
            className={styles.iconActionBtn}
            aria-label={`Wishlist, ${mounted ? productIds.length : 0} items`}
            title="Wishlist"
          >
            <div className={styles.iconBadgeWrapper}>
              <HeartIcon size={21} className={styles.actionIcon} />
              {mounted && productIds.length > 0 && (
                <span className={styles.wishlistCountBadge}>{productIds.length}</span>
              )}
            </div>
          </Link>

          {/* 3. BASKET (PRIMARY EMPHASIS) */}
          <button
            type="button"
            onClick={onOpenCart ? onOpenCart : () => router.push("/cart")}
            className={styles.basketBtn}
            aria-label={`Basket with ${mounted ? totalItems : 0} items, total ${mounted && totalPrice > 0 ? formatMoney(totalPrice) : "£0.00"}`}
          >
            <CartIcon size={21} className={styles.basketCartIcon} />
            <div className={styles.basketTextGroup}>
              <span className={styles.basketTitle}>Basket</span>
              <span className={styles.basketPrice}>
                {mounted && totalPrice > 0 ? formatMoney(totalPrice) : "£0.00"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}


