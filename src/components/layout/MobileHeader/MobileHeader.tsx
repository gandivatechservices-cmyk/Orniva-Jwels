"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AtlasLogo,
  MenuIcon,
  CartIcon,
  SearchIcon,
  UserIcon,
  HeartIcon,
} from "components/icons";
import { Drawer } from "components/ui/Drawer";
import { SearchAutocomplete } from "components/common/SearchAutocomplete";
import { useAuth, useCart, useWishlist } from "hooks";
import { formatMoney } from "utility/formatMoney";
import styles from "./MobileHeader.module.css";

export type MobileHeaderProps = {
  onOpenCart?: () => void;
};

export function MobileHeader({ onOpenCart }: MobileHeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const { productIds } = useWishlist();

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <div className={styles.mobileHeader}>
      {/* 1. TOP ROW: MENU, LOGO, BASKET */}
      <div className={styles.topRow}>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open navigation menu"
          className={styles.menuIconBtn}
        >
          <MenuIcon size={24} />
        </button>

        <Link href="/" className={styles.logoLink} aria-label="Atlas Home">
          <AtlasLogo height={26} />
        </Link>

        <button
          type="button"
          onClick={onOpenCart ? onOpenCart : () => router.push("/cart")}
          aria-label={`Basket with ${mounted ? totalItems : 0} items, total ${mounted && totalPrice > 0 ? formatMoney(totalPrice) : "£0.00"}`}
          className={styles.cartIconBtn}
        >
          <div className={styles.cartWrap}>
            <CartIcon size={22} className={styles.cartIcon} />
            {mounted && totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems > 99 ? "99+" : totalItems}</span>
            )}
          </div>
        </button>
      </div>

      {/* 2. FULL-WIDTH SEARCH BAR */}
      <SearchAutocomplete variant="mobile" />


      {/* SIDEBAR DRAWER MENU */}
      <Drawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        placement="left"
        title={<AtlasLogo height={24} />}
      >
        <div className={styles.drawerContent}>
          {/* USER PROFILE / SIGN-IN SECTION */}
          <div className={styles.drawerUserSection}>
            {mounted && isAuthenticated ? (
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <UserIcon size={22} />
                </div>
                <div className={styles.userMeta}>
                  <div className={styles.userName}>{user?.name}</div>
                  <div className={styles.userEmail}>{user?.email}</div>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.authLink}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.authLinkRegister}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MAIN NAVIGATION LINKS */}
          <nav className={styles.drawerNav}>
            <Link href="/" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Home</span>
            </Link>
            <Link href="/products" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Shop All Jewellery</span>
            </Link>
            <Link href="/categories" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Collections</span>
            </Link>
            <Link href="/custom-jewellery" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Custom Jewellery</span>
            </Link>
            <Link href="/about" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Our Story</span>
            </Link>
            <Link href="/manufacturing" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Our Manufacturing</span>
            </Link>
            <Link href="/reviews" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Customer Reviews</span>
            </Link>
            <Link href="/blog" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Blog & Guides</span>
            </Link>
            <Link href="/contact" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Contact Us</span>
            </Link>
            <Link href="/wishlist" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>My Wishlist</span>
              {productIds.length > 0 && (
                <span className={styles.navBadge}>{productIds.length}</span>
              )}
            </Link>
            <Link href="/orders" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>My Orders</span>
            </Link>
            <Link href="/cart" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Cart ({formatMoney(totalPrice)})</span>
              {totalItems > 0 && <span className={styles.navBadge}>{totalItems}</span>}
            </Link>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                prefetch={false}
                onClick={() => setIsMenuOpen(false)}
                className={`${styles.navItem} ${styles.adminNav}`}
              >
                <span>Admin Console</span>
              </Link>
            )}
            <Link href="/account" prefetch={false} onClick={() => setIsMenuOpen(false)} className={styles.navItem}>
              <span>Account Settings</span>
            </Link>
          </nav>

          {isAuthenticated && (
            <div className={styles.drawerFooter}>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                  router.push("/");
                }}
                className={styles.logoutBtn}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}

