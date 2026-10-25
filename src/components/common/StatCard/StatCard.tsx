"use client";

import { Skeleton } from "../../ui/Skeleton";
import type { StatCardProps } from "./types";
import styles from "./StatCard.module.css";

export function StatCard({
  label,
  value,
  delta,
  deltaType = "positive",
  period,
  icon,
  loading = false,
  className = "",
}: StatCardProps) {
  if (loading) {
    return <StatCardSkeleton className={className} />;
  }

  const deltaClass = styles[`delta_${deltaType}`] || styles.delta_neutral;

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.topRow}>
        <span className={styles.label}>{label}</span>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
      </div>

      <div className={styles.value}>{value}</div>

      {(delta !== undefined || period) && (
        <div className={styles.bottomRow}>
          {delta !== undefined && (
            <span className={`${styles.deltaBadge} ${deltaClass}`}>
              {deltaType === "positive" ? "↑" : deltaType === "negative" ? "↓" : "•"}{" "}
              {typeof delta === "number" ? `${delta > 0 ? "+" : ""}${delta}%` : delta}
            </span>
          )}
          {period && <span className={styles.period}>{period}</span>}
        </div>
      )}
    </div>
  );
}

export function StatCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="40%" height="14px" />
        <Skeleton width="36px" height="36px" variant="rectangular" />
      </div>
      <Skeleton width="60%" height="32px" />
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Skeleton width="45px" height="18px" />
        <Skeleton width="80px" height="14px" />
      </div>
    </div>
  );
}
