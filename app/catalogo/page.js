"use client";

import { useState } from "react";
import { useCatalog } from "@/context/CatalogContext";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";

export default function CatalogoPage() {
  const { designerDB, arabDB, loading } = useCatalog();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [gender, setGender] = useState("all");
  const [aroma, setAroma] = useState("all");
  const [brand, setBrand] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let filtered = arabDB.filter((p) => {
    const matchBrand = brand === "all" || p.brand === brand;
    const matchGender = gender === "all" || p.gender === gender;
    const matchAroma = aroma === "all" || p.families.includes(aroma);
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.notes.some((n) => n.toLowerCase().includes(search)) ||
      p.families.some((f) => f.toLowerCase().includes(search));
    return matchBrand && matchGender && matchAroma && matchSearch;
  });

  if (sort === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.prices.decant3 - b.prices.decant3);
  } else if (sort === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.prices.decant3 - a.prices.decant3);
  } else if (sort === "popularity") {
    filtered = [...filtered].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  return (
    <section id="catalogo" className="page-section active catalog-bg">
      <div className="container">
        <h2 className="section-title serif" style={{ marginBottom: "40px" }}>
          Nuestro Catálogo
        </h2>
        <button className="btn-mobile-filters" onClick={() => setSidebarOpen(true)}>
          <i className="ph ph-sliders-horizontal"></i> Mostrar Filtros
        </button>
        <div className="catalog-layout">
          <FilterSidebar
            arabDB={arabDB}
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            gender={gender}
            setGender={setGender}
            aroma={aroma}
            setAroma={setAroma}
            brand={brand}
            setBrand={setBrand}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="catalog-main">
            <div className="designer-section" id="designer-section">
              <div className="designer-section-header">
                <div className="section-divider"></div>
                <div>
                  <h3 className="serif">Perfumes de Diseñador</h3>
                  <p>Originales 100% · Solo decants disponibles</p>
                </div>
              </div>
              {!loading && <ProductGrid perfumes={designerDB} variant="designer" />}
            </div>

            <div id="arab-section">
              <div className="arab-section-header">
                <div className="section-divider"></div>
                <div>
                  <h3 className="serif">Perfumería Árabe</h3>
                  <p>Decants y frascos sellados disponibles</p>
                </div>
              </div>
              {!loading && <ProductGrid perfumes={filtered} variant="catalog" />}
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </section>
  );
}
