"use client";

import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

export default function FeaturedProducts() {
  const { perfumes, loading } = useCatalog();

  const featured = [...perfumes]
    .filter((p) => p.prices.decant3 > 0 && p.stock.decant3 !== false)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 4);

  // Si ya cargó y no hay nada que mostrar, no renderizamos la sección.
  if (!loading && featured.length === 0) return null;

  return (
    <section className="home-block">
      <div className="container">
        <h2 className="section-title serif">Los favoritos de la casa</h2>
        <p className="section-subtitle">
          Las fragancias que más enamoran a nuestros clientes. Pruébalas en decant antes de invertir.
        </p>

        {loading ? (
          <SkeletonGrid count={4} />
        ) : (
          <ProductGrid perfumes={featured} variant="catalog" />
        )}

        <div className="home-cta-center">
          <Link href="/catalogo" className="btn-primary">
            <span>Ver todo el catálogo</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
