"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { catalogService, type Category } from "utility/services";
import { Skeleton } from "components/ui/Skeleton";
import { PriceTagIcon } from "components/icons";
import styles from "./CategoryNav.module.css";

export interface GroceryNavItem {
  id: string;
  name: string;
  slug: string;
  aliases?: string[];
}

export const GROCERY_NAV_ITEMS: GroceryNavItem[] = [
  { id: "fresh-food", name: "Fresh Food", slug: "fresh-food", aliases: ["fresh-food", "fresh", "produce", "fresh-produce", "grocery-food"] },
  { id: "fruit-veg", name: "Fruit & Veg", slug: "fruit-veg", aliases: ["fruit-veg", "fruits-vegetables", "fruit", "vegetables", "produce"] },
  { id: "dairy-eggs", name: "Dairy & Eggs", slug: "dairy-eggs", aliases: ["dairy-eggs", "dairy", "milk", "eggs", "cheese"] },
  { id: "meat-seafood", name: "Meat & Seafood", slug: "meat-seafood", aliases: ["meat-seafood", "meat", "seafood", "poultry", "fish"] },
  { id: "frozen", name: "Frozen", slug: "frozen", aliases: ["frozen", "frozen-food", "ice-cream"] },
  { id: "bakery", name: "Bakery", slug: "bakery", aliases: ["bakery", "bread", "pastries"] },
  { id: "rice-grains", name: "Rice & Grains", slug: "rice-grains", aliases: ["rice-grains", "rice", "grains", "pasta", "flour", "pulses"] },
  { id: "spices", name: "Spices", slug: "spices", aliases: ["spices", "herbs", "seasonings", "masala"] },
  { id: "snacks", name: "Snacks", slug: "snacks", aliases: ["snacks", "crisps", "chips", "biscuits", "grocery-snacks", "grocery-healthy-snacks"] },
  { id: "drinks", name: "Drinks", slug: "drinks", aliases: ["drinks", "beverages", "juices", "soft-drinks", "water", "tea-coffee"] },
  { id: "household", name: "Household", slug: "household", aliases: ["household", "cleaning", "paper-goods", "laundry"] },
  { id: "beauty", name: "Beauty", slug: "beauty", aliases: ["beauty", "personal-care", "toiletries", "skincare"] },
  { id: "indian-grocery", name: "Indian Grocery", slug: "indian-grocery", aliases: ["indian-grocery", "indian-asian", "asian-grocery", "ethnic"] },
];

export function NavigationItem({
  label,
  href,
  isActive,
}: {
  label: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${styles.navItem} ${isActive ? styles.active : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function OffersNavigationItem({
  label = "Offers",
  href = "/products?offers=true",
  isActive,
}: {
  label?: string;
  href?: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${styles.offersItem} ${isActive ? styles.activeOffers : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <PriceTagIcon size={13} className={styles.offersIcon} />
      <span>{label}</span>
    </Link>
  );
}


function CategoryNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategorySlug = searchParams.get("category") || "";
  const currentCategoryId = searchParams.get("categoryId") || "";
  const isOffersActive = searchParams.get("offers") === "true";
  const isSearchActive = Boolean(searchParams.get("search"));

  const isShopAllActive =
    pathname === "/products" &&
    !currentCategorySlug &&
    !currentCategoryId &&
    !isOffersActive &&
    !isSearchActive;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogService
      .listCategories({ type: "root" })
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          return catalogService.listCategories().then((all) => {
            const rootOnly = (all || []).filter((c) => !c.parentCategoryId || c.type === "root");
            setCategories(rootOnly.length > 0 ? rootOnly : all || []);
          });
        }
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <nav className={styles.navWrapper} aria-label="Grocery categories loading">
        <div className={styles.container}>
          <div className={styles.skeletonRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} width={75 + (i % 4) * 15} height={28} />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navWrapper} aria-label="Grocery categories">
      <div className={styles.container}>
        <div className={styles.scrollRow} role="menubar">
          {/* 1. SHOP ALL */}
          <NavigationItem
            label="Shop All"
            href="/products"
            isActive={isShopAllActive}
          />

          {/* DYNAMIC CATEGORIES LOADED LIVE FROM API */}
          {categories.map((category) => {
            const catSlug = category.slug.toLowerCase();
            const isCategoryRouteActive =
              pathname === `/category/${catSlug}` ||
              pathname === `/category/${encodeURIComponent(catSlug)}`;
            const isProductFilterActive =
              pathname === "/products" &&
              !isOffersActive &&
              (currentCategorySlug.toLowerCase() === catSlug ||
                currentCategoryId === category._id);

            const isActive = isCategoryRouteActive || isProductFilterActive;

            return (
              <NavigationItem
                key={category._id}
                label={category.name}
                href={`/category/${encodeURIComponent(category.slug)}`}
                isActive={isActive}
              />
            );
          })}

          {/* OFFERS ITEM */}
          <OffersNavigationItem
            label="Offers"
            href="/products?offers=true"
            isActive={pathname === "/products" && isOffersActive}
          />
        </div>
      </div>
    </nav>
  );
}

export function CategoryNav() {
  return (
    <Suspense
      fallback={
        <div className={styles.navWrapper}>
          <div className={styles.container}>
            <div className={styles.skeletonRow}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} width={80} height={28} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CategoryNavContent />
    </Suspense>
  );
}

export const CategoryNavigation = CategoryNav;
