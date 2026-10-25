"use client";

import { useState } from "react";
import { formatPrice } from "../../../utility/formatMoney";
import { Skeleton } from "../../ui/Skeleton";
import type { RevenueChartProps } from "./types";
import styles from "./RevenueChart.module.css";

export function RevenueChart({
  data,
  currency = "GBP",
  title = "Revenue Analytics",
  totalRevenue,
  loading = false,
  className = "",
}: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton width="120px" height="20px" />
          <Skeleton width="80px" height="24px" />
        </div>
        <Skeleton height="180px" variant="rectangular" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <h4 className={styles.title}>{title}</h4>
        <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-muted)" }}>
          No revenue data available
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 100);
  const calculatedTotal = totalRevenue ?? values.reduce((sum, v) => sum + v, 0);

  // SVG Chart calculation parameters
  const width = 600;
  const height = 180;
  const paddingX = 30;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  // Build SVG path
  const linePathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x},${pt.y}`;
    // Smooth cubic bezier curve
    const prev = points[idx - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, "");

  const areaPathD = `${linePathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.headerRow}>
        <div>
          <h4 className={styles.title}>{title}</h4>
          {activePoint && (
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--color-muted)" }}>
              {activePoint.label}: <strong>{formatPrice(activePoint.value, currency)}</strong>
            </span>
          )}
        </div>
        <div className={styles.totalRevenue}>
          {formatPrice(calculatedTotal, currency)}
        </div>
      </div>

      <div className={styles.chartArea}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={styles.svg}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            className={styles.gridLine}
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            className={styles.gridLine}
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            className={styles.gridLine}
          />

          {/* Area fill */}
          <path d={areaPathD} className={styles.areaPath} />

          {/* Smooth line */}
          <path d={linePathD} className={styles.linePath} />

          {/* Interactive points */}
          {points.map((pt, idx) => (
            <circle
              key={pt.label}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === idx ? 6 : 4}
              className={styles.point}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
      </div>

      <div className={styles.labelsRow}>
        {data.map((item) => (
          <span key={item.label} className={styles.xLabel}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
