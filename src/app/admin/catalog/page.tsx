"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { App, Button, Card, Col, Collapse, Empty, Flex, Image, Row, Dropdown, Form, Input, InputNumber, Modal, Popconfirm, Segmented, Select, Space, Switch, Table, Tabs, Tag, Tooltip, Typography } from "antd";
import { AppstoreOutlined, ApartmentOutlined, CloseCircleOutlined, BranchesOutlined, CheckCircleOutlined, StopOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, MoreOutlined, PlusOutlined, ShoppingOutlined, TagsOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AdminLayout, ImageUploadList } from "components";
import { ProtectedRoute } from "guards";
import { AdminPageHeader, AdminSearchBar } from "components/admin";
import { useAdminSearchIntent } from "hooks";
import { catalogService, type Brand, type Catalog, type Category, type Domain, type Product, type ProductPayload } from "utility/services";
import { VariantManager } from "./VariantManager";
import { InfoLabel, tip } from "./tip";
import { NutritionFields, SourcingFields, contentToForm, formToNutrition, formToSourcing, type ContentFormValues } from "./ContentFields";
import styles from "./catalog.module.css";

type NestedCategory = Category & { children?: NestedCategory[] };
type EntityType = "catalog" | "category" | "brand" | "product";

function AttributeRows({ name, title }: { name: string | (string | number)[]; title: string }) {
  return (
    <Form.List name={name as never}>
      {(fields, { add, remove }) => (
        <div className={styles.attributeRows}>
          <Typography.Text strong>
            {title}{" "}
            <Tooltip title="Extra details shown as cards on the product page, e.g. flavour or material. Add as many as you need; each needs a name and a value.">
              <InfoCircleOutlined style={{ color: "var(--muted)" }} />
            </Tooltip>
          </Typography.Text>
          {fields.length > 0 && (
            <div className={styles.attributeHeader}>
              <InfoLabel info="The name of the detail, e.g. flavor or material. Names are also used as filters, so keep them consistent across products.">Attribute name</InfoLabel>
              <InfoLabel info="The value for this product, e.g. Spicy. Shown as a card on the product page. Leave empty to skip it.">Value</InfoLabel>
              <span />
            </div>
          )}
          {fields.map(({ key, name: fieldName, ...restField }) => (
            <div className={styles.attributeRow} key={key}>
              <Form.Item {...restField} name={[fieldName, "key"]}>
                <Input placeholder="e.g. purity" />
              </Form.Item>
              <Form.Item {...restField} name={[fieldName, "value"]}>
                <Input placeholder="e.g. 18K" />
              </Form.Item>
              <Popconfirm title="Remove this attribute?" okText="Remove" okType="danger" onConfirm={() => remove(fieldName)}>
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Remove
                </Button>
              </Popconfirm>
            </div>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ key: "", value: "" })}>
            Add attribute
          </Button>
        </div>
      )}
    </Form.List>
  );
}

function makeTree(items: Category[]): NestedCategory[] {
  const nodes = new Map(items.map((item) => [item._id, { ...item, children: [] as NestedCategory[] }]));
  const roots: NestedCategory[] = [];
  nodes.forEach((node) => (node.parentCategoryId && nodes.has(node.parentCategoryId) ? nodes.get(node.parentCategoryId)?.children?.push(node) : roots.push(node)));
  return roots;
}

function getCategoryType(parentCategoryId: string | undefined | null, allCategories: Category[]): string {
  if (!parentCategoryId) return "category";
  let depth = 1;
  let current = allCategories.find((c) => c._id === parentCategoryId);
  const visited = new Set<string>();
  while (current && current.parentCategoryId && !visited.has(current._id)) {
    visited.add(current._id);
    depth++;
    current = allCategories.find((c) => c._id === current!.parentCategoryId);
  }
  if (depth === 1) return "subcategory";
  if (depth === 2) return "subsubcategory";
  return `level-${depth}-subcategory`;
}

/** Weight has its own field in the forms, so it's kept out of the free-form attribute rows. */
const WEIGHT_KEY = "weight";
const omitWeight = (attributes?: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(attributes || {}).filter(([key]) => key !== WEIGHT_KEY));
const withoutWeightKey = (keys: string[]) => keys.filter((key) => key !== WEIGHT_KEY);

function rowsToObject(rows: unknown): Record<string, string> {
  return Object.fromEntries(
    (Array.isArray(rows) ? rows : [])
      .filter((row): row is { key?: string; value?: string } => Boolean(row && typeof row === "object" && "key" in row))
      .filter((row) => Boolean(row.key && row.key.trim() && row.value !== undefined && String(row.value).trim() !== ""))
      .map((row) => [row.key!.trim(), String(row.value).trim()])
  );
}

function objectToRows(attributes?: Record<string, string>, domainKeys?: string[]): Array<{ key: string; value: string }> {
  const existing = { ...(attributes || {}) };
  const rows: Array<{ key: string; value: string }> = [];

  if (domainKeys && domainKeys.length > 0) {
    domainKeys.forEach((key) => {
      rows.push({ key, value: existing[key] ?? "" });
      delete existing[key];
    });
  }

  Object.entries(existing).forEach(([key, value]) => {
    rows.push({ key, value: String(value ?? "") });
  });

  return rows;
}

function mergeWithDomainKeys(
  existingRows: Array<{ key?: string; value?: string }>,
  domainKeys: string[]
): Array<{ key: string; value: string }> {
  const existingMap = new Map<string, string>();
  const extraRows: Array<{ key: string; value: string }> = [];

  for (const row of existingRows || []) {
    if (row && row.key) {
      if (existingMap.has(row.key)) {
        extraRows.push({ key: row.key, value: row.value || "" });
      } else {
        existingMap.set(row.key, row.value || "");
      }
    }
  }

  const result: Array<{ key: string; value: string }> = [];
  for (const key of domainKeys) {
    result.push({ key, value: existingMap.get(key) ?? "" });
    existingMap.delete(key);
  }
  existingMap.forEach((value, key) => {
    if (key) result.push({ key, value });
  });
  for (const extra of extraRows) {
    if (extra.key && !domainKeys.includes(extra.key)) {
      result.push(extra);
    }
  }
  return result;
}

