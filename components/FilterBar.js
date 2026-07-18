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

function Dropdown({ label, active, children, onClose }) {
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
    <div ref={ref} style={{ position: "relative" }}>
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

  const btnStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: isActive ? "rgba(var(--accent-rgb), 0.15)" : "rgba(var(--ink-rgb), 0.04)",
    border: `1px solid ${isActive ? "rgba(var(--accent-rgb), 0.5)" : "rgba(var(--ink-rgb), 0.1)"}`,
    borderRadius: "8px",
    color: isActive ? "var(--accent)" : "var(--text-muted)",
    fontSize: "0.8rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
    fontFamily: "inherit",
    letterSpacing: "0.3px",
  });

  const dropStyle = {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    background: "#141414",
    border: "1px solid rgba(var(--ink-rgb), 0.12)",
    borderRadius: "10px",
    padding: "6px",
    zIndex: 200,
    minWidth: "180px",
    boxShadow: "0 8px 32px rgba(var(--shadow-rgb), 0.6)",
  };

  const optStyle = (isActive) => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 12px",
    background: isActive ? "rgba(var(--accent-rgb), 0.12)" : "transparent",
    color: isActive ? "var(--accent)" : "var(--text-muted)",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.82rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  });

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Search */}
      <div style={{ marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="🔍  Buscar perfume, marca, nota..."
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          aria-label="Buscar en el catálogo"
          style={{
            width: "100%",
            background: "rgba(var(--ink-rgb), 0.04)",
            border: "1px solid rgba(var(--ink-rgb), 0.1)",
            borderRadius: "10px",
            padding: "10px 16px",
            color: "var(--text-main)",
            fontSize: "0.88rem",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Dropdowns row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>

        {/* Ordenar */}
        <Dropdown label="Ordenar" active={open === "sort"} onClose={close}>
          <button style={btnStyle(sort !== "default")} onClick={() => toggle("sort")} aria-haspopup="listbox" aria-expanded={open === "sort"}>
            {SORTS.find(s => s.value === sort)?.label || "Ordenar"} <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▼</span>
          </button>
          {open === "sort" && (
            <div style={dropStyle}>
              {SORTS.map((s) => (
                <button key={s.value} style={optStyle(sort === s.value)} onClick={() => { setSort(s.value); close(); }}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Género */}
        <Dropdown label="Género" active={open === "gender"} onClose={close}>
          <button style={btnStyle(gender !== "all")} onClick={() => toggle("gender")} aria-haspopup="listbox" aria-expanded={open === "gender"}>
            {gender !== "all" ? gender : "Género"} <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▼</span>
          </button>
          {open === "gender" && (
            <div style={dropStyle}>
              <button style={optStyle(gender === "all")} onClick={() => { setGender("all"); close(); }}>Todos</button>
              {GENDERS.map((g) => (
                <button key={g} style={optStyle(gender === g)} onClick={() => { setGender(g); close(); }}>{g}</button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Familia Olfativa */}
        <Dropdown label="Familia" active={open === "aroma"} onClose={close}>
          <button style={btnStyle(aroma !== "all")} onClick={() => toggle("aroma")} aria-haspopup="listbox" aria-expanded={open === "aroma"}>
            {aroma !== "all" ? aroma : "Familia olfativa"} <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▼</span>
          </button>
          {open === "aroma" && (
            <div style={dropStyle}>
              <button style={optStyle(aroma === "all")} onClick={() => { setAroma("all"); close(); }}>Todas</button>
              {AROMA_FAMILIES.map((f) => (
                <button key={f} style={optStyle(aroma === f)} onClick={() => { setAroma(f); close(); }}>{f}</button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Marca */}
        <Dropdown label="Marca" active={open === "brand"} onClose={close}>
          <button style={btnStyle(brand !== "all")} onClick={() => toggle("brand")} aria-haspopup="listbox" aria-expanded={open === "brand"}>
            {brand !== "all" ? brand : "Marca"} <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▼</span>
          </button>
          {open === "brand" && (
            <div style={{ ...dropStyle, maxHeight: "260px", overflowY: "auto" }}>
              <button style={optStyle(brand === "all")} onClick={() => { setBrand("all"); close(); }}>Todas</button>
              {brands.map((b) => (
                <button key={b} style={optStyle(brand === b)} onClick={() => { setBrand(b); close(); }}>{b}</button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Formato */}
        <Dropdown label="Formato" active={open === "formato"} onClose={close}>
          <button style={btnStyle(formato !== "all")} onClick={() => toggle("formato")} aria-haspopup="listbox" aria-expanded={open === "formato"}>
            {formato !== "all" ? FORMATOS.find((f) => f.value === formato)?.label : "Formato"} <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▼</span>
          </button>
          {open === "formato" && (
            <div style={dropStyle}>
              {FORMATOS.map((f) => (
                <button key={f.value} style={optStyle(formato === f.value)} onClick={() => { setFormato(f.value); close(); }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Separador + resultados + limpiar */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
          {totalResults != null && (
            <span style={{ fontSize: "0.75rem", color: "#999" }}>
              {totalResults} resultado{totalResults !== 1 ? "s" : ""}
            </span>
          )}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              style={{ background: "none", border: "none", color: "#999", fontSize: "0.75rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontFamily: "inherit" }}
            >
              ✕ Limpiar filtros ({activeCount})
            </button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
          {chips.map((c, i) => (
            <button
              key={i}
              onClick={c.clear}
              aria-label={`Quitar filtro ${c.label}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(var(--accent-rgb), 0.12)", border: "1px solid rgba(var(--accent-rgb), 0.4)",
                color: "var(--accent)", borderRadius: "16px", padding: "4px 10px",
                fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.3px",
              }}
            >
              {c.label} <span style={{ fontSize: "0.85rem", lineHeight: 1, opacity: 0.8 }}>✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
