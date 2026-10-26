"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  App,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Segmented,
  Select,
  Space,
  Steps,
  Switch,
  Table,
  Tag,
  Typography,
  Flex,
} from "antd";
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, StopOutlined, TagsOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { AdminLayout } from "components";
import { ProtectedRoute } from "guards";
import { ADMIN_TABLE_PROPS, AdminPageHeader, AdminSearchBar, AdminStatCards } from "components/admin";
import { useAdminSearchIntent } from "hooks";
import { catalogService, offersService, type Category, type Coupon, type CouponPayload, type Domain, type Product } from "utility/services";
import styles from "./offers.module.css";

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage off", value: "percent" },
  { label: "Fixed amount off", value: "fixed" },
  { label: "Free delivery", value: "free_shipping" },
  { label: "Buy X, Get Y", value: "buy_x_get_y" },
];

const SCOPE_OPTIONS = [
  { label: "Entire cart", value: "cart" },
  { label: "A category", value: "category" },
  { label: "A product (any variant)", value: "product" },
  { label: "Specific variant(s) only", value: "variant" },
];

const ELIGIBILITY_OPTIONS = [
  { label: "All customers", value: "all" },
  { label: "New customers only (first order)", value: "new_customers" },
];

const DAY_OPTIONS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const STEP_FIELDS = [
  ["kind", "code", "description", "domainId", "isActive"],
  ["discountType", "discountValue", "maxDiscountAmount", "freeDelivery", "bxgyBuyProductId", "bxgyBuyQuantity", "bxgyGetProductId", "bxgyGetQuantity", "bxgyGetDiscountPercent"],
  ["scope", "categoryId", "productId", "variantIds", "exclusiveToTargets", "minCartValue", "minQuantity"],
  ["dateRange", "daysOfWeek", "startHour", "endHour", "eligibility", "stackable", "usageLimit", "perUserLimit"],
];

type FormValues = {
  kind: "code" | "auto";
  code?: string;
  description: string;
  domainId: string;
  isActive: boolean;
  discountType: Coupon["discountType"];
  discountValue?: number;
  maxDiscountAmount?: number;
  freeDelivery: boolean;
  bxgyBuyProductId?: string;
  bxgyBuyQuantity?: number;
  bxgyGetProductId?: string;
  bxgyGetQuantity?: number;
  bxgyGetDiscountPercent?: number;
  scope: "cart" | "category" | "product" | "variant";
  categoryId?: string;
  productId?: string;
  variantIds?: string[];
  exclusiveToTargets: boolean;
  minCartValue?: number;
  minQuantity?: number;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  daysOfWeek?: number[];
  startHour?: number;
  endHour?: number;
  eligibility: Coupon["eligibility"];
  stackable: boolean;
  usageLimit?: number;
  perUserLimit?: number;
};

function couponToFormValues(coupon: Coupon): Partial<FormValues> {
  const target = coupon.targets[0];
  return {
    kind: coupon.code ? "code" : "auto",
    code: coupon.code,
    description: coupon.description,
    domainId: coupon.domainId,
    isActive: coupon.isActive,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    freeDelivery: coupon.freeDelivery,
    bxgyBuyProductId: coupon.bxgy?.buyTarget.productId,
    bxgyBuyQuantity: coupon.bxgy?.buyQuantity,
    bxgyGetProductId: coupon.bxgy?.getTarget.productId,
    bxgyGetQuantity: coupon.bxgy?.getQuantity,
    bxgyGetDiscountPercent: coupon.bxgy?.getDiscountPercent,
    scope: target?.scope || "cart",
    categoryId: target?.categoryId,
    productId: target?.productId,
    variantIds: target?.variantIds,
    exclusiveToTargets: coupon.exclusiveToTargets,
    minCartValue: coupon.minCartValue,
    minQuantity: coupon.minQuantity,
    dateRange: [dayjs(coupon.validFrom), dayjs(coupon.validTo)],
    daysOfWeek: coupon.daysOfWeek,
    startHour: coupon.timeWindow?.startHour,
    endHour: coupon.timeWindow?.endHour,
    eligibility: coupon.eligibility,
    stackable: coupon.stackable,
    usageLimit: coupon.usageLimit,
    perUserLimit: coupon.perUserLimit,
  };
}

