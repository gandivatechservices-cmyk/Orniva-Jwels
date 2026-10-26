"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Manufacturing", href: "/manufacturing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Header({ onOpenCart }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const { productIds } = useWishlist();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mounted, setMounted] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* LEFT: LUXE JWELS LOGO */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logoLink} aria-label="LUXE JWELS Home">
            <AtlasLogo height={32} />
          </Link>
        </div>

        {/* CENTER: PRIMARY JEWELRY NAVIGATION */}
        <nav className={styles.centerNav} aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: ACTION CONTROLS (SEARCH, ACCOUNT, WISHLIST, BASKET) */}
        <div className={styles.actions}>
          {/* 1. SEARCH TRIGGER & EXPANDABLE DRAWER */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className={`${styles.iconActionBtn} ${showSearch ? styles.actionBtnActive : ""}`}
              aria-label="Search jewelry collections"
              title="Search"
            >
              <SearchIcon size={20} className={styles.actionIcon} />
            </button>

            {showSearch && (
              <div className={styles.searchDropdown}>
                <div className={styles.searchDropdownHeader}>
                  <span className={styles.searchDropdownTitle}>Search LUXE JWELS</span>
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className={styles.closeSearchBtn}
                    aria-label="Close search"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
                <SearchAutocomplete variant="desktop" />
              </div>
            )}
          </div>

          {/* 2. ACCOUNT */}
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
                <UserIcon size={20} className={styles.actionIcon} />
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
                <UserIcon size={20} className={styles.actionIcon} />
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

          {/* 3. WISHLIST */}
          <Link
            href="/wishlist"
            prefetch={false}
            className={styles.iconActionBtn}
            aria-label={`Wishlist, ${mounted ? productIds.length : 0} items`}
            title="Wishlist"
          >
            <div className={styles.iconBadgeWrapper}>
              <HeartIcon size={20} className={styles.actionIcon} />
              {mounted && productIds.length > 0 && (
                <span className={styles.wishlistCountBadge}>{productIds.length}</span>
              )}
            </div>
          </Link>

          {/* 4. SHOPPING CART */}
          <button
            type="button"
            onClick={onOpenCart ? onOpenCart : () => router.push("/cart")}
            className={styles.basketBtn}
            aria-label={`Cart with ${mounted ? totalItems : 0} items, total ${mounted && totalPrice > 0 ? formatMoney(totalPrice) : "£0.00"}`}
            title="Shopping Cart"
          >
            <div className={styles.iconBadgeWrapper}>
              <CartIcon size={20} className={styles.basketCartIcon} />
              {mounted && totalItems > 0 && (
                <span className={styles.cartCountPill}>{totalItems}</span>
              )}
            </div>
            <span className={styles.basketTitle}>Cart</span>
            {mounted && totalPrice > 0 && (
              <span className={styles.basketPrice}>{formatMoney(totalPrice)}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}


