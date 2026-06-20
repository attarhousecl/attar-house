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
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    background: isActive ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${isActive ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "8px",
    color: isActive ? "#d4af37" : "#aaa",
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
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "6px",
    zIndex: 200,
    minWidth: "180px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  };

  const optStyle = (isActive) => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 12px",
    background: isActive ? "rgba(212,175,55,0.12)" : "transparent",
    color: isActive ? "#d4af37" : "#ccc",
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
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "10px 16px",
            color: "#e0e0e0",
            fontSize: "0.88rem",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Dropdowns row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>

        {/* Ordenar */}
        <Dropdown label="Ordenar" active={open === "sort"} onClose={close}>
          <button style={btnStyle(sort !== "default")} onClick={() => toggle("sort")}>
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
          <button style={btnStyle(gender !== "all")} onClick={() => toggle("gender")}>
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
          <button style={btnStyle(aroma !== "all")} onClick={() => toggle("aroma")}>
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
          <button style={btnStyle(brand !== "all")} onClick={() => toggle("brand")}>
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
          <button style={btnStyle(formato !== "all")} onClick={() => toggle("formato")}>
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
            <span style={{ fontSize: "0.75rem", color: "#555" }}>
              {totalResults} resultado{totalResults !== 1 ? "s" : ""}
            </span>
          )}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              style={{ background: "none", border: "none", color: "#c0392b", fontSize: "0.75rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontFamily: "inherit" }}
            >
              ✕ Limpiar filtros ({activeCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
