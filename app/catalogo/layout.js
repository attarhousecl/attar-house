export const metadata = {
  title: "Catálogo | Attar House — Perfumería Árabe y Decants en Valdivia",
  description:
    "Explora nuestra colección completa de perfumería árabe, nicho y diseñador. Decants desde 3ml, frascos sellados y envíos a todo Chile. Filtra por género, familia olfativa y marca.",
  openGraph: {
    title: "Catálogo de Perfumes | Attar House",
    description: "Perfumería árabe auténtica y decants de alta gama. Oud, ambar, rosa y más. Envíos a todo Chile desde Valdivia.",
    url: "https://attarhouse.cl/catalogo",
    images: ["/images/his-confession.png"],
  },
  alternates: {
    canonical: "https://attarhouse.cl/catalogo",
  },
};

export default function CatalogoLayout({ children }) {
  return children;
}
