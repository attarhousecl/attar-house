/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Permite los recursos externos que el sitio usa de
// verdad (Google Fonts + Phosphor Icons desde unpkg), el REST/Realtime de
// Supabase, y lo que necesita @imgly/background-removal (Estudio Fotografico
// recorta fondos en el navegador): fetch del modelo IA desde staticimgly.com,
// import() dinámico de un módulo empaquetado como blob: (así carga su backend
// wasm/onnxruntime), y 'wasm-unsafe-eval' para poder instanciar ese WASM bajo
// una CSP estricta. En desarrollo se añade 'unsafe-eval' porque el HMR de
// Next lo necesita; en producción no.
//
// Limitación conocida: script-src usa 'unsafe-inline' porque Next inyecta
// scripts de hidratación inline y el sitio usa estilos inline (styled-jsx).
// Aun así, frame-ancestors/object-src/base-uri/form-action endurecen el resto.
// Mejora futura: pasar a CSP basado en nonce vía proxy.js.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://staticimgly.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net",
  "font-src 'self' https://fonts.gstatic.com https://unpkg.com https://cdn.jsdelivr.net data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://staticimgly.com blob:",
  "worker-src 'self' blob:",
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
