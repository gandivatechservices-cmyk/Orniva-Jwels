/**
 * Global ring-size content & data.
 * Everything shown by the ring size selector, the "Need Ring Size Help?" modal and the
 * /ring-size-guide page lives here, so copy, steps, FAQs and the size chart are managed in one place.
 */

export const RING_SIZE_ROUTE = "/ring-size-guide";

/** How we recognise a ring-size attribute on a product variant. */
export const RING_SIZE_DETECTION = {
  /** Attribute keys that are always a ring size (e.g. "ringSize", "ring_size"). */
  explicitKey: /ring[\s_-]?size/i,
  /** Generic attribute keys that are a ring size only when the product is a ring. */
  genericKey: /^size$/i,
  /** Product / category names that count as a ring listing. */
  productName: /\brings?\b/i,
} as const;

/**
 * Ring listings whose variants carry no ring-size attribute still show a size picker.
 * Display-only for now: the choice is not sent with the cart/order payload until the backend supports it.
 */
export const hasRingSizeAttribute = (attributeKeys: string[], isRingProduct: boolean): boolean =>
  attributeKeys.some((key) => isRingSizeKey(key, isRingProduct));

export const isRingSizeKey = (key: string, isRingProduct: boolean): boolean =>
  RING_SIZE_DETECTION.explicitKey.test(key) || (isRingProduct && RING_SIZE_DETECTION.genericKey.test(key));

export const isRingProductName = (...names: Array<string | undefined | null>): boolean =>
  names.some((n) => !!n && RING_SIZE_DETECTION.productName.test(n));

/** Labels used by the selector on the product page. */
export const RING_SIZE_SELECTOR = {
  title: "Select Ring Size",
  placeholder: "Select Ring Size",
  helpLink: "Find ring size",
  outOfStock: "Out of stock",
} as const;

/** "Need Ring Size Help?" modal. */
export const RING_SIZE_MODAL = {
  title: "Need Ring Size Help?",
  subtitle: "Don't worry, you have some options:",
  options: [
    {
      id: "home",
      icon: "ring",
      title: "Find your ring size at home",
      text: "Measure with a simple paper strip in under two minutes, then convert it to any country's scale.",
      cta: "Find now",
      href: RING_SIZE_ROUTE,
    },
    {
      id: "download",
      icon: "pdf",
      title: "Download our ring size chart",
      text: "Click to download our practical ring size chart and keep it handy.",
      cta: "Download",
      action: "download-chart",
    },
  ],
  expert: {
    title: "Ask an Expert",
    text: "Our jewellery experts are happy to help you choose the right size.",
    cta: "Chat now",
    href: "/contact",
  },
} as const;

/** /ring-size-guide page copy. */
export const RING_SIZE_PAGE = {
  seo: {
    title: "Find Your Ring Size at Home | Ring Size Guide",
    description:
      "Measure your ring size at home with a paper strip and convert it to US, UK, EU and Japan sizes with our ring size chart and converter.",
  },
  hero: {
    eyebrow: "RING SIZE GUIDE",
    title: "Find Your Ring Size At Home",
    subtitle:
      "Already know your size but your jeweller uses a different scale? Use the converter and chart below to find your ring size in any scale.",
    primaryCta: { label: "Size converter", href: "#size-converter" },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Ring Size Guide" },
    ],
  },
  stepsSection: {
    eyebrow: "USING A PAPER STRIP",
    title: "How To Find Your Ring Size At Home",
    intro:
      "A perfectly fitting ring is a joy to wear. All you need is a thin strip of paper (or string), a pen and a ruler.",
    steps: [
      {
        title: "Take a thin strip",
        text: "Cut a strip of paper or take a piece of thin string, about 15 cm long and 5 mm wide.",
      },
      {
        title: "Wrap it around your finger",
        text: "Wrap it snugly around the base of the finger you will wear the ring on. It should be snug, but able to slide over your knuckle.",
      },
      {
        title: "Mark the overlap",
        text: "Use a pen to mark the exact point where the end of the strip meets the rest of it.",
      },
      {
        title: "Measure with a ruler",
        text: "Lay the strip flat and measure the length to the mark in millimetres. That is your circumference.",
      },
    ],
    tips: [
      "Measure at the end of the day, when fingers are at their largest.",
      "Avoid measuring when your hands are cold.",
      "For wide bands, go up by a quarter to half a size.",
      "If you are between sizes, choose the larger one.",
    ],
  },
  converter: {
    eyebrow: "RING SIZE CONVERTER",
    title: "Find Out Ring Size Equivalents Globally",
    byCircumference: "Finger circumference (mm)",
    or: "OR",
    byCountry: "Pick a country and size",
    countryLabel: "Country",
    sizeLabel: "Ring size",
    cta: "Find now",
    resultPrefix: "Your ring size is",
    shopCta: { label: "Shop rings", href: "/products" },
    promo: "Discover our range of rings and take advantage of current promotions.",
    downloadCta: "Download size chart",
  },
  chart: {
    eyebrow: "SIZE CHART",
    title: "Ring Size Equivalents",
    note: "Sizes are approximate. Minor variations can occur between manufacturers.",
    tabs: [
      { id: "all", label: "All" },
      { id: "us", label: "US / CA" },
      { id: "uk", label: "UK / AU" },
      { id: "eu", label: "EU / ISO" },
      { id: "jp", label: "Japan" },
    ],
  },
  faqs: {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    title: "Ring Size FAQs",
    items: [
      {
        id: "accuracy",
        question: "Can I trust the accuracy of the sizes listed?",
        answer:
          "The chart is based on international standards. Minor variations can occur between manufacturers, so if you are between two sizes we recommend choosing the larger one.",
      },
      {
        id: "measure",
        question: "How do I accurately measure my ring size at home?",
        answer:
          "Wrap a strip of paper or string around the base of your finger, mark where the ends meet and measure the length with a ruler. Compare it with the chart. For the most accurate result, measure at the end of the day.",
      },
      {
        id: "local",
        question: "Can I order using my local size?",
        answer:
          "Yes. Use the converter above to translate your local size into the sizes we list, or contact us and we will help you.",
      },
      {
        id: "resize",
        question: "What is your ring re-sizing policy?",
        answer:
          "We offer one free resize within 30 days of purchase, up to one full size up or down. Some designs, such as eternity bands, may not be resizable; we will suggest alternatives in that case.",
      },
      {
        id: "help",
        question: "How can I get help finding my size?",
        answer: "Reach out through our contact page and one of our jewellery experts will guide you.",
      },
    ],
  },
  cta: {
    title: "Still not sure?",
    text: "Talk to one of our jewellery experts. We are happy to help you find the perfect fit.",
    primary: { label: "Contact an expert", href: "/contact" },
    secondary: { label: "Shop rings", href: "/products" },
  },
} as const;

