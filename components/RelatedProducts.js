"use client";

import { useCatalog } from "@/context/CatalogContext";
import ProductGrid from "@/components/ProductGrid";

function variantFor(p) {
  if (p.inspiration === "Diseñador Original") return "designer";
  if (p.inspiration === "Nicho") return "nicho";
  return "catalog";
}

export default function RelatedProducts({ perfume }) {
  const { perfumes } = useCatalog();
  if (!perfume) return null;

  const famSet = new Set((perfume.families || []).map((f) => f.toLowerCase()));

  const related = perfumes
    .filter((p) => p.id !== perfume.id && p.prices.decant3 > 0 && p.stock.decant3 !== false)
    .map((p) => {
      let score = 0;
      const sharedFam = (p.families || []).filter((f) => famSet.has(f.toLowerCase())).length;
      score += sharedFam * 3;
      if (p.brand === perfume.brand) score += 2;
      if (p.gender === perfume.gender) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.p.popularity || 0) - (a.p.popularity || 0))
    .slice(0, 4)
    .map((x) => x.p);

  if (related.length === 0) return null;

  return (
    <div className="related-section">
      <h2 className="section-title serif" style={{ fontSize: "2rem", marginBottom: "8px" }}>
        También te puede gustar
      </h2>
      <p className="section-subtitle" style={{ marginBottom: "32px" }}>
        Fragancias con un perfil parecido a {perfume.name}.
      </p>
      <ProductGrid perfumes={related} variant="catalog" />
    </div>
  );
}
