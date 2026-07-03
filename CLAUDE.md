# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (or double-click `dev.cmd` on Windows, which sets `PATH` and runs the same thing).
- `npm run build` — production build. **Always run this before pushing/opening a PR** — `main` auto-deploys to attarhouse.cl on Vercel, so a broken build takes down the live store. The script force-deletes `.next` first (`node -e "fs.rmSync('.next',...)"`) because stale build artifacts have caused false-pass builds before.
- `npm run lint` — ESLint via `eslint-config-next/core-web-vitals`.
- No test suite exists in this repo.

## Architecture

### Two audiences, one Next.js App Router app
- **Storefront** (customer-facing): `app/page.js`, `app/catalogo`, `app/producto`, `app/checkout`, `app/pack`, `app/quiz`, `app/disenador`, `app/accesorios`, `app/faq`, `app/mis-pedidos`, `app/pedido`, plus `components/**` and `context/**`. Dark/gold/serif "boutique" identity (Playfair Display + Montserrat via `next/font`, CSS vars — never hardcode font names). See `PRODUCT.md` for brand voice/design principles and `MARKETING.md` for positioning.
- **Admin** (`app/admin/**`): staff-only panel (catalog, pedidos, contabilidad, objetivos, etiquetas, publicidad/Studio). Functional-first — deliberately diverges from the storefront's ornamental system.

This repo is actively worked by multiple parallel agents/chats, each restricted to one of the "carriles" (lanes) above — see `AGENTS.md` for the full split and hard rules (branch discipline, build-before-push, no direct commits to `main`).

### Auth & security boundary
- `proxy.js` is this Next.js version's middleware convention (replaces `middleware.js`) — it gates every `/admin/*` route except `/admin/login` by checking a Supabase session cookie, redirecting to login if absent.
- `lib/adminAuth.js`'s `getAdminUser()` re-validates the session server-side (`auth.getUser()`, not the unverified `getSession()`) inside sensitive route handlers.
- `lib/supabaseClient.js` (anon key, RLS-scoped) is for browser/public reads. `lib/supabaseAdmin.js` (service-role key, `persistSession: false`) bypasses RLS and must only be used in server-only code (route handlers, cron) — never imported into client components.
- Security headers and CSP live in `next.config.mjs`. The CSP is intentionally relaxed only on `/admin/estudio/:path*` (the AttarStudio photo tool needs `unsafe-eval` for `@imgly/background-removal`'s WASM loader) — don't widen that relaxation to other routes.
- `lib/rateLimit.js` is an in-memory, best-effort per-IP limiter (not distributed — each serverless instance has its own bucket map). Used on public-facing API routes like `checkout` and `subscribe` as a cheap first barrier, not a hard guarantee.

### Catalog & stock
- Product data lives in Supabase's `perfumes` table (schema in `supabase-setup.sql`); accessories are a static array in `lib/catalogData.js`, not a DB table.
- Stock is modeled per-format as booleans: `stock_sellado`, `stock_decant10`, `stock_decant5`, `stock_decant3` (paired with `price_<format>`). A format is purchasable when its stock column is not `false`. Always account for all three decant sizes plus `sellado` when touching stock/pricing logic.

### Cart → checkout → payment flow
- `context/CartContext.js` holds an optimistic client-side cart persisted to `localStorage` (`attar_cart`); prices shown here are **not trusted** at payment time.
- `POST /api/checkout` (`app/api/checkout/route.js`) re-fetches the real perfumes/accessories from Supabase and re-derives every price/stock/quantity server-side before creating a `pending` row in `orders` and a Mercado Pago preference (`lib/mercadopago.js`). Order numbers include a random suffix so they aren't enumerable.
- `app/api/mercadopago/webhook` confirms payment status asynchronously and is what actually flips order status and sends the confirmation email (`lib/email.js`) — the checkout route never sends it.
- `app/api/cron/abandoned-cart` runs on Vercel's cron schedule (see `vercel.json`) for abandoned-cart follow-up.

### AttarStudio (admin/publicidad — ad-image generator)
Built in phases, still visible in the code split:
- **Fase 1**: template system in `components/AttarStudio.jsx` (`TEMPLATES`) — producto, versus, tabla, promo, lanzamiento, inspirado, testimonio, comparativa, countdown, carrusel — rendered client-side to PNG via `html-to-image`, with procedural scene backdrops (`components/proceduralBackdrops.js`) for `SCENE_CAPABLE` templates.
- **Fase 2**: editable canvas — `components/StudioEditable.jsx` (`EditableItem`, `ElementPanel`) adds drag/resize/align/layering on top of each template, stored under a `layout` field that Fase 3 code must never touch directly.
- **Fase 3**: rule-based (no-AI) content layer — `components/studioCopy.js` (`copyFor`) generates on-brand copy patches per template (brand rules are documented as comments in that file — e.g. the tagline "No son perfumes, es presencia" is reserved and never auto-generated, testimonials never fabricate a customer quote/name), `components/studioSugerencias.js` builds catalog-driven content suggestions (launches, low-stock, popular, cross-family "versus"), and `components/brandFacts.js` holds shared policy/CTA constants.

### Anthropic API usage
`@anthropic-ai/sdk` is a dependency — check for `ANTHROPIC_API_KEY` handling (must degrade gracefully, e.g. HTTP 503, not crash the route) before adding or modifying any AI-backed endpoint.
