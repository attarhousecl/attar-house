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
  return <div className={`${cormorant.variable} ${interStudio.variable}`}>{children}</div>;
}
