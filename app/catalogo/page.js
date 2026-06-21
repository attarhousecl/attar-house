"use client";

import { useState } from "react";
import { useCatalog } from "@/context/CatalogContext";
import FilterBar from "@/components/FilterBar";
import ProductGrid from "@/components/ProductGrid";
import SkeletonGrid from "@/components/SkeletonGrid";

// Precio más bajo realmente disponible (cualquier formato > 0). Evita que un
// perfume sin decant3 (precio 0) se cuele primero en "Menor precio".
function effectivePrice(p) {
  const candidates = [p.prices.decant3, p.prices.decant5, p.prices.decant10, p.prices.sellado].filter((v) => v > 0);
  return candidates.length ? Math.min(...candidates) : Infinity;
}

function applyFilters(perfumes, { search, sort, gender, aroma, brand, note, formato }) {
  let filtered = perfumes.filter((p) => {
    const hasSellado = p.prices.sellado > 0 && p.stock.sellado !== false;
    const hasDecant =
      (p.prices.decant3 > 0 && p.stock.decant3 !== false) ||
      (p.prices.decant5 > 0 && p.stock.decant5 !== false) ||
      (p.prices.decant10 > 0 && p.stock.decant10 !== false);
    const matchBrand = brand === "all" || p.brand === brand;
    const matchGender = gender === "all" || p.gender === gender;
    const matchAroma = aroma === "all" || p.families.includes(aroma);
    const matchNote = !note || p.notes.includes(note);
    const matchFormato = formato === "all" || (formato === "sealed" ? hasSellado : hasDecant);
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.notes.some((n) => n.toLowerCase().includes(search)) ||
      p.families.some((f) => f.toLowerCase().includes(search)) ||
      (p.description && p.description.toLowerCase().includes(search));
    return matchBrand && matchGender && matchAroma && matchNote && matchFormato && matchSearch;
  });

  if (sort === "price-asc") {
    filtered = [...filtered].sort((a, b) => effectivePrice(a) - effectivePrice(b));
  } else if (sort === "price-desc") {
    filtered = [...filtered].sort((a, b) => effectivePrice(b) - effectivePrice(a));
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
  const [note, setNote] = useState("");
  const [formato, setFormato] = useState("all");

  const filterState = { search, sort, gender, aroma, brand, note, formato };
  const filteredArab     = applyFilters(arabDB, filterState);
  const filteredNicho    = applyFilters(nichoDB, filterState);
  const filteredDesigner = applyFilters(designerDB, filterState);

  const showArab     = activeTab === "todos" || activeTab === "arabe";
  const showNicho    = activeTab === "todos" || activeTab === "nicho";
  const showDesigner = activeTab === "todos" || activeTab === "disenador";

  const allDB = [...arabDB, ...nichoDB, ...designerDB];
  const totalResults = (showArab ? filteredArab.length : 0) + (showNicho ? filteredNicho.length : 0) + (showDesigner ? filteredDesigner.length : 0);
  const noResults = !loading && allDB.length > 0 && totalResults === 0;

  function clearFilters() {
    setSearch("");
    setSort("default");
    setGender("all");
    setAroma("all");
    setBrand("all");
    setNote("");
    setFormato("all");
  }

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
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <FilterBar
          allDB={allDB}
          search={search} setSearch={setSearch}
          sort={sort} setSort={setSort}
          gender={gender} setGender={setGender}
          aroma={aroma} setAroma={setAroma}
          brand={brand} setBrand={setBrand}
          note={note} setNote={setNote}
          formato={formato} setFormato={setFormato}
          totalResults={totalResults}
        />

        {showArab && (loading || filteredArab.length > 0) && (
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

        {showNicho && (loading || filteredNicho.length > 0) && (
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

        {showDesigner && (loading || filteredDesigner.length > 0) && (
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

        {noResults && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔍</div>
            <p style={{ marginBottom: "20px" }}>No encontramos perfumes con esos filtros.</p>
            <button
              onClick={clearFilters}
              style={{ background: "transparent", border: "1px solid var(--gold-primary)", color: "var(--gold-primary)", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.8rem" }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
