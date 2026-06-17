"use client";

const AROMA_FAMILIES = [
  { value: "all", label: "Todas" },
  { value: "Dulce", label: "Dulce" },
  { value: "Fresco", label: "Fresco" },
  { value: "Amaderado", label: "Amaderado" },
  { value: "Especiado", label: "Especiado" },
  { value: "Frutal", label: "Frutal" },
  { value: "Cítrico", label: "Cítrico" },
  { value: "Oriental", label: "Oriental" },
  { value: "Almizcle", label: "Almizcle" },
];

const GENDERS = [
  { value: "all", label: "Todos" },
  { value: "Femenino", label: "Femenino" },
  { value: "Masculino", label: "Masculino" },
  { value: "Unisex", label: "Unisex" },
];

const SORTS = [
  { value: "default", label: "Por defecto" },
  { value: "popularity", label: "Popularidad" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

function getTopNotes(perfumes, limit = 16) {
  const freq = {};
  perfumes.forEach((p) => p.notes.forEach((n) => { freq[n] = (freq[n] || 0) + 1; }));
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([note]) => note);
}

export default function FilterSidebar({
  arabDB,
  search, setSearch,
  sort, setSort,
  gender, setGender,
  aroma, setAroma,
  brand, setBrand,
  note, setNote,
  open, onClose,
}) {
  const brands = [...new Set(arabDB.map((p) => p.brand))].sort();
  const topNotes = getTopNotes(arabDB);

  const countGender = (value) =>
    value === "all" ? arabDB.length : arabDB.filter((p) => p.gender === value).length;
  const countAroma = (value) =>
    value === "all" ? arabDB.length : arabDB.filter((p) => p.families.includes(value)).length;

  const handleMobileSelect = (fn) => (value) => {
    fn(value);
    if (typeof window !== "undefined" && window.innerWidth <= 768) onClose();
  };

  const selectGender = handleMobileSelect(setGender);
  const selectAroma  = handleMobileSelect(setAroma);
  const selectBrand  = handleMobileSelect(setBrand);

  return (
    <aside className={`catalog-sidebar ${open ? "open" : ""}`} id="catalog-sidebar">
      <button className="close-filters-btn" onClick={onClose}>
        <i className="ph ph-x"></i>
      </button>

      <div className="filter-section">
        <h4>Buscar</h4>
        <input
          type="text"
          className="search-input"
          placeholder="Ej. Asad, Vainilla, amaderado..."
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      <div className="filter-section">
        <h4>Ordenar Por</h4>
        <ul className="filter-list" id="sort-list">
          {SORTS.map((s) => (
            <li key={s.value} className={sort === s.value ? "active" : ""} onClick={() => setSort(s.value)}>
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <h4>Familia Olfativa</h4>
        <ul className="filter-list" id="aroma-list">
          {AROMA_FAMILIES.map((f) => (
            <li key={f.value} className={aroma === f.value ? "active" : ""} onClick={() => selectAroma(f.value)}>
              {f.label} <span className="filter-count">{countAroma(f.value)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <h4>Nota Olfativa</h4>
        <div className="brand-grid">
          <button className={`brand-btn ${!note ? "active" : ""}`} onClick={() => setNote("")}>
            Todas
          </button>
          {topNotes.map((n) => (
            <button key={n} className={`brand-btn ${note === n ? "active" : ""}`} onClick={() => setNote(note === n ? "" : n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Género</h4>
        <ul className="filter-list" id="gender-list">
          {GENDERS.map((g) => (
            <li key={g.value} className={gender === g.value ? "active" : ""} onClick={() => selectGender(g.value)}>
              {g.label} <span className="filter-count">{countGender(g.value)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <h4>Marcas</h4>
        <div className="brand-grid" id="brand-list">
          <button className={`brand-btn ${brand === "all" ? "active" : ""}`} onClick={() => selectBrand("all")}>
            Todas
          </button>
          {brands.map((b) => (
            <button key={b} className={`brand-btn ${brand === b ? "active" : ""}`} onClick={() => selectBrand(b)}>
              {b}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
