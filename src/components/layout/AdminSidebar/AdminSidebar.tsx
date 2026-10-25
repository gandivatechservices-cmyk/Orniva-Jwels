"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, ConfigProvider, Drawer, Flex, Grid, Layout, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  CarOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
  UserAddOutlined,
  UserOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useAuth } from "hooks";
import { AtlasAdminLogo } from "../../icons";
import type { AdminNavItem, AdminSidebarProps } from "./types";

const SIDEBAR_BG = "#11231a";
const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: "/admin/dashboard", label: "Overview", href: "/admin/dashboard", icon: <AppstoreOutlined /> },
  { key: "/admin/catalog", label: "Catalog & Products", href: "/admin/catalog", icon: <InboxOutlined /> },
  { key: "/admin/offers", label: "Offers & Coupons", href: "/admin/offers", icon: <GiftOutlined /> },
  { key: "/admin/reviews", label: "Customer Reviews", href: "/admin/reviews", icon: <StarOutlined /> },
  { key: "/admin/orders", label: "Orders", href: "/admin/orders", icon: <CarOutlined /> },
  { key: "/admin/users", label: "User Management", href: "/admin/users", icon: <UserOutlined /> },
  { key: "/admin/users/new", label: "Create New User", href: "/admin/users/new", icon: <UserAddOutlined /> },
];

/** Picks the nav item whose route is the longest prefix of the current path. */
function getSelectedKey(pathname: string): string[] {
  const match = ADMIN_NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return match ? [match.key] : [];
}

export function AdminSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.lg === false;

  const handleSignOut = () => {
    logout();
    router.replace("/login");
  };

  const navItems: MenuProps["items"] = ADMIN_NAV_ITEMS.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: (
      <Link href={item.href} onClick={onMobileClose}>
        {item.label}
      </Link>
    ),
  }));

  const footerItems: MenuProps["items"] = [
    { key: "storefront", icon: <HomeOutlined />, label: <Link href="/">View Storefront</Link> },
    { key: "signout", icon: <LogoutOutlined />, label: "Sign Out", danger: true, onClick: handleSignOut },
  ];

  const content = (showCollapsed: boolean) => (
    <Flex vertical style={{ height: "100%" }}>
      <Flex align="center" justify="space-between" style={{ height: 64, padding: "0 16px" }}>
        {showCollapsed ? null : <AtlasAdminLogo />}
        {onToggleCollapse && !isMobile && (
          <Button
            type="text"
            style={{ color: "#fff", marginInline: showCollapsed ? "auto" : 0 }}
            icon={showCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleCollapse}
            aria-label={showCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          />
        )}
      </Flex>

      {!showCollapsed && (
        <Typography.Text
          style={{ padding: "12px 24px 4px", fontSize: 11, letterSpacing: 1, color: "rgba(255,255,255,0.45)" }}
        >
          BACKOFFICE CONTROL
        </Typography.Text>
      )}

      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={showCollapsed}
        selectedKeys={getSelectedKey(pathname)}
        items={navItems}
        style={{ flex: 1, borderInlineEnd: 0 }}
      />

      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={showCollapsed}
        selectable={false}
        items={footerItems}
        style={{ borderInlineEnd: 0, borderTop: "1px solid rgba(255,255,255,0.08)", paddingBlock: 8 }}
      />
    </Flex>
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: SIDEBAR_BG,
            darkSubMenuItemBg: SIDEBAR_BG,
            darkItemSelectedBg: "#255a3a",
            darkItemSelectedColor: "#ffffff",
            darkItemHoverBg: "rgba(255,255,255,0.08)",
            darkItemColor: "rgba(255,255,255,0.75)",
            itemBorderRadius: 10,
            itemMarginInline: 12,
          },
          Layout: { siderBg: SIDEBAR_BG },
        },
      }}
    >
      {isMobile ? (
        <Drawer
          open={mobileOpen}
          onClose={onMobileClose}
          placement="left"
          size={SIDEBAR_WIDTH}
          closable={false}
          styles={{ body: { padding: 0, background: SIDEBAR_BG } }}
        >
          {content(false)}
        </Drawer>
      ) : (
        <Layout.Sider
          width={SIDEBAR_WIDTH}
          collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          collapsed={collapsed}
          trigger={null}
          style={{ height: "100vh", position: "sticky", top: 0, overflow: "auto", flexShrink: 0 }}
        >
          {content(collapsed)}
        </Layout.Sider>
      )}
    </ConfigProvider>
  );
}
