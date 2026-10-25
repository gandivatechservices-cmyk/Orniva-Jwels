"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StoreLayout } from "../../../../components/StoreLayout";
import { Container } from "../../../../components/layout/Container";
import { OrderStatusStepper, DownloadInvoiceButton } from "../../../../components/common";
import { PendingSection } from "../../../../components/ui/PendingSection";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { MapPinIcon, TruckIcon, UserIcon } from "../../../../components/icons";
import { ordersService, type Order } from "../../../../utility/services";
import { formatPrice } from "../../../../utility/formatMoney";
import styles from "./track.module.css";

export default function TrackOrderPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!params.id) return;
      try {
        setLoading(true);
        const res = await ordersService.getById(params.id);
        setOrder(res);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load order details.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [params.id]);

  if (loading) {
    return (
      <StoreLayout>
        <Container>
          <div className={styles.container}>
            <Skeleton width="40%" height="28px" />
            <Skeleton height="140px" variant="rectangular" />
            <div className={styles.detailsGrid}>
              <Skeleton height="200px" variant="rectangular" />
              <Skeleton height="200px" variant="rectangular" />
            </div>
          </div>
        </Container>
      </StoreLayout>
    );
  }

  if (error || !order) {
    return (
      <StoreLayout>
        <Container>
          <div style={{ padding: "80px 0" }}>
            <EmptyState
              title="Order not found"
              description={error || "We couldn't locate this order in our system."}
              action={
                <Link
                  href="/products"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    padding: "10px 20px",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Return to Store
                </Link>
              }
            />
          </div>
        </Container>
      </StoreLayout>
    );
  }

  const currency = order.currency || "GBP";
  const address = order.shippingAddress;

  return (
    <StoreLayout>
      <Container>
        <div className={styles.container}>
          <div className={styles.headingRow}>
            <div>
              <h1 className={styles.title}>Track Your Grocery Order</h1>
              <span className={styles.orderRef}>
                Order ID: #{order._id.slice(-8).toUpperCase()} • Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            {order.status !== "pending" && (
              <DownloadInvoiceButton orderId={order._id} />
            )}
          </div>

          <div className={styles.layout}>
            {/* 1. LIVE ORDER STATUS STEPPER */}
            <OrderStatusStepper currentStatus={order.status} />

            {/* 2. DRIVER & LIVE MAP (PENDING API) */}
            {/* TODO: API pending — Driver/live map on Track Order */}
            <PendingSection
              title="Live Driver Location & Telematics"
              pendingFeature="real-time GPS courier tracking and driver dispatch socket"
            >
              <div className={styles.driverCardMock}>
                <div className={styles.driverInfo}>
                  <div className={styles.driverAvatar}>
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <div className={styles.driverName}>Atlas Express Courier</div>
                    <div className={styles.driverVehicle}>Eco Electric Van • Local Depot</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontSize: "var(--fs-xs)", fontWeight: 600 }}>
                  <TruckIcon size={16} />
                  <span>On Schedule</span>
                </div>
              </div>
            </PendingSection>

            {/* 3. ORDER DETAILS & ADDRESS GRID */}
            <div className={styles.detailsGrid}>
              {/* Delivery Address Card */}
              <div className={styles.card}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPinIcon size={18} style={{ color: "var(--color-primary)" }} />
                  <h2 className={styles.cardTitle} style={{ borderBottom: "none", paddingBottom: 0 }}>
                    Delivery Destination
                  </h2>
                </div>
                {address ? (
                  <div className={styles.addressText}>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--color-ink)" }}>
                      {address.line1}
                    </p>
                    {address.line2 && <p style={{ margin: 0 }}>{address.line2}</p>}
                    <p style={{ margin: 0 }}>
                      {address.city}, {address.state}
                    </p>
                    <p style={{ margin: 0 }}>{address.postalCode}</p>
                    {address.phone && (
                      <p style={{ marginTop: "8px", fontSize: "var(--fs-2xs)" }}>
                        Contact: {address.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className={styles.addressText}>Standard delivery address</p>
                )}
              </div>

              {/* Order Items Breakdown */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Items in Order ({order.items.length})</h2>
                <div className={styles.itemsList}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <span className={styles.itemName}>
                        {item.name} × {item.quantity}
                      </span>
                      <span className={styles.itemPrice}>
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.totalRow}>
                  <span>Total Paid</span>
                  <span className={styles.totalPrice}>
                    {formatPrice(order.total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </StoreLayout>
  );
}
