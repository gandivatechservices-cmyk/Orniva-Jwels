import {
  RING_SIZE_DETECTION,
  RING_SIZE_MODAL,
  RING_SIZE_PICKER_VALUES,
  RING_SIZE_ROUTE,
  RING_SIZE_SELECTOR,
  ringSizeChartCsv,
} from "./ringSize";
import {
  NECKLACE_LENGTH_DETECTION,
  NECKLACE_LENGTH_MODAL,
  NECKLACE_LENGTH_PICKER_VALUES,
  NECKLACE_LENGTH_ROUTE,
  NECKLACE_LENGTH_SELECTOR,
  necklaceLengthChartCsv,
} from "./necklaceLength";

/**
 * Registry of "size guides": product types that need a size/length choice, with a help modal
 * and a guide page. Add a new entry here to support another product type (bracelets, bangles...).
 */

export type SizeHelpContent = {
  readonly title: string;
  readonly subtitle: string;
  readonly options: ReadonlyArray<{
    readonly id: string;
    readonly icon: string;
    readonly title: string;
    readonly text: string;
    readonly cta: string;
    readonly href?: string;
    readonly action?: string;
  }>;
  readonly expert: { readonly title: string; readonly text: string; readonly cta: string; readonly href: string };
};

export type SizeGuide = {
  id: string;
  route: string;
  /** Does this product / category name belong to this guide? */
  matchProduct: RegExp;
  /** Variant attribute keys that already represent this guide's size. */
  explicitKey: RegExp;
  /** Generic keys (e.g. "size") treated as this guide's size on matching products. */
  genericKey: RegExp;
  selector: { readonly title: string; readonly placeholder: string; readonly helpLink: string; readonly outOfStock: string };
  modal: SizeHelpContent;
  /** Values for the frontend-only picker (used when variants carry no size attribute). */
  pickerValues: string[];
  /** CSV text for the modal's download action. */
  csv: () => string;
  csvFilename: string;
};

export const SIZE_GUIDES: SizeGuide[] = [
  {
    id: "ring",
    route: RING_SIZE_ROUTE,
    matchProduct: RING_SIZE_DETECTION.productName,
    explicitKey: RING_SIZE_DETECTION.explicitKey,
    genericKey: RING_SIZE_DETECTION.genericKey,
    selector: RING_SIZE_SELECTOR,
    modal: RING_SIZE_MODAL,
    pickerValues: RING_SIZE_PICKER_VALUES,
    csv: ringSizeChartCsv,
    csvFilename: "ring-size-chart.csv",
  },
  {
    id: "necklace",
    route: NECKLACE_LENGTH_ROUTE,
    matchProduct: NECKLACE_LENGTH_DETECTION.productName,
    explicitKey: NECKLACE_LENGTH_DETECTION.explicitKey,
    genericKey: NECKLACE_LENGTH_DETECTION.genericKey,
    selector: NECKLACE_LENGTH_SELECTOR,
    modal: NECKLACE_LENGTH_MODAL,
    pickerValues: NECKLACE_LENGTH_PICKER_VALUES,
    csv: necklaceLengthChartCsv,
    csvFilename: "necklace-length-chart.csv",
  },
];

/** The guide a product belongs to, from its name and category name (first match wins). */
export const detectSizeGuide = (...names: Array<string | undefined | null>): SizeGuide | null =>
  SIZE_GUIDES.find((g) => names.some((n) => !!n && g.matchProduct.test(n))) ?? null;

/** Is this attribute key the guide's size/length? */
export const isGuideKey = (guide: SizeGuide, key: string): boolean =>
  guide.explicitKey.test(key) || guide.genericKey.test(key);
