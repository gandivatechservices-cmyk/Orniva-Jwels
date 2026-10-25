"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import { adminCompactTheme } from "theme";
import { AdminSidebar, AdminTopbar } from "./layout";
import styles from "./AdminLayout.module.css";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard Overview",
  "/admin/catalog": "Catalog Management",
  "/admin/offers": "Offers & Coupons",
  "/admin/reviews": "Customer Reviews",
  "/admin/orders": "Orders",
  "/admin/users": "User Accounts",
  "/admin/users/new": "Create New User",
};

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = PAGE_TITLES[pathname] || (pathname.startsWith("/admin/products/") ? "Product Details" : "Admin Console");

  return (
    <ConfigProvider theme={adminCompactTheme} componentSize="small">
    <div className={styles.layout}>
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={styles.body}>
        <AdminTopbar
          title={title}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
    </ConfigProvider>
  );
}
