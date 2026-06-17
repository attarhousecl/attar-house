"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const PRIORIDADES = ["Alta", "Media", "Baja"];
const PRIORIDAD_COLOR = { Alta: "#c0392b", Media: "#d4af37", Baja: "#555" };
const FILTROS = ["Todos", "Pendientes", "Completados"];

export default function ObjetivosPage() {
  const router = useRouter();
  const sb     = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const [objetivos, setObjetivos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [texto, setTexto]         = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [saving, setSaving]       = useState(false);
  const [filtro, setFiltro]       = useState("Todos");
  const toastTimer = useRef(null);
  const [toast, setToast]         = useState(null);
  const inputRef = useRef(null);

  function showToast(text, err = false) {
    setToast({ text, err });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    sb.from("objetivos").select("*").order("completado").order("prioridad").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setObjetivos(data || []);
        setLoading(false);
      });
  }, []);

  async function agregar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    setSaving(true);
    const { data, error } = await sb.from("objetivos").insert({ texto: texto.trim(), prioridad }).select().single();
    if (error) showToast(`Error: ${error.message}`, true);
    else {
      setObjetivos((prev) => [data, ...prev]);
      setTexto("");
      inputRef.current?.focus();
    }
    setSaving(false);
  }

  async function toggleCompletado(obj) {
    const { data, error } = await sb.from("objetivos").update({ completado: !obj.completado }).eq("id", obj.id).select().single();
    if (!error) setObjetivos((prev) => prev.map((o) => o.id === obj.id ? data : o));
  }

  async function eliminar(id) {
    const { error } = await sb.from("objetivos").delete().eq("id", id);
    if (!error) setObjetivos((prev) => prev.filter((o) => o.id !== id));
    else showToast("Error al eliminar", true);
  }

  const visibles = objetivos.filter((o) => {
    if (filtro === "Pendientes")  return !o.completado;
    if (filtro === "Completados") return  o.completado;
    return true;
  });

  const total     = objetivos.length;
  const hechos    = objetivos.filter((o) => o.completado).length;
  const pct       = total > 0 ? Math.round((hechos / total) * 100) : 0;

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={S.backBtn} onClick={() => router.push("/admin")}>← Admin</button>
          <h1 style={S.h1}>🎯 Objetivos</h1>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#666" }}>
          {hechos}/{total} completados
        </div>
      </header>

      <div style={S.content}>

        {/* Barra de progreso */}
        {total > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.75rem", color: "#666" }}>
              <span>Progreso general</span>
              <span style={{ color: pct === 100 ? "#27ae60" : "#d4af37", fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: "6px", background: "#1a1a1a", borderRadius: "3px" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#27ae60" : "#d4af37", borderRadius: "3px", transition: "width 0.5s" }} />
            </div>
          </div>
        )}

        {/* Agregar objetivo */}
        <form onSubmit={agregar} style={S.addForm}>
          <input
            ref={inputRef}
            style={{ ...S.input, flex: 1 }}
            type="text"
            placeholder="Nuevo objetivo... (ej: Llegar a 100 pedidos/mes)"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={200}
          />
          <select style={{ ...S.input, width: "110px" }} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
            {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <button type="submit" disabled={saving || !texto.trim()} style={S.btnAdd}>
            {saving ? "..." : "+ Agregar"}
          </button>
        </form>

        {/* Filtros */}
        <div style={S.filtros}>
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setFiltro(f)} style={{ ...S.filtroBtn, ...(filtro === f ? S.filtroBtnActive : {}) }}>
              {f}
              <span style={{ marginLeft: "6px", fontSize: "0.7rem", color: filtro === f ? "#000" : "#555" }}>
                {f === "Todos" ? total : f === "Pendientes" ? total - hechos : hechos}
              </span>
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={S.center}><div style={S.spinner} /></div>
        ) : visibles.length === 0 ? (
          <div style={S.empty}>
            {filtro === "Completados" ? "¡Aún no has completado ningún objetivo!" : filtro === "Pendientes" ? "¡Todo completado! 🎉" : "Agrega tu primer objetivo arriba."}
          </div>
        ) : (
          <div style={S.lista}>
            {visibles.map((obj) => (
              <div key={obj.id} style={{ ...S.objRow, opacity: obj.completado ? 0.55 : 1 }}>
                <button
                  style={{ ...S.checkbox, borderColor: obj.completado ? "#27ae60" : "#333", background: obj.completado ? "#27ae60" : "transparent" }}
                  onClick={() => toggleCompletado(obj)}
                  title={obj.completado ? "Marcar como pendiente" : "Marcar como completado"}
                >
                  {obj.completado && <span style={{ color: "#000", fontSize: "0.75rem", fontWeight: 900 }}>✓</span>}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ ...S.objTexto, textDecoration: obj.completado ? "line-through" : "none", color: obj.completado ? "#444" : "#e0e0e0" }}>
                    {obj.texto}
                  </div>
                  <div style={{ marginTop: "3px" }}>
                    <span style={{ ...S.prioTag, color: PRIORIDAD_COLOR[obj.prioridad], borderColor: PRIORIDAD_COLOR[obj.prioridad] }}>
                      {obj.prioridad}
                    </span>
                  </div>
                </div>

                <button style={S.btnDel} onClick={() => eliminar(obj.id)} title="Eliminar">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje motivacional cuando todo está hecho */}
        {total > 0 && pct === 100 && (
          <div style={{ textAlign: "center", padding: "24px", color: "#27ae60", fontSize: "1rem", fontWeight: 600 }}>
            🏆 ¡Todos los objetivos completados! Es hora de ponerse nuevos.
          </div>
        )}
      </div>

      {toast && <div style={{ ...S.toast, background: toast.err ? "#c0392b" : "#d4af37", color: toast.err ? "#fff" : "#000" }}>{toast.text}</div>}
      <SpinStyle />
    </div>
  );
}

