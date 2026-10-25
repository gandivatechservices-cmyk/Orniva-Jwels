"use client";

import { useState } from "react";
import { Typography } from "antd";

export type BarPoint = { label: string; value: number };

type Props = {
  data: BarPoint[];
  formatValue: (value: number) => string;
  height?: number;
  color?: string;
  /** Use whole-number axis steps (for counts such as orders). */
  integer?: boolean;
};

const W = 600;
const PAD = { top: 12, right: 12, bottom: 26, left: 52 };

/** Rounds the max up to a tidy number so the y-axis ticks are readable. */
function niceMax(max: number): number {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

/** Plain SVG bar chart with grid, y-axis ticks and a hover tooltip. */
export function RevenueBarChart({ data, formatValue, height = 220, color = "#2f8f5b", integer = false }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const rawMax = Math.max(...data.map((d) => d.value), 0);
  const max = integer ? Math.max(4, Math.ceil(rawMax / 4) * 4) : niceMax(rawMax);
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(data.length, 1);
  const barW = Math.min(36, slot * 0.6);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" role="img" aria-label="Revenue by day bar chart">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#6b7280">
              {formatValue(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const h = Math.max((d.value / max) * innerH, d.value > 0 ? 2 : 0);
          return (
            <g key={`${d.label}-${i}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={innerH} fill="transparent" />
              <path
                d={`M ${cx - barW / 2} ${y(0)} V ${y(0) - h + 4} Q ${cx - barW / 2} ${y(0) - h} ${cx - barW / 2 + 4} ${y(0) - h} H ${cx + barW / 2 - 4} Q ${cx + barW / 2} ${y(0) - h} ${cx + barW / 2} ${y(0) - h + 4} V ${y(0)} Z`}
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
              <text x={cx} y={height - 8} textAnchor="middle" fontSize={10} fill="#6b7280">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div
          style={{
            position: "absolute",
            left: `${((PAD.left + slot * hover + slot / 2) / W) * 100}%`,
            top: 0,
            transform: "translate(-50%, -4px)",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "4px 10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
            {data[hover].label}
          </Typography.Text>
          <Typography.Text strong>{formatValue(data[hover].value)}</Typography.Text>
        </div>
      )}
    </div>
  );
}
