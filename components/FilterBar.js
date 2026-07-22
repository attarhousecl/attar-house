"use client";

import { useState, useRef, useEffect } from "react";

const AROMA_FAMILIES = [
  "Dulce", "Gourmand", "Fresco", "Cítrico",
  "Amaderado", "Especiado", "Oriental", "Frutal",
  "Floral", "Aromático", "Almizcle",
];

const GENDERS = ["Femenino", "Masculino", "Unisex"];

const SORTS = [
  { value: "default",    label: "Relevancia" },
  { value: "popularity", label: "Popularidad" },
  { value: "price-asc",  label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
];

const FORMATOS = [
  { value: "all",    label: "Todos los formatos" },
  { value: "sealed", label: "Con frasco sellado" },
  { value: "decant", label: "Solo decants" },
];

function getTopBrands(db) {
  return [...new Set(db.map((p) => p.brand))].sort();
}

// En desktop el menú es un dropdown pegado al botón; en móvil (CSS) el mismo
// panel se presenta como bottom-sheet fijo, alcanzable con el pulgar.
function Dropdown({ title, active, children, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    // Solo el dropdown ABIERTO escucha clics afuera. Si todos escucharan,
    // al hacer clic (mouse real) en una opción los demás lo detectan como
    // "clic afuera" y cierran el menú en el mousedown, antes de que el click
    // aplique el filtro — haciendo que los filtros parezcan "de adorno".
    if (!active) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, onClose]);

  return (
    <div ref={ref} className="fbar-item">
      {children}
    </div>
  );
}

function DropPanel({ title, onClose, children, scrollable = false }) {
  return (
    <div className={`fbar-drop ${scrollable ? "fbar-drop-scroll" : ""}`} role="listbox">
      <div className="fbar-drop-head">
        <span>{title}</span>
        <button type="button" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>
      {children}
    </div>
  );
}