function SpinStyle() {
  return <style>{`@keyframes obj-spin { to { transform: rotate(360deg); } }`}</style>;
}

const S = {
  page:    { fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0a", color: "#e0e0e0", minHeight: "100vh" },
  center:  { display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" },
  spinner: { width: "28px", height: "28px", border: "2px solid #333", borderTopColor: "#d4af37", borderRadius: "50%", animation: "obj-spin 0.7s linear infinite" },
  header:  { background: "#111", borderBottom: "1px solid #2a2a2a", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  h1:      { fontSize: "1.05rem", color: "#d4af37", letterSpacing: "2px", textTransform: "uppercase", margin: 0 },
  backBtn: { background: "none", border: "1px solid #333", color: "#888", borderRadius: "6px", padding: "5px 12px", fontSize: "0.78rem", cursor: "pointer" },
  content: { padding: "24px", maxWidth: "720px", margin: "0 auto" },
  addForm: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  input:   { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "10px 14px", color: "#e0e0e0", fontSize: "0.9rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  btnAdd:  { background: "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  filtros: { display: "flex", gap: "8px", marginBottom: "20px" },
  filtroBtn: { background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", borderRadius: "20px", padding: "6px 16px", fontSize: "0.8rem", cursor: "pointer" },
  filtroBtnActive: { background: "#d4af37", border: "1px solid #d4af37", color: "#000", fontWeight: 700 },
  lista:   { display: "flex", flexDirection: "column", gap: "8px" },
  objRow:  { display: "flex", alignItems: "flex-start", gap: "14px", background: "#111", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "14px 16px", transition: "opacity 0.3s" },
  checkbox: { width: "22px", height: "22px", borderRadius: "6px", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: "1px", transition: "all 0.2s" },
  objTexto: { fontSize: "0.92rem", lineHeight: 1.4 },
  prioTag:  { fontSize: "0.67rem", border: "1px solid", borderRadius: "10px", padding: "1px 8px", textTransform: "uppercase", letterSpacing: "0.5px" },
  btnDel:  { background: "none", border: "none", color: "#333", fontSize: "0.8rem", cursor: "pointer", padding: "2px 4px", flexShrink: 0, marginTop: "2px", transition: "color 0.2s" },
  empty:   { textAlign: "center", color: "#444", padding: "48px 0", fontSize: "0.9rem" },
  toast:   { position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", padding: "10px 20px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap" },
};
