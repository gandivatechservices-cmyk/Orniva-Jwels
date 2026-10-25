import type { ReactNode } from "react";

export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

export interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}
