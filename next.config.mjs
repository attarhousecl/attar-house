/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Permite los recursos externos que el sitio usa de
// verdad (Google Fonts + Phosphor Icons desde unpkg) y el REST/Realtime de
// Supabase. En desarrollo se añade 'unsafe-eval' porque el HMR de Next lo
// necesita; en producción no.
//
// Limitación conocida: script-src usa 'unsafe-inline' porque Next inyecta
// scripts de hidratación inline y el sitio usa estilos inline (styled-jsx).
// Aun así, frame-ancestors/object-src/base-uri/form-action endurecen el resto.
// Mejora futura: pasar a CSP basado en nonce vía proxy.js.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net",
  "font-src 'self' https://fonts.gstatic.com https://unpkg.com https://cdn.jsdelivr.net data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  async headers() {
    return [
      {
        // Cabeceras de seguridad en todas las rutas.
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // El panel admin nunca debe cachearse.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
