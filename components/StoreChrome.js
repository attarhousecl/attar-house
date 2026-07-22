"use client";

import { usePathname } from "next/navigation";

// Envuelve el "chrome" de la tienda (navbar, footer, carrito, WhatsApp…):
// en el panel /admin nada de eso debe verse — el panel es un dashboard aparte.
export default function StoreChrome({ children }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return children;
}
