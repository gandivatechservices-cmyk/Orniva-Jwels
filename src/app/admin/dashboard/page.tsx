"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, App, Avatar, Button, Card, Col, DatePicker, Drawer, Empty, Flex, Input, InputNumber, List, Progress, Row, Segmented, Space, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreAddOutlined,
  DollarOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserAddOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { ProtectedRoute } from "../../../guards";
import { DonutChart, HorizontalBarChart, RevenueBarChart, type DonutSlice } from "../../../components/charts";
import { AdminLayout } from "../../../components/AdminLayout";
import {
  catalogService,
  ordersService,
  usersService,
  type Domain,
  type Order,
  type Product,
} from "../../../utility/services";
import type { User } from "../../../utility/services/auth";
import { useAuth } from "hooks";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { formatPrice } from "../../../utility/formatMoney";

const STATUS_COLOR: Record<string, string> = {
  delivered: "success",
  completed: "success",
  shipped: "processing",
  out_for_delivery: "processing",
  picking: "warning",
  confirmed: "blue",
  pending: "warning",
  cancelled: "error",
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { notification } = App.useApp();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [preset, setPreset] = useState<"7" | "30" | "90" | "all" | "custom">("all");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [missingProductIds, setMissingProductIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [ordersRes, prodsRes, usersRes, domainsRes] = await Promise.all([
          ordersService.listAdmin().catch(() => []),
          catalogService.listAllProducts().catch(() => []),
          usersService.list().catch(() => []),
          catalogService.listDomains().catch(() => []),
        ]);

        setAllOrders(ordersRes || []);
        // The product list leaves out inactive/deleted products, so look up any that orders point to.
        const known = new Set((prodsRes || []).map((p) => p._id));
        const missing = [...new Set((ordersRes || []).flatMap((o) => o.items.map((i) => i.productId)))].filter((id) => !known.has(id));
        const extra = await Promise.all(missing.map((id) => catalogService.getProduct(id).catch(() => null)));
        const found = extra.filter((p): p is Product => p !== null);
        setProducts([...(prodsRes || []), ...found]);
        setMissingProductIds(missing.filter((id) => !found.some((p) => p._id === id)));
        setUsers(usersRes || []);
        setDomains(domainsRes || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const currency = domains[0]?.currency || "GBP";

  // KPIs
  // Orders inside the chosen date range. Every KPI, chart and table below uses these.
  const orders = useMemo(() => {
    const [start, end] = dateRange ?? [null, null];
    return allOrders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      if (start && t < start.startOf("day").valueOf()) return false;
      if (end && t > end.endOf("day").valueOf()) return false;
      return true;
    });
  }, [allOrders, dateRange]);

  function choosePreset(value: typeof preset) {
    setPreset(value);
    if (value === "all" || value === "custom") {
      if (value === "all") setDateRange(null);
      return;
    }
    setDateRange([dayjs().subtract(Number(value) - 1, "day"), dayjs()]);
  }

  const countedOrders = useMemo(() => orders.filter((o) => o.status !== "cancelled"), [orders]);
  const totalRevenue = useMemo(
    () => countedOrders.reduce((sum, o) => sum + (o.total || 0) - (o.totalRefunded || 0), 0),
    [countedOrders]
  );
  const totalOrders = countedOrders.length;
  const totalCustomers = users.length;
  const activeProductsCount = products.filter((p) => p.isActive).length;

  // Chart data: Group orders by date or list points
  const chartData = useMemo(() => {
    if (countedOrders.length === 0) {
      return [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 },
      ];
    }

    // Sort orders chronologically
    const sortedOrders = [...countedOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Group by day label
    const dayTotals: Record<string, number> = {};
    sortedOrders.forEach((ord) => {
      const day = new Date(ord.createdAt).toLocaleDateString("en-GB", {
        weekday: "short",
      });
      dayTotals[day] = (dayTotals[day] || 0) + ord.total;
    });

    const entries = Object.entries(dayTotals);
    if (entries.length < 5) {
      return sortedOrders.slice(-7).map((o) => ({
        label: new Date(o.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
        value: o.total,
      }));
    }

    return entries.map(([label, value]) => ({ label, value }));
  }, [countedOrders]);

  // Inventory Alerts: Out of stock (stock === 0) & Low stock (0 < stock <= 5)
  const inventoryAlerts = useMemo(() => {
    const alerts: Array<{
      productId: string;
      name: string;
      sku: string;
      stock: number;
      isOut: boolean;
    }> = [];

    products.forEach((p) => {
      if (p.isActive === false) return;
      p.variants.forEach((v) => {
        if (v.stock <= 5) {
          alerts.push({
            productId: p._id,
            name: p.name,
            sku: v.sku || "Base",
            stock: v.stock,
            isOut: v.stock <= 0,
          });
        }
      });
    });

    // Out of stock first, then the lowest stock.
    return alerts.sort((a, b) => a.stock - b.stock);
  }, [products]);

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [stockEdits, setStockEdits] = useState<Record<string, number | null>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [perfOpen, setPerfOpen] = useState(false);
  const [perfSearch, setPerfSearch] = useState("");
  const [alertSearch, setAlertSearch] = useState("");
  const [alertFilter, setAlertFilter] = useState<"all" | "out" | "low">("all");
  const shownAlerts = inventoryAlerts.filter(
    (a) =>
      (alertFilter === "all" || (alertFilter === "out" ? a.isOut : !a.isOut)) &&
      `${a.name} ${a.sku}`.toLowerCase().includes(alertSearch.trim().toLowerCase())
  );

  async function saveStock(productId: string, sku: string) {
    const key = `${productId}-${sku}`;
    const next = stockEdits[key];
    const product = products.find((p) => p._id === productId);
    if (next === undefined || next === null || !product) return;
    setSavingKey(key);
    try {
      const variants = product.variants.map((v) => ((v.sku || "Base") === sku ? { ...v, stock: Math.max(0, Math.floor(next)) } : v));
      const updated = await catalogService.updateProduct(productId, { variants });
      setProducts((current) => current.map((p) => (p._id === productId ? { ...p, variants: updated?.variants ?? variants } : p)));
      setStockEdits((current) => Object.fromEntries(Object.entries(current).filter(([k]) => k !== key)));
      notification.success({ title: "Stock updated", description: `${product.name} (${sku}) now has ${Math.max(0, Math.floor(next))} in stock.` });
    } catch (err) {
      notification.error({ title: "Couldn't update stock", description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSavingKey(null);
    }
  }

  const outCount = inventoryAlerts.filter((a) => a.isOut).length;

  const columns: ColumnsType<Order> = [
    {
      title: "Order",
      key: "_id",
      render: (_, row) => (
        <Link href={`/admin/orders/${row._id}`}>
          <Typography.Text strong style={{ color: "#12432a" }}>#{row._id.slice(-8).toUpperCase()}</Typography.Text>
        </Link>
      ),
    },
    { title: "Location", key: "loc", render: (_, row) => `${row.shippingAddress?.city || "Local"} ${row.shippingAddress?.postalCode || ""}` },
    {
      title: "Items",
      key: "items",
      align: "center",
      render: (_, row) => row.items?.reduce((n, i) => n + i.quantity, 0) || 0,
    },
    {
      title: "Amount",
      key: "total",
      align: "right",
      render: (_, row) => <Typography.Text strong>{formatPrice(row.total, row.currency || currency)}</Typography.Text>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <Tag variant="filled" color={STATUS_COLOR[row.status] || "default"}>
          {row.status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
        </Tag>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      render: (_, row) => (
        <Typography.Text type="secondary">
          {new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </Typography.Text>
      ),
    },
  ];

  const ordersByDay = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const counts = new Map<string, number>();
    sorted.forEach((o) => {
      const label = new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    const rows = [...counts.entries()].map(([label, value]) => ({ label, value }));
    return rows.length ? rows.slice(-14) : [{ label: "No orders", value: 0 }];
  }, [orders]);

  const [perfMetric, setPerfMetric] = useState<"qty" | "revenue">("qty");

  const productPerformance = useMemo(() => {
    const stockById = new Map(products.map((p) => [p._id, p.variants.reduce((sum, v) => sum + (v.stock || 0), 0)]));
    const map = new Map<string, { id: string; name: string; image?: string; qty: number; revenue: number; orderIds: Set<string> }>();
    countedOrders.forEach((o) =>
      o.items.forEach((item) => {
        const row = map.get(item.productId) || { id: item.productId, name: item.name, image: item.image, qty: 0, revenue: 0, orderIds: new Set<string>() };
        row.qty += item.quantity;
        row.revenue += item.price * item.quantity;
        row.orderIds.add(o._id);
        map.set(item.productId, row);
      })
    );
    const total = [...map.values()].reduce((sum, r) => sum + r.revenue, 0);
    return [...map.values()].map((r) => ({
      id: r.id,
      name: r.name,
      image: r.image,
      qty: r.qty,
      revenue: r.revenue,
      orders: r.orderIds.size,
      share: total ? (r.revenue / total) * 100 : 0,
      stock: stockById.get(r.id),
      unavailable: missingProductIds.includes(r.id),
    }));
  }, [countedOrders, products, missingProductIds]);

  const perfSorted = useMemo(
    () => [...productPerformance].sort((a, b) => b[perfMetric] - a[perfMetric]),
    [productPerformance, perfMetric]
  );

  const perfColumns: ColumnsType<(typeof productPerformance)[number]> = [
    {
      title: "Product",
      key: "name",
      render: (_, p) => (
        <Space>
          <Avatar shape="square" size={28} src={p.image} />
          <Typography.Text strong>{p.name}</Typography.Text>
        </Space>
      ),
    },
    { title: "Sold", dataIndex: "qty", align: "center", sorter: (a, b) => a.qty - b.qty },
    { title: "Orders", dataIndex: "orders", align: "center" },
    {
      title: "Revenue",
      key: "revenue",
      align: "right",
      sorter: (a, b) => a.revenue - b.revenue,
      render: (_, p) => formatPrice(p.revenue, currency),
    },
    {
      title: "Share",
      key: "share",
      width: 120,
      render: (_, p) => <Progress percent={Math.round(p.share)} size="small" strokeColor="#2f7a52" />,
    },
    {
      title: "Stock",
      key: "stock",
      align: "center",
      render: (_, p) =>
        p.unavailable ? (
          <Tag>Deleted</Tag>
        ) : p.stock === undefined ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : p.stock <= 0 ? (
          <Tag color="error">Out</Tag>
        ) : p.stock <= 5 ? (
          <Tag color="warning">{p.stock} left</Tag>
        ) : (
          <Tag color="success">{p.stock}</Tag>
        ),
    },
  ];

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; image?: string; qty: number; revenue: number }>();
    countedOrders.forEach((o) =>
      o.items.forEach((item) => {
        const row = map.get(item.productId) || { name: item.name, image: item.image, qty: 0, revenue: 0 };
        row.qty += item.quantity;
        row.revenue += item.price * item.quantity;
        map.set(item.productId, row);
      })
    );
    return [...map.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [countedOrders]);

  const statusSlices = useMemo<DonutSlice[]>(() => {
    const defs: Array<{ key: string; label: string; color: string }> = [
      { key: "pending", label: "Pending", color: "#eb6834" },
      { key: "confirmed", label: "Confirmed", color: "#2a78d6" },
      { key: "shipped", label: "Shipped", color: "#6250d6" },
      { key: "delivered", label: "Delivered", color: "#1baf7a" },
      { key: "cancelled", label: "Cancelled", color: "#e87ba4" },
    ];
    return defs.map((d) => ({ ...d, value: orders.filter((o) => o.status === d.key).length }));
  }, [orders]);

  const kpis = [
    { key: "rev", title: "Total revenue", value: formatPrice(totalRevenue, currency), icon: <DollarOutlined />, from: "#14452b", to: "#2f7a52" },
    { key: "orders", title: "Total orders", value: String(totalOrders), icon: <ShoppingCartOutlined />, from: "#1f3f55", to: "#3f6f8c" },
    { key: "users", title: "Registered users", value: String(totalCustomers), icon: <TeamOutlined />, from: "#4a4060", to: "#7a6c96" },
    { key: "products", title: "Active products", value: String(activeProductsCount), icon: <AppstoreAddOutlined />, from: "#6b5a3a", to: "#a08a57" },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminLayout>
        <Flex vertical gap={16}>
          {error && <Alert type="error" showIcon title={error} />}
          <Card variant="borderless" style={{ background: "#14452b", borderRadius: 14 }} styles={{ body: { padding: 16 } }}>
            <Flex justify="space-between" align="center" wrap gap={12}>
              <div>
                <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
                  Welcome back, {user?.name || "Administrator"}
                </Typography.Title>
                <Typography.Text style={{ color: "rgba(255,255,255,0.75)" }}>
                  Real-time overview of your Atlas grocery store.
                </Typography.Text>
              </div>
              <Space>
                <Link href="/admin/catalog"><Button icon={<AppstoreAddOutlined />}>Manage catalog</Button></Link>
                <Link href="/admin/users/new"><Button type="primary" ghost style={{ color: "#fff", borderColor: "#fff" }} icon={<UserAddOutlined />}>New user</Button></Link>
              </Space>
            </Flex>
          </Card>

          <Card variant="borderless" style={{ borderRadius: 12 }} styles={{ body: { padding: 12 } }}>
            <Flex wrap gap={12} align="center">
              <Typography.Text strong>Date range</Typography.Text>
              <Segmented
                size="large"
                value={preset}
                onChange={(v) => choosePreset(v as typeof preset)}
                options={[
                  { value: "7", label: "7 days" },
                  { value: "30", label: "30 days" },
                  { value: "90", label: "90 days" },
                  { value: "all", label: "All time" },
                  ...(preset === "custom" ? [{ value: "custom", label: "Custom" }] : []),
                ]}
              />
              <DatePicker.RangePicker
                size="large"
                value={dateRange}
                allowClear
                onChange={(values) => {
                  const next = values as [Dayjs | null, Dayjs | null] | null;
                  setDateRange(next);
                  setPreset(next && (next[0] || next[1]) ? "custom" : "all");
                }}
              />
              <Typography.Text type="secondary" style={{ marginLeft: "auto" }}>
                {orders.length} of {allOrders.length} orders in range
              </Typography.Text>
            </Flex>
          </Card>

          <Row gutter={[16, 16]}>
            {kpis.map((k) => (
              <Col key={k.key} xs={12} lg={6}>
                <Card loading={loading} variant="borderless" style={{ borderRadius: 12 }}>
                  <Statistic
                    title={<span style={{ color: "#6b7280" }}>{k.title}</span>}
                    value={k.value}
                    prefix={<span style={{ color: k.from }}>{k.icon}</span>}
                    styles={{ content: { color: "#111827", fontSize: 22, fontWeight: 700 } }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                loading={loading}
                size="small"
                title="Revenue by day"
                extra={<Typography.Text strong style={{ color: "#12432a" }}>{formatPrice(totalRevenue, currency)}</Typography.Text>}
                style={{ height: "100%" }}
                styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}
              >
                <RevenueBarChart data={chartData} formatValue={(v) => formatPrice(v, currency)} />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                loading={loading}
                size="small"
                title="Orders by day"
                extra={<Typography.Text strong style={{ color: "#12432a" }}>{orders.length} orders</Typography.Text>}
                style={{ height: "100%" }}
                styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}
              >
                <RevenueBarChart data={ordersByDay} integer color="#1f3f55" formatValue={(v) => String(Math.round(v))} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card loading={loading} size="small" title="Orders by status" style={{ height: "100%" }} styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}>
                <DonutChart data={statusSlices} centerLabel="Orders" />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                loading={loading}
                size="small"
                title={<><WarningOutlined /> Stock alerts</>}
                extra={
                  <Space size={8}>
                    <Tag color={inventoryAlerts.length ? "warning" : "success"} style={{ margin: 0 }}>{inventoryAlerts.length} alerts</Tag>
                    {inventoryAlerts.length > 0 && <Button type="link" size="small" onClick={() => setAlertsOpen(true)}>View all</Button>}
                  </Space>
                }
                style={{ height: "100%" }}
                styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}
              >
                {inventoryAlerts.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="All products have healthy stock" />
                ) : (
                  <List
                    size="small"
                    dataSource={inventoryAlerts.slice(0, 5)}
                    renderItem={(alert) => (
                      <List.Item extra={alert.isOut ? <Tag color="error">Out of stock</Tag> : <Tag color="warning">{alert.stock} left</Tag>}>
                        <List.Item.Meta title={alert.name} description={`SKU: ${alert.sku}`} />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card loading={loading} size="small" title="Top selling products" extra={topProducts.length > 0 && <Button type="link" size="small" onClick={() => setPerfOpen(true)}>View all</Button>} style={{ height: "100%" }} styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}>
                {topProducts.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No sales yet" />
                ) : (
                  <List
                    size="small"
                    dataSource={topProducts}
                    renderItem={(p, index) => (
                      <List.Item extra={<Typography.Text strong>{formatPrice(p.revenue, currency)}</Typography.Text>}>
                        <List.Item.Meta avatar={<Tag color="purple">#{index + 1}</Tag>} title={p.name} description={`${p.qty} sold`} />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Card
            loading={loading}
            size="small"
            title="Product performance"
            extra={
              <Space>
              <Segmented
                value={perfMetric}
                onChange={(v) => setPerfMetric(v as typeof perfMetric)}
                options={[
                  { value: "qty", label: "Units sold" },
                  { value: "revenue", label: "Revenue" },
                ]}
              />
              {perfSorted.length > 0 && <Button type="link" size="small" onClick={() => setPerfOpen(true)}>View all ({perfSorted.length})</Button>}
              </Space>
            }
            styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}
          >
            {perfSorted.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No sales yet" />
            ) : (
              <Row gutter={[24, 16]}>
                <Col xs={24} lg={10}>
                  <HorizontalBarChart
                    color={perfMetric === "qty" ? "#2f7a52" : "#1f3f55"}
                    rows={perfSorted.slice(0, 5).map((p) => ({
                      key: p.id,
                      label: p.name,
                      value: p[perfMetric],
                      sublabel: `${p.orders} order${p.orders === 1 ? "" : "s"}`,
                    }))}
                    formatValue={(v) => (perfMetric === "qty" ? `${v} sold` : formatPrice(v, currency))}
                  />
                </Col>
                <Col xs={24} lg={14}>
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={perfSorted.slice(0, 5)}
                    columns={perfColumns}
                  />
                </Col>
              </Row>
            )}
          </Card>

          <Card
            size="small"
            title="Recent orders"
            extra={<Link href="/admin/orders">View all</Link>}
            styles={{ header: { background: "#f4f7f5", color: "#14452b" } }}
          >
            <Table size="small" rowKey="_id" loading={loading} columns={columns} dataSource={orders.slice(0, 10)} pagination={false} locale={{ emptyText: "No customer orders recorded yet." }} />
          </Card>

        <Drawer
          open={perfOpen}
          onClose={() => setPerfOpen(false)}
          placement="right"
          size={780}
          destroyOnHidden
          title={`Product performance (${perfSorted.length} products)`}
        >
          <Flex vertical gap={12}>
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined style={{ color: "#14452b" }} />}
              placeholder="Search products..."
              value={perfSearch}
              onChange={(e) => setPerfSearch(e.target.value)}
            />
            <Table
              size="small"
              rowKey="id"
              columns={perfColumns}
              dataSource={perfSorted.filter((p) => p.name.toLowerCase().includes(perfSearch.trim().toLowerCase()))}
              pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
            />
          </Flex>
        </Drawer>
        <Drawer
          open={alertsOpen}
          onClose={() => setAlertsOpen(false)}
          placement="right"
          size={720}
          destroyOnHidden
          title={`Stock alerts (${inventoryAlerts.length})`}
          footer={
            <Flex justify="space-between" align="center">
              <Link href="/admin/catalog">
                <Button type="link" style={{ paddingInline: 0 }}>Open catalog for full editing →</Button>
              </Link>
              <Button onClick={() => setAlertsOpen(false)}>Close</Button>
            </Flex>
          }
        >
          <Flex vertical gap={12}>
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined style={{ color: "#14452b" }} />}
              placeholder="Search product or SKU..."
              value={alertSearch}
              onChange={(e) => setAlertSearch(e.target.value)}
            />
            <Segmented
              size="large"
              value={alertFilter}
              onChange={(v) => setAlertFilter(v as typeof alertFilter)}
              options={[
                { value: "all", label: `All (${inventoryAlerts.length})` },
                { value: "out", label: `Out of stock (${outCount})` },
                { value: "low", label: `Low (${inventoryAlerts.length - outCount})` },
              ]}
            />
            <Table
              size="small"
              rowKey={(a) => `${a.productId}-${a.sku}`}
              dataSource={shownAlerts}
              pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
              columns={[
                { title: "Product", dataIndex: "name", ellipsis: true },
                { title: "SKU", dataIndex: "sku", width: 110, render: (v: string) => <Typography.Text code>{v}</Typography.Text> },
                {
                  title: "Stock",
                  key: "stock",
                  width: 110,
                  render: (_, a) => (a.isOut ? <Tag color="error">Out of stock</Tag> : <Tag color="warning">{a.stock} left</Tag>),
                },
                {
                  title: "Set new stock",
                  key: "update",
                  width: 210,
                  render: (_, a) => {
                    const key = `${a.productId}-${a.sku}`;
                    const value = stockEdits[key];
                    return (
                      <Space.Compact>
                        <InputNumber
                          min={0}
                          precision={0}
                          placeholder="Qty"
                          style={{ width: 90 }}
                          value={value ?? null}
                          onChange={(v) => setStockEdits((current) => ({ ...current, [key]: v }))}
                          onPressEnter={() => saveStock(a.productId, a.sku)}
                        />
                        <Button
                          type="primary"
                          loading={savingKey === key}
                          disabled={value === undefined || value === null}
                          onClick={() => saveStock(a.productId, a.sku)}
                        >
                          Update
                        </Button>
                      </Space.Compact>
                    );
                  },
                },
              ]}
            />
          </Flex>
        </Drawer>
        </Flex>
      </AdminLayout>
    </ProtectedRoute>
  );
}