function formValuesToPayload(values: FormValues): Partial<CouponPayload> {
  const targets =
    values.scope === "cart"
      ? []
      : [
          {
            scope: values.scope,
            categoryId: values.scope === "category" ? values.categoryId : undefined,
            productId: values.scope === "product" || values.scope === "variant" ? values.productId : undefined,
            variantIds: values.scope === "variant" ? values.variantIds : undefined,
          },
        ];

  const bxgy =
    values.discountType === "buy_x_get_y"
      ? {
          buyTarget: { scope: "product" as const, productId: values.bxgyBuyProductId },
          buyQuantity: values.bxgyBuyQuantity || 1,
          getTarget: { scope: "product" as const, productId: values.bxgyGetProductId },
          getQuantity: values.bxgyGetQuantity || 1,
          getDiscountPercent: values.bxgyGetDiscountPercent ?? 100,
        }
      : undefined;

  return {
    domainId: values.domainId,
    code: values.kind === "code" ? values.code?.toUpperCase() : undefined,
    description: values.description,
    isActive: values.isActive,
    discountType: values.discountType,
    discountValue: values.discountType === "percent" || values.discountType === "fixed" ? values.discountValue : undefined,
    maxDiscountAmount: values.discountType === "percent" ? values.maxDiscountAmount : undefined,
    freeDelivery: values.discountType === "free_shipping" ? true : values.freeDelivery,
    bxgy,
    targets,
    exclusiveToTargets: values.exclusiveToTargets,
    minCartValue: values.minCartValue,
    minQuantity: values.minQuantity,
    eligibility: values.eligibility,
    daysOfWeek: values.daysOfWeek,
    timeWindow: values.startHour !== undefined && values.endHour !== undefined ? { startHour: values.startHour, endHour: values.endHour } : undefined,
    validFrom: values.dateRange[0].toISOString(),
    validTo: values.dateRange[1].toISOString(),
    stackable: values.stackable,
    usageLimit: values.usageLimit,
    perUserLimit: values.perUserLimit,
  };
}

function targetSummary(coupon: Coupon): string {
  const target = coupon.targets[0];
  if (!target || target.scope === "cart") return "Entire cart";
  if (target.scope === "category") return "Category";
  if (target.scope === "product") return "Specific product";
  if (target.scope === "variant") return `Specific variant${(target.variantIds?.length || 0) > 1 ? "s" : ""}`;
  return "—";
}

function statusTag(coupon: Coupon) {
  const now = dayjs();
  if (!coupon.isActive) return <Tag>Inactive</Tag>;
  if (now.isBefore(dayjs(coupon.validFrom))) return <Tag color="blue">Scheduled</Tag>;
  if (now.isAfter(dayjs(coupon.validTo))) return <Tag color="default">Expired</Tag>;
  return <Tag color="green">Active</Tag>;
}

