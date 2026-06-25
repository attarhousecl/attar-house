"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const initialForm = {
  id: "",
  name: "",
  brand: "",
  gender: "Masculino",
  inspiration: "",
  image: "",
  notes: "",
  families: "",
  popularity: 85,
  bottle: "bottle-asad",
  desc: "",
  pSellado: 0,
  pD10: 5000,
  pD5: 3000,
  pD3: 2000,
  sSellado: false,
  sD10: true,
  sD5: true,
  sD3: true,
  sLow: false,
};

function generarDescripcion({ name, brand, gender, inspiration, notes, families }) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const adj = gender === "Femenino" ? "femenino" : gender === "Masculino" ? "masculino" : "unisex";
  const para = gender === "Femenino" ? "ella" : gender === "Masculino" ? "él" : "quien lo porte";

  const aperturas = [
    `${brand} presenta ${name}, una fragancia ${adj} de carácter inconfundible.`,
    `${name} de ${brand} es una fragancia ${adj} que despierta los sentidos desde el primer instante.`,
    `Una creación ${adj} de ${brand}, ${name} despliega una firma olfativa que perdura en la memoria.`,
    `${name} es la apuesta de ${brand} por una fragancia ${adj} envolvente y profunda.`,
  ];
  let desc = pick(aperturas) + " ";

  if (notes.length >= 4) {
    const inicio = notes.slice(0, 2).join(" y ");
    const corazon = notes.slice(2, -1).join(", ");
    const fondo = notes[notes.length - 1];
    const puentes = [
      `Su apertura vibra con notas de ${inicio}; el corazón evoluciona con ${corazon} y se asienta en un fondo de ${fondo}.`,
      `Comienza con ${inicio}, transita por ${corazon} y cierra con la profundidad de ${fondo}.`,
      `Las notas de ${inicio} abren paso a un corazón de ${corazon}, dejando como huella ${fondo}.`,
    ];
    desc += pick(puentes) + " ";
  } else if (notes.length >= 2) {
    const notaStr = notes.slice(0, -1).join(", ") + " y " + notes[notes.length - 1];
    desc +=
      pick([
        `Sus notas de ${notaStr} crean una experiencia olfativa memorable.`,
        `Una mezcla de ${notaStr} que resulta cautivadora desde la primera aplicación.`,
      ]) + " ";
  } else if (notes.length === 1) {
    desc += `El ${notes[0]} es el alma de esta fragancia. `;
  }

  if (families.length) {
    const famStr = families.slice(0, 2).map((f) => f.toLowerCase()).join(" y ");
    desc +=
      pick([
        `De carácter ${famStr}, es ideal para ${para}.`,
        `Su perfil ${famStr} lo convierte en una elección perfecta para ${para}.`,
        `Una fragancia ${famStr} que se adapta a cualquier momento del día.`,
      ]) + " ";
  }

  if (inspiration === "Diseñador Original") {
    desc += pick([
      `Un clásico de diseñador que se convierte en segunda piel.`,
      `La elegancia de un diseñador que nunca pasa de moda.`,
      `Sofisticación pura, directo del mundo de la alta perfumería.`,
    ]);
  } else if (inspiration) {
    desc += pick([
      `Una interpretación que captura la esencia de ${inspiration} con personalidad propia.`,
      `Inspirado en ${inspiration}, con una identidad que lo hace único.`,
      `Evoca la magia de ${inspiration} a un precio accesible, sin sacrificar calidad.`,
    ]);
  } else {
    desc += pick([
      `Una joya de la perfumería árabe que deja una estela memorable.`,
      `El arte de la perfumería árabe en su máxima expresión.`,
      `Tradición oriental con un toque contemporáneo irresistible.`,
    ]);
  }

  return desc.trim();
}

