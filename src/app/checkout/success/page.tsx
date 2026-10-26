"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StoreLayout } from "../../../components/StoreLayout";
import { Container } from "../../../components/layout/Container";
import { OrderStatusStepper, DownloadInvoiceButton } from "../../../components/common";
import { ArrowRightIcon, TruckIcon } from "../../../components/icons";
import { ordersService, paymentsService, type Order } from "../../../utility/services";
import { useCart } from "hooks";
import { formatPrice } from "../../../utility/formatMoney";
import styles from "./success.module.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const sessionId = searchParams.get("session_id") || undefined;
  const totalParam = parseFloat(searchParams.get("total") || "0");

  const [order, setOrder] = useState<Order | null>(null);
  const { clear, loadCart } = useCart();

  useEffect(() => {
    if (!orderId) return;

    // Verify session with backend to mark order PAID and clear backend cart
    paymentsService
      .verifySession(orderId, sessionId)
      .then((res) => {
        if (res.order) setOrder(res.order);
      })
      .catch(() => {
        ordersService.getById(orderId).then(setOrder).catch(() => undefined);
      })
      .finally(() => {
        // Clear local basket and re-sync cart now that order is paid
        clear();
        loadCart();
      });
  }, [orderId, sessionId, clear, loadCart]);

  const displayTotal = order ? order.total : totalParam;
  const currency = order?.currency || "GBP";
  const itemsCount = order?.items?.reduce((s, i) => s + i.quantity, 0) || 1;
  const shortRef = orderId ? orderId.slice(-8).toUpperCase() : "ORD-2026";

  return (
    <StoreLayout>
      <div className={styles.pageWrapper}>
        <Container>
          <div className={styles.container}>

            {/* ── Hero ── */}
            <div className={styles.heroSection}>
              <div className={styles.successIconWrapper}>
                <div className={styles.successIconInner}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
                <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
                <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
                <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
              </div>

              <div className={styles.headerGroup}>
                <h1 className={styles.title}>Thank you, your order is confirmed</h1>
                <p className={styles.subtitle}>
                  Your jewellery is being prepared and carefully packaged by our atelier. We&apos;ll notify you when it&apos;s on its way.
                </p>
              </div>
            </div>

            {/* ── Order Details Card ── */}
            <div className={styles.orderDetailsCard}>
              <div className={styles.cardHeader}>
                <p className={styles.cardHeaderTitle}>Order Summary</p>
                <span className={styles.orderRefPill}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="2" width="6" height="4" rx="1" />
                    <path d="M17 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  </svg>
                  #{shortRef}
                </span>
              </div>

              <div className={styles.cardBody}>
                {/* Total Paid */}
                <div className={styles.detailTile}>
                  <div className={styles.detailTileIcon} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <p className={styles.detailLabel}>Total Paid</p>
                  <p className={styles.detailValue}>{formatPrice(displayTotal, currency)}</p>
                </div>

                {/* Items */}
                <div className={styles.detailTile}>
                  <div className={styles.detailTileIcon} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <p className={styles.detailLabel}>Items</p>
                  <p className={styles.detailValue}>{itemsCount} {itemsCount === 1 ? "item" : "items"}</p>
                </div>

                {/* Estimated Delivery */}
                <div className={styles.detailTile}>
                  <div className={styles.detailTileIcon} aria-hidden="true">
                    <TruckIcon size={16} />
                  </div>
                  <p className={styles.detailLabel}>Est. Delivery</p>
                  <p className={`${styles.detailValue} ${styles.detailValueAccent}`}>Today, 4:00 – 6:00 PM</p>
                </div>

                {/* Status */}
                <div className={styles.detailTile}>
                  <div className={styles.detailTileIcon} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <p className={styles.detailLabel}>Status</p>
                  <p className={styles.detailValue} style={{ textTransform: "capitalize" }}>
                    {order?.status ?? "Confirmed"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Order Stepper ── */}
            <div className={styles.stepperSection}>
              <div className={styles.stepperHeader}>
                <p className={styles.stepperTitle}>Delivery Progress</p>
                <span className={styles.liveTag}>
                  <span className={styles.liveDot} />
                  Live
                </span>
              </div>
              <div className={styles.stepperBody}>
                <OrderStatusStepper currentStatus={order?.status || "placed"} />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className={styles.actionsRow}>
              {orderId && (
                <DownloadInvoiceButton orderId={orderId} label="Download Invoice" />
              )}
              {orderId && (
                <Link href={`/orders/${orderId}/track`} className={styles.trackOrderBtn}>
                  <TruckIcon size={16} />
                  <span>Track Live Delivery</span>
                  <ArrowRightIcon size={14} />
                </Link>
              )}
              <Link href="/products" className={styles.continueShoppingBtn}>
                Continue Shopping
              </Link>
            </div>

          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <StoreLayout>
          <Container>
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              Loading order confirmation...
            </div>
          </Container>
        </StoreLayout>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
