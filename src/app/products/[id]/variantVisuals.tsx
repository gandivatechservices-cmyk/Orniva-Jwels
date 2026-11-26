import type { CSSProperties, ReactNode } from "react";

/**
 * Maps a variant attribute (key + value) to a small visual so each option looks like what it
 * represents: metal colours, karat/purity tones, gemstone colours and stone-shape icons.
 * Everything falls back to a plain rounded text chip.
 */
export type OptionVisual =
  | { kind: "swatch"; background: string; text?: string; dark?: boolean }
  | { kind: "shape"; icon: ReactNode }
  | { kind: "text" };

const GOLD_BY_KARAT: Record<number, string> = {
  24: "linear-gradient(135deg, #F6D56B 0%, #D9A425 55%, #F0C84E 100%)",
  22: "linear-gradient(135deg, #F2D277 0%, #D4A432 55%, #EDC95E 100%)",
  18: "linear-gradient(135deg, #EDD085 0%, #CFA43F 55%, #E6C873 100%)",
  14: "linear-gradient(135deg, #E9D294 0%, #C9A74F 55%, #E2CB88 100%)",
  10: "linear-gradient(135deg, #E4D2A1 0%, #C4A862 55%, #DDCB9B 100%)",
  9: "linear-gradient(135deg, #E0D2AB 0%, #BFA870 55%, #D9CBA3 100%)",
};

const SILVER = "linear-gradient(135deg, #F4F4F2 0%, #BDBDBA 55%, #E6E6E3 100%)";
const YELLOW_GOLD = GOLD_BY_KARAT[22];
const WHITE_GOLD = "linear-gradient(135deg, #F7F7F5 0%, #C9CBCD 55%, #EDEEEF 100%)";
const ROSE_GOLD = "linear-gradient(135deg, #F6D3C5 0%, #D9987F 55%, #F0C3B0 100%)";
const PLATINUM = "linear-gradient(135deg, #EEF0F2 0%, #AEB4BA 55%, #E1E4E7 100%)";
const COPPER = "linear-gradient(135deg, #E9B08A 0%, #B8693F 55%, #DD9B72 100%)";
const BLACK_METAL = "linear-gradient(135deg, #5A5754 0%, #1E1C1A 55%, #45423F 100%)";

const GEM_COLORS: Record<string, string> = {
  ruby: "#B3122F",
  emerald: "#1F8A5B",
  sapphire: "#1E3F9C",
  "blue sapphire": "#1E3F9C",
  diamond: "#EAF2F6",
  white: "#F4F4F2",
  pearl: "#F3EBDD",
  amethyst: "#8A5CC2",
  topaz: "#E9A93B",
  citrine: "#E8B63A",
  garnet: "#8B1A24",
  turquoise: "#3BB7B0",
  aquamarine: "#7FD1D6",
  opal: "#DCE8EE",
  onyx: "#1E1C1A",
  coral: "#F0735E",
  peridot: "#9CC63C",
  tanzanite: "#4B4FB8",
  morganite: "#F0B9B0",
};

const isGoldNumber = (n: number) => [916, 750, 585, 417, 375].includes(n);

const metalVisual = (key: string, raw: string): OptionVisual | null => {
  const value = raw.toLowerCase().trim();
  if (!value) return null;

  const karat = value.match(/^(\d{1,2})\s*k(t|arat)?$/);
  if (karat) {
    const k = Number(karat[1]);
    return { kind: "swatch", background: GOLD_BY_KARAT[k] || YELLOW_GOLD, text: `${k}K` };
  }
  if (/rose/.test(value)) return { kind: "swatch", background: ROSE_GOLD };
  if (/white\s*gold/.test(value)) return { kind: "swatch", background: WHITE_GOLD };
  if (/yellow|gold/.test(value)) return { kind: "swatch", background: YELLOW_GOLD };
  if (/platinum|palladium/.test(value)) return { kind: "swatch", background: PLATINUM };
  if (/silver|sterling/.test(value)) return { kind: "swatch", background: SILVER };
  if (/copper|brass|bronze/.test(value)) return { kind: "swatch", background: COPPER };
  if (/black|titanium|steel|oxidi[sz]ed/.test(value)) return { kind: "swatch", background: /steel/.test(value) ? SILVER : BLACK_METAL, dark: !/steel/.test(value) };

  const num = Number(value);
  if (/purity|fineness|hallmark/i.test(key) && Number.isFinite(num) && num >= 100 && num <= 1000) {
    return { kind: "swatch", background: isGoldNumber(num) ? YELLOW_GOLD : SILVER, text: value };
  }
  return null;
};

