<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Coordinación entre agentes (varios chats sobre este repo)

Hay VARIOS chats de Claude trabajando este repo en paralelo. Para no pisarse ni
romper producción, todo agente DEBE respetar esto:

## Carriles (cada chat toca SOLO lo suyo)
- **Seguridad / Infra:** `next.config.mjs`, `proxy.js` (middleware), `lib/adminAuth.js`,
  `lib/rateLimit.js`, `lib/supabase*.js`, RLS/migraciones de Supabase, y **todo `app/api/**`**
  (incluye pagos: `checkout`, `mercadopago/webhook`, `cron`, `subscribe`). Revisión de
  seguridad transversal. Coordina los deploys.
- **Admin (panel):** `app/admin/**`, `components/AttarStudio.jsx`, `components/proceduralBackdrops.js`
  y componentes usados solo por el admin.
- **Tienda / Público (cara al cliente):** páginas de cliente (`app/page.js`, `app/catalogo`,
  `app/producto`, `app/checkout` [solo UI], `app/pack`, `app/quiz`, `app/disenador`,
  `app/accesorios`, `app/faq`, `app/mis-pedidos`, `app/pedido`, `app/layout.js`,
  `app/globals.css`, `app/sitemap.js`, `app/robots.js`), `components/**` de tienda, `context/**`.

**Pagos NO es un carril propio.** El backend de pagos vive en *Seguridad* (integridad de
pago = seguridad). Tienda puede tocar la *página* de checkout (UI), no la API.

## Reglas duras (todos)
1. Trabaja en TU rama (`sec/…`, `admin/…`, `tienda/…`). **NUNCA** commitees directo a `main`.
2. A `main` solo por **Pull Request** y solo si el check de **Vercel está VERDE**.
3. **Antes de push corre `npm run build`.** Si falla, no subas: `main` despliega a
   attarhouse.cl y un build roto tumba TODA la tienda (ya pasó).
4. Quédate en tu carril. Si necesitas tocar otro, coordínalo — **no borres trabajo ajeno**.
5. `git pull --rebase` antes de empezar; commits chicos y frecuentes.
6. Archivos compartidos (`AGENTS.md`, `CLAUDE.md`, `package.json`, `next.config.mjs`):
   coordinar antes de tocar; los de config/seguridad los lleva *Seguridad*.
7. Ojo con las **comillas tipográficas** (`“ ” ‘ ’`) en JSX/código: el parser SWC las
   rechaza y rompen el build. Usa siempre comillas rectas (`" ' \``).
