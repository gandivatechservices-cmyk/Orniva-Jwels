"use client";

import { CheckIcon, ClockIcon, TruckIcon } from "../../icons";
import type { OrderStatusKey, OrderStatusStepperProps, StepItem } from "./types";
import styles from "./OrderStatusStepper.module.css";

const ORDER_STEPS: StepItem[] = [
  { key: "placed", label: "Order Placed", description: "Payment verified" },
  { key: "confirmed", label: "Confirmed", description: "Store accepted" },
  { key: "picking", label: "Picking Items", description: "Packing fresh" },
  { key: "out_for_delivery", label: "Out for Delivery", description: "On the way" },
  { key: "delivered", label: "Delivered", description: "Handed over" },
];

const STATUS_RANK: Record<string, number> = {
  pending: 0,
  placed: 0,
  confirmed: 1,
  processing: 2,
  picking: 2,
  out_for_delivery: 3,
  shipping: 3,
  delivered: 4,
  completed: 4,
};

export function OrderStatusStepper({
  currentStatus,
  estimatedDelivery = "Today, 4:00 PM – 6:00 PM",
  className = "",
}: OrderStatusStepperProps) {
  const normalizedStatus = currentStatus.toLowerCase();
  const isCancelled = normalizedStatus === "cancelled";
  const currentRank = STATUS_RANK[normalizedStatus] ?? 0;

  if (isCancelled) {
    return (
      <div className={`${styles.stepper} ${className}`}>
        <div className={styles.cancelledBanner}>
          <ClockIcon size={18} />
          <span>This order has been cancelled and refunded.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.stepper} ${className}`}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.etaTitle}>Estimated Delivery</span>
          <div className={styles.etaValue}>{estimatedDelivery}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)" }}>
          <TruckIcon size={20} />
          <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600 }}>Insured Express Delivery</span>
        </div>
      </div>

      <div className={styles.stepsContainer}>
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = currentRank > index;
          const isActive = currentRank === index;

          let stepClass = "";
          if (isCompleted) stepClass = styles.completed;
          else if (isActive) stepClass = styles.active;

          return (
            <div key={step.key} className={`${styles.stepItem} ${stepClass}`}>
              <div className={styles.connector} />
              <div className={styles.node}>
                {isCompleted ? <CheckIcon size={16} /> : index + 1}
              </div>
              <span className={styles.label}>{step.label}</span>
              {step.description && (
                <span className={styles.description}>{step.description}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
