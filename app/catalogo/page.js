"use client";

import { useState } from "react";
import { useCatalog } from "@/context/CatalogContext";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

function applyFilters(perfumes, { search, sort, gender, aroma, brand }) {
  let filtered = perfumes.filter((p) => {
    const matchBrand = brand === "all" || p.brand === brand;
    const matchGender = gender === "all" || p.gender === gender;
    const matchAroma = aroma === "all" || p.families.includes(aroma);
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.notes.some((n) => n.toLowerCase().includes(search)) ||
      p.families.some((f) => f.toLowerCase().includes(search)) ||
      (p.description && p.description.toLowerCase().includes(search));
    return matchBrand && matchGender && matchAroma && matchSearch;
  });

  if (sort === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.prices.decant3 - b.prices.decant3);
  } else if (sort === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.prices.decant3 - a.prices.decant3);
  } else if (sort === "popularity") {
    filtered = [...filtered].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  return filtered;
}

const TABS = [
  { id: "todos",     label: "Todos" },
  { id: "arabe",     label: "🌙 Árabe" },
  { id: "nicho",     label: "◆ Nicho" },
  { id: "disenador", label: "✦ Diseñador" },
];

export default function CatalogoPage() {
  const { designerDB, nichoDB, arabDB, loading } = useCatalog();
  const [activeTab, setActiveTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [gender, setGender] = useState("all");
  const [aroma, setAroma] = useState("all");
  const [brand, setBrand] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filterState = { search, sort, gender, aroma, brand };
  const filteredArab     = applyFilters(arabDB, filterState);
  const filteredNicho    = applyFilters(nichoDB, filterState);
  const filteredDesigner = applyFilters(designerDB, filterState);

  const showArab     = activeTab === "todos" || activeTab === "arabe";
  const showNicho    = activeTab === "todos" || activeTab === "nicho";
  const showDesigner = activeTab === "todos" || activeTab === "disenador";

  const allDB = [...arabDB, ...nichoDB, ...designerDB];

  return (
    <section id="catalogo" className="page-section active catalog-bg">
      <div className="container">
        <h2 className="section-title serif" style={{ marginBottom: "24px" }}>
          Nuestro Catálogo
        </h2>

        {/* Category tabs */}
        <div className="catalog-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`catalog-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button className="btn-mobile-filters" onClick={() => setSidebarOpen(true)}>
          <i className="ph ph-sliders-horizontal"></i> Mostrar Filtros
        </button>

        <div className="catalog-layout">
          <FilterSidebar
            arabDB={allDB}
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
            {showArab && (arabDB.length > 0 || loading) && (
              <div id="arab-section" style={{ marginBottom: "48px" }}>
                <div className="arab-section-header">
                  <div className="section-divider"></div>
                  <div>
                    <h3 className="serif">Perfumería Árabe</h3>
                    <p>Decants y frascos sellados disponibles</p>
                  </div>
                </div>
                {loading ? <SkeletonGrid count={8} /> : <ProductGrid perfumes={filteredArab} variant="catalog" />}
              </div>
            )}

            {showNicho && (nichoDB.length > 0 || loading) && (
              <div id="nicho-section" style={{ marginBottom: "48px" }}>
                <div className="arab-section-header">
                  <div className="section-divider"></div>
                  <div>
                    <h3 className="serif">Perfumería de Nicho</h3>
                    <p>Alta perfumería · Solo decants disponibles</p>
                  </div>
                </div>
                {loading ? <SkeletonGrid count={4} /> : <ProductGrid perfumes={filteredNicho} variant="nicho" />}
              </div>
            )}

            {showDesigner && (designerDB.length > 0 || loading) && (
              <div className="designer-section" id="designer-section">
                <div className="designer-section-header">
                  <div className="section-divider"></div>
                  <div>
                    <h3 className="serif">Perfumes de Diseñador</h3>
                    <p>Originales 100% · Solo decants disponibles</p>
                  </div>
                </div>
                {loading ? <SkeletonGrid count={4} /> : <ProductGrid perfumes={filteredDesigner} variant="designer" />}
              </div>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />
      )}
    </section>
  );
}