export default function CatalogPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [deletedBrands, setDeletedBrands] = useState<Brand[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("catalogs");
  const [showDeletedCategories, setShowDeletedCategories] = useState(false);
  // How many image uploads are in progress in the open form; Save is disabled until they finish.
  const [uploadingCount, setUploadingCount] = useState(0);
  const trackUpload = useCallback((uploading: boolean) => setUploadingCount((n) => Math.max(0, n + (uploading ? 1 : -1))), []);
  const [productBrand, setProductBrand] = useState<string>("all");
  const [productCategory, setProductCategory] = useState<string>("all");
  const [productCatalog, setProductCatalog] = useState<string>("all");
  const [showDeletedBrands, setShowDeletedBrands] = useState(false);
  const [search, setSearch] = useState("");
  // A ref blocks a second submit in the same instant, before the `saving` state has re-rendered
  const savingRef = useRef(false);
  const [productStatus, setProductStatus] = useState<"all" | "active" | "inactive" | "deleted">("active");
  // Opened from the top-bar search: jump to the right tab and filter by what was searched
  useAdminSearchIntent(({ q, tab }) => {
    setSearch(q);
    if (tab) setActiveTab(tab);
    setProductStatus("all");
  });
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<EntityType | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const { notification, modal: confirmModal } = App.useApp();

  const selectedDomainId = Form.useWatch("domainId", form);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, c, cat, allProducts, allBrands, allDeleted, allDeletedCategories, allDeletedBrands] = await Promise.all([
        catalogService.listDomains(),
        catalogService.listCatalogs(),
        catalogService.listCategories(),
        catalogService.listAllAdminProducts(),
        catalogService.listAllBrands(),
        catalogService.listAllAdminProducts(true),
        catalogService.listDeletedCategories(),
        catalogService.listAllBrands(undefined, true),
      ]);
      setDeletedCategories(allDeletedCategories);
      setDeletedBrands(allDeletedBrands);
      setBrands(allBrands);
      setDeletedProducts(
        [...allDeleted].sort(
          (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        )
      );
      setDomains(d);
      setCatalogs(c);
      setCategories(cat);
      setProducts(
        [...allProducts].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
      );
    } catch (error) {
      notification.error({
        title: "Unable to load catalog",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const close = () => {
    form.resetFields();
    setModal(null);
    setEditingProduct(null);
    setEditingCatalog(null);
    setEditingCategory(null);
    setEditingBrand(null);
  };

  const handleDomainChange = (newDomainId: string) => {
    const domain = domains.find((d) => d._id === newDomainId);
    const domainKeys = withoutWeightKey(domain?.attributeKeys || []);

    // Update Product attributes
    const currentProdAttrs = form.getFieldValue("attributeRows") || [];
    form.setFieldValue("attributeRows", mergeWithDomainKeys(currentProdAttrs, domainKeys));

    // A brand belongs to one domain, so the old selection no longer applies
    form.setFieldValue("brandId", undefined);
  };

  const openAddProduct = () => {
    form.resetFields();
    setEditingProduct(null);
    setEditingCatalog(null);
    setEditingCategory(null);

    const defaultDomain = domains[0];
    const domainKeys = withoutWeightKey(defaultDomain?.attributeKeys || []);

    form.setFieldsValue({
      domainId: defaultDomain?._id,
      catalogId: undefined,
      categoryId: undefined,
      name: "",
      basePrice: 0,
      mrp: undefined,
      isActive: true,
      images: [],
      weight: "",
      attributeRows: domainKeys.map((key) => ({ key, value: "" })),
      sku: "",
      stock: 0,
      ...contentToForm(),
    });
    setModal("product");
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditingCatalog(null);
    setEditingCategory(null);

    const domain = domains.find((d) => d._id === product.domainId);
    const domainKeys = withoutWeightKey(domain?.attributeKeys || []);

    form.setFieldsValue({
      domainId: product.domainId,
      catalogId: product.catalogId,
      categoryId: product.categoryId,
      brandId: typeof product.brandId === "object" ? product.brandId?._id : product.brandId || undefined,
      name: product.name,
      basePrice: product.basePrice,
      mrp: product.mrp,
      isActive: product.isActive !== false,
      images: product.images || [],
      weight: product.attributes?.[WEIGHT_KEY] || "",
      attributeRows: objectToRows(omitWeight(product.attributes), domainKeys),
      ...contentToForm(product.nutrition, product.sourcing),
    });
    setModal("product");
  };

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setEditingProduct(null);
    setEditingCatalog(null);
    setEditingCategory(null);
    form.setFieldsValue({
      domainId: brand.domainId,
      name: brand.name,
      description: brand.description || "",
      logoUrl: brand.logoUrl ? [brand.logoUrl] : [],
      bannerUrl: brand.bannerUrl ? [brand.bannerUrl] : [],
      isActive: brand.isActive,
    });
    setModal("brand");
  };

  const handleDeleteBrand = async (brand: Brand) => {
    try {
      await catalogService.deleteBrand(brand._id);
      notification.success({ title: "Brand deleted successfully" });
      await load();
    } catch (error) {
      notification.error({
        title: "Unable to delete brand",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleToggleProductActive = async (product: Product) => {
    const next = product.isActive === false;
    try {
      await catalogService.updateProduct(product._id, { isActive: next });
      notification.success({ title: `Product ${next ? "activated" : "deactivated"}` });
      await load();
    } catch (error) {
      notification.error({
        title: "Unable to update product",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const confirmDelete = (kind: string, name: string, remove: () => Promise<unknown>) =>
    confirmModal.confirm({
      title: `Delete this ${kind}?`,
      content:
        kind === "product"
          ? `"${name}" will be removed from the store and moved to Products → Deleted. Past orders and reviews keep their history.`
          : `"${name}" will be hidden and moved to the Deleted ${kind === "category" ? "categories" : `${kind}s`} list. Nothing is permanently removed.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await remove();
          notification.success({ title: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} deleted` });
          await load();
        } catch (error) {
          notification.error({
            title: `Unable to delete ${kind}`,
            description: error instanceof Error ? error.message : "Please try again.",
          });
        }
      },
    });

  const rowMenu = (onEdit: () => void, onDelete: () => void, extra: NonNullable<MenuProps["items"]> = []) => ({
    items: [
      { key: "edit", icon: <EditOutlined />, label: "Edit" },
      ...extra,
      { type: "divider" as const },
      { key: "delete", icon: <DeleteOutlined />, label: "Delete", danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "edit") onEdit();
      else if (key === "delete") onDelete();
    },
  });

  const openEditCatalog = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setEditingProduct(null);
    setEditingCategory(null);
    form.setFieldsValue({
      name: catalog.name,
      domainId: catalog.domainId,
      description: catalog.description || "",
      imageUrl: catalog.imageUrl ? [catalog.imageUrl] : [],
    });
    setModal("catalog");
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditingProduct(null);
    setEditingCatalog(null);
    form.setFieldsValue({
      name: category.name,
      domainId: category.domainId,
      parentCategoryId: category.parentCategoryId || undefined,
      imageUrl: category.imageUrl ? [category.imageUrl] : [],
    });
    setModal("category");
  };

  const handleOpenAdd = (label: EntityType) => {
    form.resetFields();
    setEditingProduct(null);
    setEditingCatalog(null);
    setEditingCategory(null);
    setEditingBrand(null);

    if (label === "product") {
      openAddProduct();
    } else {
      if ((label === "catalog" || label === "category" || label === "brand") && domains.length > 0) {
        form.setFieldValue("domainId", domains[0]._id);
      }
      setModal(label);
    }
  };

  async function save(values: Record<string, unknown>) {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await saveForm(values);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function saveForm(values: Record<string, unknown>) {
    try {
      if (modal === "catalog") {
        const catalogImages = Array.isArray(values.imageUrl) ? (values.imageUrl as string[]) : [];
        const payload = {
          name: String(values.name),
          domainId: String(values.domainId),
          description: String(values.description || ""),
          imageUrl: catalogImages[0] || "",
        };
        if (editingCatalog) {
          await catalogService.updateCatalog(editingCatalog._id, payload);
        } else {
          await catalogService.createCatalog(payload);
        }
      }
      if (modal === "category") {
        const parentId = values.parentCategoryId ? String(values.parentCategoryId) : undefined;
        const computedType = getCategoryType(parentId, categories);
        const categoryImages = Array.isArray(values.imageUrl) ? (values.imageUrl as string[]) : [];
        const payload = {
          name: String(values.name),
          domainId: String(values.domainId),
          type: computedType,
          parentCategoryId: parentId,
          imageUrl: categoryImages[0] || "",
        };
        if (editingCategory) {
          await catalogService.updateCategory(editingCategory._id, payload);
        } else {
          await catalogService.createCategory(payload);
        }
      }
      if (modal === "brand") {
        const logos = Array.isArray(values.logoUrl) ? (values.logoUrl as string[]) : [];
        const payload = {
          domainId: String(values.domainId),
          name: String(values.name),
          description: String(values.description || ""),
          logoUrl: logos[0] || "",
          bannerUrl: (Array.isArray(values.bannerUrl) ? (values.bannerUrl as string[]) : [])[0] || "",
          isActive: values.isActive !== false,
        };
        if (editingBrand) await catalogService.updateBrand(editingBrand._id, payload);
        else await catalogService.createBrand(payload);
      }
      if (modal === "product") {
        const basePrice = Number(values.basePrice);
        const payload = {
          domainId: String(values.domainId),
          catalogId: String(values.catalogId),
          categoryId: String(values.categoryId),
          brandId: values.brandId ? String(values.brandId) : undefined,
          name: String(values.name),
          basePrice,
          mrp: values.mrp ? Number(values.mrp) : undefined,
          isActive: values.isActive !== false,
          images: Array.isArray(values.images) ? (values.images as string[]) : [],
          attributes: {
            ...rowsToObject(values.attributeRows),
            ...(String(values.weight ?? "").trim() ? { [WEIGHT_KEY]: String(values.weight).trim() } : {}),
          },
          // null clears the saved value when editing; omitted on create
          nutrition: formToNutrition(values as ContentFormValues) ?? (editingProduct ? null : undefined),
          sourcing: formToSourcing(values as ContentFormValues) ?? (editingProduct ? null : undefined),
        };

        if (editingProduct) {
          // Variants are managed separately from the Variants drawer
          await catalogService.updateProduct(editingProduct._id, payload);
        } else {
          // A product needs one variant to exist — start with a default one, more can be added after
          await catalogService.createProduct({
            ...payload,
            // The first variant starts with the same attributes (weight, flavour…) so they show up on it too
            variants: [
              {
                sku: String(values.sku).trim(),
                name: String(values.variantName || "").trim() || undefined,
                price: basePrice,
                stock: Number(values.stock) || 0,
                attributes: payload.attributes,
              },
            ],
          } as ProductPayload);
        }
      }
      const isEditing = Boolean(editingProduct || editingCatalog || editingCategory || editingBrand);
      notification.success({
        title: `${modal ? labelTitle(modal) : "Item"} ${isEditing ? "updated" : "created"} successfully`,
      });
      close();
      await load();
    } catch (error) {
      notification.error({
        title: "Unable to save",
        description: error instanceof Error ? error.message : "Check the values and try again.",
      });
    }
  }

  const catalogColumns: ColumnsType<Catalog> = [
    {
      title: "Catalog",
      dataIndex: "name",
      render: (name: string, item) => (
        <Space size={10}>
          <Image
            width={36}
            height={36}
            src={item.imageUrl}
            alt={name}
            style={{ objectFit: "cover", borderRadius: 6 }}
            fallback="/assets/images/placeholders/product-placeholder.svg"
          />
          <Typography.Text strong>{name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Domain",
      dataIndex: "domainId",
      render: (_, item) => domains.find((d) => d._id === item.domainId)?.name || item.domainId,
      filters: domains.map((d) => ({ text: d.name, value: d._id })),
      onFilter: (value, item) => item.domainId === value,
    },
    { title: "Description", dataIndex: "description", ellipsis: true },
    {
      title: "",
      key: "actions",
      width: 60,
      align: "center",
      render: (_, item) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={rowMenu(() => openEditCatalog(item), () => confirmDelete("catalog", item.name, () => catalogService.deleteCatalog(item._id)))}
        >
          <Button type="text" icon={<MoreOutlined />} aria-label={`Actions for ${item.name}`} />
        </Dropdown>
      ),
    },
  ];

  const categoryTypes = Array.from(new Set(categories.map((c) => c.type))).filter(Boolean);
  const categoryColumns: ColumnsType<NestedCategory> = [
    {
      title: "Category",
      dataIndex: "name",
      render: (name: string, item) => (
        <Space size={10}>
          <Image
            width={32}
            height={32}
            src={item.imageUrl}
            alt={name}
            style={{ objectFit: "cover", borderRadius: 6 }}
            fallback="/assets/images/placeholders/product-placeholder.svg"
          />
          <Typography.Text strong={!item.parentCategoryId}>{name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Domain",
      dataIndex: "domainId",
      render: (_, item) => domains.find((d) => d._id === item.domainId)?.name || item.domainId,
      filters: domains.map((d) => ({ text: d.name, value: d._id })),
      onFilter: (value, item) => item.domainId === value,
    },
    {
      title: "Hierarchy / Level",
      dataIndex: "type",
      filters: categoryTypes.map((type) => ({ text: type, value: type })),
      onFilter: (value, item) => item.type === value,
      render: (type: string, item) => {
        const isRoot = !item.parentCategoryId;
        const label = isRoot ? "Root Category" : type === "subcategory" ? "Subcategory" : type === "subsubcategory" ? "Sub-subcategory" : type;
        return (
          <span
            style={{
              color: isRoot ? "#1d4ed8" : "#047857",
              fontWeight: 500,
              fontSize: "12px",
              background: isRoot ? "#eff6ff" : "#ecfdf5",
              border: `1px solid ${isRoot ? "#dbeafe" : "#a7f3d0"}`,
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      title: "Parent",
      render: (_, item) => categories.find((c) => c._id === item.parentCategoryId)?.name || "Root",
    },
    {
      title: "",
      key: "actions",
      width: 60,
      align: "center",
      render: (_, item) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={rowMenu(() => openEditCategory(item), () => confirmDelete("category", item.name, () => catalogService.deleteCategory(item._id)))}
        >
          <Button type="text" icon={<MoreOutlined />} aria-label={`Actions for ${item.name}`} />
        </Dropdown>
      ),
    },
  ];

  const brandColumns: ColumnsType<Brand> = [
    {
      title: "Brand",
      dataIndex: "name",
      render: (name: string, item) => (
        <Space size={10}>
          <Image
            width={32}
            height={32}
            src={item.logoUrl}
            alt={name}
            style={{ objectFit: "contain", borderRadius: 6, background: "#fff" }}
            fallback="/assets/images/placeholders/product-placeholder.svg"
          />
          <Typography.Text strong>{name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Domain",
      dataIndex: "domainId",
      render: (_, item) => domains.find((d) => d._id === item.domainId)?.name || item.domainId,
      filters: domains.map((d) => ({ text: d.name, value: d._id })),
      onFilter: (value, item) => item.domainId === value,
    },
    {
      title: "Products",
      render: (_, item) => products.filter((p) => (typeof p.brandId === "object" ? p.brandId?._id : p.brandId) === item._id).length,
    },
    { title: "Status", dataIndex: "isActive", render: (active: boolean) => <Tag color={active ? "green" : "default"}>{active ? "Active" : "Inactive"}</Tag> },
    {
      title: "",
      key: "actions",
      width: 170,
      render: (_, item) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditBrand(item)}>
            Edit
          </Button>
          <Popconfirm title="Delete this brand?" description="It moves to Brands → Deleted. Brands used by products can't be deleted." okText="Delete" okType="danger" onConfirm={() => handleDeleteBrand(item)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const productColumns: ColumnsType<Product> = [
    {
      title: "Product",
      dataIndex: "name",
      render: (name: string, item) => (
        <Space size={10}>
          <Image
            width={40}
            height={40}
            src={item.images?.[0] || item.variants?.[0]?.images?.[0]}
            alt={name}
            style={{ objectFit: "cover", borderRadius: 6 }}
            fallback="/assets/images/placeholders/product-placeholder.svg"
          />
          <Flex vertical gap={2}>
            <Link href={`/admin/products/${item._id}`}>
              <Typography.Text strong style={{ color: "#14452b" }}>{name}</Typography.Text>
            </Link>
            <Space size={4}>
              {((typeof item.brandId === "object" && item.brandId?.name) || item.brand) && (
                <Tag variant="filled" style={{ margin: 0, background: "#e6eef4", color: "#1f3f55", fontWeight: 600 }}>
                  {(typeof item.brandId === "object" && item.brandId?.name) || item.brand}
                </Tag>
              )}
              {item.isActive === false && <Tag style={{ margin: 0 }}>Inactive</Tag>}
            </Space>
          </Flex>
        </Space>
      ),
    },
    {
      title: "Catalog / Category",
      key: "catalogCategory",
      width: 260,
      render: (_, item) => {
        const rows: Array<[string, string]> = [
          ["Catalog", catalogs.find((c) => c._id === item.catalogId)?.name || item.catalogId],
          ["Category", categories.find((c) => c._id === item.categoryId)?.name || item.categoryId],
        ];
        return (
          <Flex vertical gap={2}>
            {rows.map(([label, value]) => (
              <Flex key={label} gap={8} align="baseline">
                <Typography.Text style={{ width: 62, flexShrink: 0, fontSize: 12, color: "#4b5563", fontWeight: 600 }}>
                  {label}
                </Typography.Text>
                <Typography.Text style={{ color: "#111827" }}>{value}</Typography.Text>
              </Flex>
            ))}
          </Flex>
        );
      },
    },
    { title: "Base price", dataIndex: "basePrice", render: (p: number) => `₹${Number(p).toLocaleString("en-IN")}` },
    { title: "Variants", render: (_, item) => item.variants?.length || 0 },
    {
      title: "Actions",
      key: "actions",
      width: 340,
      align: "right",
      render: (_, item) => (
        <Space size={6}>
          <Tooltip title="Edit product">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditProduct(item)} aria-label={`Edit ${item.name}`}>Edit</Button>
          </Tooltip>
          <Tooltip title="Manage variants, price and stock">
            <Button size="small" icon={<BranchesOutlined />} onClick={() => setVariantProduct(item)} aria-label={`Variants of ${item.name}`}>Variants</Button>
          </Tooltip>
          {item.isActive === false ? (
            <Tooltip title="Activate">
              <Button size="small" icon={<CheckCircleOutlined />} onClick={() => void handleToggleProductActive(item)} aria-label={`Activate ${item.name}`}>Activate</Button>
            </Tooltip>
          ) : (
            <Tooltip title="Make inactive">
              <Button
                size="small"
                icon={<StopOutlined />}
                aria-label={`Make ${item.name} inactive`}
                onClick={() =>
                  confirmModal.confirm({
                    title: "Make this product inactive?",
                    content: "It will be hidden from the store and can't be bought until you activate it again.",
                    okText: "Make inactive",
                    onOk: () => handleToggleProductActive(item),
                  })
                }
              >
                Inactive
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Delete product">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${item.name}`}
              onClick={() => confirmDelete("product", item.name, () => catalogService.deleteProduct(item._id))}
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const labelTitle = (label: EntityType) => label.charAt(0).toUpperCase() + label.slice(1);
  const isEditing = Boolean(editingProduct || editingCatalog || editingCategory || editingBrand);

  const inactiveProductCount = products.filter((p) => p.isActive === false).length;
  const visibleProducts = products.filter((p) =>
    productStatus === "all" || productStatus === "deleted" ? true : productStatus === "inactive" ? p.isActive === false : p.isActive !== false
  );
  const productStatusFilter = (
    <Segmented
      size="large"
      value={productStatus}
      onChange={(value) => setProductStatus(value as typeof productStatus)}
      options={[
        { value: "all", label: `All (${products.length})` },
        { value: "active", label: `Active (${products.length - inactiveProductCount})` },
        { value: "inactive", label: `Inactive (${inactiveProductCount})` },
        { value: "deleted", label: `Deleted (${deletedProducts.length})` },
      ]}
    />
  );

  const searchTokens = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (...texts: Array<string | undefined>) => {
    const haystack = texts.filter(Boolean).join(" ").toLowerCase();
    return searchTokens.every((token) => haystack.includes(token));
  };
  const shownCatalogs = catalogs.filter((c) => matches(c.name, c.description));
  const shownCategories = categories.filter((c) => matches(c.name, c.slug));
  const shownBrands = brands.filter((b) => matches(b.name, b.slug, b.description));
  const productBrandId = (p: Product) => (typeof p.brandId === "object" ? p.brandId?._id : p.brandId) || "";
  const matchesProductFilters = (p: Product) =>
    (productBrand === "all" || productBrandId(p) === productBrand) &&
    (productCategory === "all" || p.categoryId === productCategory) &&
    (productCatalog === "all" || p.catalogId === productCatalog);
  const shownProducts = visibleProducts.filter(
    (p) => matchesProductFilters(p) && matches(p.name, p.brand, p.description, ...(p.variants || []).flatMap((v) => [v.sku, v.name]))
  );

  const deletedProductColumns = productColumns.filter((column) => column.key !== "actions");
  const deletedCategoryColumns: ColumnsType<NestedCategory> = categoryColumns
    .filter((column) => column.key !== "actions")
    .map((column) =>
      column.title === "Parent"
        ? { ...column, render: (_: unknown, item: NestedCategory) => [...categories, ...deletedCategories].find((c) => c._id === item.parentCategoryId)?.name || "Root" }
        : column
    );
  const deletedBrandColumns = brandColumns.filter((column) => column.key !== "actions");
  const shownDeletedCategories = deletedCategories.filter((c) => matches(c.name, c.slug));
  const shownDeletedBrands = deletedBrands.filter((b) => matches(b.name, b.slug, b.description));
  const deletedNote = (text: string) => <Typography.Text type="secondary">{text}</Typography.Text>;
  const shownDeletedProducts = deletedProducts.filter(
    (p) => matchesProductFilters(p) && matches(p.name, p.brand, p.description, ...(p.variants || []).flatMap((v) => [v.sku, v.name]))
  );

  const hasProductFilters = productBrand !== "all" || productCategory !== "all" || productCatalog !== "all";
  const productDropdownFilters = (
    <Flex wrap gap={12} align="center" style={{ marginBottom: 16 }}>
      <Select
        size="large"
        showSearch
        optionFilterProp="label"
        allowClear
        placeholder="All brands"
        value={productBrand === "all" ? undefined : productBrand}
        onChange={(value) => setProductBrand(value ?? "all")}
        style={{ minWidth: 200 }}
        options={[{ value: "all", label: "All brands" }, ...brands.map((b) => ({ value: b._id, label: b.name }))]}
      />
      <Select
        size="large"
        showSearch
        optionFilterProp="label"
        allowClear
        placeholder="All categories"
        value={productCategory === "all" ? undefined : productCategory}
        onChange={(value) => setProductCategory(value ?? "all")}
        style={{ minWidth: 220 }}
        options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
      />
      <Select
        size="large"
        showSearch
        optionFilterProp="label"
        allowClear
        placeholder="All catalogs"
        value={productCatalog === "all" ? undefined : productCatalog}
        onChange={(value) => setProductCatalog(value ?? "all")}
        style={{ minWidth: 200 }}
        options={[{ value: "all", label: "All catalogs" }, ...catalogs.map((c) => ({ value: c._id, label: c.name }))]}
      />
      {hasProductFilters && (
        <Button
          size="large"
          icon={<CloseCircleOutlined />}
          onClick={() => {
            setProductBrand("all");
            setProductCategory("all");
            setProductCatalog("all");
          }}
        >
          Clear filters
        </Button>
      )}
    </Flex>
  );

  const deletedToggle = (value: boolean, onChange: (v: boolean) => void, deletedCount: number) => (
    <Segmented
      size="large"
      value={value ? "deleted" : "active"}
      onChange={(v) => onChange(v === "deleted")}
      options={[
        { value: "active", label: "Active" },
        { value: "deleted", label: `Deleted (${deletedCount})` },
      ]}
    />
  );

  const table = <T extends object>(columns: ColumnsType<T>, data: T[], label: EntityType, expandable?: boolean, filter?: ReactNode, readOnly = false, belowToolbar?: ReactNode) => (
    <>
      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder={`Search ${label === "category" ? "categories" : `${label}s`}...`}
      />
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <div>{filter ?? <Typography.Text type="secondary">All {label === "category" ? "categories" : `${label}s`}</Typography.Text>}</div>
        {!readOnly && (
          <Button size="large" type="primary" icon={<PlusOutlined />} onClick={() => handleOpenAdd(label)}>
            Add {label}
          </Button>
        )}
      </Flex>
      {belowToolbar}
      <Table<T>
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={data}
        expandable={expandable ? { defaultExpandAllRows: true } : undefined}
        size="middle"
        style={{ fontSize: 14 }}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={searchTokens.length ? "No matches for your search" : readOnly ? `No deleted ${label === "category" ? "categories" : `${label}s`}` : `No ${label === "category" ? "categories" : `${label}s`} yet`}
            >
              {!readOnly && !searchTokens.length && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenAdd(label)}>
                  Add {label}
                </Button>
              )}
            </Empty>
          ),
        }}
      />
    </>
  );

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminLayout>
        <AdminPageHeader title="Domains & Catalog" subtitle="Manage catalogs, categories, brands, products and priced variants." />
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {[
            { key: "catalogs", label: "Catalogs", count: catalogs.length, icon: <AppstoreOutlined /> },
            { key: "categories", label: "Categories", count: categories.length, icon: <ApartmentOutlined /> },
            { key: "brands", label: "Brands", count: brands.length, icon: <TagsOutlined /> },
            { key: "products", label: "Products", count: products.length, icon: <ShoppingOutlined /> },
          ].map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <Col key={tab.key} xs={12} lg={6}>
                <Card
                  hoverable
                  variant="borderless"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    borderRadius: 12,
                    cursor: "pointer",
                    background: selected ? "#14452b" : "#ffffff",
                    transition: "background 0.2s",
                  }}
                  styles={{ body: { padding: 14 } }}
                >
                  <Flex align="center" gap={12}>
                    <span
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        background: selected ? "rgba(255,255,255,0.16)" : "#eef3f0",
                        color: selected ? "#ffffff" : "#14452b",
                      }}
                    >
                      {tab.icon}
                    </span>
                    <Flex vertical>
                      <Typography.Text style={{ color: selected ? "rgba(255,255,255,0.8)" : "#6b7280", fontSize: 12 }}>
                        {tab.label}
                      </Typography.Text>
                      <Typography.Text strong style={{ color: selected ? "#ffffff" : "#111827", fontSize: 20, lineHeight: 1.2 }}>
                        {tab.count}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </Card>
              </Col>
            );
          })}
        </Row>
        <Card variant="borderless" style={{ borderRadius: 12 }}>
          <Tabs
            tabBarStyle={{ display: "none" }}
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: "catalogs", label: `Catalogs (${catalogs.length})`, children: table(catalogColumns, shownCatalogs, "catalog") },
              {
                key: "categories",
                label: `Categories (${categories.length})`,
                children: showDeletedCategories
                  ? table(
                      deletedCategoryColumns,
                      makeTree(shownDeletedCategories),
                      "category",
                      true,
                      <Space>
                        {deletedToggle(showDeletedCategories, setShowDeletedCategories, deletedCategories.length)}
                        {deletedNote("Hidden from the store. Kept so existing history stays intact.")}
                      </Space>,
                      true
                    )
                  : table(
                      categoryColumns,
                      makeTree(shownCategories),
                      "category",
                      true,
                      deletedToggle(showDeletedCategories, setShowDeletedCategories, deletedCategories.length)
                    ),
              },
              {
                key: "brands",
                label: `Brands (${brands.length})`,
                children: showDeletedBrands
                  ? table(
                      deletedBrandColumns,
                      shownDeletedBrands,
                      "brand",
                      false,
                      <Space>
                        {deletedToggle(showDeletedBrands, setShowDeletedBrands, deletedBrands.length)}
                        {deletedNote("Hidden from the store. Kept so existing history stays intact.")}
                      </Space>,
                      true
                    )
                  : table(
                      brandColumns,
                      shownBrands,
                      "brand",
                      false,
                      deletedToggle(showDeletedBrands, setShowDeletedBrands, deletedBrands.length)
                    ),
              },
              {
                key: "products",
                label: `Products (${products.length})`,
                children:
                  productStatus === "deleted"
                    ? table(deletedProductColumns, shownDeletedProducts, "product", false, productStatusFilter, true, productDropdownFilters)
                    : table(productColumns, shownProducts, "product", false, productStatusFilter, false, productDropdownFilters),
              },
            ]}
          />
        </Card>
        <Modal
          title={
            editingProduct
              ? "Edit product"
              : editingCatalog
              ? "Edit catalog"
              : editingCategory
              ? "Edit category"
              : editingBrand
              ? "Edit brand"
              : `Add ${modal ? labelTitle(modal) : "item"}`
          }
          open={modal !== null}
          onCancel={close}
          closable={!saving}
          maskClosable={!saving}
          keyboard={!saving}
          footer={null}
          destroyOnHidden
          width={modal === "product" ? 560 : 480}
        >
          <Form form={form} layout="vertical" onFinish={save} className={styles.form} requiredMark={false}>
            {modal === "catalog" && (
              <>
                <Form.Item name="domainId" label="Domain" tooltip={tip("The store this catalog belongs to. Catalogs, categories and brands are separate for each domain.")} rules={[{ required: true }]}>
                  <Select options={domains.map((v) => ({ value: v._id, label: v.name }))} />
                </Form.Item>
                <Form.Item name="name" label="Catalog name" tooltip={tip("The catalog's name, for example 'FreshMart Grocery'. Shoppers see it on the Catalogs pages.")} rules={[{ required: true }]}>
                  <Input placeholder="Catalog name" />
                </Form.Item>
                <Form.Item name="description" label="Description" tooltip={tip("Shown to shoppers on the catalog banner. A short line about what this catalog contains.")}>
                  <Input.TextArea rows={3} placeholder="Catalog description" />
                </Form.Item>
                <Form.Item name="imageUrl" label="Catalog image" required rules={[{ validator: (_, value?: string[]) => (Array.isArray(value) && value.length > 0 ? Promise.resolve() : Promise.reject(new Error("Please upload an image"))) }]} tooltip={tip("Required. Cover image shown on the home page and the Catalogs page: upload one image.")}>
                  <ImageUploadList maxCount={1} onUploadingChange={trackUpload} />
                </Form.Item>
              </>
            )}
            {modal === "category" && (
              <>
                <Form.Item name="domainId" label="Domain" tooltip={tip("The store this category belongs to. Changing it clears the parent category.")} rules={[{ required: true }]}>
                  <Select
                    placeholder="Select domain"
                    options={domains.map((v) => ({ value: v._id, label: v.name }))}
                    onChange={() => {
                      form.setFieldValue("parentCategoryId", undefined);
                    }}
                  />
                </Form.Item>
                <Form.Item name="name" label="Category name" tooltip={tip("Shown to shoppers in menus and filters, for example 'Smartphones' or 'Atta & Flours'.")} rules={[{ required: true }]}>
                  <Input placeholder="e.g. Smartphones or Laptops" />
                </Form.Item>
                <Form.Item name="imageUrl" label="Category image" required rules={[{ validator: (_, value?: string[]) => (Array.isArray(value) && value.length > 0 ? Promise.resolve() : Promise.reject(new Error("Please upload an image"))) }]} tooltip={tip("Required. Shown on the home page and the categories page: upload one image.")}>
                  <ImageUploadList maxCount={1} onUploadingChange={trackUpload} />
                </Form.Item>
                <Form.Item name="parentCategoryId" label="Parent category" tooltip={tip("Pick a parent to make this a subcategory. Leave empty for a top-level category.")}>
                  <Select
                    allowClear
                    placeholder="None (Root category)"
                    options={categories
                      .filter(
                        (v) =>
                          (!selectedDomainId || v.domainId === selectedDomainId) &&
                          (!editingCategory || v._id !== editingCategory._id)
                      )
                      .map((v) => ({ value: v._id, label: v.name }))}
                  />
                </Form.Item>
              </>
            )}
            {modal === "brand" && (
              <>
                <Form.Item name="domainId" label="Domain" tooltip={tip("The store this brand belongs to. It can't be changed after the brand is created.")} rules={[{ required: true }]}>
                  <Select placeholder="Select domain" disabled={Boolean(editingBrand)} options={domains.map((v) => ({ value: v._id, label: v.name }))} />
                </Form.Item>
                <Form.Item name="name" label="Brand name" tooltip={tip("The brand name shown on products and brand pages, for example 'Jagdish'.")} rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="e.g. Nike" />
                </Form.Item>
                <Form.Item name="description" label="Description" tooltip={tip("Optional short text about the brand.")}>
                  <Input.TextArea rows={3} placeholder="Brand description" />
                </Form.Item>
                <Form.Item name="logoUrl" label="Logo" required rules={[{ validator: (_, value?: string[]) => (Array.isArray(value) && value.length > 0 ? Promise.resolve() : Promise.reject(new Error("Please upload an image"))) }]} tooltip={tip("Required. Brand logo: upload one image; it's shown on brand pages and cards.")}>
                  <ImageUploadList maxCount={1} onUploadingChange={trackUpload} />
                </Form.Item>
                <Form.Item name="bannerUrl" label="Banner image (optional)" tooltip={tip("Optional wide picture shown at the top of the brand's page. If you skip it, the logo is shown instead.")}>
                  <ImageUploadList maxCount={1} onUploadingChange={trackUpload} />
                </Form.Item>
                <Form.Item name="isActive" label="Active" tooltip={tip("Inactive brands can't be picked for new products and are hidden from shoppers.")} valuePropName="checked" initialValue={true}>
                  <Switch />
                </Form.Item>
              </>
            )}
            {modal === "product" && (
              <>
                <Form.Item name="domainId" label="Domain" tooltip={tip("The store this product is sold in. Changing it clears the brand and re-checks attribute names.")} rules={[{ required: true }]}>
                  <Select
                    placeholder="Select domain"
                    onChange={handleDomainChange}
                    options={domains.map((v) => ({ value: v._id, label: v.name }))}
                  />
                </Form.Item>
                <Form.Item name="catalogId" label="Catalog" tooltip={tip("The catalog this product is listed under. Only catalogs of the chosen domain are shown.")} rules={[{ required: true }]}>
                  <Select
                    placeholder="Select catalog"
                    options={catalogs
                      .filter((c) => !selectedDomainId || c.domainId === selectedDomainId)
                      .map((v) => ({ value: v._id, label: v.name }))}
                  />
                </Form.Item>
                <Form.Item name="categoryId" label="Category" tooltip={tip("Where shoppers find the product. Some categories only allow certain attribute names.")} rules={[{ required: true }]}>
                  <Select
                    placeholder="Select category"
                    options={categories
                      .filter((c) => !selectedDomainId || c.domainId === selectedDomainId)
                      .map((v) => ({ value: v._id, label: v.name }))}
                  />
                </Form.Item>
                <Form.Item name="brandId" label="Brand" tooltip={tip("Manage brands from the Brands tab")}>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select brand (optional)"
                    notFoundContent="No brands for this domain yet"
                    options={brands
                      .filter((b) => b.isActive && (!selectedDomainId || b.domainId === selectedDomainId))
                      .map((v) => ({ value: v._id, label: v.name }))}
                  />
                </Form.Item>
                <Form.Item name="name" label="Product name" tooltip={tip("The product title shown to shoppers. A selected variant's name is added to it on the product page.")} rules={[{ required: true }]}>
                  <Input placeholder="e.g. Solitaire Diamond Ring" />
                </Form.Item>
                <Form.Item name="basePrice" label="Base price" tooltip={tip("The product's selling price. The first variant uses it; each variant can have its own price later.")} rules={[{ required: true }]}>
                  <InputNumber min={0} className={styles.fullWidth} placeholder="0" />
                </Form.Item>
                <Form.Item
                  name="mrp"
                  label="MRP (optional)"
                  tooltip={tip("List price shown struck-through next to the selling price so shoppers see a discount. Leave empty for no discount display.")}
                  dependencies={["basePrice"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator: (_, value) =>
                        !value || value > (getFieldValue("basePrice") || 0)
                          ? Promise.resolve()
                          : Promise.reject(new Error("MRP must be higher than the base price")),
                    }),
                  ]}
                >
                  <InputNumber min={0} className={styles.fullWidth} placeholder="e.g. 999" />
                </Form.Item>
                <Form.Item name="isActive" label="Active" valuePropName="checked" tooltip={tip("Inactive products are hidden from the store and can't be bought. You can switch it back on any time.")}>
                  <Switch />
                </Form.Item>
                <Form.Item name="weight" label="Net weight" tooltip={tip("Shown as 'Net Weight' on the product page. Variants can have their own weight.")}>
                  <Input placeholder="e.g. 250g" />
                </Form.Item>
                <Form.Item name="images" label="Product images (shared by all variants unless a variant has its own)" tooltip={tip("Photos shared by all variants. A variant can have its own images, which replace these for that variant.")}>
                  <ImageUploadList onUploadingChange={trackUpload} />
                </Form.Item>
                {!editingProduct && (
                  <div className={styles.variantRow}>
                    <Form.Item name="variantName" label="Variant name" tooltip={tip("Optional name for the first variant, for example '500g pack' or 'Large / Black'.")}>
                      <Input placeholder="e.g. Default" />
                    </Form.Item>
                    <Form.Item name="sku" label="SKU" tooltip={tip("Unique stock code for the first variant. A SKU can't be reused by another product.")} rules={[{ required: true, whitespace: true }]}>
                      <Input placeholder="Default variant SKU" />
                    </Form.Item>
                    <Form.Item name="stock" label="Stock" tooltip={tip("How many units of the first variant you have. At 0 it shows as out of stock.")} rules={[{ required: true }]}>
                      <InputNumber min={0} precision={0} className={styles.fullWidth} />
                    </Form.Item>
                  </div>
                )}
                <Collapse
                  ghost
                  defaultActiveKey={["attrs"]}
                  items={[
                    { key: "attrs", label: <InfoLabel info="Extra details shown as cards on the product page, such as flavour or material. Brand and Net weight have their own fields.">Product attributes (optional)</InfoLabel>, forceRender: true, children: <AttributeRows name="attributeRows" title="Attributes" /> },
                    { key: "nutrition", label: <InfoLabel info="The Nutrition Facts table on the product page. Leave empty to hide that tab. A variant can have its own table; otherwise this one is used.">Nutrition facts (optional)</InfoLabel>, forceRender: true, children: <NutritionFields /> },
                    { key: "sourcing", label: <InfoLabel info="Ingredients, allergen advice and origin text for the Ingredients & Sourcing tab. Leave all empty to hide that tab.">Ingredients & sourcing (optional)</InfoLabel>, forceRender: true, children: <SourcingFields /> },
                  ]}
                />
                {!editingProduct && (
                  <Typography.Paragraph type="secondary">
                    The weight and attributes above are also saved on this first variant. You can add more variants (sizes, weights, colours…) from the Variants button after saving.
                  </Typography.Paragraph>
                )}
              </>
            )}
            <Form.Item className={styles.formActions}>
              <Space>
                <Button onClick={close} disabled={saving}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={saving || uploadingCount > 0} disabled={uploadingCount > 0}>
                  {isEditing ? "Save changes" : "Save"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <VariantManager
          product={variantProduct}
          domain={domains.find((d) => d._id === variantProduct?.domainId)}
          onClose={() => setVariantProduct(null)}
          onChanged={() => void load()}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
