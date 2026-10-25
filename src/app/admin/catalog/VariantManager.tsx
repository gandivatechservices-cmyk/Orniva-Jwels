"use client";

import { useRef, useState } from "react";
import { Alert, App, Button, Collapse, Drawer, Dropdown, Form, Input, InputNumber, Modal, Space, Switch, Table, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ImageUploadList } from "components";
import { InfoLabel, tip } from "./tip";
import { NutritionFields, SourcingFields, contentToForm, formToNutrition, formToSourcing, type ContentFormValues } from "./ContentFields";
import { LOW_STOCK_THRESHOLD } from "utility/variantPricing";
import { catalogService, type Domain, type Product, type Variant } from "utility/services";
import styles from "./catalog.module.css";

type Row = { key?: string; value?: string };

/** Weight has its own field, so it's kept out of the free-form attribute rows. */
const omitWeight = (attributes?: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(attributes || {}).filter(([key]) => key !== "weight"));

const rowsToObject = (rows?: Row[]): Record<string, string> =>
  Object.fromEntries(
    (rows || [])
      .filter((row) => row.key?.trim() && String(row.value ?? "").trim() !== "")
      .map((row) => [row.key!.trim(), String(row.value).trim()])
  );

const objectToRows = (attributes: Record<string, string> | undefined, domainKeys: string[]): Row[] => {
  const rest = { ...(attributes || {}) };
  const rows = domainKeys.map((key) => {
    const value = rest[key] ?? "";
    delete rest[key];
    return { key, value };
  });
  return [...rows, ...Object.entries(rest).map(([key, value]) => ({ key, value: String(value ?? "") }))];
};

/** Only the fields the API accepts — drops _id so variants are matched by SKU. */
const toPayload = (variant: Variant): Variant => ({
  sku: variant.sku,
  ...(variant.name ? { name: variant.name } : {}),
  price: variant.price,
  stock: variant.stock,
  images: variant.images || [],
  isActive: variant.isActive !== false,
  nutrition: variant.nutrition ?? null,
  sourcing: variant.sourcing ?? null,
  attributes: variant.attributes || {},
  ...(variant.prices ? { prices: variant.prices } : {}),
});

type Props = {
  product: Product | null;
  domain?: Domain;
  onClose: () => void;
  /** Called after any successful change so the page can refresh its list. */
  onChanged: () => void;
};

