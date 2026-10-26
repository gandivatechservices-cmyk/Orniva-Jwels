"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Rate,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { ProtectedRoute } from "guards";
import { AdminLayout } from "components";
import { ADMIN_TABLE_PROPS, AdminPageHeader, AdminSearchBar, AdminStatCards } from "components/admin";
import { catalogService, getReviewerName, reviewsService, type Product, type Review } from "utility/services";

const PLACEHOLDER = "/assets/images/placeholders/product-placeholder.svg";

export default function AdminReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminLayout>
        <ReviewsView />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function ReviewsView() {
  const { notification } = App.useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [form] = Form.useForm();

  const load = useCallback(() => {
    setLoading(true);
    reviewsService
      .listAdmin({ includeInactive: true, limit: 200 })
      .then(async (reviewResult) => {
        setReviews(reviewResult.items);
        // Product names are a nice-to-have: if this fails the reviews still show.
        const allProducts = await catalogService.listAllProducts().catch(() => [] as Product[]);
        setProducts(allProducts);
        // The product list can omit inactive products, so look up any that reviews point to.
        const known = new Set(allProducts.map((p) => p._id));
        const missingIds = [...new Set(reviewResult.items.map((r) => r.productId))].filter((id) => !known.has(id));
        if (missingIds.length === 0) return;
        const extra = await Promise.all(missingIds.map((id) => catalogService.getProduct(id).catch(() => null)));
        setProducts([...allProducts, ...extra.filter((p): p is Product => p !== null)]);
      })
      .catch((err) => notification.error({ title: "Couldn't load reviews", description: err instanceof Error ? err.message : "Please try again." }))
      .finally(() => setLoading(false));
  }, [notification]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p._id, p])), [products]);

  const stats = useMemo(() => {
    const active = reviews.filter((r) => r.isActive).length;
    const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return { total: reviews.length, active, hidden: reviews.length - active, average };
  }, [reviews]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((review) => {
      if (ratingFilter !== "all" && review.rating !== ratingFilter) return false;
      if (statusFilter === "active" && !review.isActive) return false;
      if (statusFilter === "inactive" && review.isActive) return false;
      if (!q) return true;
      const user = typeof review.userId === "object" && review.userId ? review.userId : null;
      return [productById[review.productId]?.name, review.comment, getReviewerName(review), user?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [reviews, search, ratingFilter, statusFilter, productById]);

  function openEdit(review: Review) {
    setEditing(review);
    form.setFieldsValue({ rating: review.rating, comment: review.comment, isActive: review.isActive });
  }

  function close() {
    setEditing(null);
    form.resetFields();
  }

  async function save(values: { rating: number; comment?: string; isActive: boolean }) {
    if (!editing) return;
    try {
      await reviewsService.update(editing._id, values);
      notification.success({ title: "Review updated" });
      close();
      load();
    } catch (err) {
      notification.error({ title: "Couldn't update review", description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function toggleActive(review: Review, isActive: boolean) {
    try {
      const updated = await reviewsService.update(review._id, { isActive });
      setReviews((current) => current.map((item) => (item._id === review._id ? { ...item, isActive: updated.isActive } : item)));
    } catch (err) {
      notification.error({ title: "Couldn't update review", description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function remove(review: Review) {
    try {
      await reviewsService.remove(review._id);
      notification.success({ title: "Review deleted" });
      load();
    } catch (err) {
      notification.error({ title: "Couldn't delete review", description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  async function toggleImage(review: Review, imageId: string, isActive: boolean) {
    try {
      const updated = await reviewsService.setImageStatus(review._id, imageId, isActive);
      setReviews((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err) {
      notification.error({ title: "Couldn't update image", description: err instanceof Error ? err.message : "Please try again." });
    }
  }

  const columns: ColumnsType<Review> = [
    {
      title: "Product",
      key: "product",
      width: 240,
      render: (_, review) => {
        const product = productById[review.productId];
        return (
          <Space size={8}>
            <Image width={28} height={28} src={product?.images?.[0]} alt={product?.name} preview={false} style={{ objectFit: "cover", borderRadius: 6 }} fallback={PLACEHOLDER} />
            <Typography.Text strong >
              {product?.name || "Deleted product"}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: "Reviewer",
      key: "reviewer",
      width: 190,
      render: (_, review) => {
        const user = typeof review.userId === "object" && review.userId ? review.userId : null;
        const name = getReviewerName(review);
        return (
          <Tooltip title={user?.email}>
            <Space size={8}>
              <Avatar size={28} style={{ background: "#8E662F" }}>{name.charAt(0).toUpperCase()}</Avatar>
              <Flex vertical>
                <Typography.Text strong>{name}</Typography.Text>
                {review.isVerifiedBuyer && (
                  <Typography.Text type="success" style={{ fontSize: 11 }}>
                    <SafetyCertificateOutlined /> Verified buyer
                  </Typography.Text>
                )}
              </Flex>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 130,
      sorter: (a, b) => a.rating - b.rating,
      render: (rating: number) => <Rate disabled value={rating} style={{ fontSize: 13 }} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (comment?: string) =>
        comment ? (
          <Typography.Paragraph style={{ margin: 0, fontSize: 12 }} ellipsis={{ rows: 2, tooltip: comment }}>
            {comment}
          </Typography.Paragraph>
        ) : (
          <Typography.Text type="secondary">No comment</Typography.Text>
        ),
    },
    {
      title: "Photos",
      key: "images",
      width: 170,
      render: (_, review) =>
        review.images.length === 0 ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : (
          <Image.PreviewGroup>
            <Space size={6} wrap>
              {review.images.map((image) => (
                <Flex key={image._id} vertical align="center" gap={2}>
                  <Image width={26} height={26} src={image.url} alt="Review" style={{ objectFit: "cover", borderRadius: 6, opacity: image.isActive ? 1 : 0.35 }} />
                  <Tooltip title={image.isActive ? "Visible to customers" : "Hidden"}>
                    <Switch size="small" checked={image.isActive} onChange={(checked) => toggleImage(review, image._id, checked)} />
                  </Tooltip>
                </Flex>
              ))}
            </Space>
          </Image.PreviewGroup>
        ),
    },
    {
      title: "Visible",
      dataIndex: "isActive",
      key: "isActive",
      width: 90,
      align: "center",
      render: (isActive: boolean, review) => (
        <Tooltip title={isActive ? "Shown on the store" : "Hidden from the store"}>
          <Switch size="small" checked={isActive} onChange={(checked) => toggleActive(review, checked)} />
        </Tooltip>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_, review) => (
        <Space size={0}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(review)} />
          <Popconfirm title="Delete this review?" okText="Delete" okType="danger" onConfirm={() => remove(review)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Customer Reviews" subtitle="Moderate what customers say about your products." />
      <AdminStatCards
        items={[
          { key: "total", title: "Total reviews", value: stats.total, icon: <MessageOutlined />, color: "#8E662F" },
          { key: "avg", title: "Average rating", value: stats.average ? stats.average.toFixed(1) : "—", icon: <StarOutlined />, color: "#6b5a3a" },
          { key: "active", title: "Visible", value: stats.active, icon: <CheckCircleOutlined />, color: "#1f3f55" },
          { key: "hidden", title: "Hidden", value: stats.hidden, icon: <EyeInvisibleOutlined />, color: "#4a4060" },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: 12 }}>
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by product, reviewer or comment..." />
        <Flex wrap gap={12} align="center" style={{ marginBottom: 16 }}>
          <Select
            size="large"
            value={ratingFilter}
            onChange={setRatingFilter}
            style={{ minWidth: 150 }}
            options={[
              { value: "all", label: "All ratings" },
              ...[5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n > 1 ? "s" : ""}` })),
            ]}
          />
          <Segmented
            size="large"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as typeof statusFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Visible" },
              { value: "inactive", label: "Hidden" },
            ]}
          />
          <Typography.Text type="secondary" style={{ marginLeft: "auto" }}>
            {filtered.length} of {reviews.length} reviews
          </Typography.Text>
        </Flex>

        <Table
          rowKey="_id"
          {...ADMIN_TABLE_PROPS}
          loading={loading}
          columns={columns}
          dataSource={filtered}
        />
      </Card>

      <Modal open={editing !== null} onCancel={close} footer={null} destroyOnHidden title="Edit review">
        <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
          <Form.Item name="rating" label="Rating" rules={[{ required: true, message: "Please select a rating" }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Comment">
            <Input.TextArea rows={3} maxLength={2000} />
          </Form.Item>
          <Form.Item name="isActive" label="Visible on store" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Flex justify="end" gap={8}>
            <Button onClick={close}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save changes</Button>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
}
