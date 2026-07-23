import "./globals.css";
// Phosphor Icons self-hosted (solo peso "regular"). Antes se cargaba por
// <Script> desde unpkg, que a su vez traia 6 stylesheets de jsdelivr (los 6
// pesos, ~46KB de CSS sin usar) + la fuente desde CDN externo: render-blocking,
// dependiente de red ajena y causa de los iconos en blanco. Ahora la fuente y
// el CSS del peso regular viajan en el bundle, servidos desde el propio dominio.
import "@phosphor-icons/web/regular";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import SplashIntro from "@/components/SplashIntro";
import StoreChrome from "@/components/StoreChrome";

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

// El sitio SIEMPRE abre en tema claro (Blanco Humo). El toggle a oscuro
// "bosque" se recuerda solo durante la visita (sessionStorage): al volver a
// entrar, se parte de nuevo en claro. Se aplica ANTES de pintar para evitar
// el destello de tema incorrecto en recargas dentro de la misma visita.
const THEME_INIT = `(function(){try{var t=sessionStorage.getItem("ah_theme");if(t!=="dark")t="light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: data-theme lo ajusta el script anterior a React
    // según la sesión; ese desajuste puntual con el SSR es intencional.
    <html
      lang="es"
      className={`${archivo.variable} ${plexMono.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Saltar al contenido</a>
        <SplashIntro />
        <ToastProvider>
          <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <StoreChrome>
                <Nav />
              </StoreChrome>
              <main id="main-content">{children}</main>
              <StoreChrome>
                <CartDrawer />
                <WhatsAppFloat />
                <SocialProof />
                <Footer />
              </StoreChrome>
            </CartProvider>
          </CatalogProvider>
          </AuthProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
