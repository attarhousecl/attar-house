import "./globals.css";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import Nav from "@/components/Nav";
import SplashIntro from "@/components/SplashIntro";

// Fuentes del sistema de marca (Marca.html): Archivo para todo el texto y
// títulos, IBM Plex Mono para etiquetas/precios/datos técnicos. Self-hosted
// vía next/font: sin request externo render-blocking ni layout shift.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-archivo",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SocialProof from "@/components/SocialProof";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/context/ToastContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  metadataBase: new URL("https://attarhouse.cl"),
  title: "Attar House | Perfumería Árabe y Decants en Valdivia",
  description:
    "Descubre alta perfumería árabe, de nicho y diseñador en decants y frascos sellados, en Valdivia. Fragancias 100% originales, testers y envíos a todo Chile. Attar House: No son perfumes, es presencia.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "https://attarhouse.cl/",
    title: "Attar House | Perfumería Árabe y Decants en Valdivia",
    description:
      "Descubre la mejor perfumería árabe y decants en Valdivia. Fragancias exclusivas, testers originales y envíos a todo Chile.",
    images: ["/images/his-confession.png"],
    locale: "es_CL",
    siteName: "Attar House",
  },
  twitter: {
    card: "summary_large_image",
    title: "Attar House | Perfumería Árabe y Decants en Valdivia",
    description:
      "Descubre la mejor perfumería árabe y decants en Valdivia. Fragancias exclusivas y envíos a todo Chile.",
    images: ["/images/his-confession.png"],
  },
};

export const viewport = {
  themeColor: "#F5F5F5",
  colorScheme: "light dark",
};

// Aplica el tema guardado ANTES de pintar (evita el destello de tema incorrecto).
// Claro (Blanco Humo) es el tema principal; oscuro es "bosque".
const THEME_INIT = `(function(){try{var t=localStorage.getItem("ah_theme");if(t!=="dark")t="light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${archivo.variable} ${plexMono.variable}`} data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {/* Preconnect al CDN de iconos (Phosphor) para adelantar su handshake.
            Las fuentes ya no son render-blocking: se sirven self-hosted vía next/font. */}
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Saltar al contenido</a>
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="afterInteractive" />
        <SplashIntro />
        <ToastProvider>
          <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <Nav />
              <main id="main-content">{children}</main>
              <CartDrawer />
              <WhatsAppFloat />
              <SocialProof />
              <Footer />
            </CartProvider>
          </CatalogProvider>
          </AuthProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