const stroke = { fill: "currentColor", fillOpacity: 0.12, stroke: "currentColor", strokeWidth: 1.5, strokeLinejoin: "round" as const };
const shapeSvg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    {children}
  </svg>
);

const SHAPES: Record<string, ReactNode> = {
  round: shapeSvg(<circle cx="12" cy="12" r="8" {...stroke} />),
  oval: shapeSvg(<ellipse cx="12" cy="12" rx="6" ry="9" {...stroke} />),
  emerald: shapeSvg(<polygon points="8,3.5 16,3.5 19.5,7 19.5,17 16,20.5 8,20.5 4.5,17 4.5,7" {...stroke} />),
  asscher: shapeSvg(<polygon points="8,3.5 16,3.5 20.5,8 20.5,16 16,20.5 8,20.5 3.5,16 3.5,8" {...stroke} />),
  pear: shapeSvg(<path d="M12 3 C15 8 18 10.5 18 14.5 A6 6 0 0 1 6 14.5 C6 10.5 9 8 12 3 Z" {...stroke} />),
  princess: shapeSvg(<rect x="5" y="5" width="14" height="14" {...stroke} />),
  square: shapeSvg(<rect x="5" y="5" width="14" height="14" {...stroke} />),
  cushion: shapeSvg(<rect x="4.5" y="4.5" width="15" height="15" rx="4.5" {...stroke} />),
  radiant: shapeSvg(<polygon points="9,4 15,4 20,9 20,15 15,20 9,20 4,15 4,9" {...stroke} />),
  marquise: shapeSvg(<path d="M12 2.5 C17 8 17 16 12 21.5 C7 16 7 8 12 2.5 Z" {...stroke} />),
  heart: shapeSvg(<path d="M12 20 C4 14 3 9.5 6 7 C8.5 5 11 6.5 12 8.5 C13 6.5 15.5 5 18 7 C21 9.5 20 14 12 20 Z" {...stroke} />),
  baguette: shapeSvg(<rect x="8" y="3.5" width="8" height="17" {...stroke} />),
  trillion: shapeSvg(<path d="M12 4 L20 19 L4 19 Z" {...stroke} />),
  triangle: shapeSvg(<path d="M12 4 L20 19 L4 19 Z" {...stroke} />),
};

export function getOptionVisual(key: string, value: string): OptionVisual {
  const k = key.toLowerCase();
  const v = value.toLowerCase().trim();
  if (!v) return { kind: "text" };

  if (/shape|cut/.test(k)) {
    const name = Object.keys(SHAPES).find((s) => v.includes(s));
    if (name) return { kind: "shape", icon: SHAPES[name] };
  }

  if (/metal|material|purity|karat|fineness|gold|plating/.test(k)) {
    const m = metalVisual(k, v);
    if (m) return m;
  }

  if (/colou?r|stone|gem/.test(k) && !/type|shape|cut/.test(k)) {
    if (GEM_COLORS[v]) return { kind: "swatch", background: GEM_COLORS[v], dark: ["onyx", "ruby", "garnet", "sapphire", "blue sapphire", "emerald", "amethyst", "tanzanite"].includes(v) };
  }

  // A metal word hiding in any other attribute (e.g. "finish": "Rose Gold")
  const m = /gold|silver|platinum|steel|copper|brass|bronze/.test(v) ? metalVisual(k, v) : null;
  if (m) return m;

  return { kind: "text" };
}

export const swatchStyle = (visual: Extract<OptionVisual, { kind: "swatch" }>): CSSProperties => ({ background: visual.background });
