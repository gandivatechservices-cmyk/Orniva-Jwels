"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../guards";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  HeartIcon,
  TruckIcon,
  ArrowRightIcon,
} from "../../components/icons";
import { useAuth, useWishlist } from "hooks";
import { ordersService, type Order } from "../../utility/services";
import { formatPrice } from "../../utility/formatMoney";
import { IMAGES } from "../../constants/images";
import styles from "./account.module.css";

function AccountDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { productIds } = useWishlist();

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoadingOrders(true);
        const orders = await ordersService.list();
        setRecentOrders(orders?.slice(0, 3) || []);
      } catch {
        setRecentOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadDashboard();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        <TopContentCard
          eyebrow="PATRON ATELIER"
          title={user?.name ? `Welcome, ${user.name}` : "My Account"}
          subtitle="Manage your fine jewelry acquisitions, personal wishlist, and account preferences."
          image={IMAGES.jewelry.heroModel}
          imageAlt="Client Account Dashboard"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "My Account" },
          ]}
          badge={
            <span className={styles.headerRoleBadge}>
              {user?.role?.toUpperCase() || "PATRON"}
            </span>
          }
          actions={
            <button
              type="button"
              className={styles.headerLogoutBtn}
              onClick={handleLogout}
              title="Sign Out"
            >
              Sign Out
            </button>
          }
          ariaLabel="Client Account Dashboard"
        />

        <Container>
          <div className={styles.layout}>
            {/* Sidebar Profile & Nav */}
            <aside className={styles.sidebar}>
              <div className={styles.profileCard}>
                <div className={styles.avatar}>{getInitials(user?.name)}</div>
                <div>
                  <h2 className={styles.userName}>{user?.name || "Valued Customer"}</h2>
                  <p className={styles.userEmail}>{user?.email}</p>
                </div>
                <span className={styles.roleBadge}>{user?.role || "Customer"}</span>
              </div>

              <div className={styles.navMenu}>
                <Link href="/orders" className={styles.navItem}>
                  <div className={styles.navItemLeft}>
                    <TruckIcon size={18} style={{ color: "var(--color-primary)" }} />
                    <span>My Orders</span>
                  </div>
                  <ArrowRightIcon size={14} />
                </Link>

                <Link href="/wishlist" prefetch={false} className={styles.navItem}>
                  <div className={styles.navItemLeft}>
                    <HeartIcon size={18} style={{ color: "var(--color-primary)" }} />
                    <span>My Wishlist</span>
                  </div>
                  {productIds.length > 0 && (
                    <span className={styles.navBadge}>{productIds.length}</span>
                  )}
                </Link>
              </div>

              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Sign Out
              </button>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainSection}>
              {/* Recent Orders Section */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Recent Orders</h3>
                  <Link href="/orders" className={styles.cardLink}>
                    View all
                  </Link>
                </div>

                {loadingOrders ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Skeleton height="72px" variant="rectangular" />
                    <Skeleton height="72px" variant="rectangular" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <EmptyState
                    title="No orders yet"
                    description="You have not placed any fine jewelry orders yet."
                    action={
                      <Link href="/products" className={styles.cardLink}>
                        Browse Collections
                      </Link>
                    }
                  />
                ) : (
                  <div className={styles.orderList}>
                    {recentOrders.map((order) => (
                      <div key={order._id} className={styles.orderItem}>
                        <div className={styles.orderMeta}>
                          <span className={styles.orderId}>
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span className={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className={styles.orderRight}>
                          <span className={styles.orderPrice}>
                            {formatPrice(order.total, order.currency || "GBP")}
                          </span>
                          <span className={styles.statusBadge}>{order.status}</span>
                          <Link
                            href={`/orders/${order._id}/track`}
                            className={styles.trackLink}
                          >
                            Track
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountDashboard />
    </ProtectedRoute>
  );
}
