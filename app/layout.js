import "./globals.css";
import { Montserrat, Playfair_Display } from "next/font/google";
import Script from "next/script";
import Nav from "@/components/Nav";

// Fuentes self-hosted vía next/font: sin request externo render-blocking ni
// layout shift. Se exponen como variables CSS usadas en globals.css y estilos inline.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SocialProof from "@/components/SocialProof";
import { ToastProvider } from "@/context/ToastContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { CartProvider } from "@/context/CartContext";

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

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect al CDN de iconos (Phosphor) para adelantar su handshake.
            Las fuentes ya no son render-blocking: se sirven self-hosted vía next/font. */}
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Saltar al contenido</a>
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="beforeInteractive" />
        <ToastProvider>
          <CatalogProvider>
            <CartProvider>
              <AnnouncementBar />
              <Nav />
              <main id="main-content">{children}</main>
              <CartDrawer />
              <WhatsAppFloat />
              <SocialProof />
              <Footer />
            </CartProvider>
          </CatalogProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
