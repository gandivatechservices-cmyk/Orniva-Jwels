"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { catalogService, offersService, ordersService, usersService } from "utility/services";
import { emitAdminSearch } from "../../../hooks/useAdminSearchIntent";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useDebounce } from "../../../hooks/useDebounce";
import { SearchIcon } from "../../icons";
import styles from "./AdminTopbar.module.css";

type ResultType = "Product" | "Brand" | "Catalog" | "Category" | "Offer / Coupon" | "User" | "Order";

type Entry = {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string;
  haystack: string;
  /** Admin page to open and what to search for there */
  path: string;
  tab?: string;
  q: string;
};

const GROUP_ORDER: ResultType[] = ["Product", "Brand", "Catalog", "Category", "Offer / Coupon", "Order", "User"];
const PER_GROUP = 4;
const REFRESH_AFTER_MS = 60_000;

const clean = (...parts: Array<string | number | undefined | null>) =>
  parts.filter((part) => part !== undefined && part !== null && String(part).trim() !== "").join(" ").toLowerCase();

async function loadEntries(): Promise<Entry[]> {
  const [products, brands, catalogs, categories, offers, orders, users] = await Promise.allSettled([
    catalogService.listAllAdminProducts(),
    catalogService.listAllBrands(),
    catalogService.listCatalogs(),
    catalogService.listCategories(),
    offersService.list(),
    ordersService.listAdmin(),
    usersService.list(),
  ]);
  const ok = <T,>(result: PromiseSettledResult<T[]>): T[] => (result.status === "fulfilled" ? result.value : []);
  const entries: Entry[] = [];

  ok(products).forEach((p) =>
    entries.push({
      id: p._id,
      type: "Product",
      title: p.name,
      subtitle: [p.brand, p.isActive === false ? "Inactive" : undefined].filter(Boolean).join(" · ") || undefined,
      haystack: clean(p.name, p.brand, p.description, ...(p.variants || []).flatMap((v) => [v.sku, v.name])),
      path: "/admin/catalog",
      tab: "products",
      q: p.name,
    })
  );
  ok(brands).forEach((b) =>
    entries.push({ id: b._id, type: "Brand", title: b.name, subtitle: b.isActive ? undefined : "Inactive", haystack: clean(b.name, b.slug, b.description), path: "/admin/catalog", tab: "brands", q: b.name })
  );
  ok(catalogs).forEach((c) =>
    entries.push({ id: c._id, type: "Catalog", title: c.name, subtitle: c.description, haystack: clean(c.name, c.description), path: "/admin/catalog", tab: "catalogs", q: c.name })
  );
  ok(categories).forEach((c) =>
    entries.push({ id: c._id, type: "Category", title: c.name, subtitle: c.type, haystack: clean(c.name, c.slug), path: "/admin/catalog", tab: "categories", q: c.name })
  );
  ok(offers).forEach((o) =>
    entries.push({
      id: o._id,
      type: "Offer / Coupon",
      title: o.code || "Auto-applied offer",
      subtitle: [o.description, o.isActive ? undefined : "Inactive"].filter(Boolean).join(" · "),
      haystack: clean(o.code, o.description),
      path: "/admin/offers",
      q: o.code || o.description,
    })
  );
  ok(orders).forEach((o) => {
    const customer = typeof o.userId === "string" ? undefined : o.userId;
    entries.push({
      id: o._id,
      type: "Order",
      title: `Order ${o._id.slice(-8).toUpperCase()}`,
      subtitle: [customer?.name, o.status].filter(Boolean).join(" · "),
      haystack: clean(o._id, customer?.name, customer?.email, o.trackingNumber, o.couponCode),
      path: "/admin/orders",
      q: o._id,
    });
  });
  ok(users).forEach((u) => {
    const id = (u as { _id?: string; id?: string })._id || (u as { id?: string }).id || u.email;
    entries.push({ id, type: "User", title: u.name, subtitle: u.email, haystack: clean(u.name, u.email), path: "/admin/users", q: u.email });
  });
  return entries;
}

export function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState(0);
  const loadedAt = useRef(0);
  const debounced = useDebounce(query, 150);
  const wrapRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const ensureLoaded = async () => {
    if (loading || Date.now() - loadedAt.current < REFRESH_AFTER_MS) return;
    setLoading(true);
    try {
      setEntries(await loadEntries());
      loadedAt.current = Date.now();
    } finally {
      setLoading(false);
    }
  };

  const results = useMemo(() => {
    const tokens = debounced.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    const matches = entries.filter((entry) => tokens.every((token) => entry.haystack.includes(token)));
    return GROUP_ORDER.flatMap((type) => matches.filter((entry) => entry.type === type).slice(0, PER_GROUP));
  }, [debounced, entries]);

  const choose = (entry: Entry) => {
    setOpen(false);
    const params = new URLSearchParams({ q: entry.q });
    if (entry.tab) params.set("tab", entry.tab);
    router.push(`${entry.path}?${params.toString()}`);
    // The page may already be open (no remount), so tell it directly as well
    window.setTimeout(() => emitAdminSearch({ q: entry.q, tab: entry.tab }), 0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setOpen(false);
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      choose(results[active]);
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className={styles.searchWrap} ref={wrapRef}>
      <SearchIcon size={16} className={styles.searchIcon} />
      <input
        type="search"
        placeholder="Search products, brands, offers, orders, users..."
        className={styles.searchInput}
        aria-label="Search backoffice"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          void ensureLoaded();
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />

      {open && hasQuery && (
        <div className={styles.searchResults} role="listbox">
          {loading && entries.length === 0 ? (
            <div className={styles.searchEmpty}>Searching…</div>
          ) : results.length === 0 ? (
            <div className={styles.searchEmpty}>No results for “{query.trim()}”</div>
          ) : (
            GROUP_ORDER.map((type) => {
              const group = results.filter((entry) => entry.type === type);
              if (group.length === 0) return null;
              return (
                <div key={type}>
                  <div className={styles.searchGroup}>{type}</div>
                  {group.map((entry) => {
                    const index = results.indexOf(entry);
                    return (
                      <button
                        key={`${entry.type}-${entry.id}`}
                        type="button"
                        role="option"
                        aria-selected={index === active}
                        className={`${styles.searchItem} ${index === active ? styles.searchItemActive : ""}`}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => choose(entry)}
                      >
                        <span className={styles.searchItemTitle}>{entry.title}</span>
                        {entry.subtitle && <span className={styles.searchItemSub}>{entry.subtitle}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
