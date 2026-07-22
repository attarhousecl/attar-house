import { Cormorant_Garamond, Inter } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-cormorant",
});
const interStudio = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
  variable: "--font-inter-studio",
});

export default function AdminLayout({ children }) {
  // .admin-scope re-fija la paleta original del panel: el tema claro/oscuro
  // de la tienda es solo para el cliente y no debe afectar al admin.
  return <div className={`admin-scope ${cormorant.variable} ${interStudio.variable}`}>{children}</div>;
}
