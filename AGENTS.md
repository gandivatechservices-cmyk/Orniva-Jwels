<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## What This Is
Shopper is a multi-tenant e-commerce platform and administrative back-office built with Next.js App Router and Ant Design, supporting product discovery, cart/wishlist management, checkout, multi-currency domains, and merchant catalog/review administration.

## Stack
- Framework: Next.js 16 (App Router) & React 19
- UI Library: Ant Design (antd v6) & @ant-design/icons
- Styling: Ant Design Token System (`theme.ts`) + CSS Modules + Global CSS variables
- Forms & Validation: Formik & Yup
- Language: TypeScript (strict mode) with absolute path aliases

## Key Commands
- `npm run dev`: Start Next.js development server
- `npm run build`: Build production bundle
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks

## Folder Map
- `src/app/`: Next.js App Router pages, layouts, route handlers, and CSS modules
- `src/components/`: Reusable UI components (StoreLayout, AdminLayout, AuthShell, StoreHeader/Footer)
- `src/context/`: React Context state providers (Auth, Cart, Wishlist, Notifications)
- `src/guards/`: Authentication and role-based route guard wrappers (`ProtectedRoute`)
- `src/utility/`: Service layer (`apiClient`, catalog, orders, users, reviews) and helpers
- `specs/`: Spec-driven development specifications, workflow, template, and index
- `.agents/rules/`: Modular coding, styling, and architectural rules

## Undocumented Architecture
- Multi-domain currency mapping is dynamically resolved from `catalogService.listDomains()` and formatted via `formatMoney`.
- Authentication bearer tokens are stored in `localStorage` (`accessToken`) and attached automatically via `apiClient` in `src/utility/services/base.ts`.

## Rules
Refer to detailed rules in `.agents/rules/` and SDD specifications in `specs/`.

## Session Startup
At the start of every session:
1. Read `AGENTS.md` and `specs/WORKFLOW.md`.
2. Read `specs/INDEX.md` to know what specs exist (names, paths, and one-line descriptions only).
3. Wait for a task. Only read a specific spec file when a relevant task comes in.

Available workflows:
- `/sdd-audit [module]`: Read and report on a module, touch nothing.
- `/sdd-spec [feature]`: Create a draft spec for a new feature.
- `/sdd-change [feature]`: Update an existing spec when requirements change.
- `/sdd-implement [feature]`: Implement an approved spec or change request.

## Communication
Always respond in plain, simple English. Avoid unnecessary technical jargon. Keep responses concise, clear, and direct.
