"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Col,
  Row,
  Image,
  Badge,
  Flex,
  List,
  Tooltip,
  Popover,
} from "antd";
import type { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  EllipsisOutlined,
  FilePdfOutlined,
  ShoppingCartOutlined,
  StopOutlined,
  TruckOutlined,
  UndoOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { ProtectedRoute } from "guards";
import { ADMIN_TABLE_PROPS, AdminPageHeader, AdminSearchBar, AdminStatCards } from "components/admin";
import { useAdminSearchIntent } from "hooks";
import { AdminLayout } from "components";
import { ordersService, type Order, type Refund, type RefundMethod } from "utility/services";
import { downloadInvoicePdf } from "utility/generateInvoicePdf";
import { formatPrice } from "utility/formatMoney";
import { OrderPricing } from "./OrderPricing";
import styles from "./orders.module.css";

export default function AdminOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminLayout>
        <OrdersView />
      </AdminLayout>
    </ProtectedRoute>
  );
}

const statusColor: Record<Order["status"], string> = {
  pending: "gold",
  confirmed: "blue",
  shipped: "geekblue",
  delivered: "green",
  cancelled: "red",
};

const REFUND_METHODS: { value: RefundMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "original_payment_method", label: "Original Payment Method" },
  { value: "store_credit", label: "Store Credit" },
  { value: "other", label: "Other" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

function OrdersView() {
  const { notification } = App.useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Order | null>(null);
  const [editForm] = Form.useForm();

  const [shipping, setShipping] = useState<Order | null>(null);
  const [shipForm] = Form.useForm();

  const [refunding, setRefunding] = useState<Order | null>(null);
  const [refundForm] = Form.useForm();
  const [refundHistory, setRefundHistory] = useState<Refund[]>([]);
  const [refundHistoryLoading, setRefundHistoryLoading] = useState(false);

  const [rejecting, setRejecting] = useState<Order | null>(null);
  const [rejectForm] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  useAdminSearchIntent(({ q }) => setSearchText(q));
  const [statusFilter, setStatusFilter] = useState<Order["status"][]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [refundFilter, setRefundFilter] = useState<"all" | "refunded" | "not_refunded">("all");

  const load = useCallback(() => {
    setLoading(true);
    ordersService
      .listAdmin()
      .then(setOrders)
      .catch((err) =>
        notification.error({
          title: "Couldn't load orders",
          description: err instanceof Error ? err.message : "Please try again.",
        })
      )
      .finally(() => setLoading(false));
  }, [notification]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const stats = useMemo(() => {
    const currency = orders[0]?.currency || "GBP";
    const pending = orders.filter((o) => o.status === "pending").length;
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const refunded = orders.reduce((sum, o) => sum + (o.totalRefunded || 0), 0);
    return { total: orders.length, pending, revenue, refunded, currency };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter.length > 0 && !statusFilter.includes(order.status)) return false;

      if (refundFilter === "refunded" && !(order.totalRefunded > 0)) return false;
      if (refundFilter === "not_refunded" && order.totalRefunded > 0) return false;

      if (dateRange && dateRange[0] && dateRange[1]) {
        const placed = new Date(order.createdAt).getTime();
        const start = dateRange[0].startOf("day").valueOf();
        const end = dateRange[1].endOf("day").valueOf();
        if (placed < start || placed > end) return false;
      }

      if (query) {
        const customerName = typeof order.userId === "string" ? order.userId : order.userId.name;
        const customerEmail = typeof order.userId === "string" ? "" : order.userId.email;
        const haystack = [
          order._id,
          customerName,
          customerEmail,
          order.trackingNumber || "",
          order.carrierName || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [orders, searchText, statusFilter, dateRange, refundFilter]);

  const hasActiveFilters = Boolean(
    searchText.trim() || statusFilter.length > 0 || dateRange || refundFilter !== "all"
  );

  function clearFilters() {
    setSearchText("");
    setStatusFilter([]);
    setDateRange(null);
    setRefundFilter("all");
  }

  async function cancelOrder(order: Order) {
    try {
      await ordersService.cancel(order._id);
      notification.success({ title: "Order cancelled" });
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't cancel order",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  async function acceptOrder(order: Order) {
    try {
      await ordersService.accept(order._id);
      notification.success({ title: "Order accepted" });
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't accept order",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  async function rejectOrder(order: Order, reason?: string) {
    try {
      await ordersService.cancel(order._id, reason);
      notification.success({ title: "Order rejected" });
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't reject order",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  async function deliverOrder(order: Order) {
    try {
      await ordersService.deliver(order._id);
      notification.success({ title: "Order marked as delivered" });
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't mark order as delivered",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  async function undoShipOrder(order: Order) {
    try {
      await ordersService.undoShip(order._id);
      notification.success({ title: "Shipment undone — order is back to confirmed" });
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't undo shipment",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  async function undoDeliverOrder(order: Order) {
    try {
      await ordersService.undoDeliver(order._id);
      notification.success({ title: "Delivery undone — order is back to shipped" });
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't undo delivery",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  function openEdit(order: Order) {
    setEditing(order);
    editForm.setFieldsValue({
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
      adminNote: order.adminNote,
    });
  }

  function closeEdit() {
    setEditing(null);
    editForm.resetFields();
  }

  async function saveEdit(values: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    phone?: string;
    adminNote?: string;
  }) {
    if (!editing) return;
    try {
      await ordersService.update(editing._id, {
        shippingAddress: {
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          phone: values.phone,
        },
        adminNote: values.adminNote,
      });
      notification.success({ title: "Order updated" });
      closeEdit();
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't update order",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  function openShip(order: Order) {
    setShipping(order);
    shipForm.setFieldsValue({ carrierName: order.carrierName, trackingNumber: order.trackingNumber });
  }

  function closeShip() {
    setShipping(null);
    shipForm.resetFields();
  }

  async function saveShip(values: { carrierName?: string; trackingNumber?: string }) {
    if (!shipping) return;
    try {
      await ordersService.ship(shipping._id, values);
      notification.success({ title: "Order marked as shipped" });
      closeShip();
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't mark order as shipped",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  function openRefund(order: Order) {
    setRefunding(order);
    setRefundHistory([]);
    refundForm.resetFields();
    setRefundHistoryLoading(true);
    ordersService
      .listRefunds(order._id)
      .then(setRefundHistory)
      .catch((err) =>
        notification.error({
          title: "Couldn't load refund history",
          description: err instanceof Error ? err.message : "Please try again.",
        })
      )
      .finally(() => setRefundHistoryLoading(false));
  }

  function closeRefund() {
    setRefunding(null);
    refundForm.resetFields();
  }

  async function saveRefund(values: { amount: number; reason: string; method: RefundMethod; referenceNumber?: string; notes?: string }) {
    if (!refunding) return;
    try {
      await ordersService.createRefund(refunding._id, values);
      notification.success({ title: "Refund recorded" });
      closeRefund();
      load();
    } catch (err) {
      notification.error({
        title: "Couldn't record refund",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  const columns: ColumnsType<Order> = [
    {
      title: "Order",
      key: "id",
      width: 110,
      render: (_, order) => (
        <Flex vertical gap={2}>
          <Link href={`/admin/orders/${order._id}`}>
            <Typography.Text strong style={{ color: "#12432a" }}>
              #{order._id.slice(-8).toUpperCase()}
            </Typography.Text>
          </Link>
          <Typography.Text type="secondary">
            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: "Customer",
      key: "userId",
      width: 170,
      render: (_, order) =>
        typeof order.userId === "string" ? (
          order.userId
        ) : (
          <Tooltip title={order.userId.email}><Space size={8}>
            <Avatar size={26} style={{ background: "#12432a" }}>{initials(order.userId.name)}</Avatar>
            <Typography.Text strong>{order.userId.name}</Typography.Text>
          </Space></Tooltip>
        ),
    },
    {
      title: "Items",
      key: "items",
      width: 60,
      align: "center",
      render: (_, order) => (
        <Popover
          placement="right"
          title={
            <Flex justify="space-between" align="center" gap={16}>
              <span>Pack list</span>
              {order.paymentMethod === "cod" && order.paymentStatus !== "paid" && (
                <Tag color="red" style={{ margin: 0 }}>
                  COD: collect {formatPrice(order.total, order.currency || "GBP")}
                </Tag>
              )}
              <Tag color="blue" style={{ margin: 0 }}>
                {order.items.reduce((n, i) => n + i.quantity + (i.freeQty || 0), 0)} units to pack
              </Tag>
            </Flex>
          }
          content={
            <Flex vertical gap={10} style={{ minWidth: 300, maxWidth: 380, maxHeight: 360, overflowY: "auto" }}>
              {order.items.map((item, index) => (
                <Flex key={`${item.productId}-${item.variantId}-${index}`} gap={10} align="center">
                  <Image
                    width={44}
                    height={44}
                    src={item.image}
                    alt={item.name}
                    preview={false}
                    style={{ objectFit: "cover", borderRadius: 6 }}
                    fallback="/assets/images/placeholders/product-placeholder.svg"
                  />
                  <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong>{item.name}</Typography.Text>
                    <Space size={4} wrap>
                      {item.sku && <Typography.Text code style={{ fontSize: 11 }}>{item.sku}</Typography.Text>}
                    </Space>
                    {Object.keys(item.attributes || {}).length > 0 && (
                      <Space size={4} wrap>
                        {Object.entries(item.attributes || {}).map(([k, v]) => (
                          <Tag key={k} color="geekblue" style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>
                            {`${k.charAt(0).toUpperCase()}${k.slice(1)}: ${v}`}
                          </Tag>
                        ))}
                      </Space>
                    )}
                    {item.freeQty ? <Tag color="gold" style={{ margin: 0, width: "fit-content" }}>+ {item.freeQty} free</Tag> : null}
                  </Flex>
                  <Flex vertical align="flex-end">
                    <Typography.Text strong style={{ fontSize: 18, color: "#12432a" }}>× {item.quantity}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {formatPrice(item.price, order.currency || "GBP")} each
                    </Typography.Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          }
        >
          <span style={{ cursor: "pointer" }}>
            <Badge count={order.items.reduce((sum, item) => sum + item.quantity, 0)} color="#1d4ed8" showZero />
          </span>
        </Popover>
      ),
    },
    {
      title: "Total",
      key: "total",
      align: "right",
      width: 90,
      render: (_, order) => (
        <Typography.Text strong style={{ fontSize: 13 }}>
          {formatPrice(order.total, order.currency || "GBP")}
        </Typography.Text>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      width: 110,
      render: (_, order) => {
        const isCod = order.paymentMethod === "cod";
        const unpaid = order.paymentStatus !== "paid";
        return (
          <Flex vertical gap={2} align="flex-start">
            <Space size={4}>
              <Tag
                variant="filled"
                style={{ margin: 0 }}
                color={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "error" : order.paymentStatus === "pending" ? "warning" : "purple"}
              >
                {order.paymentStatus.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
              </Tag>
              {isCod && <Tag color="orange" style={{ margin: 0 }}>COD</Tag>}
            </Space>
            {isCod && unpaid && (
              <Typography.Text type="danger" strong style={{ fontSize: 11 }}>
                Collect {formatPrice(order.total, order.currency || "GBP")}
              </Typography.Text>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: Order["status"]) => (
        <Tag variant="filled" color={statusColor[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Shipping",
      key: "shipping",
      width: 160,
      render: (_, order) =>
        order.deliveredAt ? (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0, whiteSpace: "nowrap" }}>
            {new Date(order.deliveredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </Tag>
        ) : order.trackingNumber ? (
          <Tag icon={<TruckOutlined />} color="processing" style={{ margin: 0, whiteSpace: "nowrap" }}>
            {order.carrierName || "Carrier"} · {order.trackingNumber}
          </Tag>
        ) : (
          <Tag>Not shipped</Tag>
        ),
    },
    {
      title: "Refunded",
      key: "refunded",
      align: "right",
      width: 90,
      render: (_, order) =>
        order.totalRefunded > 0 ? (
          <Typography.Text type="danger" strong>
            {formatPrice(order.totalRefunded, order.currency || "GBP")}
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 90,
      render: (_, order) => {
        const isPending = order.status === "pending";
        const cancellable = order.status === "pending" || order.status === "confirmed";
        const shippable = order.status === "confirmed";
        const shipEditable = order.status === "shipped";
        const deliverable = order.status === "shipped";
        const refundable = order.status === "cancelled" && order.totalRefunded < order.total;

        const items: MenuProps["items"] = [
          { key: "accept", label: "Accept order", icon: <CheckCircleOutlined />, disabled: !isPending },
          { key: "edit", label: "Edit order", icon: <EditOutlined /> },
          {
            key: "ship",
            label: shipEditable ? "Edit shipping details" : "Mark as shipped",
            icon: <TruckOutlined />,
            disabled: !shippable && !shipEditable,
          },
          { key: "undoShip", label: "Undo shipment", icon: <UndoOutlined />, disabled: !shipEditable },
          { key: "deliver", label: "Mark as delivered", icon: <CheckCircleOutlined />, disabled: !deliverable },
          {
            key: "undoDeliver",
            label: "Undo delivery",
            icon: <UndoOutlined />,
            disabled: order.status !== "delivered",
          },
          { key: "refund", label: "Record refund", icon: <UndoOutlined />, disabled: !refundable },
          {
            key: "invoice",
            label: "Download invoice",
            icon: <FilePdfOutlined />,
            disabled: isPending,
          },
          { type: "divider" },
          {
            key: "cancel",
            label: isPending ? "Reject order" : "Cancel order",
            icon: <StopOutlined />,
            danger: true,
            disabled: !cancellable,
          },
        ];

        const onMenuClick: MenuProps["onClick"] = ({ key }) => {
          if (key === "invoice") {
            ordersService
              .getInvoice(order._id)
              .then((inv) => {
                downloadInvoicePdf(inv);
                notification.success({ title: "Invoice downloaded" });
              })
              .catch((err) => {
                notification.error({
                  title: "Failed to download invoice",
                  description: err instanceof Error ? err.message : "Unknown error",
                });
              });
          }
          if (key === "accept") {
            Modal.confirm({
              title: "Accept this order?",
              content: "The order will move to \"Confirmed\" and can then be shipped.",
              okText: "Accept Order",
              cancelText: "Back",
              onOk: () => acceptOrder(order),
            });
          }
          if (key === "edit") openEdit(order);
          if (key === "ship") openShip(order);
          if (key === "undoShip") {
            Modal.confirm({
              title: "Undo this shipment?",
              content: "The order will go back to \"Confirmed\" so you can fix and re-ship it.",
              okText: "Undo Shipment",
              cancelText: "Back",
              onOk: () => undoShipOrder(order),
            });
          }
          if (key === "deliver") {
            Modal.confirm({
              title: "Mark this order as delivered?",
              okText: "Mark Delivered",
              cancelText: "Back",
              onOk: () => deliverOrder(order),
            });
          }
          if (key === "undoDeliver") {
            Modal.confirm({
              title: "Undo this delivery?",
              content: "The order will go back to \"Shipped\".",
              okText: "Undo Delivery",
              cancelText: "Back",
              onOk: () => undoDeliverOrder(order),
            });
          }
          if (key === "refund") openRefund(order);
          if (key === "cancel") {
            if (isPending) {
              setRejecting(order);
              rejectForm.resetFields();
            } else {
              Modal.confirm({
                title: "Cancel this order?",
                okText: "Cancel Order",
                okButtonProps: { danger: true },
                cancelText: "Back",
                onOk: () => cancelOrder(order),
              });
            }
          }
        };

        return (
          <Dropdown menu={{ items, onClick: onMenuClick }} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<EllipsisOutlined />} className={styles.actionsBtn} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      <AdminPageHeader title="Orders" subtitle="Track, pack, ship and refund customer orders." />
      <AdminStatCards
        items={[
          { key: "total", title: "Total Orders", value: stats.total, icon: <ShoppingCartOutlined />, color: "#14452b" },
          { key: "pending", title: "Pending", value: stats.pending, icon: <ClockCircleOutlined />, color: "#6b5a3a" },
          { key: "revenue", title: "Revenue (excl. cancelled)", value: formatPrice(stats.revenue, stats.currency), icon: <WalletOutlined />, color: "#1f3f55" },
          { key: "refunded", title: "Refunded", value: formatPrice(stats.refunded, stats.currency), icon: <UndoOutlined />, color: "#7a3030" },
        ]}
      />

      <Card bordered={false} className={styles.tableCard}>
        <AdminSearchBar value={searchText} onChange={setSearchText} placeholder="Search by order ID, customer or tracking number..." />
        <Flex wrap gap={12} align="center" style={{ marginBottom: 16 }}>
          <Select
            size="large"
            mode="multiple"
            allowClear
            placeholder="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ minWidth: 200 }}
            options={[
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <DatePicker.RangePicker
            size="large"
            value={dateRange}
            onChange={(values) => setDateRange(values as [Dayjs | null, Dayjs | null] | null)}
          />
          <Select
            size="large"
            value={refundFilter}
            onChange={setRefundFilter}
            style={{ minWidth: 150 }}
            options={[
              { value: "all", label: "All orders" },
              { value: "refunded", label: "Refunded" },
              { value: "not_refunded", label: "Not refunded" },
            ]}
          />
          {hasActiveFilters && (
            <Button type="link" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
          <Typography.Text type="secondary" style={{ marginLeft: "auto" }}>
            {filteredOrders.length} of {orders.length} orders
          </Typography.Text>
        </Flex>

        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={filteredOrders}
          {...ADMIN_TABLE_PROPS}
          rowHoverable
          expandable={{
            columnWidth: 40,
            expandedRowRender: (order) => (
              <Row gutter={[12, 12]} style={{ maxWidth: 1250 }}>
                <Col xs={24} xl={11}>
                  <Card size="small" title={<span style={{ fontSize: 13 }}>Items</span>} style={{ height: "100%" }} styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}>
                    <List
                      size="small"
                      dataSource={order.items}
                      renderItem={(item) => (
                        <List.Item
                          key={`${item.productId}-${item.variantId}`}
                          extra={<Typography.Text strong>{formatPrice(item.price, order.currency || "GBP")}</Typography.Text>}
                        >
                          <List.Item.Meta
                            avatar={
                              <Image
                                width={40}
                                height={40}
                                src={item.image}
                                alt={item.name}
                                style={{ objectFit: "cover", borderRadius: 6 }}
                                fallback="/assets/images/placeholders/product-placeholder.svg"
                              />
                            }
                            title={item.name}
                            description={
                              <Space size={4} wrap>
                                {item.sku && <Typography.Text code>{item.sku}</Typography.Text>}
                                {Object.entries(item.attributes || {}).map(([k, v]) => (
                                  <Tag key={k}>{`${k}: ${v}`}</Tag>
                                ))}
                                <Tag color="blue">× {item.quantity}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12} xl={7}>
                  <OrderPricing order={order} currency={order.currency || "GBP"} />
                </Col>
                <Col xs={24} md={12} xl={6}>
                  <Card
                    size="small"
                    title={<span style={{ fontSize: 13 }}><EnvironmentOutlined /> Delivery address</span>}
                    extra={
                      <Typography.Text
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
                      />
                    }
                    style={{ height: "100%" }}
                    styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}
                  >
                    <Flex vertical gap={2}>
                      <Typography.Text strong>
                        {typeof order.userId === "string" ? "" : order.userId.name}
                      </Typography.Text>
                      <Typography.Text>{order.shippingAddress.line1}</Typography.Text>
                      {order.shippingAddress.line2 && <Typography.Text>{order.shippingAddress.line2}</Typography.Text>}
                      <Typography.Text>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </Typography.Text>
                      <Typography.Text>{order.shippingAddress.country}</Typography.Text>
                      {order.shippingAddress.phone && (
                        <Typography.Text
                          type="secondary"
                          copyable={{ text: order.shippingAddress.phone, tooltips: ["Copy phone", "Copied"] }}
                        >
                          <PhoneOutlined /> {order.shippingAddress.phone}
                        </Typography.Text>
                      )}
                    </Flex>
                  </Card>
                </Col>
              </Row>
            ),
          }}
        />
      </Card>

      <Modal open={editing !== null} onCancel={closeEdit} footer={null} destroyOnHidden title="Edit order">
        <Form form={editForm} layout="vertical" onFinish={saveEdit} requiredMark={false}>
          <Form.Item name="line1" label="Address line 1" rules={[{ required: true, message: "Required" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="line2" label="Address line 2">
            <Input />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]} style={{ width: "100%" }}>
              <Input />
            </Form.Item>
            <Form.Item name="state" label="State" rules={[{ required: true, message: "Required" }]} style={{ width: "100%" }}>
              <Input />
            </Form.Item>
          </Space.Compact>
          <Space.Compact block>
            <Form.Item name="postalCode" label="Postal code" rules={[{ required: true, message: "Required" }]} style={{ width: "100%" }}>
              <Input />
            </Form.Item>
            <Form.Item name="country" label="Country" style={{ width: "100%" }}>
              <Input />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="adminNote" label="Internal admin note">
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          <Form.Item className={styles.formActions}>
            <Button onClick={closeEdit}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save changes</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={shipping !== null}
        onCancel={closeShip}
        footer={null}
        destroyOnHidden
        title={shipping?.status === "shipped" ? "Edit shipping details" : "Mark order as shipped"}
      >
        <p className={styles.muted}>
          Shipping is handled manually right now — enter the carrier and tracking number by hand. This can be swapped for an automated
          carrier integration later without changing this flow for admins.
        </p>
        <Form form={shipForm} layout="vertical" onFinish={saveShip} requiredMark={false}>
          <Form.Item name="carrierName" label="Carrier name">
            <Input placeholder="e.g. Blue Dart, DTDC" />
          </Form.Item>
          <Form.Item name="trackingNumber" label="Tracking number">
            <Input />
          </Form.Item>
          <Form.Item className={styles.formActions}>
            <Button onClick={closeShip}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {shipping?.status === "shipped" ? "Save Changes" : "Mark as Shipped"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={refunding !== null} onCancel={closeRefund} footer={null} destroyOnHidden title="Record a refund" width={520}>
        {refunding && (
          <Descriptions size="small" column={1} className={styles.refundSummary}>
            <Descriptions.Item label="Order total">{formatPrice(refunding.total, refunding.currency || "GBP")}</Descriptions.Item>
            <Descriptions.Item label="Already refunded">{formatPrice(refunding.totalRefunded, refunding.currency || "GBP")}</Descriptions.Item>
          </Descriptions>
        )}

        {refundHistory.length > 0 && (
          <div className={styles.refundHistory}>
            <Typography.Text strong>Refund history</Typography.Text>
            {refundHistory.map((refund) => (
              <div key={refund._id} className={styles.refundHistoryItem}>
                {formatPrice(refund.amount, refunding?.currency || "GBP")} via {refund.method.replace(/_/g, " ")} —{" "}
                {new Date(refund.createdAt).toLocaleString()}
                <div className={styles.muted}>{refund.reason}</div>
              </div>
            ))}
          </div>
        )}

        <Form form={refundForm} layout="vertical" onFinish={saveRefund} requiredMark={false} disabled={refundHistoryLoading}>
          <Form.Item name="amount" label="Refund amount" rules={[{ required: true, message: "Please enter an amount" }]}>
            <Input type="number" min={0.01} step={0.01} />
          </Form.Item>
          <Form.Item name="method" label="Refund method" rules={[{ required: true, message: "Please select a method" }]}>
            <Select options={REFUND_METHODS} placeholder="How was this refunded?" />
          </Form.Item>
          <Form.Item name="referenceNumber" label="Reference number">
            <Input placeholder="Bank/UPI transaction id, cheque number, etc." />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: "Please explain why this refund is issued" }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item className={styles.formActions}>
            <Button onClick={closeRefund}>Cancel</Button>
            <Button type="primary" htmlType="submit">Record Refund</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={rejecting !== null}
        onCancel={() => setRejecting(null)}
        footer={null}
        destroyOnHidden
        title="Reject this order"
      >
        <Form
          form={rejectForm}
          layout="vertical"
          requiredMark={false}
          onFinish={(values: { reason?: string }) => {
            if (!rejecting) return;
            rejectOrder(rejecting, values.reason);
            setRejecting(null);
          }}
        >
          <Form.Item name="reason" label="Reason for rejection">
            <Input.TextArea rows={3} placeholder="e.g. out of stock, unable to verify address, suspected fraud..." />
          </Form.Item>
          <Form.Item className={styles.formActions}>
            <Button onClick={() => setRejecting(null)}>Cancel</Button>
            <Button type="primary" danger htmlType="submit">Reject Order</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
