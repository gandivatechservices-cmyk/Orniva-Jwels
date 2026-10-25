"use client";

import { useState } from "react";
import { Flex, Typography } from "antd";

export type DonutSlice = { key: string; label: string; value: number; color: string };

type Props = { data: DonutSlice[]; centerLabel?: string; size?: number };

/** Plain SVG donut with a gap between slices, a hover highlight and a labelled legend. */
export function DonutChart({ data, centerLabel = "Total", size = 150 }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = 56;
  const stroke = 22;
  const c = 2 * Math.PI * r;
  const gap = data.filter((d) => d.value > 0).length > 1 ? 2 : 0;

  const visible = data.filter((d) => d.value > 0);
  const arcs = visible.map((d, i) => {
    const before = visible.slice(0, i).reduce((sum, x) => sum + x.value, 0);
    const len = (d.value / total) * c;
    return { ...d, dash: Math.max(len - gap, 0), offset: (before / total) * c };
  });

  const active = data.find((d) => d.key === hover);

  return (
    <Flex align="center" gap={20} wrap justify="center">
      <svg width={size} height={size} viewBox="0 0 150 150" role="img" aria-label="Orders by status donut chart">
        <circle cx={75} cy={75} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx={75}
            cy={75}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={hover === a.key ? stroke + 4 : stroke}
            strokeDasharray={`${a.dash} ${c - a.dash}`}
            strokeDashoffset={-a.offset}
            transform="rotate(-90 75 75)"
            opacity={hover === null || hover === a.key ? 1 : 0.45}
            onMouseEnter={() => setHover(a.key)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        <text x={75} y={72} textAnchor="middle" fontSize={22} fontWeight={700} fill="#111827">
          {active ? active.value : total}
        </text>
        <text x={75} y={90} textAnchor="middle" fontSize={10} fill="#6b7280">
          {active ? active.label : centerLabel}
        </text>
      </svg>

      <Flex vertical gap={6}>
        {data.map((d) => (
          <Flex
            key={d.key}
            align="center"
            gap={8}
            onMouseEnter={() => setHover(d.key)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "default", opacity: hover === null || hover === d.key ? 1 : 0.5 }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: "inline-block" }} />
            <Typography.Text style={{ minWidth: 80 }}>{d.label}</Typography.Text>
            <Typography.Text strong>{d.value}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {total ? Math.round((d.value / total) * 100) : 0}%
            </Typography.Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
