"use client";

import { Flex, Tooltip, Typography } from "antd";

export type HBarRow = { key: string; label: string; value: number; sublabel?: string };

type Props = {
  rows: HBarRow[];
  formatValue: (value: number) => string;
  color?: string;
};

/** Ranked horizontal bars: label on the left, bar in the middle, value on the right. */
export function HorizontalBarChart({ rows, formatValue, color = "#A77B3F" }: Props) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <Flex vertical gap={10} role="img" aria-label="Ranked bar chart">
      {rows.map((row) => (
        <Tooltip key={row.key} title={`${row.label}: ${formatValue(row.value)}${row.sublabel ? ` · ${row.sublabel}` : ""}`}>
          <Flex align="center" gap={12}>
            <Typography.Text ellipsis style={{ width: 150, flexShrink: 0 }}>
              {row.label}
            </Typography.Text>
            <div style={{ flex: 1, background: "#F3EFE9", borderRadius: 6, height: 14, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.max((row.value / max) * 100, row.value > 0 ? 2 : 0)}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 6,
                }}
              />
            </div>
            <Typography.Text strong style={{ width: 80, textAlign: "right", flexShrink: 0 }}>
              {formatValue(row.value)}
            </Typography.Text>
          </Flex>
        </Tooltip>
      ))}
    </Flex>
  );
}