export default function AdminClient() {
  // Cliente Supabase ligado a la SESIÓN del admin logueado (rol `authenticated`).
  // Ya NO se usa la service_role en el navegador: todas las operaciones pasan
  // por las políticas RLS atadas a tu usuario.
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  );
  const [checking, setChecking] = useState(true);

  const [db, setDb] = useState([]);
  const [dbError, setDbError] = useState("");
  const [loadingDb, setLoadingDb] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("stock");
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [savingIds, setSavingIds] = useState({});

  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [genShown, setGenShown] = useState("generar");
  const [genHint, setGenHint] = useState({ text: "Completa nombre, marca y notas primero.", color: "#555" });
  const [fragStatus, setFragStatus] = useState({ text: "", color: "#666" });
  const [fragLoading, setFragLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    let active = true;
    // Verifica la sesión. El middleware (proxy.js) ya protege /admin en el
    // servidor; esto es defensa en profundidad en el cliente.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [supabase, router]);

  const showToast = useCallback((text, error = false) => {
    setToastMsg({ text, error });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const cargarCatalogo = useCallback(async () => {
    setLoadingDb(true);
    setDbError("");
    try {
      const { data, error } = await supabase
        .from("perfumes")
        .select("*")
        .order("popularity", { ascending: false });
      if (error) throw error;
      setDb(data || []);
    } catch (e) {
      setDbError(e.message);
      showToast("Error al cargar", true);
    } finally {
      setLoadingDb(false);
    }
  }, [supabase, showToast]);

  useEffect(() => {
    if (!checking) cargarCatalogo();
  }, [checking, cargarCatalogo]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    location.href = "/admin/login";
  }

  async function toggleStock(id, campo) {
    const p = db.find((x) => x.id === id);
    if (!p) return;
    const nuevoValor = !p[campo];
    setSavingIds((s) => ({ ...s, [id]: "saving" }));
    try {
      const { error } = await supabase.from("perfumes").update({ [campo]: nuevoValor }).eq("id", id);
      if (error) throw error;
      setDb((prev) => prev.map((x) => (x.id === id ? { ...x, [campo]: nuevoValor } : x)));
      setSavingIds((s) => ({ ...s, [id]: "ok" }));
      showToast(`✓ ${p.name} actualizado`);
      setTimeout(() => setSavingIds((s) => { const n = { ...s }; delete n[id]; return n; }), 1500);
    } catch (e) {
      setSavingIds((s) => ({ ...s, [id]: "error" }));
      showToast(`Error: ${e.message}`, true);
      setTimeout(() => setSavingIds((s) => { const n = { ...s }; delete n[id]; return n; }), 2000);
    }
  }

  async function eliminarPerfume(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}" del catálogo?\nEsta acción no se puede deshacer.`)) return;
    try {
      const { error } = await supabase.from("perfumes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => prev.filter((x) => x.id !== id));
      showToast(`🗑 ${nombre} eliminado`);
    } catch (e) {
      showToast(`Error al eliminar: ${e.message}`, true);
    }
  }

  function limpiarForm() {
    setForm(initialForm);
    setFragStatus({ text: "", color: "#666" });
    setGenShown("generar");
    setGenHint({ text: "Completa nombre, marca y notas primero.", color: "#555" });
    setSelectedPreset(null);
    setFormStatus("");
  }

  async function agregarPerfume() {
    const id = form.id.trim().toLowerCase().replace(/\s+/g, "-");
    const name = form.name.trim();
    const brand = form.brand.trim();
    if (!id || !name || !brand) {
      showToast("⚠ Completa al menos ID, nombre y marca", true);
      return;
    }
    if (db.find((p) => p.id === id)) {
      showToast("⚠ Ya existe un perfume con ese ID", true);
      return;
    }

    const notasRaw = form.notes.trim();
    const famsRaw = form.families.trim();

    const nuevo = {
      id,
      brand,
      name,
      gender: form.gender,
      image_url: form.image.trim(),
      bottle_class: form.bottle,
      notes: notasRaw ? notasRaw.split(",").map((s) => s.trim()) : [],
      families: famsRaw ? famsRaw.split(",").map((s) => s.trim()) : [],
      popularity: parseInt(form.popularity) || 0,
      inspiration: form.inspiration.trim(),
      description: form.desc.trim(),
      price_sellado: parseInt(form.pSellado) || 0,
      price_decant10: parseInt(form.pD10) || 0,
      price_decant5: parseInt(form.pD5) || 0,
      price_decant3: parseInt(form.pD3) || 0,
      stock_sellado: form.sSellado,
      stock_decant10: form.sD10,
      stock_decant5: form.sD5,
      stock_decant3: form.sD3,
      stock_low: form.sLow,
    };

    setFormStatus("⏳ Guardando en Supabase...");
    try {
      const { error } = await supabase.from("perfumes").insert(nuevo);
      if (error) throw error;
      setDb((prev) => [...prev, nuevo]);
      showToast(`✓ "${name}" guardado en Supabase`);
      limpiarForm();
      setActiveTab("stock");
    } catch (e) {
      setFormStatus("");
      showToast(`Error: ${e.message}`, true);
    }
  }

  function generarYPoner() {
    if (!form.name.trim() || !form.brand.trim()) {
      setGenHint({ text: "⚠ Completa al menos nombre y marca.", color: "#c0392b" });
      return;
    }
    const notes = form.notes.split(",").map((s) => s.trim()).filter(Boolean);
    const families = form.families.split(",").map((s) => s.trim()).filter(Boolean);
    const desc = generarDescripcion({
      name: form.name.trim(),
      brand: form.brand.trim(),
      gender: form.gender,
      inspiration: form.inspiration.trim(),
      notes,
      families,
    });
    setForm((f) => ({ ...f, desc }));
    setGenShown("regen");
    setGenHint({ text: "Puedes editar el texto directamente o regenerar.", color: "#555" });
  }

  function setInspiracion(val) {
    setForm((f) => ({ ...f, inspiration: val }));
    setSelectedPreset(val);
  }

  async function buscarEnWeb() {
    const name = form.name.trim();
    const brand = form.brand.trim();
    if (!name || !brand) {
      showToast("⚠ Escribe primero el nombre y la marca", true);
      return;
    }
    setFragStatus({ text: "⏳ Buscando información...", color: "#888" });
    setFragLoading(true);

    try {
      const res = await fetch(`/api/perfume-data?name=${encodeURIComponent(name)}&brand=${encodeURIComponent(brand)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      const filled = [];
      const updates = {};
      if (data.name) { updates.name = data.name; filled.push("nombre"); }
      if (data.brand) { updates.brand = data.brand; filled.push("marca"); }
      if (data.gender) { updates.gender = data.gender; filled.push("género"); }
      if (data.description) { updates.desc = data.description; filled.push("descripción"); }
      if (data.notes?.length) { updates.notes = data.notes.join(", "); filled.push(`${data.notes.length} notas`); }
      if (data.families?.length) { updates.families = data.families.join(", "); filled.push(`${data.families.length} familias`); }

      if (updates.brand && updates.name) {
        updates.id = (updates.brand + "-" + updates.name)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      setForm((f) => ({ ...f, ...updates }));
      setFragStatus({ text: `✓ Datos cargados: ${filled.join(", ")}. Revisa y completa precio y stock.`, color: "#27ae60" });
      showToast("✓ Datos cargados");
    } catch (e) {
      setFragStatus({ text: `✗ Error: ${e.message}`, color: "#c0392b" });
      showToast("Error al buscar datos", true);
    } finally {
      setFragLoading(false);
    }
  }

  const listaFiltrada = () => {
    const b = busqueda.toLowerCase();
    return db.filter((p) => {
      const families = Array.isArray(p.families) ? p.families : [];
      const notes = Array.isArray(p.notes) ? p.notes : [];
      const matchSearch =
        !b ||
        p.name.toLowerCase().includes(b) ||
        p.brand.toLowerCase().includes(b) ||
        families.some((f) => f.toLowerCase().includes(b)) ||
        notes.some((n) => n.toLowerCase().includes(b));
      const isAgotado = !p.stock_sellado && !p.stock_decant10 && !p.stock_decant5 && !p.stock_decant3;
      const isDis = p.inspiration === "Diseñador Original";
      if (filtro === "agotados") return matchSearch && isAgotado;
      if (filtro === "disponibles") return matchSearch && !isAgotado;
      if (filtro === "disenador") return matchSearch && isDis;
      if (filtro === "arabe") return matchSearch && !isDis;
      return matchSearch;
    });
  };

  const total = db.length;
  const agotados = db.filter((p) => !p.stock_sellado && !p.stock_decant10 && !p.stock_decant5 && !p.stock_decant3).length;
  const dis = db.filter((p) => p.inspiration === "Diseñador Original").length;
  const ara = total - dis;
  const items = listaFiltrada();

  if (checking) return null;

  return (
    <div className="admin-page">
      <div id="app">
        <header>
          <h1>⚗ Attar House Admin <span style={{fontSize:"0.55rem",background:"#d4af37",color:"#000",borderRadius:"4px",padding:"2px 6px",verticalAlign:"middle",fontWeight:"700"}}>v7</span></h1>
          <div className="header-right">
            <span className="conn-dot"></span>
            <span className="conn-label">Conectado</span>
            <button className="btn-disconnect" onClick={cerrarSesion} style={{ borderColor: "#c0392b", color: "#c0392b" }}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <div style={{ display: "flex", flexWrap: "wrap", borderBottom: "1px solid #2a2a2a", background: "#111", padding: "0 24px" }}>
          {[
            { label: "📦 Stock", action: () => setActiveTab("stock"), active: activeTab === "stock" },
            { label: "➕ Agregar", action: () => setActiveTab("agregar"), active: activeTab === "agregar" },
            { label: "📋 Pedidos", action: () => router.push("/admin/pedidos"), active: false },
            { label: "💰 Contabilidad", action: () => router.push("/admin/contabilidad"), active: false },
            { label: "🎯 Objetivos", action: () => router.push("/admin/objetivos"), active: false },
            { label: "🏷️ Etiquetas", action: () => router.push("/admin/etiquetas"), active: false },
            { label: "📸 Estudio Fotográfico", action: () => router.push("/admin/estudio"), active: false },
            { label: "🎨 Publicidad", action: () => router.push("/admin/publicidad"), active: false },
          ].map(({ label, action, active }) => (
            <div
              key={label}
              onClick={action}
              style={{
                padding: "13px 14px",
                cursor: "pointer",
                fontSize: "0.78rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                color: active ? "#d4af37" : "#666",
                borderBottom: active ? "2px solid #d4af37" : "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#d4af37"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#666"; }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="content">
          <div className={`panel ${activeTab === "stock" ? "active" : ""}`}>
            <div className="stats-bar">
              <div className="stat">
                <strong>{total}</strong>Total
              </div>
              <div className="stat">
                <strong>{ara}</strong>Árabes
              </div>
              <div className="stat">
                <strong>{dis}</strong>Diseñador
              </div>
              <div className="stat red">
                <strong>{agotados}</strong>Agotados
              </div>
              <div className="stat green">
                <strong>{total - agotados}</strong>Disponibles
              </div>
            </div>

            <input
              className="search-bar"
              type="text"
              placeholder="🔍  Buscar por nombre, marca o familia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="quick-filters">
              <span className={`qf ${filtro === "todos" ? "active" : ""}`} onClick={() => setFiltro("todos")}>
                Todos
              </span>
              <span className={`qf ${filtro === "agotados" ? "active" : ""}`} onClick={() => setFiltro("agotados")}>
                ⛔ Agotados
              </span>
              <span className={`qf ${filtro === "disponibles" ? "active" : ""}`} onClick={() => setFiltro("disponibles")}>
                ✅ Disponibles
              </span>
              <span className={`qf ${filtro === "disenador" ? "active" : ""}`} onClick={() => setFiltro("disenador")}>
                ✦ Diseñador
              </span>
              <span className={`qf ${filtro === "arabe" ? "active" : ""}`} onClick={() => setFiltro("arabe")}>
                🌙 Árabe
              </span>
            </div>

            <div className="perfume-list">
              {loadingDb && (
                <div className="loading-list">
                  <div className="spinner"></div>Cargando catálogo...
                </div>
              )}
              {!loadingDb && dbError && <p style={{ color: "#c0392b", textAlign: "center", padding: "40px" }}>{dbError}</p>}
              {!loadingDb && !dbError && items.length === 0 && (
                <p style={{ color: "#555", textAlign: "center", padding: "40px" }}>Sin resultados.</p>
              )}
              {!loadingDb &&
                !dbError &&
                items.map((p) => {
                  const isAgotado = !p.stock_sellado && !p.stock_decant10 && !p.stock_decant5 && !p.stock_decant3;
                  const isDis = p.inspiration === "Diseñador Original";
                  const p3 = p.price_decant3 ? `$${p.price_decant3.toLocaleString("es-CL")} dec.3ml` : "";
                  const ps = p.price_sellado ? ` · $${p.price_sellado.toLocaleString("es-CL")} sell.` : "";
                  const saving = savingIds[p.id];
                  return (
                    <div className={`p-card ${isAgotado ? "agotado" : "disponible"}`} key={p.id}>
                      <div className="p-info">
                        <h3>
                          {p.brand} — {p.name}
                        </h3>
                        <div className="p-meta">
                          <span>{p.gender}</span>
                          {isDis ? <span className="badge-d">✦ Diseñador</span> : <span>🌙 Árabe</span>}
                        </div>
                        <div className="stock-row">
                          <span className="stock-label">Stock:</span>
                          {!isDis && (
                            <button className={`toggle-btn ${p.stock_sellado ? "on" : "off"}`} onClick={() => toggleStock(p.id, "stock_sellado")} disabled={saving === "saving"}>
                              Sellado
                            </button>
                          )}
                          <button className={`toggle-btn ${p.stock_decant10 ? "on" : "off"}`} onClick={() => toggleStock(p.id, "stock_decant10")} disabled={saving === "saving"}>
                            10ml
                          </button>
                          <button className={`toggle-btn ${p.stock_decant5 ? "on" : "off"}`} onClick={() => toggleStock(p.id, "stock_decant5")} disabled={saving === "saving"}>
                            5ml
                          </button>
                          <button className={`toggle-btn ${p.stock_decant3 ? "on" : "off"}`} onClick={() => toggleStock(p.id, "stock_decant3")} disabled={saving === "saving"}>
                            3ml
                          </button>
                          {saving && (
                            <span className="saving-label show">
                              {saving === "saving" ? "Guardando..." : saving === "ok" ? "✓ Guardado" : "✗ Error"}
                            </span>
                          )}
                        </div>
                        <div className="stock-row" style={{ marginTop: "6px" }}>
                          <span className="stock-label">Urgencia:</span>
                          <button className={`toggle-btn ${p.stock_low ? "on" : "off"}`} onClick={() => toggleStock(p.id, "stock_low")} disabled={saving === "saving"} title="Muestra el badge ⚡ Últimas unidades en la tienda">
                            ⚡ Últimas unidades
                          </button>
                        </div>
                      </div>
                      <div className="p-actions">
                        <div className="price-hint">
                          {p3}
                          {ps}
                        </div>
                        <button className="btn-del" onClick={() => eliminarPerfume(p.id, p.name)}>
                          🗑 Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className={`panel ${activeTab === "agregar" ? "active" : ""}`}>
            <div className="frag-box">
              <label>🔍 Autocompletar datos desde la web</label>
              <p style={{ fontSize: "0.78rem", color: "#8080c0", marginBottom: "10px", lineHeight: "1.5" }}>
                Escribe el nombre y la marca abajo, luego haz clic en el botón para autocompletar notas, familias, género y descripción.
              </p>
              <button className="btn-frag" onClick={buscarEnWeb} disabled={fragLoading} style={{ width: "100%" }}>
                {fragLoading ? "⏳ Buscando..." : "✦ Buscar en web"}
              </button>
              {fragStatus.text && (
                <p style={{ fontSize: "0.75rem", color: fragStatus.color, marginTop: "8px", lineHeight: "1.5" }}>{fragStatus.text}</p>
              )}
            </div>

            <div className="section-title">Datos del perfume</div>
            <div className="form-grid">
              <div className="form-group">
                <label>ID único (sin espacios)</label>
                <input type="text" placeholder="ej. khamrah-black" value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" placeholder="ej. Khamrah Black" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Marca</label>
                <input type="text" placeholder="ej. Lattafa" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Género</label>
                <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Unisex</option>
                </select>
              </div>
              <div className="form-group">
                <label>Inspirado en</label>
                <input
                  type="text"
                  placeholder="ej. Tom Ford Tobacco Vanille"
                  value={form.inspiration}
                  onChange={(e) => setForm((f) => ({ ...f, inspiration: e.target.value }))}
                />
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  <button type="button" className={`preset-btn ${selectedPreset === "Diseñador Original" ? "selected" : ""}`} onClick={() => setInspiracion("Diseñador Original")}>
                    ✦ Diseñador Original
                  </button>
                  <button type="button" className={`preset-btn ${selectedPreset === "Nicho" ? "selected" : ""}`} onClick={() => setInspiracion("Nicho")}>
                    ◆ Nicho
                  </button>
                  <button type="button" className={`preset-btn ${selectedPreset === "" ? "selected" : ""}`} onClick={() => setInspiracion("")}>
                    🌙 Árabe (sin inspiración)
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Imagen (nombre del archivo)</label>
                <input type="text" placeholder="ej. khamrah-black.png" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Notas olfativas (separar con coma)</label>
                <input type="text" placeholder="ej. Tabaco, Vainilla, Cuero" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Familias (separar con coma)</label>
                <input type="text" placeholder="ej. Dulce, Especiado" value={form.families} onChange={(e) => setForm((f) => ({ ...f, families: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Popularidad (1-100)</label>
                <input type="number" min="1" max="100" value={form.popularity} onChange={(e) => setForm((f) => ({ ...f, popularity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Botella (fallback visual)</label>
                <select value={form.bottle} onChange={(e) => setForm((f) => ({ ...f, bottle: e.target.value }))}>
                  <option value="bottle-asad">bottle-asad (dorada)</option>
                  <option value="bottle-brun">bottle-brun (marrón)</option>
                  <option value="bottle-club">bottle-club (oscura)</option>
                </select>
              </div>
              <div className="form-group full">
                <label>Descripción</label>
                <textarea rows={4} placeholder="Descripción detallada del perfume..." value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}></textarea>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                  {genShown === "generar" && (
                    <button type="button" className="btn-gen" onClick={generarYPoner}>
                      ✨ Generar descripción
                    </button>
                  )}
                  {genShown === "regen" && (
                    <button type="button" className="btn-gen regen" onClick={generarYPoner}>
                      🔄 Regenerar
                    </button>
                  )}
                  <span style={{ fontSize: "0.72rem", color: genHint.color }}>{genHint.text}</span>
                </div>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: "22px" }}>
              Precios
            </div>
            <div className="price-grid">
              <div className="form-group">
                <label>Sellado ($)</label>
                <input type="number" value={form.pSellado} onChange={(e) => setForm((f) => ({ ...f, pSellado: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Decant 10ml ($)</label>
                <input type="number" value={form.pD10} onChange={(e) => setForm((f) => ({ ...f, pD10: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Decant 5ml ($)</label>
                <input type="number" value={form.pD5} onChange={(e) => setForm((f) => ({ ...f, pD5: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Decant 3ml ($)</label>
                <input type="number" value={form.pD3} onChange={(e) => setForm((f) => ({ ...f, pD3: e.target.value }))} />
              </div>
            </div>

            <div className="section-title" style={{ marginTop: "22px" }}>
              Stock inicial
            </div>
            <div className="stock-checks">
              <label>
                <input type="checkbox" checked={form.sSellado} onChange={(e) => setForm((f) => ({ ...f, sSellado: e.target.checked }))} /> Sellado
              </label>
              <label>
                <input type="checkbox" checked={form.sD10} onChange={(e) => setForm((f) => ({ ...f, sD10: e.target.checked }))} /> 10ml
              </label>
              <label>
                <input type="checkbox" checked={form.sD5} onChange={(e) => setForm((f) => ({ ...f, sD5: e.target.checked }))} /> 5ml
              </label>
              <label>
                <input type="checkbox" checked={form.sD3} onChange={(e) => setForm((f) => ({ ...f, sD3: e.target.checked }))} /> 3ml
              </label>
              <label title="Muestra el badge ⚡ Últimas unidades en la tienda">
                <input type="checkbox" checked={form.sLow} onChange={(e) => setForm((f) => ({ ...f, sLow: e.target.checked }))} /> ⚡ Últimas unidades
              </label>
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={agregarPerfume}>
                ➕ Guardar en Supabase
              </button>
              <button className="btn-secondary" onClick={limpiarForm}>
                Limpiar
              </button>
            </div>
            {formStatus && <p style={{ marginTop: "12px", fontSize: "0.82rem", color: "#888" }}>{formStatus}</p>}
          </div>
        </div>
      </div>

      {toastMsg && <div className={`toast show ${toastMsg.error ? "error" : ""}`}>{toastMsg.text}</div>}

      <AdminStyles />
    </div>
  );
}

function AdminStyles() {
  return (
    <style jsx global>{`
      @keyframes admin-spin {
        to { transform: rotate(360deg); }
      }

      .admin-page {
        font-family: "Segoe UI", sans-serif;
        background: #0a0a0a;
        color: #e0e0e0;
        min-height: 100vh;
      }
      .admin-page * { box-sizing: border-box; }

      #setup-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
      .setup-card { background: #111; border: 1px solid #2a2a2a; border-radius: 16px; padding: 40px; max-width: 560px; width: 100%; }
      .setup-logo { font-size: 2rem; color: #d4af37; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 6px; text-align: center; }
      .setup-subtitle { text-align: center; color: #666; font-size: 0.85rem; margin-bottom: 32px; }
      .setup-step { display: flex; gap: 14px; margin-bottom: 20px; align-items: flex-start; }
      .step-num { background: #d4af37; color: #000; font-weight: 700; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; margin-top: 2px; }
      .step-body { flex: 1; }
      .step-body p { font-size: 0.88rem; color: #ccc; margin-bottom: 8px; line-height: 1.5; }
      .step-body a { color: #d4af37; }
      .step-body code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; font-size: 0.82rem; color: #d4af37; }
      .admin-page input.setup-input { width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; padding: 9px 12px; color: #e0e0e0; font-size: 0.85rem; outline: none; font-family: monospace; }
      .admin-page input.setup-input:focus { border-color: #d4af37; }
      .sql-box { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 0.72rem; color: #888; max-height: 120px; overflow-y: auto; line-height: 1.5; margin-bottom: 8px; cursor: text; white-space: pre-wrap; }
      .btn-copy { background: #1a1a1a; border: 1px solid #333; color: #d4af37; padding: 5px 14px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; }
      .btn-copy:hover { background: #d4af37; color: #000; }
      .btn-connect { background: #d4af37; color: #000; border: none; border-radius: 8px; padding: 12px 28px; font-size: 0.9rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 20px; letter-spacing: 0.5px; }
      .btn-connect:hover { opacity: 0.85; }
      .setup-error { color: #c0392b; font-size: 0.82rem; margin-top: 10px; text-align: center; }

      #app header { background: #111; border-bottom: 1px solid #2a2a2a; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
      #app header h1 { font-size: 1.1rem; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; }
      .header-right { display: flex; gap: 10px; align-items: center; }
      .conn-dot { width: 8px; height: 8px; border-radius: 50%; background: #27ae60; display: inline-block; }
      .conn-label { font-size: 0.75rem; color: #27ae60; }

      .tabs { display: flex; flex-wrap: wrap; border-bottom: 1px solid #2a2a2a; background: #111; padding: 0 24px; }
      .tab { padding: 13px 14px; cursor: pointer; font-size: 0.78rem; letter-spacing: 0.5px; text-transform: uppercase; color: #666; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
      .tab.active { color: #d4af37; border-bottom-color: #d4af37; }
      .tab:hover { color: #d4af37; }

      .content { padding: 24px; max-width: 1100px; margin: 0 auto; }
      .panel { display: none; }
      .panel.active { display: block; }

      .stats-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
      .stat { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px 16px; font-size: 0.8rem; color: #999; }
      .stat strong { display: block; font-size: 1.25rem; color: #d4af37; }
      .stat.red strong { color: #c0392b; }
      .stat.green strong { color: #27ae60; }

      .admin-page .search-bar { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px 16px; color: #e0e0e0; font-size: 0.88rem; width: 100%; margin-bottom: 14px; outline: none; }
      .admin-page .search-bar:focus { border-color: #d4af37; }
      .quick-filters { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
      .qf { padding: 5px 14px; border-radius: 20px; font-size: 0.78rem; cursor: pointer; border: 1px solid #2a2a2a; background: #1a1a1a; color: #888; transition: all 0.2s; }
      .qf.active, .qf:hover { background: #d4af37; color: #000; border-color: #d4af37; }

      .perfume-list { display: flex; flex-direction: column; gap: 10px; }
      .p-card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px; padding: 14px 18px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 14px; transition: border-color 0.2s; }
      .p-card.agotado { opacity: 0.55; border-left: 3px solid #c0392b; }
      .p-card.disponible { border-left: 3px solid #27ae60; }
      .p-info h3 { font-size: 0.92rem; color: #fff; margin-bottom: 4px; }
      .p-meta { font-size: 0.73rem; color: #888; display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
      .p-meta span { background: #252525; padding: 2px 8px; border-radius: 20px; }
      .p-meta .badge-d { background: #1a1500; color: #d4af37; border: 1px solid #3a3000; }
      .stock-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .stock-label { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
      .toggle-btn { padding: 3px 12px; border-radius: 20px; font-size: 0.73rem; cursor: pointer; border: 1px solid; transition: all 0.15s; font-weight: 600; }
      .toggle-btn.on { background: #0d2b0d; color: #27ae60; border-color: #27ae60; }
      .toggle-btn.off { background: #2b0d0d; color: #c0392b; border-color: #c0392b; }
      .toggle-btn:hover { filter: brightness(1.2); }
      .p-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
      .btn-del { background: none; border: 1px solid #3a2020; color: #c0392b; border-radius: 6px; padding: 5px 12px; font-size: 0.72rem; cursor: pointer; }
      .btn-del:hover { background: #3a2020; }
      .price-hint { font-size: 0.73rem; color: #d4af37; text-align: right; white-space: nowrap; }
      .saving-label { font-size: 0.7rem; color: #666; }

      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .form-group { display: flex; flex-direction: column; gap: 6px; }
      .form-group.full { grid-column: 1 / -1; }
      .admin-page label { font-size: 0.72rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
      .admin-page input, .admin-page select, .admin-page textarea { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; padding: 9px 12px; color: #e0e0e0; font-size: 0.86rem; outline: none; font-family: inherit; }
      .admin-page input:focus, .admin-page select:focus, .admin-page textarea:focus { border-color: #d4af37; }
      .admin-page textarea { resize: vertical; min-height: 80px; }
      .price-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .stock-checks { display: flex; gap: 16px; flex-wrap: wrap; }
      .stock-checks label { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; text-transform: none; letter-spacing: 0; cursor: pointer; color: #ccc; }
      .stock-checks input[type="checkbox"] { width: 15px; height: 15px; accent-color: #d4af37; }
      .section-title { font-size: 0.9rem; color: #d4af37; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1a1a1a; padding-bottom: 8px; }
      .form-actions { display: flex; gap: 10px; margin-top: 18px; }
      .admin-page .btn-primary { background: #d4af37; color: #000; border: none; border-radius: 8px; padding: 10px 22px; font-size: 0.86rem; font-weight: 700; cursor: pointer; }
      .admin-page .btn-primary:hover { opacity: 0.85; }
      .admin-page .btn-secondary { background: #1a1a1a; color: #d4af37; border: 1px solid #d4af37; border-radius: 8px; padding: 10px 22px; font-size: 0.86rem; font-weight: 600; cursor: pointer; }
      .admin-page .btn-secondary:hover { background: #d4af37; color: #000; }

      .spinner { width: 18px; height: 18px; border: 2px solid #333; border-top-color: #d4af37; border-radius: 50%; animation: admin-spin 0.7s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px; }
      .loading-list { text-align: center; padding: 60px; color: #555; }
      .loading-list .spinner { width: 32px; height: 32px; margin: 0 auto 16px; display: block; }

      .admin-page .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(0); background: #d4af37; color: #000; padding: 10px 20px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; opacity: 1; transition: all 0.3s; pointer-events: none; z-index: 9999; white-space: nowrap; }
      .admin-page .toast.error { background: #c0392b; color: #fff; }

      .btn-disconnect { background: none; border: 1px solid #333; color: #666; border-radius: 6px; padding: 5px 12px; font-size: 0.75rem; cursor: pointer; }
      .btn-disconnect:hover { border-color: #c0392b; color: #c0392b; }

      .preset-btn { background: #1a1a1a; border: 1px solid #333; color: #d4af37; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
      .preset-btn:hover, .preset-btn.selected { background: #d4af37; color: #000; border-color: #d4af37; }

      .frag-box { background: #0f0f1a; border: 1px solid #2a2a40; border-radius: 10px; padding: 16px; margin-bottom: 22px; }
      .frag-box label { color: #8080c0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
      .frag-row { display: flex; gap: 10px; }
      .admin-page .frag-row input { flex: 1; background: #1a1a2a; border: 1px solid #2a2a40; border-radius: 6px; padding: 9px 12px; color: #e0e0e0; font-size: 0.85rem; outline: none; }
      .admin-page .frag-row input:focus { border-color: #8080c0; }
      .btn-frag { background: #2a2a50; color: #a0a0ff; border: 1px solid #3a3a70; border-radius: 6px; padding: 9px 16px; font-size: 0.82rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
      .btn-frag:hover { background: #5050cc; color: #fff; border-color: #5050cc; }
      .btn-frag:disabled { opacity: 0.5; cursor: not-allowed; }

      .btn-gen { background: #1a1a1a; border: 1px solid #333; color: #d4af37; padding: 5px 14px; border-radius: 20px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
      .btn-gen:hover { background: #d4af37; color: #000; border-color: #d4af37; }
      .btn-gen.regen { color: #aaa; border-color: #2a2a2a; }
      .btn-gen.regen:hover { background: #333; color: #fff; border-color: #555; }

      @media (max-width: 600px) {
        .form-grid { grid-template-columns: 1fr; }
        .price-grid { grid-template-columns: 1fr 1fr; }
        .p-card { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
