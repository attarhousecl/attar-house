import "./globals.css";
import Script from "next/script";
import Nav from "@/components/Nav";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata = {
  metadataBase: new URL("https://attarhouse.cl"),
  title: "Attar House | Perfumería Árabe y Decants en Valdivia",
  description:
    "Descubre la mejor alta perfumería árabe y decants en Valdivia. Fragancias exclusivas, testers originales y envíos a todo Chile. Attar House: No son perfumes, es presencia.",
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
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="beforeInteractive" />
        <AnnouncementBar />
        <Nav />
        <main>{children}</main>
        <CartDrawer />
        <Footer />
      </body>
    </html>
  );
}
