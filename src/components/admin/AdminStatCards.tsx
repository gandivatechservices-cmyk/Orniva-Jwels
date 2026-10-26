import type { ReactNode } from "react";
import { Card, Col, Row, Statistic } from "antd";

export type AdminStat = { key: string; title: string; value: string | number; icon: ReactNode; color: string };

/** Same row of white summary cards on every admin page. */
export function AdminStatCards({ items, loading = false }: { items: AdminStat[]; loading?: boolean }) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {items.map((stat) => (
        <Col key={stat.key} xs={12} lg={24 / items.length}>
          <Card loading={loading} variant="borderless" style={{ borderRadius: 12 }}>
            <Statistic
              title={<span style={{ color: "#77716A" }}>{stat.title}</span>}
              value={stat.value}
              prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
              styles={{ content: { color: "#242321", fontSize: 22, fontWeight: 700 } }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
