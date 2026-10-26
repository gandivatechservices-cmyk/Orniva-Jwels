"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, Card, Col, Descriptions, Empty, Row, Spin, Statistic, Tag, Timeline, Typography } from "antd";
import {
  ArrowLeftOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  StopOutlined,
  TruckOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { ProtectedRoute } from "guards";
import { AdminLayout } from "components";
import { ordersService, type Order, type OrderHistoryAction, type Refund } from "utility/services";
import { formatPrice } from "utility/formatMoney";
import { OrderPricing } from "../OrderPricing";
import styles from "../orders.module.css";
import detailStyles from "./orderDetail.module.css";

const statusColor: Record<Order["status"], string> = {
  pending: "gold",
  confirmed: "blue",
  shipped: "geekblue",
  delivered: "green",
  cancelled: "red",
};

const historyIcon: Record<OrderHistoryAction, React.ReactNode> = {
  created: <PlusCircleOutlined />,
  updated: <EditOutlined />,
  accepted: <CheckCircleOutlined />,
  cancelled: <StopOutlined />,
  shipped: <TruckOutlined />,
  shipment_edited: <TruckOutlined />,
  shipment_undone: <UndoOutlined />,
  delivered: <CheckCircleOutlined />,
  delivery_undone: <UndoOutlined />,
  refunded: <UndoOutlined />,
};

const historyColor: Record<OrderHistoryAction, string> = {
  created: "blue",
  updated: "gray",
  accepted: "green",
  cancelled: "red",
  shipped: "green",
  shipment_edited: "blue",
  shipment_undone: "orange",
  delivered: "green",
  delivery_undone: "orange",
  refunded: "red",
};

export default function AdminOrderDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminLayout>
        <OrderDetailView />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function OrderDetailView() {
  const { notification } = App.useApp();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!orderId) return;
    setLoading(true);
    Promise.all([ordersService.getById(orderId), ordersService.listRefunds(orderId).catch(() => [])])
      .then(([orderResult, refundResult]) => {
        setOrder(orderResult);
        setRefunds(refundResult);
      })
      .catch((err) =>
        notification.error({
          title: "Couldn't load order",
          description: err instanceof Error ? err.message : "Please try again.",
        })
      )
      .finally(() => setLoading(false));
  }, [orderId, notification]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading && !order) {
    return (
      <div className={detailStyles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return <Empty description="Order not found" />;
  }

  const currency = order.currency || "GBP";
  const customerName = typeof order.userId === "string" ? order.userId : order.userId.name;
  const customerEmail = typeof order.userId === "string" ? "" : order.userId.email;

  const sortedHistory = [...order.history].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className={styles.page}>
      <div className={detailStyles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/orders")}>
          Back to Orders
        </Button>
        <div className={detailStyles.headerTitle}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Order #{order._id.slice(-8).toUpperCase()}
          </Typography.Title>
          <Tag color={statusColor[order.status]} className={styles.statusTag}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Tag>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { key: "total", title: "Order total", value: formatPrice(order.total, currency), icon: <DollarOutlined />, from: "#8E662F", to: "#A77B3F" },
          { key: "items", title: "Items", value: `${order.items.reduce((n, i) => n + i.quantity, 0)} units`, icon: <ShoppingOutlined />, from: "#1f3f55", to: "#3f6f8c" },
          {
            key: "pay",
            title: "Payment",
            value: order.paymentStatus.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
            icon: <CreditCardOutlined />,
            from: order.paymentStatus === "paid" ? "#6b5a3a" : "#7a3030",
            to: order.paymentStatus === "paid" ? "#a08a57" : "#b05a5a",
          },
          {
            key: "placed",
            title: "Placed on",
            value: new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            icon: <ClockCircleOutlined />,
            from: "#4a4060",
            to: "#7a6c96",
          },
        ].map((stat) => (
          <Col key={stat.key} xs={12} lg={6}>
            <Card
              variant="borderless"
              style={{ borderRadius: 12 }}
            >
              <Statistic
                title={<span style={{ color: "#77716A" }}>{stat.title}</span>}
                value={stat.value}
                prefix={<span style={{ color: stat.from }}>{stat.icon}</span>}
                styles={{ content: { color: "#242321", fontSize: 22, fontWeight: 700 } }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title={<><ShoppingOutlined /> Items</>} bordered={false} className={styles.tableCard} styles={{ header: { background: "#FAF8F4", color: "#8E662F" } }}>
            <div className={detailStyles.itemsList}>
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${item.variantId}-${index}`} className={detailStyles.itemRow}>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className={detailStyles.itemImage} />
                  ) : (
                    <div className={detailStyles.itemImagePlaceholder} />
                  )}
                  <div className={detailStyles.itemInfo}>
                    <div className={detailStyles.itemName}>{item.name}</div>
                    <div className={styles.muted}>
                      {item.sku ? `SKU: ${item.sku}` : null}
                      {item.sku && Object.keys(item.attributes || {}).length > 0 ? " · " : ""}
                      {Object.entries(item.attributes || {})
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </div>
                    {item.freeQty ? (
                      <Tag color="gold" className={detailStyles.freeTag}>
                        {item.freeQty} free
                      </Tag>
                    ) : null}
                  </div>
                  <div className={detailStyles.itemQty}>× {item.quantity}</div>
                  <div className={detailStyles.itemPrice}>{formatPrice(item.price, currency)}</div>
                </div>
              ))}
            </div>

            <Row gutter={[24, 16]} className={detailStyles.totalsBlock}>
              <Col xs={24} md={12}>
                <Card size="small" title="Order info" styles={{ header: { background: "#FAF8F4", color: "#8E662F" } }}>
                <Descriptions
                  size="small"
                  column={1}
                  items={[
                    { key: "items", label: "Items", children: `${order.items.length} (${order.items.reduce((n, i) => n + i.quantity, 0)} units)` },
                    { key: "method", label: "Payment method", children: order.paymentMethod === "cod" ? "Cash on delivery" : "Card" },
                    {
                      key: "payment",
                      label: "Payment status",
                      children: (
                        <Tag color={order.paymentStatus === "paid" ? "green" : order.paymentStatus === "failed" ? "red" : "gold"}>
                          {order.paymentStatus.replace(/_/g, " ")}
                        </Tag>
                      ),
                    },
                    ...(order.deliveredAt
                      ? [{ key: "delivered", label: "Delivered", children: new Date(order.deliveredAt).toLocaleDateString("en-GB") }]
                      : []),
                  ]}
                />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <OrderPricing order={order} currency={currency} />
              </Col>
            </Row>
          </Card>

          <Card title={<><ClockCircleOutlined /> Timeline</>} bordered={false} className={detailStyles.timelineCard} styles={{ header: { background: "#FAF8F4", color: "#8E662F" } }}>
            {sortedHistory.length === 0 ? (
              <Empty description="No history recorded yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Timeline
                items={sortedHistory.map((entry) => ({
                  color: historyColor[entry.action],
                  dot: historyIcon[entry.action],
                  children: (
                    <div>
                      <div className={detailStyles.historyDescription}>{entry.description}</div>
                      <div className={styles.muted}>
                        {new Date(entry.at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {entry.actorName || entry.actorEmail ? (
                          <>
                            {" "}
                            by <strong>{entry.actorName || entry.actorEmail}</strong>
                            {entry.actorRole ? ` (${entry.actorRole})` : ""}
                          </>
                        ) : (
                          " by customer"
                        )}
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>

          {refunds.length > 0 && (
            <Card title="Refund history" bordered={false} className={detailStyles.timelineCard}>
              {refunds.map((refund) => (
                <div key={refund._id} className={styles.refundHistoryItem}>
                  {formatPrice(refund.amount, currency)} via {refund.method.replace(/_/g, " ")} —{" "}
                  {new Date(refund.createdAt).toLocaleString()}
                  <div className={styles.muted}>{refund.reason}</div>
                </div>
              ))}
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<><UserOutlined /> Customer</>} bordered={false} className={detailStyles.sideCard} styles={{ header: { background: "#FAF8F4", color: "#8E662F" } }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{customerName}</Descriptions.Item>
              {customerEmail && <Descriptions.Item label="Email">{customerEmail}</Descriptions.Item>}
              <Descriptions.Item label="Placed">
                {new Date(order.createdAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title={<><EnvironmentOutlined /> Shipping address</>} bordered={false} className={detailStyles.sideCard} styles={{ header: { background: "#FAF8F4", color: "#8E662F" } }}>
            <Typography.Paragraph
              className={detailStyles.addressBlock}
              copyable={{
                text: [
                  order.shippingAddress.line1,
                  order.shippingAddress.line2,
                  `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
                  order.shippingAddress.country,
                ]
                  .filter(Boolean)
                  .join("\n"),
                tooltips: ["Copy address", "Copied"],
              }}
            >
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? <><br />{order.shippingAddress.line2}</> : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </Typography.Paragraph>
            {order.shippingAddress.phone ? (
              <Typography.Text copyable={{ text: order.shippingAddress.phone, tooltips: ["Copy phone", "Copied"] }}>
                {order.shippingAddress.phone}
              </Typography.Text>
            ) : null}
          </Card>

          {(order.trackingNumber || order.carrierName) && (
            <Card title="Shipment" bordered={false} className={detailStyles.sideCard} styles={{ header: { background: "#FAF8F4", color: "#8E662F" } }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<><CarOutlined /> Carrier</>}>{order.carrierName || "—"}</Descriptions.Item>
                <Descriptions.Item label="Tracking #">{order.trackingNumber || "—"}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {order.adminNote && (
            <Card title={<><FileTextOutlined /> Admin note</>} bordered={false} className={detailStyles.sideCard}>
              <Typography.Paragraph className={detailStyles.addressBlock}>{order.adminNote}</Typography.Paragraph>
            </Card>
          )}

          {order.cancellationReason && (
            <Card title="Cancellation reason" bordered={false} className={detailStyles.sideCard}>
              <Typography.Paragraph className={detailStyles.addressBlock}>{order.cancellationReason}</Typography.Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