export default function OffersPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  // Blocks a second submit in the same instant, before `saving` has re-rendered
  const savingRef = useRef(false);
  const [form] = Form.useForm<FormValues>();
  const { notification } = App.useApp();

  const kind = Form.useWatch("kind", form);
  const discountType = Form.useWatch("discountType", form);
  const scope = Form.useWatch("scope", form);
  const productId = Form.useWatch("productId", form);
  const watchedValues = Form.useWatch([], form);

  const [filterDomainId, setFilterDomainId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [search, setSearch] = useState("");
  useAdminSearchIntent(({ q }) => {
    setSearch(q);
    setStatusFilter("all");
  });

  const load = useCallback(async (selectedDomain?: string) => {
    setLoading(true);
    try {
      const activeDomain = selectedDomain !== undefined ? selectedDomain : filterDomainId;
      const domainFilter = activeDomain !== "all" ? activeDomain : undefined;
      const [d, cat, allProducts, c] = await Promise.all([
        catalogService.listDomains(),
        catalogService.listCategories(),
        catalogService.listAllProducts(),
        offersService.list(domainFilter),
      ]);
      setDomains(d);
      setCategories(cat);
      setProducts(allProducts);
      setCoupons(c);
    } catch (error) {
      notification.error({
        title: "Unable to load offers",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [filterDomainId, notification]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectedProduct = useMemo(() => products.find((p) => p._id === productId), [products, productId]);

  const openCreate = () => {
    setEditing(null);
    setCurrentStep(0);
    form.resetFields();
    form.setFieldsValue({
      kind: "code",
      isActive: true,
      discountType: "percent",
      freeDelivery: false,
      scope: "cart",
      exclusiveToTargets: false,
      eligibility: "all",
      stackable: false,
      dateRange: [dayjs(), dayjs().add(30, "day")],
    });
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setCurrentStep(0);
    form.resetFields();
    form.setFieldsValue(couponToFormValues(coupon) as FormValues);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await offersService.remove(id);
      notification.success({ title: "Offer deleted" });
      void load();
    } catch (error) {
      notification.error({ title: "Delete failed", description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await offersService.update(coupon._id, { isActive: !coupon.isActive });
      notification.success({ title: coupon.isActive ? "Offer turned off" : "Offer turned on" });
      void load();
    } catch (error) {
      notification.error({ title: "Unable to update offer", description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields(STEP_FIELDS[currentStep] as never);
      setCurrentStep((s) => Math.min(s + 1, STEP_FIELDS.length));
    } catch {
      // validation errors already shown inline
    }
  };

  const handleSubmit = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const values = await form.validateFields();
      const payload = formValuesToPayload(values);
      if (editing) {
        await offersService.update(editing._id, payload);
        notification.success({ title: "Offer updated" });
      } else {
        await offersService.create(payload);
        notification.success({ title: "Offer created" });
      }
      setModalOpen(false);
      void load();
    } catch (error) {
      notification.error({ title: "Save failed", description: error instanceof Error ? error.message : "Please check the form and try again." });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const inactiveCount = coupons.filter((coupon) => !coupon.isActive).length;
  const searchTokens = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visibleCoupons = coupons.filter((coupon) => {
    if (statusFilter === "active" && !coupon.isActive) return false;
    if (statusFilter === "inactive" && coupon.isActive) return false;
    const haystack = `${coupon.code || ""} ${coupon.description || ""}`.toLowerCase();
    return searchTokens.every((token) => haystack.includes(token));
  });

  const columns: ColumnsType<Coupon> = [
    {
      title: "Code / Offer",
      key: "name",
      render: (_, coupon) => (
        <div>
          <Typography.Text strong>{coupon.code || "Auto-applied"}</Typography.Text>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{coupon.description}</div>
        </div>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, coupon) =>
        coupon.discountType === "percent"
          ? `${coupon.discountValue}% off${coupon.maxDiscountAmount ? ` (max ${coupon.maxDiscountAmount})` : ""}`
          : coupon.discountType === "fixed"
          ? `${coupon.discountValue} off`
          : coupon.discountType === "free_shipping"
          ? "Free delivery"
          : "Buy X Get Y",
    },
    { title: "Applies to", key: "target", render: (_, coupon) => targetSummary(coupon) },
    {
      title: "Valid",
      key: "valid",
      render: (_, coupon) => `${dayjs(coupon.validFrom).format("DD MMM YYYY")} - ${dayjs(coupon.validTo).format("DD MMM YYYY")}`,
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, coupon) => `${coupon.timesUsed}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}`,
    },
    { title: "Status", key: "status", render: (_, coupon) => statusTag(coupon) },
    {
      title: "On",
      key: "toggle",
      align: "center",
      width: 70,
      render: (_, coupon) => <Switch size="small" checked={coupon.isActive} onChange={() => void handleToggleActive(coupon)} aria-label={`Toggle ${coupon.code || coupon.description}`} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, coupon) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(coupon)} />
          <Popconfirm title="Delete this offer?" okText="Delete" okType="danger" onConfirm={() => handleDelete(coupon._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminLayout>
        <AdminPageHeader
          title="Offers & Coupons"
          subtitle="Create coupon codes and auto-applied promotions."
          actions={<Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreate}>New Offer</Button>}
        />
        <AdminStatCards
          items={[
            { key: "all", title: "Total offers", value: coupons.length, icon: <TagsOutlined />, color: "#8E662F" },
            { key: "active", title: "Active", value: coupons.length - inactiveCount, icon: <CheckCircleOutlined />, color: "#1f3f55" },
            { key: "inactive", title: "Inactive", value: inactiveCount, icon: <StopOutlined />, color: "#6b5a3a" },
          ]}
        />

        <Card variant="borderless" style={{ borderRadius: 12 }}>
          <Flex vertical gap={12} style={{ marginBottom: 16 }}>
            <AdminSearchBar value={search} onChange={setSearch} placeholder="Search offers by code or description..." />
            <Flex justify="space-between" align="center" wrap gap={12}>
              <Space>
                <Typography.Text strong style={{ fontSize: 15 }}>Store Domain:</Typography.Text>
                <Select
                  size="large"
                  value={filterDomainId}
                  onChange={(val) => {
                    setFilterDomainId(val);
                    void load(val);
                  }}
                  style={{ minWidth: 260 }}
                  options={[
                    { label: "All Store Domains", value: "all" },
                    ...domains.map((d) => ({
                      label: `${d.name} (${d.currency})`,
                      value: d._id,
                    })),
                  ]}
                />
              </Space>
              <Segmented
                size="large"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as typeof statusFilter)}
                options={[
                  { value: "all", label: `All (${coupons.length})` },
                  { value: "active", label: `Active (${coupons.length - inactiveCount})` },
                  { value: "inactive", label: `Inactive (${inactiveCount})` },
                ]}
              />
            </Flex>
          </Flex>
          <Table rowKey="_id" {...ADMIN_TABLE_PROPS} columns={columns} dataSource={visibleCoupons} loading={loading} />
        </Card>

        <Modal
          title={editing ? "Edit offer" : "Create offer"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          width={720}
          footer={null}
          destroyOnHidden
        >
          <div className={styles.stepsWrapper}>
            <Steps
              current={currentStep}
              size="small"
              items={[{ title: "Basics" }, { title: "Discount" }, { title: "Targeting" }, { title: "Validity & limits" }, { title: "Review" }]}
            />
          </div>

          <Form form={form} layout="vertical">
            <div className={styles.stepBody} style={{ display: currentStep === 0 ? "block" : "none" }}>
              <Form.Item name="kind" label="Offer type" rules={[{ required: true }]}>
                <Radio.Group
                  options={[
                    { label: "Coupon code (customer enters it)", value: "code" },
                    { label: "Automatic offer (applies without a code)", value: "auto" },
                  ]}
                />
              </Form.Item>
              {kind === "code" && (
                <Form.Item
                  name="code"
                  label="Code"
                  rules={[{ required: true, message: "Enter a code" }, { pattern: /^[A-Za-z0-9_-]{3,20}$/, message: "3-20 letters, digits, - or _" }]}
                >
                  <Input placeholder="e.g. SAVE20" style={{ textTransform: "uppercase" }} />
                </Form.Item>
              )}
              <Form.Item name="description" label="Description" rules={[{ required: true, message: "Enter a description" }]}>
                <Input.TextArea rows={2} placeholder="Shown to customers in cart, e.g. Weekend Special" />
              </Form.Item>
              <Form.Item name="domainId" label="Domain" rules={[{ required: true, message: "Select a domain" }]}>
                <Select options={domains.map((d) => ({ label: d.name, value: d._id }))} placeholder="Select domain" />
              </Form.Item>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>

            <div className={styles.stepBody} style={{ display: currentStep === 1 ? "block" : "none" }}>
              <Form.Item name="discountType" label="Discount type" rules={[{ required: true }]}>
                <Select options={DISCOUNT_TYPE_OPTIONS} />
              </Form.Item>

              {(discountType === "percent" || discountType === "fixed") && (
                <Form.Item
                  name="discountValue"
                  label={discountType === "percent" ? "Percent off" : "Amount off"}
                  rules={[{ required: true, message: "Enter a value" }]}
                >
                  <InputNumber min={0} max={discountType === "percent" ? 100 : undefined} style={{ width: "100%" }} />
                </Form.Item>
              )}

              {discountType === "percent" && (
                <Form.Item name="maxDiscountAmount" label="Max discount cap (optional)">
                  <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 500" />
                </Form.Item>
              )}

              {discountType !== "free_shipping" && (
                <Form.Item name="freeDelivery" label="Also give free delivery" valuePropName="checked">
                  <Switch />
                </Form.Item>
              )}

              {discountType === "buy_x_get_y" && (
                <>
                  <Typography.Text strong>Buy</Typography.Text>
                  <Space.Compact block style={{ marginBottom: 16, marginTop: 8 }}>
                    <Form.Item name="bxgyBuyProductId" rules={[{ required: true, message: "Select a product" }]} style={{ flex: 2 }}>
                      <Select
                        showSearch
                        placeholder="Product to buy"
                        options={products.map((p) => ({ label: p.name, value: p._id }))}
                        filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
                      />
                    </Form.Item>
                    <Form.Item name="bxgyBuyQuantity" rules={[{ required: true, message: "Qty" }]} style={{ flex: 1 }}>
                      <InputNumber min={1} placeholder="Qty" style={{ width: "100%" }} />
                    </Form.Item>
                  </Space.Compact>
                  <Typography.Text strong>Get</Typography.Text>
                  <Space.Compact block style={{ marginBottom: 16, marginTop: 8 }}>
                    <Form.Item name="bxgyGetProductId" rules={[{ required: true, message: "Select a product" }]} style={{ flex: 2 }}>
                      <Select
                        showSearch
                        placeholder="Product to get"
                        options={products.map((p) => ({ label: p.name, value: p._id }))}
                        filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
                      />
                    </Form.Item>
                    <Form.Item name="bxgyGetQuantity" rules={[{ required: true, message: "Qty" }]} style={{ flex: 1 }}>
                      <InputNumber min={1} placeholder="Qty" style={{ width: "100%" }} />
                    </Form.Item>
                  </Space.Compact>
                  <Form.Item name="bxgyGetDiscountPercent" label="Discount on the 'get' item" rules={[{ required: true }]}>
                    <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      100% = fully free
                    </Typography.Text>
                  </Form.Item>
                </>
              )}
            </div>

            <div className={styles.stepBody} style={{ display: currentStep === 2 ? "block" : "none" }}>
              <Form.Item name="scope" label="What this offer applies to" rules={[{ required: true }]}>
                <Radio.Group options={SCOPE_OPTIONS} />
              </Form.Item>

              {scope === "category" && (
                <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: "Select a category" }]}>
                  <Select
                    showSearch
                    options={categories.map((c) => ({ label: c.name, value: c._id }))}
                    filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
              )}

              {(scope === "product" || scope === "variant") && (
                <Form.Item name="productId" label="Product" rules={[{ required: true, message: "Select a product" }]}>
                  <Select
                    showSearch
                    options={products.map((p) => ({ label: p.name, value: p._id }))}
                    filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
                    onChange={() => form.setFieldValue("variantIds", undefined)}
                  />
                </Form.Item>
              )}

              {scope === "variant" && selectedProduct && (
                <Form.Item name="variantIds" label="Eligible variants" rules={[{ required: true, message: "Select at least one variant" }]}>
                  <Checkbox.Group
                    options={selectedProduct.variants.map((v) => ({
                      label: `${v.sku}${v.attributes ? " · " + Object.values(v.attributes).join(" / ") : ""} (${v.price})`,
                      value: v._id || v.sku,
                    }))}
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  />
                </Form.Item>
              )}

              {scope !== "cart" && (
                <Form.Item name="exclusiveToTargets" valuePropName="checked" label="Only valid when the cart contains just these eligible items">
                  <Switch />
                </Form.Item>
              )}

              <Form.Item name="minCartValue" label="Minimum cart value (optional)">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 1000" />
              </Form.Item>
              <Form.Item name="minQuantity" label="Minimum eligible quantity (optional)">
                <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 3" />
              </Form.Item>
            </div>

            <div className={styles.stepBody} style={{ display: currentStep === 3 ? "block" : "none" }}>
              <Form.Item name="dateRange" label="Valid from / to" rules={[{ required: true, message: "Select a date range" }]}>
                <DatePicker.RangePicker style={{ width: "100%" }} showTime />
              </Form.Item>
              <Form.Item name="daysOfWeek" label="Restrict to specific days (optional)">
                <Checkbox.Group options={DAY_OPTIONS} className={styles.dayCheckGroup} />
              </Form.Item>
              <Space.Compact block>
                <Form.Item name="startHour" label="Active from hour (optional)" style={{ flex: 1 }}>
                  <InputNumber min={0} max={23} style={{ width: "100%" }} placeholder="e.g. 16" />
                </Form.Item>
                <Form.Item name="endHour" label="Active until hour (optional)" style={{ flex: 1 }}>
                  <InputNumber min={0} max={23} style={{ width: "100%" }} placeholder="e.g. 19" />
                </Form.Item>
              </Space.Compact>
              <Form.Item name="eligibility" label="Who can use this" rules={[{ required: true }]}>
                <Select options={ELIGIBILITY_OPTIONS} />
              </Form.Item>
              <Form.Item name="stackable" valuePropName="checked" label="Stackable (competes with other offers; best one wins)">
                <Switch />
              </Form.Item>
              <Space.Compact block>
                <Form.Item name="usageLimit" label="Total usage limit (optional)" style={{ flex: 1 }}>
                  <InputNumber min={1} style={{ width: "100%" }} placeholder="Unlimited" />
                </Form.Item>
                <Form.Item name="perUserLimit" label="Per-customer limit (optional)" style={{ flex: 1 }}>
                  <InputNumber min={1} style={{ width: "100%" }} placeholder="Unlimited" />
                </Form.Item>
              </Space.Compact>
            </div>

            <div className={styles.stepBody} style={{ display: currentStep === 4 ? "block" : "none" }}>
              {watchedValues && (
                <div className={styles.reviewCard}>
                  <div className={styles.reviewRow}>
                    <span>Offer</span>
                    <strong>{watchedValues.kind === "code" ? watchedValues.code?.toUpperCase() || "—" : "Auto-applied"}</strong>
                  </div>
                  <div className={styles.reviewRow}>
                    <span>Description</span>
                    <span>{watchedValues.description || "—"}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span>Discount</span>
                    <span>
                      {watchedValues.discountType === "percent" && `${watchedValues.discountValue || 0}% off`}
                      {watchedValues.discountType === "fixed" && `${watchedValues.discountValue || 0} off`}
                      {watchedValues.discountType === "free_shipping" && "Free delivery"}
                      {watchedValues.discountType === "buy_x_get_y" && "Buy X Get Y"}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span>Applies to</span>
                    <span>{SCOPE_OPTIONS.find((o) => o.value === watchedValues.scope)?.label}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span>Minimum cart</span>
                    <span>{watchedValues.minCartValue ? watchedValues.minCartValue : "None"}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span>Valid</span>
                    <span>
                      {watchedValues.dateRange?.[0]?.format("DD MMM YYYY")} - {watchedValues.dateRange?.[1]?.format("DD MMM YYYY")}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span>Limits</span>
                    <span>
                      {watchedValues.usageLimit ? `${watchedValues.usageLimit} total` : "Unlimited total"}
                      {" · "}
                      {watchedValues.perUserLimit ? `${watchedValues.perUserLimit} per customer` : "Unlimited per customer"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.stepActions}>
              <Button disabled={currentStep === 0} onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}>
                Back
              </Button>
              {currentStep < STEP_FIELDS.length ? (
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="primary" loading={saving} onClick={handleSubmit}>
                  {editing ? "Save changes" : "Create offer"}
                </Button>
              )}
            </div>
          </Form>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}
