"use client";

import { Button, Checkbox, Form, Input, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { Nutrition, Sourcing } from "utility/services";
import { InfoLabel, tip } from "./tip";
import styles from "./catalog.module.css";

/** Form field names shared by the product form and the variant form. */
export type ContentFormValues = {
  nutritionBasis?: string;
  nutritionRows?: Array<{ name?: string; amount?: string; indented?: boolean }>;
  ingredients?: string;
  allergenAdvice?: string;
  origin?: string;
};

const STANDARD_ROWS = [
  { name: "Energy", amount: "", indented: false },
  { name: "Fat", amount: "", indented: false },
  { name: "of which saturates", amount: "", indented: true },
  { name: "Carbohydrate", amount: "", indented: false },
  { name: "of which sugars", amount: "", indented: true },
  { name: "Fibre", amount: "", indented: false },
  { name: "Protein", amount: "", indented: false },
  { name: "Salt", amount: "", indented: false },
];

export const contentToForm = (nutrition?: Nutrition | null, sourcing?: Sourcing | null): ContentFormValues => ({
  nutritionBasis: nutrition?.basis || "",
  nutritionRows: (nutrition?.rows || []).map((row) => ({ name: row.name, amount: row.amount, indented: Boolean(row.indented) })),
  ingredients: sourcing?.ingredients || "",
  allergenAdvice: sourcing?.allergenAdvice || "",
  origin: sourcing?.origin || "",
});

/** Rows without both a name and an amount are dropped; no rows at all means "no nutrition" (null). */
export const formToNutrition = (values: ContentFormValues): Nutrition | null => {
  const rows = (values.nutritionRows || [])
    .filter((row) => row.name?.trim() && row.amount?.trim())
    .map((row) => ({ name: row.name!.trim(), amount: row.amount!.trim(), ...(row.indented ? { indented: true } : {}) }));
  return rows.length ? { basis: values.nutritionBasis?.trim() || undefined, rows } : null;
};

export const formToSourcing = (values: ContentFormValues): Sourcing | null => {
  const sourcing: Sourcing = {
    ingredients: values.ingredients?.trim() || undefined,
    allergenAdvice: values.allergenAdvice?.trim() || undefined,
    origin: values.origin?.trim() || undefined,
  };
  return sourcing.ingredients || sourcing.allergenAdvice || sourcing.origin ? sourcing : null;
};

export function NutritionFields({ inheritedRows }: { inheritedRows?: number }) {
  return (
    <div className={styles.attributeRows}>
      <Typography.Text type="secondary">
        {inheritedRows
          ? `Leave empty to use the product's nutrition facts (${inheritedRows} rows). Add rows here only if this variant differs.`
          : "Shown on the product page under Nutrition Facts. Leave empty to hide the tab."}
      </Typography.Text>
      <Form.Item name="nutritionBasis" label="Values are" tooltip={tip("What the amounts refer to, for example 'per 100g' or 'per serving'. Shown in the table title.")} style={{ marginBottom: 0 }}>
        <Input placeholder="per 100g" />
      </Form.Item>
      <Form.List name="nutritionRows">
        {(fields, { add, remove }) => (
          <>
            {fields.length > 0 && (
              <div className={`${styles.nutritionRow} ${styles.attributeHeader}`}>
                <InfoLabel info="The nutrient name shown in the first column, e.g. Energy, Fat, Protein.">Nutrient</InfoLabel>
                <InfoLabel info="The amount with its unit, e.g. 51.0 g or 2,450 kJ / 590 kcal.">Amount</InfoLabel>
                <InfoLabel info="Tick if this row is a part of the row above it, e.g. 'of which saturates' under Fat. It is shown indented and is already counted in the row above.">Indent</InfoLabel>
                <span />
              </div>
            )}
            {fields.map(({ key, name, ...rest }) => (
              <div className={styles.nutritionRow} key={key}>
                <Form.Item {...rest} name={[name, "name"]} style={{ marginBottom: 0 }}>
                  <Input placeholder="Nutrient, e.g. Energy" />
                </Form.Item>
                <Form.Item {...rest} name={[name, "amount"]} style={{ marginBottom: 0 }}>
                  <Input placeholder="e.g. 590 kcal" />
                </Form.Item>
                <Form.Item {...rest} name={[name, "indented"]} valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>of which</Checkbox>
                </Form.Item>
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} aria-label="Remove row" />
              </div>
            ))}
            <div className={styles.nutritionActions}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ name: "", amount: "", indented: false })}>
                Add row
              </Button>
              {fields.length === 0 && <Button onClick={() => STANDARD_ROWS.forEach((row) => add(row))}>Add standard rows</Button>}
            </div>
          </>
        )}
      </Form.List>
    </div>
  );
}

export function SourcingFields({ inherited }: { inherited?: Sourcing | null }) {
  return (
    <div className={styles.attributeRows}>
      <Typography.Text type="secondary">
        {inherited ? "Each field left empty uses the product's text." : "Shown on the product page under Ingredients & Sourcing. Leave all empty to hide the tab."}
      </Typography.Text>
      <Form.Item name="ingredients" label="Ingredients" tooltip={tip("Ingredient list shown on the Ingredients & Sourcing tab.")} style={{ marginBottom: 0 }}>
        <Input.TextArea rows={2} placeholder={inherited?.ingredients || "e.g. 100% whole almonds, sea salt"} />
      </Form.Item>
      <Form.Item name="allergenAdvice" label="Allergen advice" tooltip={tip("Allergy information, for example 'May contain nuts and gluten'.")} style={{ marginBottom: 0 }}>
        <Input.TextArea rows={2} placeholder={inherited?.allergenAdvice || "e.g. Packed in a facility that handles tree nuts and gluten"} />
      </Form.Item>
      <Form.Item name="origin" label="Origin / traceability" tooltip={tip("Where it comes from or how it was sourced. Shown with a leaf icon.")} style={{ marginBottom: 0 }}>
        <Input.TextArea rows={2} placeholder={inherited?.origin || "e.g. Sourced from certified growers"} />
      </Form.Item>
    </div>
  );
}
