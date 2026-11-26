/**
 * Global necklace-length content & data.
 * Used by the length selector, the "Need Length Help?" modal and the /necklace-length-guide page.
 */

export const NECKLACE_LENGTH_ROUTE = "/necklace-length-guide";

export const NECKLACE_LENGTH_DETECTION = {
  /** Attribute keys that are always a necklace length. */
  explicitKey: /(necklace|chain)?[\s_-]?length/i,
  /** Generic attribute keys that are a length when the product is a necklace. */
  genericKey: /^size$/i,
  /** Product / category names that count as a necklace listing. */
  productName: /necklace|chain|choker|pendant/i,
} as const;

export const NECKLACE_LENGTH_SELECTOR = {
  title: "Select Length",
  placeholder: "Select Length",
  helpLink: "Find necklace length",
  outOfStock: "Out of stock",
} as const;

export const NECKLACE_LENGTH_MODAL = {
  title: "Need Length Help?",
  subtitle: "Not sure which length suits you? Here are some options:",
  options: [
    {
      id: "guide",
      icon: "necklace",
      title: "Find your perfect length",
      text: "See where each necklace length sits on the neck and chest, and pick the style you love.",
      cta: "View guide",
      href: NECKLACE_LENGTH_ROUTE,
    },
    {
      id: "download",
      icon: "pdf",
      title: "Download our length chart",
      text: "Click to download our practical necklace length chart and keep it handy.",
      cta: "Download",
      action: "download-chart",
    },
  ],
  expert: {
    title: "Ask an Expert",
    text: "Our jewellery experts are happy to help you choose the right length.",
    cta: "Chat now",
    href: "/contact",
  },
} as const;

export type NecklaceStyle = {
  id: string;
  name: string;
  inches: [number, number];
  sits: string;
  bestFor: string;
};

/** Standard necklace styles, shortest to longest. */
export const NECKLACE_STYLES: NecklaceStyle[] = [
  { id: "collar", name: "Collar", inches: [12, 13], sits: "Close around the base of the neck", bestFor: "Open necklines and statement pieces" },
  { id: "choker", name: "Choker", inches: [14, 16], sits: "Sits at the base of the neck", bestFor: "Strapless, off-shoulder and boat necklines" },
  { id: "princess", name: "Princess", inches: [17, 19], sits: "Rests on the collarbone", bestFor: "Pendants, everyday wear and most necklines" },
  { id: "matinee", name: "Matinee", inches: [20, 24], sits: "Falls just below the collarbone", bestFor: "Crew necks, business and evening wear" },
  { id: "opera", name: "Opera", inches: [28, 36], sits: "Reaches the middle of the chest", bestFor: "High necklines; can be doubled for a layered look" },
  { id: "rope", name: "Rope", inches: [37, 48], sits: "Falls below the bust line", bestFor: "Wrapping, knotting and layering" },
];

export const inchesToCm = (inches: number) => Math.round(inches * 2.54 * 10) / 10;

export const formatStyleRange = (s: NecklaceStyle) => `${s.inches[0]}–${s.inches[1]}"`;
export const formatStyleRangeCm = (s: NecklaceStyle) => `${inchesToCm(s.inches[0])}–${inchesToCm(s.inches[1])} cm`;

/** Lengths offered by the frontend-only picker (inches). */
export const NECKLACE_LENGTH_PICKER_VALUES: string[] = ['14"', '16"', '18"', '20"', '22"', '24"', '28"', '30"', '36"'];

/** CSV used by the "Download length chart" action. */
export const necklaceLengthChartCsv = (): string => {
  const head = "Style,Length (in),Length (cm),Where it sits,Best for";
  const rows = NECKLACE_STYLES.map((s) =>
    [s.name, `${s.inches[0]}-${s.inches[1]}`, `${inchesToCm(s.inches[0])}-${inchesToCm(s.inches[1])}`, `"${s.sits}"`, `"${s.bestFor}"`].join(",")
  );
  return [head, ...rows].join("\n");
};

export const NECKLACE_LENGTH_PAGE = {
  seo: {
    title: "Necklace Length Guide | Find Your Perfect Necklace Length",
    description:
      "Learn how to choose the right necklace length. See where choker, princess, matinee and opera lengths sit and how to measure at home.",
  },
  hero: {
    eyebrow: "NECKLACE LENGTH GUIDE",
    title: "Find Your Perfect Necklace Length",
    subtitle:
      "From chokers to opera lengths, the right length frames your face and complements your neckline. Use the guide below to choose with confidence.",
    primaryCta: { label: "Style finder", href: "#length-finder" },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Necklace Length Guide" },
    ],
  },
  stepsSection: {
    eyebrow: "MEASURE AT HOME",
    title: "How To Find Your Necklace Length",
    intro: "All you need is a piece of string or a soft measuring tape and a mirror.",
    steps: [
      { title: "Take a piece of string", text: "Use a piece of thin string or a soft tape measure, longer than the necklace you have in mind." },
      { title: "Drape it where you want it to sit", text: "Hold the string around your neck so it rests exactly where you would like the necklace to fall." },
      { title: "Mark the length", text: "Mark the point where the ends meet at the clasp, keeping the string relaxed and not pulled tight." },
      { title: "Measure with a ruler", text: "Lay the string flat and measure it. Compare your result with the chart below." },
    ],
    tips: [
      "Add about 2 cm (1 inch) for pendants so they hang comfortably.",
      "Neck size and height change how a length sits, so try on a necklace you already own.",
      "Layering? Space necklaces 2–4 cm (1–2 inches) apart.",
      "Not sure? 18 inches (45 cm) is the most versatile length.",
    ],
  },
  finder: {
    eyebrow: "STYLE FINDER",
    title: "Where Should Your Necklace Sit?",
    label: "Choose a style",
    cta: "Find now",
    resultPrefix: "Recommended length",
    shopCta: { label: "Shop necklaces", href: "/products" },
    promo: "Discover our range of necklaces, chains and pendants.",
    downloadCta: "Download length chart",
  },
  chart: {
    eyebrow: "LENGTH CHART",
    title: "Necklace Lengths at a Glance",
    note: "Lengths are approximate and measured end to end including the clasp.",
  },
  faqs: {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    title: "Necklace Length FAQs",
    items: [
      { id: "versatile", question: "What is the most popular necklace length?", answer: "18 inches (45 cm), the princess length, sits on the collarbone and suits most necklines and pendants." },
      { id: "pendant", question: "What length is best for a pendant?", answer: "16 to 20 inches works best for most pendants. Shorter lengths show off small pendants, while longer ones suit larger statement pieces." },
      { id: "layer", question: "How do I layer necklaces?", answer: "Choose lengths 2–4 cm (1–2 inches) apart, for example 16, 18 and 20 inches, and vary the thickness of the chains." },
      { id: "extender", question: "Can the length be adjusted?", answer: "Many of our chains come with a small extender. Contact us if you need a custom length and we will help." },
      { id: "help", question: "How can I get help choosing?", answer: "Reach out through our contact page and one of our jewellery experts will guide you." },
    ],
  },
  cta: {
    title: "Still not sure?",
    text: "Talk to one of our jewellery experts. We are happy to help you find the perfect length.",
    primary: { label: "Contact an expert", href: "/contact" },
    secondary: { label: "Shop necklaces", href: "/products" },
  },
} as const;
