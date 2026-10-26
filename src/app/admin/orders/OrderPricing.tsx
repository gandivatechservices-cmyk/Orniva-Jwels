"use client";

import { GiftOutlined, TagOutlined, TruckOutlined } from "@ant-design/icons";
import { Alert, Card, Descriptions, Divider, Flex, Statistic, Tag, Typography } from "antd";
import { formatPrice } from "../../../utility/formatMoney";
import type { Order } from "utility/services";

/** Price breakdown for an order, including the coupon/offer that was applied (if any). */
export function OrderPricing({ order, currency }: { order: Order; currency: string }) {
  const freeUnits = (order.items || []).reduce((sum, item) => sum + (item.freeQty || 0), 0);
  const offer = order.appliedOffer;
  const code = offer?.code || order.couponCode;
  const hasOffer = Boolean(offer || code || order.discountAmount > 0 || freeUnits > 0);
  const delivery = order.deliveryFee ?? 0;

  return (
    <Card size="small" title={<span style={{ fontSize: 13 }}>Payment summary</span>} style={{ height: "100%" }} styles={{ header: { background: "#FAF8F4", color: "#8E662F" } }}>
      <Descriptions
        column={1}
        size="small"
        styles={{ label: { fontSize: 12 }, content: { fontSize: 12 } }}
        items={[
          { key: "subtotal", label: "Subtotal", children: formatPrice(order.subtotal, currency) },
          { key: "delivery", label: "Delivery", children: delivery > 0 ? formatPrice(delivery, currency) : "Free" },
          ...(order.discountAmount > 0
            ? [
                {
                  key: "discount",
                  label: "Discount",
                  children: (
                    <Typography.Text type="success">-{formatPrice(order.discountAmount, currency)}</Typography.Text>
                  ),
                },
              ]
            : []),
          ...(freeUnits > 0
            ? [{ key: "free", label: "Free items", children: <Tag icon={<GiftOutlined />} color="gold">{freeUnits} free</Tag> }]
            : []),
          ...(offer?.freeDelivery
            ? [{ key: "freeDelivery", label: "Free delivery", children: <Tag icon={<TruckOutlined />} color="green">by offer</Tag> }]
            : []),
        ]}
      />

      {hasOffer && (
        <Alert
          type="success"
          showIcon
          icon={<TagOutlined />}
          style={{ marginTop: 4, padding: "6px 10px", fontSize: 12 }}
          title={
            <Flex justify="space-between" align="center" gap={8} wrap>
              <strong style={{ fontSize: 12 }}>{code || "Offer applied automatically"}</strong>
            </Flex>
          }
        />
      )}

      <Divider style={{ margin: "8px 0" }} />

      <Flex justify="space-between" align="center">
        <Typography.Text strong style={{ fontSize: 12 }}>Total</Typography.Text>
        <Statistic value={formatPrice(order.total, currency)} styles={{ content: { fontSize: 16, lineHeight: 1.2 } }} />
      </Flex>

      {order.totalRefunded > 0 && (
        <Flex justify="space-between" style={{ marginTop: 8 }}>
          <Typography.Text type="secondary">Refunded</Typography.Text>
          <Typography.Text type="danger">{formatPrice(order.totalRefunded, currency)}</Typography.Text>
        </Flex>
      )}
    </Card>
  );
}