/* ---------------------------------------------------------------------------
 * Size chart data
 * -------------------------------------------------------------------------*/

export type RingSizeRow = {
  us: string;
  uk: string;
  eu: number;
  jp: number;
  diameter: number;
  circumference: number;
};

/** UK letter for each half US size from 3 to 13. */
const UK_BY_US: Record<string, string> = {
  "3": "F", "3.5": "G", "4": "H", "4.5": "I", "5": "J½", "5.5": "K½", "6": "L½", "6.5": "M½",
  "7": "N½", "7.5": "O½", "8": "P½", "8.5": "Q½", "9": "R½", "9.5": "S½", "10": "T½", "10.5": "U½",
  "11": "V½", "11.5": "W½", "12": "X½", "12.5": "Y½", "13": "Z½",
};

/** Inside diameter in mm for a US size (standard formula). */
const diameterFor = (us: number) => 11.63 + 0.8128 * us;

export const RING_SIZE_CHART: RingSizeRow[] = Object.keys(UK_BY_US).map((key) => {
  const diameter = diameterFor(Number(key));
  const circumference = Math.PI * diameter;
  const eu = Math.round(circumference);
  return {
    us: key,
    uk: UK_BY_US[key],
    eu,
    jp: eu - 40,
    diameter: Number(diameter.toFixed(2)),
    circumference: Number(circumference.toFixed(1)),
  };
});

export type RingSizeCountry = { id: "us" | "uk" | "eu" | "jp"; label: string; note: string };

export const RING_SIZE_COUNTRIES: RingSizeCountry[] = [
  { id: "us", label: "USA / Canada", note: "US" },
  { id: "uk", label: "UK / Australia / Ireland / New Zealand", note: "UK" },
  { id: "eu", label: "Europe (ISO)", note: "EU" },
  { id: "jp", label: "Japan / India / China", note: "JP" },
];

export const sizeLabelFor = (row: RingSizeRow, country: RingSizeCountry["id"]): string =>
  country === "us" ? row.us : country === "uk" ? row.uk : country === "eu" ? String(row.eu) : String(row.jp);

/** The chart row whose circumference is closest to the measured value. */
export const findRowByCircumference = (mm: number): RingSizeRow | null => {
  if (!Number.isFinite(mm) || mm <= 0) return null;
  return RING_SIZE_CHART.reduce((best, row) =>
    Math.abs(row.circumference - mm) < Math.abs(best.circumference - mm) ? row : best
  );
};

/** Normalise a product's size label ("7", "US 7", "N 1/2") for matching against the chart. */
export const findRowByLabel = (label: string): RingSizeRow | null => {
  const clean = label.trim().toLowerCase().replace(/^us\s*/, "");
  return RING_SIZE_CHART.find((r) => r.us === clean || r.uk.toLowerCase() === clean) ?? null;
};

/** Sizes offered by the frontend-only picker (US sizes from the chart). */
export const RING_SIZE_PICKER_VALUES: string[] = RING_SIZE_CHART.map((r) => r.us);

/** CSV used by the "Download size chart" action. */
export const ringSizeChartCsv = (): string => {
  const head = "US,UK,EU (ISO),Japan,Inside diameter (mm),Circumference (mm)";
  const rows = RING_SIZE_CHART.map((r) => [r.us, r.uk, r.eu, r.jp, r.diameter, r.circumference].join(","));
  return [head, ...rows].join("\n");
};
