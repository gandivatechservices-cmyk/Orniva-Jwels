"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StoreLayout } from "../../../components/StoreLayout";
import { Container } from "../../../components/layout/Container";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { paymentsService } from "../../../utility/services";
import { useCart } from "hooks";
import styles from "./cancel.module.css";

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadCart } = useCart();

  useEffect(() => {
    // Re-sync cart to ensure items are present in basket
    loadCart();

    // Cancel pending session on backend so it's not marked active
    if (orderId) {
      paymentsService.cancelSession(orderId).catch(() => undefined);
    }
  }, [orderId, loadCart]);

  async function retryPayment() {
    if (!orderId) return;
    setRetrying(true);
    setError(null);
    try {
      const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
      const { url } = await paymentsService.createCheckoutSession(orderId, clientOrigin);
      if (url) {
        window.location.href = url;
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to restart payment session. Please try again."
      );
      setRetrying(false);
    }
  }

  return (
    <StoreLayout>
      <Container>
        <div className={styles.container}>
          <EmptyState
            title="Payment Incomplete or Cancelled"
            description={
              error ||
              "Your payment session was cancelled. No charges were made. All items remain safely in your basket."
            }
            action={
              <div className={styles.actions}>
                <Link href="/checkout">
                  <Button variant="primary">Back to Checkout</Button>
                </Link>
                <Link href="/cart">
                  <Button variant="secondary">View Basket</Button>
                </Link>
              </div>
            }
          />
        </div>
      </Container>
    </StoreLayout>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <StoreLayout>
          <Container>
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              Loading...
            </div>
          </Container>
        </StoreLayout>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
