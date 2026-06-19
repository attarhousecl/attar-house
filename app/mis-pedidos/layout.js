export const metadata = {
  title: "Mis Pedidos | Attar House — Seguimiento de Compras",
  description:
    "Revisa el estado y el historial de tus pedidos de perfumería árabe y decants en Attar House. Consulta tus compras y seguimiento de envíos.",
  openGraph: {
    title: "Mis Pedidos | Attar House",
    description:
      "Consulta el estado y el historial de tus pedidos en Attar House. Perfumería árabe y decants con envíos a todo Chile.",
    url: "https://attarhouse.cl/mis-pedidos",
    images: ["/images/his-confession.png"],
  },
  alternates: {
    canonical: "https://attarhouse.cl/mis-pedidos",
  },
};

export default function MisPedidosLayout({ children }) {
  return children;
}
