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
  ArrowRightIcon,
  CloseIcon,
} from "components/icons";
import { SearchAutocomplete } from "components/common/SearchAutocomplete";
import { useAuth, useCart, useWishlist } from "hooks";
import { formatMoney } from "utility/formatMoney";
import styles from "./Header.module.css";

export type HeaderProps = {
  onOpenCart?: () => void;
};

/** Text on the menu dropdown trigger next to the logo. */
const MENU_LABEL = "Discover";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/categories" },
  { label: "Shop", href: "/products" },
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
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const activeLink = NAV_LINKS.find((link) => isLinkActive(link.href));

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowMenu(false);
        setShowAccountMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className={styles.header}>
      {/* 1. TOP MAIN ROW: LOGO, CENTER SEARCH BAR, ACTIONS */}
      <div className={styles.container}>
        {/* LEFT: ORNIVA JEWELS LOGO */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logoLink} aria-label="ORNIVA JEWELS Home">
            <AtlasLogo height={32} />
          </Link>

          {/* MENU: text dropdown next to the logo */}
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              type="button"
              className={`${styles.menuTrigger} ${showMenu ? styles.menuTriggerOpen : ""}`}
              onClick={() => setShowMenu((open) => !open)}
              aria-haspopup="true"
              aria-expanded={showMenu}
              aria-controls="header-menu-panel"
            >
              <span>{MENU_LABEL}</span>
              <ChevronDownIcon size={14} className={styles.menuChevron} />
            </button>

            {showMenu && (
              <nav id="header-menu-panel" className={styles.menuPanel} aria-label="Main Navigation">
                {NAV_LINKS.map((link, i) => {
                  const isActive = link === activeLink;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`${styles.menuLink} ${isActive ? styles.menuLinkActive : ""}`}
                      style={{ animationDelay: `${0.03 + i * 0.04}s` }}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setShowMenu(false)}
                    >
                      <span>{link.label}</span>
                      <ArrowRightIcon size={13} className={styles.menuLinkArrow} aria-hidden="true" />
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* CENTER: LARGE PROMINENT SEARCH BAR */}
        <div className={styles.searchSection}>
          <SearchAutocomplete variant="desktop" />
        </div>

        {/* RIGHT: ACTION CONTROLS (ACCOUNT, WISHLIST, BASKET) */}
        <div className={styles.actions}>

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


