"use client";

import { useCatalog } from "@/context/CatalogContext";
import ProductGrid from "@/components/ProductGrid";

export default function DisenadorPage() {
  const { designerDB, loading } = useCatalog();

  return (
    <section id="disenador" className="page-section active">
      <div className="container">
        <div className="designer-hero">
          <div className="designer-hero-badge">✦ Originales · Solo Decants</div>
          <h2 className="section-title serif">Perfumes de Diseñador</h2>
          <p className="section-subtitle">
            Fragancias icónicas de las grandes casas del mundo, ahora accesibles en decants.
            Cada gota es 100% original, extraída directamente de la botella sellada de fábrica.
          </p>
        </div>
        {!loading && <ProductGrid perfumes={designerDB} variant="designer" />}
      </div>
    </section>
  );
}
