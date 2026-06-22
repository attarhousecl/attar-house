"use client";

import { useCatalog } from "@/context/CatalogContext";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

export default function DisenadorPage() {
  const { designerDB, loading } = useCatalog();

  return (
    <section id="disenador" className="page-section active">
      <div className="container">
        <div className="designer-hero">
          <div className="designer-hero-badge">✦ Originales · Solo Decants</div>
          <h1 className="section-title serif">Perfumes de Diseñador</h1>
          <p className="section-subtitle">
            Fragancias icónicas de las grandes casas del mundo, ahora accesibles en decants.
            Cada gota es 100% original, extraída directamente de la botella sellada de fábrica.
          </p>
        </div>
        {loading ? (
          <SkeletonGrid count={4} />
        ) : (
          <ProductGrid
            perfumes={designerDB}
            variant="designer"
            emptyMessage="Pronto sumaremos más perfumes de diseñador. Mientras tanto, explora el catálogo árabe y de nicho."
          />
        )}
      </div>
    </section>
  );
}