export default function FilterBar({
  allDB,
  search, setSearch,
  sort, setSort,
  gender, setGender,
  aroma, setAroma,
  brand, setBrand,
  note, setNote,
  formato, setFormato,
  totalResults,
}) {
  const [open, setOpen] = useState(null);
  const brands = getTopBrands(allDB);

  const toggle = (name) => setOpen((prev) => (prev === name ? null : name));
  const close = () => setOpen(null);

  const activeCount = [
    sort !== "default",
    gender !== "all",
    aroma !== "all",
    brand !== "all",
    !!note,
    formato !== "all",
  ].filter(Boolean).length;

  // Chips de filtros activos, removibles uno a uno.
  const chips = [
    search && { label: `“${search}”`, clear: () => setSearch("") },
    sort !== "default" && { label: SORTS.find((s) => s.value === sort)?.label, clear: () => setSort("default") },
    gender !== "all" && { label: gender, clear: () => setGender("all") },
    aroma !== "all" && { label: aroma, clear: () => setAroma("all") },
    brand !== "all" && { label: brand, clear: () => setBrand("all") },
    note && { label: note, clear: () => setNote("") },
    formato !== "all" && { label: FORMATOS.find((f) => f.value === formato)?.label, clear: () => setFormato("all") },
  ].filter(Boolean);

  function clearAll() {
    setSort("default");
    setGender("all");
    setAroma("all");
    setBrand("all");
    setNote("");
    setSearch("");
    setFormato("all");
    close();
  }

  return (
    <div className="fbar">
      {/* Search */}
      <input
        type="text"
        className="fbar-search"
        placeholder="🔍  Buscar perfume, marca, nota..."
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
        aria-label="Buscar en el catálogo"
      />

      {/* Velo tras el bottom-sheet (solo visible en móvil vía CSS) */}
      {open && <div className="fbar-backdrop" onClick={close} aria-hidden="true" />}

      {/* Fila de filtros: wrap en desktop, scroll horizontal en móvil */}
      <div className="fbar-row">
        <Dropdown active={open === "sort"} onClose={close}>
          <button type="button" className={`fbar-btn ${sort !== "default" ? "on" : ""}`} onClick={() => toggle("sort")} aria-haspopup="listbox" aria-expanded={open === "sort"}>
            {SORTS.find(s => s.value === sort)?.label || "Ordenar"} <span className="fbar-caret">▼</span>
          </button>
          {open === "sort" && (
            <DropPanel title="Ordenar por" onClose={close}>
              {SORTS.map((s) => (
                <button type="button" key={s.value} className={`fbar-opt ${sort === s.value ? "on" : ""}`} onClick={() => { setSort(s.value); close(); }}>
                  {s.label}
                </button>
              ))}
            </DropPanel>
          )}
        </Dropdown>

        <Dropdown active={open === "gender"} onClose={close}>
          <button type="button" className={`fbar-btn ${gender !== "all" ? "on" : ""}`} onClick={() => toggle("gender")} aria-haspopup="listbox" aria-expanded={open === "gender"}>
            {gender !== "all" ? gender : "Género"} <span className="fbar-caret">▼</span>
          </button>
          {open === "gender" && (
            <DropPanel title="Género" onClose={close}>
              <button type="button" className={`fbar-opt ${gender === "all" ? "on" : ""}`} onClick={() => { setGender("all"); close(); }}>Todos</button>
              {GENDERS.map((g) => (
                <button type="button" key={g} className={`fbar-opt ${gender === g ? "on" : ""}`} onClick={() => { setGender(g); close(); }}>{g}</button>
              ))}
            </DropPanel>
          )}
        </Dropdown>

        <Dropdown active={open === "aroma"} onClose={close}>
          <button type="button" className={`fbar-btn ${aroma !== "all" ? "on" : ""}`} onClick={() => toggle("aroma")} aria-haspopup="listbox" aria-expanded={open === "aroma"}>
            {aroma !== "all" ? aroma : "Familia olfativa"} <span className="fbar-caret">▼</span>
          </button>
          {open === "aroma" && (
            <DropPanel title="Familia olfativa" onClose={close}>
              <button type="button" className={`fbar-opt ${aroma === "all" ? "on" : ""}`} onClick={() => { setAroma("all"); close(); }}>Todas</button>
              {AROMA_FAMILIES.map((f) => (
                <button type="button" key={f} className={`fbar-opt ${aroma === f ? "on" : ""}`} onClick={() => { setAroma(f); close(); }}>{f}</button>
              ))}
            </DropPanel>
          )}
        </Dropdown>

        <Dropdown active={open === "brand"} onClose={close}>
          <button type="button" className={`fbar-btn ${brand !== "all" ? "on" : ""}`} onClick={() => toggle("brand")} aria-haspopup="listbox" aria-expanded={open === "brand"}>
            {brand !== "all" ? brand : "Marca"} <span className="fbar-caret">▼</span>
          </button>
          {open === "brand" && (
            <DropPanel title="Marca" onClose={close} scrollable>
              <button type="button" className={`fbar-opt ${brand === "all" ? "on" : ""}`} onClick={() => { setBrand("all"); close(); }}>Todas</button>
              {brands.map((b) => (
                <button type="button" key={b} className={`fbar-opt ${brand === b ? "on" : ""}`} onClick={() => { setBrand(b); close(); }}>{b}</button>
              ))}
            </DropPanel>
          )}
        </Dropdown>

        <Dropdown active={open === "formato"} onClose={close}>
          <button type="button" className={`fbar-btn ${formato !== "all" ? "on" : ""}`} onClick={() => toggle("formato")} aria-haspopup="listbox" aria-expanded={open === "formato"}>
            {formato !== "all" ? FORMATOS.find((f) => f.value === formato)?.label : "Formato"} <span className="fbar-caret">▼</span>
          </button>
          {open === "formato" && (
            <DropPanel title="Formato" onClose={close}>
              {FORMATOS.map((f) => (
                <button type="button" key={f.value} className={`fbar-opt ${formato === f.value ? "on" : ""}`} onClick={() => { setFormato(f.value); close(); }}>
                  {f.label}
                </button>
              ))}
            </DropPanel>
          )}
        </Dropdown>

        {/* Resultados + limpiar (a la derecha en desktop, bajo la fila en móvil) */}
        <div className="fbar-meta">
          {totalResults != null && (
            <span className="fbar-count mono">
              {totalResults} resultado{totalResults !== 1 ? "s" : ""}
            </span>
          )}
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="fbar-clear">
              ✕ Limpiar filtros ({activeCount})
            </button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="fbar-chips">
          {chips.map((c, i) => (
            <button
              type="button"
              key={i}
              onClick={c.clear}
              aria-label={`Quitar filtro ${c.label}`}
              className="fbar-chip"
            >
              {c.label} <span aria-hidden="true">✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
