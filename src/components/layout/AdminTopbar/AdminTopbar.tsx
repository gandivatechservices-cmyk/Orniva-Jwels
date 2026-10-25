"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "hooks";
import { useClickOutside } from "../../../hooks/useClickOutside";
import {
  ChevronDownIcon,
  HomeIcon,
  MenuIcon,
  UserIcon,
} from "../../icons";
import { AdminGlobalSearch } from "./AdminGlobalSearch";
import type { AdminTopbarProps } from "./types";
import styles from "./AdminTopbar.module.css";

export function AdminTopbar({
  title = "Dashboard",
  onMobileMenuToggle,
  className = "",
}: AdminTopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setDropdownOpen(false));

  const displayName = user?.name || "Admin";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    router.replace("/login");
  };

  return (
    <header className={`${styles.topbar} ${className}`}>
      <div className={styles.leftSection}>
        {onMobileMenuToggle && (
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={onMobileMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <MenuIcon size={20} />
          </button>
        )}
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>

      <div className={styles.centerSection}>
        <AdminGlobalSearch />
      </div>

      <div className={styles.rightSection}>
        <Link href="/" className={styles.viewStoreBtn} title="View live storefront">
          <HomeIcon size={16} />
          <span>Live Store</span>
        </Link>

        <div className={styles.userMenuContainer} ref={dropdownRef}>
          <button
            type="button"
            className={styles.userButton}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            <span className={styles.avatar}>{userInitials}</span>
            <span className={styles.userName}>{displayName}</span>
            <ChevronDownIcon size={14} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown} role="menu">
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/admin/dashboard");
                }}
              >
                <UserIcon size={16} />
                <span>Admin Profile</span>
              </button>
              <div className={styles.divider} />
              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.danger}`}
                onClick={handleSignOut}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
