"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "../../guards";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { TruckIcon, ArrowRightIcon } from "../../components/icons";
import { DownloadInvoiceButton } from "../../components/common";
import { ordersService, type Order } from "../../utility/services";
import { formatPrice } from "../../utility/formatMoney";
import { IMAGES } from "../../constants/images";
import styles from "./orders.module.css";

function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersService.list();
      setOrders(res || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load order history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  async function cancelOrder(orderId: string) {
    if (!window.confirm("Cancel this order? This can't be undone.")) return;
    try {
      setCancellingId(orderId);
      await ordersService.cancel(orderId);
      await loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to cancel order.");
    } finally {
      setCancellingId(null);
    }
  }

  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return styles.statusDelivered;
      case "shipped":
        return styles.statusShipped;
      case "confirmed":
        return styles.statusConfirmed;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        <TopContentCard
          eyebrow="CLIENT CARE & ACQUISITIONS"
          title="My Jewelry Orders"
          subtitle="Track your insured fine jewelry shipments, certificate documentation, and order history."
          image={IMAGES.jewelry.luxuryTrust}
          imageAlt="My Jewelry Orders"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "My Account", href: "/account" },
            { label: "Order History" },
          ]}
          badge={
            !loading && orders.length > 0 ? (
              <span className={styles.orderCountBadge}>
                {orders.length} {orders.length === 1 ? "order" : "orders"} placed
              </span>
            ) : undefined
          }
          ariaLabel="My Jewelry Orders"
        />

        <Container>
          <div className={styles.mainWrapper}>

          {loading ? (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonOrderCard}>
                  <Skeleton width="30%" height="20px" />
                  <Skeleton width="60%" height="16px" />
                  <Skeleton height="80px" variant="rectangular" />
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load orders"
              description={error}
              action={
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              }
            />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No jewelry orders found"
              description="You haven't placed any fine jewelry orders yet. Explore our handcrafted collections today."
              action={
                <Link href="/products" className={styles.primaryBtn}>
                  Explore Collections
                </Link>
              }
            />
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => {
                const currency = order.currency || "GBP";
                const dateStr = new Date(order.createdAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <div key={order._id} className={styles.orderCard}>
                    {/* Card Header */}
                    <div className={styles.orderHeader}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderId}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className={styles.orderDate}>Placed on {dateStr}</span>
                      </div>

                      <div className={styles.headerRight}>
                        <span
                          className={`${styles.statusBadge} ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={styles.orderTotal}>
                          {formatPrice(order.total, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className={styles.cardBody}>
                      <div className={styles.itemsSummary}>
                        <span className={styles.itemsCount}>
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                        <p className={styles.itemNames}>
                          {order.items
                            .map((item) => `${item.name} ×${item.quantity}`)
                            .join(" · ")}
                        </p>
                      </div>

                      {order.trackingNumber && (
                        <div className={styles.infoRow}>
                          <TruckIcon size={12} />
                          <span>Shipped via {order.carrierName || "carrier"} · Tracking #{order.trackingNumber}</span>
                        </div>
                      )}
                      {order.status === "cancelled" && order.totalRefunded > 0 && (
                        <div className={styles.infoRow}>
                          <span>💰 Refunded {formatPrice(order.totalRefunded, currency)}{order.totalRefunded < order.total ? " (partial)" : ""}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.orderFooter}>
                      <div className={styles.deliveryNote}>
                        <TruckIcon size={16} />
                        <span>
                          Delivered to {order.shippingAddress?.city || "your address"}
                        </span>
                      </div>

                      <div className={styles.footerActions}>
                        {/* Download Invoice — available for all non-pending/non-cancelled paid orders */}
                        {order.status !== "pending" && (
                          <DownloadInvoiceButton orderId={order._id} />
                        )}

                        {(order.status === "pending" || order.status === "confirmed") && (
                          <Button
                            onClick={() => cancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                          >
                            {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                          </Button>
                        )}

                        <Link
                          href={`/orders/${order._id}/track`}
                          className={styles.trackLink}
                        >
                          <span>Track Order &amp; Live Status</span>
                          <ArrowRightIcon size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersView />
    </ProtectedRoute>
  );
}