export function VariantManager({ product, domain, onClose, onChanged }: Props) {
  const { notification, modal: confirmModal } = App.useApp();
  const [query, setQuery] = useState("");
  const [form] = Form.useForm();
  const [editing, setEditing] = useState<Variant | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Set when the variant being saved looks identical to another one
  const [clash, setClash] = useState<{ name: string; details: string } | null>(null);
  // Blocks a second request in the same instant, before `saving` has re-rendered
  const savingRef = useRef(false);
  const [current, setCurrent] = useState<Product | null>(product);
  const domainKeys = domain?.attributeKeys || [];

  // Keep the drawer in sync when a different product is opened.
  const [lastId, setLastId] = useState(product?._id);
  if (product?._id !== lastId) {
    setLastId(product?._id);
    setCurrent(product);
  }

  const variants = current?.variants || [];

  // Attribute names every variant of this product shares (like Amazon's "variation theme"):
  // taken from the existing variants, or from the domain's keys for a brand-new product.
  const themeKeys = (variants.length > 0 ? Array.from(new Set(variants.flatMap((v) => Object.keys(v.attributes || {})))) : domainKeys).filter((key) => key !== "weight");
  // Once a product has (or is getting) two variants, existing attribute names are locked (no typos or renames),
  // but new attributes can still be added and any value can be left blank.
  const themeLocked = editing === "new" ? variants.length >= 1 : variants.length >= 2;

  const persist = async (next: Variant[], message: string, extra: { basePrice?: number } = {}) => {
    if (!current || savingRef.current) return false;
    savingRef.current = true;
    setSaving(true);
    try {
      const updated = await catalogService.updateProduct(current._id, { variants: next.map(toPayload), ...extra });
      setCurrent(updated);
      notification.success({ title: message });
      onChanged();
      return true;
    } catch (error) {
      notification.error({
        title: "Unable to save variant",
        description: error instanceof Error ? error.message : "Check the values and try again.",
      });
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const openForm = (variant: Variant | "new") => {
    setClash(null);
    form.resetFields();
    if (variant === "new") {
      form.setFieldsValue({
        sku: "",
        name: "",
        price: current?.basePrice ?? 0,
        stock: 0,
        images: [],
        isActive: true,
        ...contentToForm(),
        weight: "",
        attributeRows: themeKeys.map((key) => ({ key, value: "" })),
      });
    } else {
      form.setFieldsValue({
        sku: variant.sku,
        name: variant.name || "",
        price: variant.price,
        stock: variant.stock,
        images: variant.images || [],
        isActive: variant.isActive !== false,
        ...contentToForm(variant.nutrition, variant.sourcing),
        weight: variant.attributes?.weight || "",
        attributeRows: objectToRows(omitWeight(variant.attributes), themeKeys),
      });
    }
    setEditing(variant);
  };

  const submit = async (values: { sku: string; name?: string; weight?: string; price: number; stock: number; images?: string[]; isActive?: boolean; attributeRows?: Row[] } & ContentFormValues) => {
    const edited: Variant = {
      ...(editing && editing !== "new" ? editing : {}),
      sku: values.sku.trim(),
      name: values.name?.trim() || undefined,
      price: Number(values.price),
      stock: Number(values.stock),
      images: values.images || [],
      isActive: values.isActive !== false,
      nutrition: formToNutrition(values),
      sourcing: formToSourcing(values),
      attributes: {
        ...rowsToObject(values.attributeRows),
        ...(values.weight?.trim() ? { weight: values.weight.trim() } : {}),
      },
    };
    // Two variants with the same attributes can't be told apart by shoppers (e.g. both "100g, Pack of 1").
    const signature = (attributes?: Record<string, string>) =>
      Object.entries(attributes || {}).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("|");
    const mine = signature(edited.attributes);
    const twin = mine && variants.find((variant) => variant.sku !== (editing !== "new" ? (editing as Variant).sku : "") && signature(variant.attributes) === mine);
    if (twin) {
      setClash({
        name: twin.name || twin.sku,
        details: Object.entries(edited.attributes || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join(", "),
      });
      return;
    }
    setClash(null);
    const next =
      editing === "new"
        ? [...variants, edited]
        : variants.map((variant) => (variant.sku === (editing as Variant).sku ? edited : variant));
    if (await persist(next, editing === "new" ? "Variant added" : "Variant updated")) setEditing(null);
  };

  const commitPrice = async (variant: Variant, raw: string) => {
    const next = Math.round(Number(raw.replace(/[₹,\s]/g, "")) * 100) / 100;
    if (raw.trim() === "" || Number.isNaN(next) || next < 0 || next === variant.price) return;
    const isFirst = variants[0]?.sku === variant.sku;
    await persist(
      variants.map((item) => (item.sku === variant.sku ? { ...item, price: next } : item)),
      `Price updated to ₹${next.toLocaleString("en-IN")}`,
      // The product's base price follows its first variant.
      isFirst ? { basePrice: next } : {}
    );
  };

  const commitStock = async (variant: Variant, raw: string) => {
    const next = Math.max(0, Math.floor(Number(raw.replace(/,/g, ""))));
    if (raw.trim() === "" || Number.isNaN(next) || next === variant.stock) return;
    await persist(
      variants.map((item) => (item.sku === variant.sku ? { ...item, stock: next } : item)),
      `Stock updated to ${next}`
    );
  };

  const attributeEntries = (variant: Variant) => Object.entries(variant.attributes || {}).filter(([, value]) => value);
  const toggleActive = (variant: Variant) =>
    persist(
      variants.map((item) => (item.sku === variant.sku ? { ...item, isActive: variant.isActive === false } : item)),
      variant.isActive === false ? "Variant activated" : "Variant made inactive"
    );
  const confirmRemove = (variant: Variant) =>
    confirmModal.confirm({
      title: "Remove this variant?",
      content: `${variant.name || variant.sku} will be deleted. To just hide it from the store, switch it to inactive instead.`,
      okText: "Remove",
      okType: "danger",
      onOk: () => persist(variants.filter((item) => item.sku !== variant.sku), "Variant removed"),
    });

  const columns: ColumnsType<Variant> = [
    {
      title: "Variant",
      key: "variant",
      render: (_, variant) => (
        <div className={styles.variantCell}>
          <span className={styles.variantName}>{variant.name || attributeEntries(variant).map(([, value]) => value).join(" · ") || variant.sku}</span>
          <span className={styles.variantSku}>{variant.sku}</span>
        </div>
      ),
    },
    {
      title: "Attributes",
      key: "attributes",
      render: (_, variant) =>
        attributeEntries(variant).length ? (
          <div className={styles.attrTags}>
            {attributeEntries(variant).map(([key, value]) => (
              <Tag key={key} bordered={false}>
                {key}: <strong>{value}</strong>
              </Tag>
            ))}
          </div>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Price",
      dataIndex: "price",
      align: "right",
      width: 130,
      render: (price: number, variant) => (
        // Edit in place: type a price, then press Enter or click away to save.
        <InputNumber
          key={`${variant.sku}-${price}`}
          size="small"
          min={0}
          precision={2}
          prefix="₹"
          defaultValue={price}
          disabled={saving}
          style={{ width: 104 }}
          aria-label={`Price for ${variant.name || variant.sku}`}
          onPressEnter={(event) => (event.target as HTMLInputElement).blur()}
          onBlur={(event) => void commitPrice(variant, event.target.value)}
        />
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      align: "right",
      width: 190,
      render: (stock: number, variant) => (
        <Space size={6} align="center">
          {stock <= 0 ? <Tag color="red" style={{ margin: 0 }}>Out</Tag> : stock <= LOW_STOCK_THRESHOLD ? <Tag color="orange" style={{ margin: 0 }}>Low</Tag> : null}
          {/* Edit in place: type a number, then press Enter or click away to save. */}
          <InputNumber
            key={`${variant.sku}-${stock}`}
            size="small"
            min={0}
            precision={0}
            defaultValue={stock}
            disabled={saving}
            style={{ width: 84 }}
            aria-label={`Stock for ${variant.name || variant.sku}`}
            onPressEnter={(event) => (event.target as HTMLInputElement).blur()}
            onBlur={(event) => void commitStock(variant, event.target.value)}
          />
        </Space>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      align: "center",
      width: 80,
      render: (active: boolean | undefined, variant) => (
        <Switch size="small" checked={active !== false} loading={saving} onChange={() => void toggleActive(variant)} aria-label={`Toggle ${variant.name || variant.sku}`} />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 56,
      align: "center",
      render: (_, variant) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{
            items: [
              { key: "edit", icon: <EditOutlined />, label: "Edit" },
              { key: "delete", icon: <DeleteOutlined />, label: variants.length <= 1 ? "Remove (needs at least one variant)" : "Remove", danger: true, disabled: variants.length <= 1 },
            ],
            onClick: ({ key }) => (key === "edit" ? openForm(variant) : confirmRemove(variant)),
          }}
        >
          <Button type="text" icon={<MoreOutlined />} aria-label={`Actions for ${variant.name || variant.sku}`} />
        </Dropdown>
      ),
    },
  ];

  const search = query.trim().toLowerCase();
  const visibleVariants = search
    ? variants.filter((variant) =>
        [variant.name, variant.sku, ...Object.values(variant.attributes || {})].some((text) => String(text ?? "").toLowerCase().includes(search))
      )
    : variants;
  const activeCount = variants.filter((variant) => variant.isActive !== false).length;

  return (
    <>
      <Drawer title={current ? `Variants — ${current.name}` : "Variants"} open={Boolean(product)} onClose={onClose} size={860} destroyOnHidden>
        <div className={styles.toolbar}>
          <div>
            <Typography.Text strong>
              {variants.length} {variants.length === 1 ? "variant" : "variants"}
            </Typography.Text>
            <Typography.Text type="secondary"> · {activeCount} active</Typography.Text>
          </div>
          <Space wrap>
            {variants.length > 5 && (
              <Input allowClear prefix={<SearchOutlined />} placeholder="Search name, SKU, attribute" value={query} onChange={(event) => setQuery(event.target.value)} style={{ width: 240 }} />
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm("new")}>
              Add variant
            </Button>
          </Space>
        </div>
        <Table<Variant>
          rowKey="sku"
          columns={columns}
          dataSource={visibleVariants}
          rowClassName={(variant) => (variant.isActive === false ? styles.inactiveRow : "")}
          pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
          locale={{ emptyText: search ? "No variants match your search" : "No variants" }}
        />
      </Drawer>

      <Modal
        title={editing === "new" ? "Add variant" : "Edit variant"}
        open={editing !== null}
        onCancel={() => setEditing(null)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={submit} onValuesChange={() => setClash(null)} className={styles.form} requiredMark={false}>
          <Form.Item name="name" label="Variant name" tooltip={tip("Shown to shoppers, e.g. 500g pack or Large / Black")}>
            <Input placeholder="e.g. 500g pack" />
          </Form.Item>
          <Form.Item name="weight" label="Net weight" tooltip={tip("Shown as 'Net Weight' on the product page when this variant is selected. Leave empty to use the product's weight.")}>
            <Input placeholder={current?.attributes?.weight ? `Product's weight: ${current.attributes.weight}` : "e.g. 250g"} />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true, whitespace: true }]} tooltip={tip(editing !== "new" ? "SKU can't be changed. Add a new variant instead." : "Unique stock code for this variant. A SKU can't be reused by another product.")}>
            <Input placeholder="SKU" disabled={editing !== "new"} />
          </Form.Item>
          <div className={styles.variantRow}>
            <Form.Item name="price" label="Price" tooltip={tip("Selling price of this variant only.")} rules={[{ required: true }]}>
              <InputNumber min={0} className={styles.fullWidth} />
            </Form.Item>
            <Form.Item name="stock" label="Stock" tooltip={tip("Units available for this variant. At 0 it shows as out of stock; 5 or fewer shows 'Only N left'.")} rules={[{ required: true }]}>
              <InputNumber min={0} precision={0} className={styles.fullWidth} />
            </Form.Item>
          </div>
          <Form.Item name="isActive" label="Active" valuePropName="checked" tooltip={tip("Inactive variants stay here but shoppers can't see or buy them.")}>
            <Switch />
          </Form.Item>
          <Form.Item name="images" label="Variant images (optional — overrides product images)" tooltip={tip("Photos for this variant only. If empty, the product's photos are used.")}>
            <ImageUploadList onUploadingChange={setUploading} />
          </Form.Item>
          <Form.List name="attributeRows">
            {(fields, { add, remove }) => (
              <div className={styles.attributeRows}>
                <Typography.Text strong>
                  <InfoLabel info="Details that tell variants apart or describe this one, e.g. flavor or size. Two variants of one product must differ in at least one value.">Variant attributes</InfoLabel>
                </Typography.Text>
                {themeLocked && (
                  <Typography.Text type="secondary">
                    Attribute names are shared by all variants of this product. {"You can add a new attribute any time, and leave a value blank when it doesn't apply (shoppers see a neutral label such as \"Standard\" or \"Plain\")."}
                  </Typography.Text>
                )}
                {fields.map(({ key, name, ...rest }) => {
                  const locked = themeLocked && themeKeys.includes(form.getFieldValue(["attributeRows", name, "key"]));
                  return (
                    <div className={styles.attributeRow} key={key}>
                      <Form.Item {...rest} name={[name, "key"]}>
                        <Input placeholder="e.g. size" disabled={locked} />
                      </Form.Item>
                      <Form.Item {...rest} name={[name, "value"]}>
                        <Input placeholder={locked ? "Leave blank if not applicable" : "e.g. M"} />
                      </Form.Item>
                      {locked ? (
                        <span />
                      ) : (
                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ key: "", value: "" })}>
                  Add attribute
                </Button>
              </div>
            )}
          </Form.List>
          <Collapse
            ghost
            items={[
              {
                key: "nutrition",
                label: <InfoLabel info="Only fill this in if this variant's nutrition differs. If empty, the product's Nutrition Facts table is shown.">Nutrition facts for this variant (optional)</InfoLabel>,
                forceRender: true,
                children: <NutritionFields inheritedRows={current?.nutrition?.rows?.length} />,
              },
              {
                key: "sourcing",
                label: <InfoLabel info="Only fill the fields that differ for this variant. Any field left empty uses the product's text.">Ingredients & sourcing for this variant (optional)</InfoLabel>,
                forceRender: true,
                children: <SourcingFields inherited={current?.sourcing ?? {}} />,
              },
            ]}
          />
          {clash && (
            <Alert
              type="warning"
              showIcon
              style={{ marginTop: 8 }}
              title={`This looks the same as "${clash.name}"`}
              description={`Both have ${clash.details || "the same details"}, so shoppers couldn't tell them apart. Change at least one detail, for example the weight or pack size, and save again.`}
            />
          )}
          <Form.Item className={styles.formActions}>
            <Space>
              <Button onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={saving || uploading} disabled={uploading}>
                Save variant
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
