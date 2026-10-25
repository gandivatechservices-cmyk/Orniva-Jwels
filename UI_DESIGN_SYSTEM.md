# UI Design System — Universal Guidelines

Single source of truth for UI across all projects. Copy this file into the root of every project (website, dashboard, admin panel, SaaS, React, Next.js, or any other web app). Everyone — developers, designers, and AI assistants — follows it.

Project-specific values (brand colors, fonts, logo) are set in the project's token file. The rules in this document do not change per project.

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [System Flow — How to Implement in Every Project](#2-system-flow--how-to-implement-in-every-project)
3. [Component Creation & Reuse Flow](#3-component-creation--reuse-flow)
4. [Design Tokens](#4-design-tokens)
5. [Typography & Text Hierarchy](#5-typography--text-hierarchy)
6. [Spacing, Margin & Padding](#6-spacing-margin--padding)
7. [Layout Management](#7-layout-management)
8. [Responsive Design & Breakpoints](#8-responsive-design--breakpoints)
9. [Color System & Themes](#9-color-system--themes)
10. [Border Radius, Shadows & Elevation](#10-border-radius-shadows--elevation)
11. [Icons](#11-icons)
12. [Component States](#12-component-states)
13. [Component Specifications](#13-component-specifications)
14. [Accessibility](#14-accessibility)
15. [Naming Conventions](#15-naming-conventions)
16. [Folder & Component Structure](#16-folder--component-structure)
17. [React & Next.js Implementation Guidelines](#17-react--nextjs-implementation-guidelines)
18. [Definition of Done — UI Checklist](#18-definition-of-done--ui-checklist)
19. [Maintaining This Document](#19-maintaining-this-document)

---

## 1. Core Philosophy

Build the system incrementally, not all at once.

| Principle | Meaning |
| :--- | :--- |
| **Need-driven** | Create a component only when a real requirement exists. Never build a component library "just in case". |
| **Reuse first** | Before writing anything new, check whether an existing component, section, or token already solves it. |
| **No duplicates** | Two components with the same purpose must never exist. Extend the existing one instead. |
| **Right altitude** | Reusable when there is a real reuse case. Page-specific when there is not. Don't abstract prematurely. |
| **Tokens over values** | No hard-coded colors, sizes, spacing, radius, or shadows in components. Everything comes from tokens. |
| **Consistency over creativity** | Same button, same input, same card everywhere. Variation is done via variants, not new components. |
| **Accessible by default** | Every component is keyboard-usable, screen-reader friendly, and passes contrast requirements without extra work from the page author. |
| **States are part of the component** | Hover, focus, active, disabled, loading, error, and empty states are built into the component, not added per page. |

---

## 2. System Flow — How to Implement in Every Project

Follow this order in every new project. Do not skip ahead.

```text
Design Tokens → Base Components → Reusable Sections → Pages
```

### Step 1 — Design Tokens (Day 1, before any UI)
1. Copy the token structure from [Section 4](#4-design-tokens).
2. Set project brand values: primary/secondary colors, font family, logo.
3. Keep all other defaults (spacing scale, radius, shadows, breakpoints, type scale) unless the design explicitly requires otherwise.
4. Wire the tokens into the styling solution (CSS variables + Tailwind theme, CSS Modules, styled-components, etc.).
5. Set up light/dark theme if the project needs it (semantic tokens make this a token swap, not a rewrite).
6. **Output**: `styles/tokens.css` (or equivalent) and theme config. No components yet.

### Step 2 — Base Components (only as pages need them)
- Build base components when the first page that needs them is being built, not before.
- Typical first wave (most projects need these on the first page): `Button`, `Input`, `Card`, `Container`. Everything else waits until required.
- Each base component must:
  - Use tokens only.
  - Support its required variants and sizes ([Section 13](#13-component-specifications)).
  - Implement all applicable states ([Section 12](#12-component-states)).
  - Meet accessibility requirements ([Section 14](#14-accessibility)).

### Step 3 — Reusable Sections (only when used ≥ 2 places)
- A section (e.g. `PageHeader`, `StatsRow`, `HeroSection`, `DataTableToolbar`) becomes reusable only when it is needed in two or more places. Until then it lives inside the page that uses it.

### Step 4 — Pages
- Pages compose sections and base components. Pages contain:
  - Layout and composition.
  - Data fetching / wiring.
  - Page-specific UI that has no reuse case.
- Pages do not contain: hard-coded token values, re-implemented buttons/inputs, or copies of existing components.

### Ongoing — Every new feature
- Apply the [Component Creation & Reuse Flow](#3-component-creation--reuse-flow) for every requirement.

---

## 3. Component Creation & Reuse Flow

Follow this for every UI requirement:

```text
Requirement
  → Check Existing Components
  → Reuse if Available
  → Create New Component if Needed
  → Make It Reusable When Appropriate
  → Use It Across the Project
```

### 3.1 Step-by-step
1. **Requirement** — Understand exactly what the UI needs to do. Identify the element type (button, input, card, section, layout, page-specific block).
2. **Check existing components** — Search before building. Look in:
   - `components/ui/` (base components)
   - `components/sections/` (reusable sections)
   - `components/layout/` (layout components)
   - The token file (maybe only a new token/variant is needed)
   - *Search by purpose, not just by name (a "Chip" may already exist as Badge; a "Dialog" may already exist as Modal).*
3. **Reuse if available** — If an existing component solves the requirement:
   - Use it as-is, or
   - Add a variant / prop / size to the existing component. Extending is preferred over creating.
   - Never copy-paste a component to change one thing. Never create `Button2`, `NewCard`, `CustomInput`.
4. **Create a new component if needed** — Only when nothing existing solves it, even with a small extension.
   - Start at the lowest altitude that satisfies the requirement: page-specific first if there is only one usage.
   - Build it with tokens, states, and accessibility from the start.
5. **Make it reusable when appropriate** — Promote to `components/ui/` or `components/sections/` when:
   - It is needed in 2 or more places, or
   - It is a clear primitive (button, input, modal, table) that will obviously be reused, or
   - It represents a product-wide pattern (e.g. every list page has the same toolbar).
   - *Do not promote when:*
     - It is used once and there is no concrete second use case.
     - It is tightly coupled to one page's data shape.
     - "It might be useful later." (Later, promote it when the second usage actually appears.)
6. **Use it across the project** — Once reusable, every future usage must go through this component. Replace older ad-hoc implementations when touching that code.

### 3.2 Decision checklist
| Question | If yes |
| :--- | :--- |
| Does a component with this purpose already exist? | Reuse it. |
| Can an existing component be extended with a variant/prop? | Extend it. |
| Is this used (or definitely will be used) in ≥ 2 places? | Create as reusable in `components/ui/` or `components/sections/`. |
| Is this used in exactly 1 place with no clear reuse? | Keep it page-specific (inside the page/feature folder). |
| Does it depend on one page's specific data? | Keep it page-specific; if reuse appears, split into a generic UI component + page-specific wrapper. |
| Would creating it duplicate an existing component's purpose? | Do not create it. |

### 3.3 Examples
| Requirement | Correct action |
| :--- | :--- |
| Need a submit button on the login page | Check `Button`. Doesn't exist → create reusable `Button` (clear primitive). |
| Need a red "delete" button | `Button` exists → add `variant="destructive"`. |
| Need a stats card on the dashboard only | Check `Card`. Exists → compose `Card` inside the dashboard page. No new component. |
| The same stats card is now needed on the reports page | Promote to `components/sections/StatCard`. |
| Need a search box with an icon | Check `Input`. Exists → add `leftIcon` prop. |
| A one-off promotional banner on the homepage | Page-specific component inside `features/home/` or the page file. |
| Need a confirm dialog | Check `Modal`. Exists → build `ConfirmDialog` on top of `Modal` (composition, not duplication). |

### 3.4 Component altitude levels
- **Level 0 — Tokens** (colors, spacing, type, radius, shadow, breakpoints)
- **Level 1 — Base / UI** (`Button`, `Input`, `Card`, `Modal`, `Table`, `Badge` …) → `components/ui/`
- **Level 2 — Composite / Section** (`SearchBar`, `StatCard`, `PageHeader`, `DataTable` …) → `components/sections/`
- **Level 3 — Layout** (`Container`, `Sidebar`, `Header`, `AppShell` …) → `components/layout/`
- **Level 4 — Feature / Page** (page-specific blocks, wiring, data) → `features/` or `app/`

*Lower levels never import from higher levels. `components/ui/` never imports from `features/`.*

---

## 4. Design Tokens

Tokens are the only place raw values live. Components and pages reference tokens; they never contain raw values.

### 4.1 Token structure
Two layers:
1. **Primitive tokens** — raw palette and scales (`--blue-500`, `--space-4`). Rarely used directly.
2. **Semantic tokens** — meaning-based (`--color-primary`, `--color-text-muted`, `--color-border`). Components use only these. Themes (light/dark) swap semantic tokens.

### 4.2 Reference token file (CSS variables)
```css
:root {
  /* ---------- Primitive: Spacing (4px base) ---------- */
  --space-0: 0;
  --space-0-5: 0.125rem; /* 2px */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */

  /* ---------- Primitive: Typography ---------- */
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */

  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* ---------- Primitive: Radius ---------- */
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;

  /* ---------- Primitive: Shadows ---------- */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* ---------- Primitive: Motion ---------- */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

  /* ---------- Primitive: Z-index ---------- */
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-overlay: 1200;
  --z-modal: 1300;
  --z-popover: 1400;
  --z-toast: 1500;

  /* ---------- Primitive: Palette (PROJECT SETS THESE) ---------- */
  --brand-50: #eff6ff;
  --brand-100: #dbeafe;
  --brand-500: #3b82f6;
  --brand-600: #2563eb;
  --brand-700: #1d4ed8;

  --neutral-0: #ffffff;
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;
  --neutral-950: #030712;

  --success-500: #16a34a;
  --warning-500: #d97706;
  --danger-500: #dc2626;
  --info-500: #0284c7;

  /* ---------- Semantic: Light theme (components use ONLY these) ---------- */
  --color-bg: var(--neutral-0);
  --color-bg-subtle: var(--neutral-50);
  --color-bg-muted: var(--neutral-100);
  --color-surface: var(--neutral-0);
  --color-surface-raised: var(--neutral-0);
  --color-text: var(--neutral-900);
  --color-text-secondary: var(--neutral-600);
  --color-text-muted: var(--neutral-500);
  --color-text-disabled: var(--neutral-400);
  --color-text-inverse: var(--neutral-0);
  --color-border: var(--neutral-200);
  --color-border-strong: var(--neutral-300);
  --color-primary: var(--brand-600);
  --color-primary-hover: var(--brand-700);
  --color-primary-subtle: var(--brand-50);
  --color-primary-fg: var(--neutral-0);
  --color-success: var(--success-500);
  --color-warning: var(--warning-500);
  --color-danger: var(--danger-500);
  --color-info: var(--info-500);
  --color-focus-ring: var(--brand-500);
}

/* ---------- Semantic: Dark theme ---------- */
[data-theme="dark"] {
  --color-bg: var(--neutral-950);
  --color-bg-subtle: var(--neutral-900);
  --color-bg-muted: var(--neutral-800);
  --color-surface: var(--neutral-900);
  --color-surface-raised: var(--neutral-800);
  --color-text: var(--neutral-50);
  --color-text-secondary: var(--neutral-300);
  --color-text-muted: var(--neutral-400);
  --color-text-disabled: var(--neutral-600);
  --color-text-inverse: var(--neutral-900);
  --color-border: var(--neutral-800);
  --color-border-strong: var(--neutral-700);
  --color-primary: var(--brand-500);
  --color-primary-hover: var(--brand-600);
  --color-primary-subtle: rgb(59 130 246 / 0.15);
}
```

### 4.3 Token rules
- Components reference semantic tokens (`--color-primary`), not primitives (`--brand-600`) and never hex values.
- Adding a new token requires a real need in ≥ 2 places. Otherwise use the nearest existing token.
- Tailwind projects: map these variables in `tailwind.config` / `@theme` so utility classes (`bg-primary`, `text-muted`, `p-4`, `rounded-md`) resolve to the same tokens. Never use arbitrary values (`p-[13px]`, `text-[#333]`) except for truly one-off cases with a comment.

---

## 5. Typography & Text Hierarchy

### 5.1 Type scale (default)
| Role | Size token | Weight | Line height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `--text-5xl` / `--text-4xl` | bold | tight | Marketing hero only |
| **H1** | `--text-3xl` (mobile: `--text-2xl`) | bold | tight | Page title — one per page |
| **H2** | `--text-2xl` (mobile: `--text-xl`) | semibold | tight | Section title |
| **H3** | `--text-xl` | semibold | snug | Sub-section / card title |
| **H4** | `--text-lg` | semibold | snug | Group label |
| **Body** | `--text-base` | regular | normal | Default text |
| **Body small**| `--text-sm` | regular | normal | Secondary text, table cells, form help |
| **Caption** | `--text-xs` | medium | normal | Labels, badges, metadata |
| **Overline** | `--text-xs` | semibold, uppercase, letter-spacing 0.05em | normal | Eyebrow labels |

### 5.2 Rules
- Base body font size is 16px. Never below 12px for any visible text.
- Heading levels reflect document structure, not visual size. Use CSS/variant to change appearance, not a different heading tag.
- One `h1` per page. Don't skip heading levels (`h2` → `h4`).
- Max line length for reading content: ~65–75 characters (`max-width: 65ch`).
- Text colors come from `--color-text`, `--color-text-secondary`, `--color-text-muted`. No custom greys.
- Use weight and color for hierarchy first; size second. Avoid more than 3 sizes in one view.
- Truncate long text with `text-overflow: ellipsis` (single line) or `line-clamp` (multi-line) and expose the full text via title or tooltip.
- Numbers in tables: `font-variant-numeric: tabular-nums`, right-aligned.
- If a `Text` / `Heading` component is needed (≥ 2 usages), it exposes `as`, `size`, `weight`, `color` props mapped to these tokens.

---

## 6. Spacing, Margin & Padding

### 6.1 Scale
4px base scale: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`. Only these values. No 13px, 18px, 25px.

### 6.2 Standard usage
| Context | Token |
| :--- | :--- |
| Icon ↔ label gap inside a control | `--space-2` (8px) |
| Between form label and input | `--space-1` / `--space-2` |
| Between form fields | `--space-4` / `--space-5` |
| Inside buttons (vertical / horizontal) | `sm`: 6/12px · `md`: 8/16px · `lg`: 12/20px |
| Inside cards | `--space-4` (mobile) / `--space-6` (desktop) |
| Between cards in a grid | `--space-4` / `--space-6` |
| Between sections on a page | `--space-8` (mobile) / `--space-12`–`--space-16` (desktop) |
| Page horizontal gutter | `--space-4` (mobile) / `--space-6` (tablet) / `--space-8` (desktop) |
| Section vertical padding (marketing) | `--space-16` (mobile) / `--space-24` (desktop) |

### 6.3 Rules
- Prefer `gap` (flex/grid) over margins between siblings.
- Parents control spacing between children. Components should not carry external margins; the parent layout decides.
- Padding belongs to the container (card, section, modal), not to the content.
- Do not mix `margin-top` and `margin-bottom` for the same purpose within a stack. Pick one direction (usually a `Stack` with `gap`).
- Consistent spacing beats "pixel-perfect" spacing. If a design shows 14px, use 12 or 16.

---

## 7. Layout Management

### 7.1 Page structure
```text
AppShell / RootLayout
├─ Header / Topbar
├─ Sidebar (dashboards)
└─ Main
   ├─ Container (max-width + gutters)
   │  ├─ PageHeader (title, description, actions)
   │  ├─ Section
   │  ├─ Section
   │  └─ …
   └─ Footer (websites)
```

### 7.2 Container widths
| Name | Max width | Usage |
| :--- | :--- | :--- |
| `sm` | 640px | Auth forms, narrow content |
| `md` | 768px | Articles, settings pages |
| `lg` | 1024px | Standard content |
| `xl` | 1280px | Marketing, dashboards (default) |
| `2xl`| 1536px | Wide dashboards, data-heavy tables |
| `full` | 100% | Full-bleed sections |

*Containers are always centered with horizontal gutters from [Section 6.2](#62-standard-usage).*

### 7.3 Layout primitives (create when needed)
- **Container** — max-width + gutters.
- **Stack** — vertical flex with gap.
- **Inline / Row** — horizontal flex with gap, wrap, alignment.
- **Grid** — responsive columns (`cols={{ base: 1, md: 2, lg: 3 }}`).

*Use these instead of ad-hoc flex/grid CSS in every page.*

### 7.4 Rules
- Layouts use CSS Grid for two-dimensional structure and Flexbox for one-dimensional alignment.
- Never use fixed pixel widths for content areas; use `max-width` + percentage/fr units.
- Sidebar: fixed width on desktop (240–280px), collapsible/drawer on mobile.
- Sticky headers/toolbars must define z-index from tokens.
- Avoid nested scroll containers unless intentional (e.g. a scrollable table inside a page).

---

## 8. Responsive Design & Breakpoints

### 8.1 Breakpoints (mobile-first, min-width)
| Token | Width | Target |
| :--- | :--- | :--- |
| `base` | 0 | Mobile (default styles) |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops / small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### 8.2 Rules
- Mobile-first. Write base styles for mobile and add min-width overrides.
- Every page must be usable at 320px width without horizontal scrolling.
- Touch targets ≥ 44×44px on touch devices; interactive elements ≥ 40px tall on desktop.
- Typography scales down one step on mobile for H1/H2 (see [Section 5.1](#51-type-scale-default)).
- Tables: on mobile, either horizontal scroll inside a wrapper, or transform into stacked cards. Decide per table; never let a table break the page layout.
- Navigation: horizontal on desktop, drawer/hamburger on mobile.
- Modals: centered dialog on desktop, full-screen or bottom-sheet on mobile.
- Images: `max-width: 100%`; `height: auto`; with explicit dimensions or aspect ratio to avoid layout shift.
- Test at: 320, 375, 768, 1024, 1280, 1536.

---

## 9. Color System & Themes

### 9.1 Semantic roles
| Role | Tokens | Usage |
| :--- | :--- | :--- |
| **Background** | `--color-bg`, `--color-bg-subtle`, `--color-bg-muted` | Page, panels, striped rows |
| **Surface** | `--color-surface`, `--color-surface-raised` | Cards, modals, dropdowns |
| **Text** | `--color-text`, `--color-text-secondary`, `--color-text-muted`, `--color-text-disabled`, `--color-text-inverse` | Hierarchy |
| **Border** | `--color-border`, `--color-border-strong` | Dividers, inputs, cards |
| **Primary** | `--color-primary`, `--color-primary-hover`, `--color-primary-subtle`, `--color-primary-fg` | Main actions, links, active states |
| **Status** | `--color-success`, `--color-warning`, `--color-danger`, `--color-info` | Feedback, badges, alerts |
| **Focus** | `--color-focus-ring` | Keyboard focus |

### 9.2 Rules
- One primary color for primary actions. Don't use it for decoration.
- Status colors mean status only. Red = error/destructive, green = success, amber = warning, blue = info.
- Never convey meaning with color alone — pair with an icon, label, or text.
- Contrast: 4.5:1 for normal text, 3:1 for large text (≥ 24px or ≥ 19px bold) and UI borders/icons.
- Themes are implemented by swapping semantic tokens on `[data-theme]` (or `.dark`). Components never contain theme conditionals.
- Charts/data-viz use a dedicated categorical palette defined in tokens; never reuse status colors for data series.

---

## 10. Border Radius, Shadows & Elevation

### 10.1 Radius
| Token | Usage |
| :--- | :--- |
| `--radius-sm` (4px) | Badges, chips, checkboxes, small tags |
| `--radius-md` (8px) | Buttons, inputs, dropdown items — default |
| `--radius-lg` (12px) | Cards, modals, popovers |
| `--radius-xl` (16px) | Large panels, hero cards |
| `--radius-full` | Avatars, pills, toggle switches |

*A project may shift the whole scale (e.g. sharper or rounder brand), but the relationship stays: controls < cards < panels.*

### 10.2 Shadows / elevation
| Level | Token | Usage |
| :--- | :--- | :--- |
| **0** | `none` + `--color-border` | Flat cards, inputs, table rows |
| **1** | `--shadow-xs` / `--shadow-sm` | Cards, buttons (subtle) |
| **2** | `--shadow-md` | Dropdowns, popovers, hovered cards |
| **3** | `--shadow-lg` | Modals, drawers |
| **4** | `--shadow-xl` | Command palettes, toasts |

*Rules:* Elevation communicates layering. Higher z-index = higher shadow. Don't use shadows for decoration. In dark theme, rely more on surface color difference and borders than on shadows.

---

## 11. Icons

- One icon library per project (default: Lucide). Never mix icon sets.
- Sizes: 16px (inline with text/sm buttons), 20px (default in controls), 24px (standalone/nav). Icons match the font size of adjacent text.
- Stroke width consistent across the project (default 1.5–2).
- Color inherits from text (`currentColor`).
- Decorative icons: `aria-hidden="true"`. Meaningful standalone icons (icon-only buttons): must have `aria-label`.
- Wrap in an `Icon` component only if the project needs consistent sizing/color props in many places.

---

## 12. Component States

Every interactive component implements all applicable states. Pages never add these manually.

| State | Requirement |
| :--- | :--- |
| **Default** | Token-based, meets contrast. |
| **Hover** | Visible change (background/border/shadow shift). Only on `@media (hover: hover)` devices. Transition `--duration-fast`. |
| **Focus** | Visible focus ring via `:focus-visible` — `2px solid var(--color-focus-ring)` with `outline-offset: 2px`. Never remove outline without a replacement. |
| **Active / Pressed** | Slightly darker/scaled state on press. |
| **Selected / Checked**| Clear distinction from default (primary color, checkmark). |
| **Disabled** | `opacity: 0.5` (or disabled tokens), `cursor: not-allowed`, `aria-disabled` / `disabled`, no hover effects, not focusable when disabled. |
| **Loading** | Spinner or skeleton; control stays same size (no layout shift); `aria-busy="true"`; disable interaction while loading. |
| **Error / Invalid** | `--color-danger` border + message below; `aria-invalid="true"`; `aria-describedby` points to the message. |
| **Success (optional)** | Green border/icon when confirmation is useful (e.g. validated field). |
| **Empty** | Every list/table/collection has an empty state: icon + title + short description + primary action (if any). |
| **Skeleton** | For content loading > 300ms, use skeleton shapes matching final layout. |

### Loading Strategy
- **Buttons**: inline spinner, label kept (or replaced) — width preserved.
- **Pages/sections**: skeletons matching layout.
- **Tables**: skeleton rows.
- **Full-page blocking loaders**: only for auth/bootstrap.

---

## 13. Component Specifications

Specs define the contract for each component when it is created. Create a component only when needed (see [Section 3](#3-component-creation--reuse-flow)); when you do, follow its spec.

### 13.1 Button
| Aspect | Spec |
| :--- | :--- |
| **Variants** | `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link` |
| **Sizes** | `sm` (32px), `md` (40px, default), `lg` (48px) |
| **Props** | `variant`, `size`, `disabled`, `loading`, `leftIcon`, `rightIcon`, `fullWidth`, `type`, `asChild`/`as` (for links) |
| **Radius** | `--radius-md` |
| **Typography**| `--text-sm` (sm/md), `--text-base` (lg), `--weight-medium` |
| **States** | all from [Section 12](#12-component-states) |
| **A11y** | native `<button>`; `type="button"` unless submitting; icon-only requires `aria-label`; `aria-busy` when loading |
| **Rules** | One primary button per view/section. Destructive actions use destructive and require confirmation for irreversible operations. Labels are verbs ("Save changes", not "OK"). |

### 13.2 Input (and form controls)
*Covers Input, Textarea, Select, Checkbox, Radio, Switch. Create each only when needed.*

| Aspect | Spec |
| :--- | :--- |
| **Sizes** | `sm` (32px), `md` (40px, default), `lg` (48px) — match Button heights |
| **Props** | `label`, `placeholder`, `helperText`, `error`, `disabled`, `required`, `leftIcon`/`leftAddon`, `rightIcon`/`rightAddon`, `size` |
| **Radius** | `--radius-md` |
| **Border** | `--color-border`; focus: `--color-primary` + focus ring; error: `--color-danger` |
| **Background**| `--color-surface` |
| **Text** | `--text-sm`/`--text-base`; placeholder `--color-text-muted` |
| **A11y** | Always a visible `<label>` bound via `htmlFor`/`id`; `aria-describedby` for helper/error; `aria-invalid` on error; required + visual indicator |
| **Rules** | Placeholder is never the only label. Use correct `type` and `inputMode`, `autoComplete`. Checkbox/Radio/Switch have ≥ 44px touch target including label. |

### 13.3 Form
| Aspect | Spec |
| :--- | :--- |
| **Structure** | Form → FormField (label + control + helper/error) → controls |
| **Layout** | Single column by default; two columns only on md+ for short related fields (first/last name). Field gap `--space-4`/`--space-5`. |
| **Actions** | Aligned at the bottom: primary on the right (or left for full-width mobile). Cancel is ghost/secondary. |
| **Validation**| Validate on blur + on submit; show inline errors under the field; show a form-level summary for server errors. Never only a toast. |
| **Submission**| Disable submit + show loading during submission; keep values on failure. |
| **A11y** | Errors announced (`role="alert"` on summary or `aria-live`); focus moves to first invalid field on submit. |
| **Implementation** | Use a form library (React Hook Form + Zod recommended) with a shared `FormField` wrapper so every field renders identically. |

### 13.4 Card
| Aspect | Spec |
| :--- | :--- |
| **Parts** | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` (compose; only create the parts you need) |
| **Variants** | `default` (border, no shadow), `elevated` (`--shadow-sm`), `outlined`, `interactive` (hover shadow + cursor) |
| **Padding** | `--space-4` mobile / `--space-6` desktop |
| **Radius** | `--radius-lg` |
| **Background**| `--color-surface` |
| **Rules** | Cards contain one concept. Don't nest cards. Clickable cards: whole card is the link with a single focusable element, or contain a single clear action. |

### 13.5 Modal / Dialog
| Aspect | Spec |
| :--- | :--- |
| **Parts** | `Modal`, `ModalHeader`, `ModalTitle`, `ModalBody`, `ModalFooter` |
| **Sizes** | `sm` (400px), `md` (560px, default), `lg` (800px), `full` |
| **Overlay** | `rgb(0 0 0 / 0.5)`; z-index: `var(--z-overlay)`; modal at `--z-modal` |
| **Radius / shadow** | `--radius-lg` / `--shadow-lg` |
| **Mobile** | Full-screen or bottom sheet below md |
| **Behavior** | Focus trapped; focus moves to modal on open and returns to trigger on close; Esc closes; overlay click closes (unless destructive/unsaved); body scroll locked |
| **A11y** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (title), `aria-describedby` (body) |
| **Rules** | Use for focused tasks and confirmations only. Don't stack modals. Long forms belong in pages/drawers, not modals. Build `ConfirmDialog` on top of Modal, never as a separate implementation. Prefer a headless library (Radix / Headless UI) for the behavior. |

### 13.6 Table
| Aspect | Spec |
| :--- | :--- |
| **Parts** | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, plus `TableToolbar`, `TablePagination`, `TableEmpty` when needed |
| **Typography**| Header: `--text-xs`/`--text-sm`, semibold, `--color-text-secondary`. Cells: `--text-sm`. Numbers: tabular, right-aligned. |
| **Row height**| 44–52px; cell padding `--space-3` × `--space-4` |
| **Borders** | Row divider `--color-border`; header background `--color-bg-subtle`; optional zebra with `--color-bg-subtle` |
| **States** | hover row, selected row (`--color-primary-subtle`), loading (skeleton rows), empty (`TableEmpty`), error |
| **Features** | sorting (with `aria-sort`), selection (checkbox column), row actions (kebab menu, right-aligned), sticky header, pagination or infinite scroll, column visibility |
| **Responsive**| Horizontal scroll wrapper by default; stacked cards for simple tables on mobile |
| **A11y** | Semantic `<table>` markup; `<th scope="col">`; caption or `aria-label`; sortable headers are buttons |
| **Rules** | Use a headless table library (TanStack Table) for complex data grids; keep `components/ui/table` as the presentational layer. |

### 13.7 Other common components (create only when needed)
| Component | Key rules |
| :--- | :--- |
| **Badge / Tag** | `--radius-sm` or full; variants map to status colors + neutral; `--text-xs` medium; never the only indicator of meaning |
| **Avatar** | Sizes xs/sm/md/lg/xl; `--radius-full`; initials fallback; alt text |
| **Alert / Banner** | Variants info/success/warning/danger; icon + title + description + optional action; `role="alert"` for errors, `role="status"` otherwise |
| **Toast** | Bottom-right (desktop) / top (mobile); auto-dismiss 4–6s except errors; `aria-live="polite"`; max 3 visible |
| **Tooltip** | On hover + focus; delay 300ms; never contains interactive content; `--text-xs`; not for essential info |
| **Dropdown / Menu** | Headless lib; keyboard navigable (arrows, Home/End, type-ahead); `--shadow-md`; `--radius-md`; item height 36–40px |
| **Tabs** | `role="tablist"`; arrow-key navigation; active indicator uses `--color-primary`; scrollable on mobile |
| **Breadcrumb** | `<nav aria-label="Breadcrumb">`; last item `aria-current="page"`; truncate middle on mobile |
| **Pagination** | Buttons, not links, unless URLs change; show current/total; `aria-current="page"` |
| **Skeleton** | Matches final layout; `--color-bg-muted`; subtle pulse; `aria-hidden` |
| **EmptyState** | Icon + title + description + action; centered; padding `--space-12` |
| **Spinner** | Sizes sm/md/lg; `role="status"` + visually hidden label |
| **Divider** | `--color-border`; `<hr>` or `role="separator"` |
| **Drawer / Sheet** | Same rules as Modal; slides from side; width 320–480px |
| **Sidebar / Nav** | Active item uses `--color-primary-subtle` + `--color-primary` text; `aria-current="page"`; collapsible on mobile |
| **PageHeader** | Title (H1) + optional description + actions on the right; consistent across all pages |
| **Stat / KPI card**| Built on Card; label (`--text-sm` muted), value (`--text-2xl`/`3xl` semibold), delta (status color + icon) |

---

## 14. Accessibility

- **Minimum standard**: WCAG 2.1 AA.
- **Semantic HTML first**: `<button>`, `<a>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<table>`, `<form>`, `<label>`. ARIA only when HTML can't express it.
- **Keyboard**: Everything interactive is reachable and operable with Tab/Shift+Tab, Enter/Space, arrows (where expected), Esc. Logical tab order. No keyboard traps (except intentional modal traps).
- **Focus**: Visible `:focus-visible` ring everywhere. Manage focus on route change, modal open/close, and after destructive actions.
- **Contrast**: 4.5:1 text, 3:1 large text/UI components/icons.
- **Labels**: Every input has a label. Icon-only buttons have `aria-label`. Images have alt (empty `alt=""` for decorative).
- **Announcements**: Loading, errors, and success messages use `aria-live` regions or `role="alert"`/`role="status"`.
- **Motion**: Respect `prefers-reduced-motion` — disable non-essential animation.
- **Color**: Never the sole carrier of meaning.
- **Touch**: ≥ 44×44px targets on touch devices.
- **Links vs buttons**: Links navigate; buttons perform actions. Don't style one as the other without correct semantics.
- **Skip link**: "Skip to main content" as the first focusable element on every page.
- **Language & structure**: `lang` on `<html>`, one h1, meaningful page `<title>`.
- **Testing**: Run axe (browser extension or `@axe-core/react` / `jest-axe`) and a full keyboard-only pass before marking any UI done.

---

## 15. Naming Conventions

| Item | Convention | Example |
| :--- | :--- | :--- |
| **Component** | PascalCase, noun, singular | `Button`, `DataTable`, `PageHeader` |
| **Component file** | PascalCase.tsx (one component per file; sub-parts allowed in same file) | `Button.tsx`, `Card.tsx` |
| **Component folder** | PascalCase/ with index.ts barrel | `Button/Button.tsx`, `Button/index.ts` |
| **Hook** | useCamelCase | `useDisclosure`, `useMediaQuery` |
| **Utility** | camelCase | `cn`, `formatDate` |
| **Props type** | ComponentNameProps | `ButtonProps` |
| **Variant props** | variant, size, tone (status), align | `variant="outline" size="sm"` |
| **Boolean props** | is/has/plain adjective — pick one style per project (default: plain) | `disabled`, `loading`, `fullWidth` |
| **Event props** | on + Event | `onChange`, `onOpenChange`, `onSelect` |
| **CSS tokens** | `--category-name-modifier` | `--color-primary-hover`, `--space-4` |
| **CSS classes (non-Tailwind)** | BEM or CSS Modules camelCase | `.card__header` / `styles.cardHeader` |
| **Tailwind semantic classes** | match token names | `bg-primary`, `text-muted`, `rounded-md` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| **Folders (non-component)** | kebab-case | `features/user-profile/` |
| **Routes (Next.js)** | kebab-case | `app/user-settings/page.tsx` |
| **Test files** | Component.test.tsx next to the component | `Button.test.tsx` |
| **Story files** | Component.stories.tsx (if Storybook used) | `Button.stories.tsx` |

### Naming rules:
- Name by purpose, not appearance: `Button variant="destructive"`, not `RedButton`.
- No version suffixes or vague prefixes: never `Button2`, `NewCard`, `CustomInput`, `MyModal`.
- Sections are named by content role: `HeroSection`, `PricingSection`, `StatsRow`.

---

## 16. Folder & Component Structure

### 16.1 Reference structure (Next.js App Router; adapt for Vite/CRA)
```text
src/
├─ app/                     # Routes (Next.js). Pages compose sections + components only.
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ (dashboard)/
│     ├─ layout.tsx
│     └─ users/
│        ├─ page.tsx
│        └─ _components/   # Page-specific components (no reuse case)
│
├─ components/
│  ├─ ui/                  # Level 1 — base components (Button, Input, Card, Modal, Table …)
│  │  ├─ Button/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Button.test.tsx
│  │  │  └─ index.ts
│  │  └─ index.ts          # barrel: export * from './Button' …
│  ├─ sections/            # Level 2 — reusable composites used in ≥ 2 places
│  │  ├─ PageHeader/
│  │  ├─ StatCard/
│  │  └─ EmptyState/
│  └─ layout/              # Level 3 — AppShell, Header, Sidebar, Container, Stack, Grid
│
├─ features/               # Level 4 — feature modules (domain logic + feature-only UI)
│  └─ users/
│     ├─ components/       # Feature-specific components
│     ├─ hooks/
│     ├─ api/
│     └─ types.ts
│
├─ hooks/                  # Shared hooks (useMediaQuery, useDisclosure …)
├─ lib/                    # Utilities (cn, formatters, validators)
├─ styles/
│  ├─ tokens.css           # Design tokens (Section 4)
│  └─ globals.css          # Reset, base styles, imports tokens
├─ config/                 # Site config, nav config, theme config
└─ types/                  # Shared TS types
```

### 16.2 Rules
- `components/ui/` — pure, presentational, no data fetching, no business logic, no feature imports.
- `components/sections/` — may compose `ui/` and `layout/`; receives data via props; no fetching.
- `features/` — owns data, hooks, and feature-only components. May import from `components/*`.
- `app/` (pages) — composition + data wiring. Page-specific UI goes in `_components/` next to the page (or `features/<x>/components`).
- **Import direction**: `app → features → components/sections → components/ui → styles/tokens`. Never upward.
- A component folder contains only that component and its parts, test, and story. No unrelated helpers.
- Barrel files (`index.ts`) at `components/ui`, `components/sections`, `components/layout` so imports are `@/components/ui`.

---

## 17. React & Next.js Implementation Guidelines

### 17.1 Component authoring
- **TypeScript required**: Export `ComponentNameProps`. Extend native element props: `extends React.ButtonHTMLAttributes<HTMLButtonElement>`.
- **Forward refs**: On all base components (`React.forwardRef`) so they work with form libraries and focus management.
- **Spread rest props**: Onto the root element so `className`, `data-*`, `aria-*`, and event handlers pass through.
- **Merge classNames**: With a `cn()` utility (`clsx` + `tailwind-merge`) so consumers can override safely.
- **Variants**: Via `class-variance-authority` (`cva`) or an equivalent variant map. Variants and sizes are typed unions, never free strings.
- **Composition over configuration**: `Card` + `CardHeader` + `CardContent` rather than `Card` with 15 props. Support `asChild` (Radix Slot) or `as` where polymorphism is needed (`Button` as link).
- **Controlled + uncontrolled**: Form controls support both (`value`/`onChange` and `defaultValue`).
- **No hard-coded values**: No hex colors, pixel spacing, or radii in components — tokens/Tailwind semantic classes only.
- **No external margins**: On reusable components. Layout owner controls spacing.
- **Headless libraries for complex behavior**: Radix UI / Headless UI / React Aria for dialogs, menus, tabs, popovers; TanStack Table for tables; React Hook Form + Zod for forms. Style them with tokens. Do not hand-roll focus traps or keyboard menus.
- **Server vs Client (Next.js)**: Base UI components are client components only if they need state/effects/handlers (`"use client"` at the top). Keep pure presentational components server-compatible. Pages/layouts are server components by default.
- **Images**: `next/image` with explicit width/height or fill + sizes.
- **Fonts**: `next/font` loaded once in root layout and exposed as the `--font-sans` token.
- **Links**: `next/link` for internal navigation; `Button` `asChild` wraps `Link` for button-styled links.
- **Theme**: `data-theme` attribute on `<html>` (e.g. via `next-themes`); no flash of wrong theme (script in `<head>` or `next-themes` handling).
- **Performance**: Avoid unnecessary client components; lazy-load heavy components (`next/dynamic`) such as charts, editors, and large modals.
- **Tests**: Every `components/ui/*` component has at least a render + accessibility (`jest-axe`) + key-interaction test. Storybook (or equivalent) documents variants and states when the project uses it.

### 17.2 Reference Button implementation
```tsx
// components/ui/Button/Button.tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";

const buttonVariants = cva(
  // base — tokens only via semantic Tailwind classes
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium " +
  "transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary-hover",
        secondary: "bg-bg-muted text-text hover:bg-border",
        outline: "border border-border bg-surface text-text hover:bg-bg-subtle",
        ghost: "text-text hover:bg-bg-muted",
        destructive: "bg-danger text-primary-fg hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, asChild, loading, leftIcon, rightIcon, disabled, children, type = "button", ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Spinner size="sm" aria-hidden /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);
Button.displayName = "Button";
```

### 17.3 Reference FormField wrapper
```tsx
// components/ui/FormField/FormField.tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: (a11y: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-required"?: boolean;
  }) => React.ReactNode;
}

export function FormField({ id, label, required, helperText, error, className, children }: FormFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-danger">*</span>}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": !!error || undefined, "aria-required": required || undefined })}
      {helperText && !error && <p id={helperId} className="text-xs text-text-muted">{helperText}</p>}
      {error && <p id={errorId} role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}
```

---

## 18. Definition of Done — UI Checklist

A UI task is done only when every item passes:

### Reuse & structure
- [ ] Checked existing components before creating anything new.
- [ ] No duplicate component purposes introduced.
- [ ] New component is at the right altitude (page-specific vs `sections/` vs `ui/`).
- [ ] Uses tokens only — no hard-coded colors, spacing, radius, shadows, or font sizes.
- [ ] Follows naming and folder conventions.

### Visual consistency
- [ ] Typography from the type scale; correct heading hierarchy.
- [ ] Spacing from the 4px scale; gap used for sibling spacing; no external margins on reusable components.
- [ ] Radius/shadow match the component spec.
- [ ] Works in light and dark theme (if the project has both).

### Responsive
- [ ] Usable at 320px with no horizontal scroll.
- [ ] Verified at 375 / 768 / 1024 / 1280.
- [ ] Touch targets ≥ 44px on mobile.

### States
- [ ] Hover, focus-visible, active, disabled implemented.
- [ ] Loading state with no layout shift.
- [ ] Error state with message + `aria-invalid`.
- [ ] Empty state for any list/table/collection.

### Accessibility
- [ ] Keyboard-only pass completed.
- [ ] Labels/`aria-label` on all controls; alt on images.
- [ ] Contrast ≥ 4.5:1 (text) / 3:1 (UI).
- [ ] axe reports no violations.

### Code
- [ ] TypeScript props exported; `forwardRef` on base components; rest props spread.
- [ ] Tests for base components (render + a11y + interaction).
- [ ] No console errors/warnings.

---

## 19. Maintaining This Document

- This file is copied unchanged into every project. Project-specific values live in `styles/tokens.css` and `config/`, not here.
- Improvements to the rules are made in the master copy and rolled out to projects; do not fork the rules per project.
- When a project reveals a missing rule or component spec, add it here only if it applies to all projects. Project-only conventions go in the project's own README/CONTRIBUTING.
- Record the version and date below when the master changes.

| Version | Date | Change |
| :--- | :--- | :--- |
| **1.0.0** | 2026-09-21 | Initial universal UI design system guideline |
