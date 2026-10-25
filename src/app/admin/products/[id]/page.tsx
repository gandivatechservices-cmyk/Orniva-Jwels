"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Alert, App, Button, Card, Col, Descriptions, Empty, Flex, Image, List, Rate, Row, Space, Spin, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  EditOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { ProtectedRoute } from "guards";
import { AdminLayout } from "components";
import { AdminStatCards } from "components/admin";
import {
  catalogService,
  ordersService,
  reviewsService,
  type Brand,
  type Catalog,
  type Category,
  type Domain,
  type Order,
  type Product,
  type Review,
  type Variant,
  getReviewerName,
} from "utility/services";
import { formatPrice } from "utility/formatMoney";
import { LOW_STOCK_THRESHOLD } from "utility/variantPricing";
import { VariantManager } from "../../catalog/VariantManager";

const PLACEHOLDER = "/assets/images/placeholders/product-placeholder.svg";

export default function AdminProductDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminLayout>
        <ProductDetail />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notification, modal } = App.useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variantsOpen, setVariantsOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const prod = await catalogService.getProduct(id);
      setProduct(prod);
      // The rest is supporting detail: if any of it fails, the product page still shows.
      const [d, c, cat, b, o, r] = await Promise.all([
        catalogService.listDomains().catch(() => []),
        catalogService.listCatalogs().catch(() => []),
        catalogService.listCategories().catch(() => []),
        catalogService.listAllBrands().catch(() => []),
        ordersService.listAdmin().catch(() => []),
        reviewsService.listAdmin({ productId: id, includeInactive: true, limit: 50 }).catch(() => ({ items: [] as Review[] })),
      ]);
      setDomains(d);
      setCatalogs(c);
      setCategories(cat);
      setBrands(b);
      setOrders(o);
      setReviews(r.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load this product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const currency = domains.find((d) => d._id === product?.domainId)?.currency || "GBP";

  const sales = useMemo(() => {
    const rows = orders
      .filter((o) => o.status !== "cancelled")
      .flatMap((o) => o.items.filter((i) => i.productId === id).map((i) => ({ order: o, item: i })));
    return {
      units: rows.reduce((n, r) => n + r.item.quantity, 0),
      revenue: rows.reduce((n, r) => n + r.item.price * r.item.quantity, 0),
      orders: new Set(rows.map((r) => r.order._id)).size,
      recent: [...rows].sort((a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime()).slice(0, 6),
    };
  }, [orders, id]);

  const ratingAvg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;

  async function setActive(next: boolean) {
    if (!product) return;
    try {
      await catalogService.updateProduct(product._id, { isActive: next });
      notification.success({ title: `Product ${next ? "activated" : "made inactive"}` });
      await load();
    } catch (err) {
      notification.error({ title: "Unable to update product", description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  if (loading) {
    return (
      <Flex justify="center" style={{ padding: 80 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error || !product) {
    return (
      <Flex vertical gap={16}>
        <Alert type="error" showIcon title={error || "Product not found"} />
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/catalog")} style={{ width: "fit-content" }}>
          Back to catalog
        </Button>
      </Flex>
    );
  }

  const isActive = product.isActive !== false;
  const totalStock = product.variants.reduce((n, v) => n + (v.stock || 0), 0);
  const brandName =
    (typeof product.brandId === "object" && product.brandId?.name) ||
    brands.find((b) => b._id === (typeof product.brandId === "string" ? product.brandId : ""))?.name ||
    product.brand ||
    "—";
  const images = product.images?.length ? product.images : product.variants.flatMap((v) => v.images || []);

  const variantColumns: ColumnsType<Variant> = [
    {
      title: "Variant",
      key: "variant",
      render: (_, v) => (
        <Flex vertical>
          <Typography.Text strong>{v.name || v.sku}</Typography.Text>
          <Typography.Text type="secondary" code style={{ width: "fit-content" }}>
            {v.sku}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: "Attributes",
      key: "attributes",
      render: (_, v) => {
        const entries = Object.entries(v.attributes || {}).filter(([, value]) => value);
        return entries.length ? (
          <Space size={4} wrap>
            {entries.map(([k, value]) => (
              <Tag key={k} style={{ margin: 0 }}>{`${k}: ${value}`}</Tag>
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        );
      },
    },
    { title: "Price", dataIndex: "price", align: "right", render: (price: number) => formatPrice(price, currency) },
    {
      title: "Stock",
      dataIndex: "stock",
      align: "center",
      render: (stock: number) =>
        stock <= 0 ? <Tag color="error">Out of stock</Tag> : stock <= LOW_STOCK_THRESHOLD ? <Tag color="warning">{stock} left</Tag> : <Tag color="success">{stock}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      align: "center",
      render: (active?: boolean) => (active === false ? <Tag>Inactive</Tag> : <Tag color="success">Active</Tag>),
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Space align="center" size={12} wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/catalog")}>
            Catalog
          </Button>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {product.name}
          </Typography.Title>
          <Tag color={isActive ? "success" : "default"}>{isActive ? "Active" : "Inactive"}</Tag>
        </Space>
        <Space wrap>
          <Button size="large" icon={<BranchesOutlined />} onClick={() => setVariantsOpen(true)}>
            Manage variants
          </Button>
          {isActive ? (
            <Button
              size="large"
              icon={<StopOutlined />}
              onClick={() =>
                modal.confirm({
                  title: "Make this product inactive?",
                  content: "It will be hidden from the store and can't be bought until you activate it again.",
                  okText: "Make inactive",
                  onOk: () => setActive(false),
                })
              }
            >
              Make inactive
            </Button>
          ) : (
            <Button size="large" type="primary" icon={<CheckCircleOutlined />} onClick={() => void setActive(true)}>
              Activate
            </Button>
          )}
          <Tooltip title="Edit all product details in the catalog">
            <Link href="/admin/catalog">
              <Button size="large" type="primary" icon={<EditOutlined />}>
                Edit in catalog
              </Button>
            </Link>
          </Tooltip>
        </Space>
      </Flex>

      <AdminStatCards
        items={[
          { key: "price", title: "Base price", value: formatPrice(product.basePrice, currency), icon: <DollarOutlined />, color: "#14452b" },
          { key: "stock", title: "Total stock", value: totalStock, icon: <InboxOutlined />, color: "#6b5a3a" },
          { key: "sold", title: "Units sold", value: sales.units, icon: <ShoppingCartOutlined />, color: "#1f3f55" },
          { key: "rev", title: "Revenue", value: formatPrice(sales.revenue, currency), icon: <DollarOutlined />, color: "#4a4060" },
          { key: "rating", title: `Rating (${reviews.length})`, value: reviews.length ? ratingAvg.toFixed(1) : "—", icon: <StarOutlined />, color: "#7a3030" },
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Flex vertical gap={16}>
            <Card size="small" title="Images">
              {images.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No images" />
              ) : (
                <Image.PreviewGroup>
                  <Space size={12} wrap>
                    {images.map((src, i) => (
                      <Image key={`${src}-${i}`} width={110} height={110} src={src} alt={`${product.name} ${i + 1}`} style={{ objectFit: "cover", borderRadius: 8 }} fallback={PLACEHOLDER} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              )}
            </Card>

            <Card size="small" title="Description">
              {product.description ? (
                <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>{product.description}</Typography.Paragraph>
              ) : (
                <Typography.Text type="secondary">No description. Adding one also helps the product rank in Google.</Typography.Text>
              )}
            </Card>

            <Card size="small" title={`Variants (${product.variants.length})`} extra={<Button type="link" size="small" onClick={() => setVariantsOpen(true)}>Edit price and stock</Button>}>
              <Table size="small" rowKey={(v) => v._id || v.sku} columns={variantColumns} dataSource={product.variants} pagination={false} />
            </Card>

            {Object.keys(product.attributes || {}).length > 0 && (
              <Card size="small" title="Specifications">
                <Descriptions
                  size="small"
                  column={{ xs: 1, md: 2 }}
                  items={Object.entries(product.attributes).map(([k, v]) => ({ key: k, label: k, children: v }))}
                />
              </Card>
            )}
          </Flex>
        </Col>

        <Col xs={24} lg={8}>
          <Flex vertical gap={16}>
            <Card size="small" title="Details">
              <Descriptions
                size="small"
                column={1}
                items={[
                  { key: "brand", label: "Brand", children: brandName },
                  { key: "catalog", label: "Catalog", children: catalogs.find((c) => c._id === product.catalogId)?.name || "—" },
                  { key: "category", label: "Category", children: categories.find((c) => c._id === product.categoryId)?.name || "—" },
                  { key: "domain", label: "Domain", children: domains.find((d) => d._id === product.domainId)?.name || "—" },
                  ...(product.mrp ? [{ key: "mrp", label: "MRP", children: formatPrice(product.mrp, currency) }] : []),
                  ...(product.createdAt ? [{ key: "created", label: "Created", children: new Date(product.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }] : []),
                  ...(product.updatedAt ? [{ key: "updated", label: "Updated", children: new Date(product.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }] : []),
                  { key: "id", label: "Product ID", children: <Typography.Text type="secondary" copyable={{ text: product._id }}>{product._id.slice(-8)}</Typography.Text> },
                ]}
              />
            </Card>

            <Card size="small" title={`Recent orders (${sales.orders})`}>
              {sales.recent.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No orders yet" />
              ) : (
                <List
                  size="small"
                  dataSource={sales.recent}
                  renderItem={({ order, item }) => (
                    <List.Item extra={<Typography.Text strong>× {item.quantity}</Typography.Text>}>
                      <List.Item.Meta
                        title={<Link href={`/admin/orders/${order._id}`}>#{order._id.slice(-8).toUpperCase()}</Link>}
                        description={new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>

            <Card size="small" title={`Reviews (${reviews.length})`} extra={<Link href="/admin/reviews">Manage</Link>}>
              {reviews.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No reviews yet" />
              ) : (
                <List
                  size="small"
                  dataSource={reviews.slice(0, 4)}
                  renderItem={(review) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Typography.Text strong>{getReviewerName(review)}</Typography.Text>
                            <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                          </Space>
                        }
                        description={review.comment || "No comment"}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Flex>
        </Col>
      </Row>

      <VariantManager
        product={variantsOpen ? product : null}
        domain={domains.find((d) => d._id === product.domainId)}
        onClose={() => setVariantsOpen(false)}
        onChanged={() => void load()}
      />
    </Flex>
  );
}
