"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const FORMATOS = ["3ml", "5ml", "10ml", "Sellado"];
const CANALES  = ["WhatsApp", "Web", "Efectivo Valdivia"];

function getMeses() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    const to   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { label: d.toLocaleString("es-CL", { month: "long", year: "numeric" }), from, to };
  });
}

const initialForm = {
  fecha: new Date().toISOString().slice(0, 10),
  perfume: "",
  marca: "",
  formato: "10ml",
  cantidad: 1,
  precio_unitario: "",
  canal: "WhatsApp",
  notas: "",
};

export default function VentasPage() {
  const router = useRouter();
  const sb     = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const MESES  = getMeses();

  const [form, setForm]           = useState(initialForm);
  const [saving, setSaving]       = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadingH, setLoadingH]   = useState(true);
  const [mesFiltro, setMesFiltro] = useState(0);
  const [busqueda, setBusqueda]   = useState("");
  const toastTimer = useRef(null);
  const [toast, setToast]         = useState(null);

  function showToast(text, err = false) {
    setToast({ text, err });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const cargarHistorial = useCallback(async (mesIdx) => {
    setLoadingH(true);
    const { from, to } = MESES[mesIdx];
    const { data, error } = await sb.from("ventas").select("*").gte("fecha", from).lte("fecha", to).order("fecha", { ascending: false }).order("id", { ascending: false });
    if (error) showToast("Error al cargar historial", true);
    else setHistorial(data || []);
    setLoadingH(false);
  }, []);

  useEffect(() => { cargarHistorial(0); }, [cargarHistorial]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function guardar(e) {
    e.preventDefault();
    if (!form.perfume.trim() || !form.marca.trim() || !form.precio_unitario) {
      showToast("Completa perfume, marca y precio", true); return;
    }
    setSaving(true);
    const { data, error } = await sb.from("ventas").insert({
      fecha:           form.fecha,
      perfume:         form.perfume.trim(),
      marca:           form.marca.trim(),
      formato:         form.formato,
      cantidad:        parseInt(form.cantidad) || 1,
      precio_unitario: parseInt(form.precio_unitario) || 0,
      canal:           form.canal,
      notas:           form.notas.trim(),
    }).select().single();
    if (error) { showToast(`Error: ${error.message}`, true); }
    else {
      setHistorial((prev) => [data, ...prev]);
      setForm({ ...initialForm, fecha: form.fecha });
      showToast("✓ Venta registrada");
    }
    setSaving(false);
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este registro?")) return;
    const { error } = await sb.from("ventas").delete().eq("id", id);
    if (error) showToast(`Error: ${error.message}`, true);
    else { setHistorial((prev) => prev.filter((x) => x.id !== id)); showToast("Eliminado"); }
  }

  function cambiarMes(idx) {
    setMesFiltro(idx);
    cargarHistorial(idx);
  }

  const filtrado     = busqueda ? historial.filter((x) => `${x.perfume} ${x.marca}`.toLowerCase().includes(busqueda.toLowerCase())) : historial;
  const totalMes     = historial.reduce((a, x) => a + (x.total || 0), 0);
  const unidadesMes  = historial.reduce((a, x) => a + (x.cantidad || 0), 0);
  const totalPreview = (parseInt(form.cantidad) || 1) * (parseInt(form.precio_unitario) || 0);

  const porCanal = CANALES.map((canal) => ({
    canal,
    total: historial.filter((x) => x.canal === canal).reduce((a, x) => a + (x.total || 0), 0),
  })).filter((x) => x.total > 0);

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={S.backBtn} onClick={() => router.push("/admin/contabilidad")}>← Dashboard</button>
          <h1 style={S.h1}>📤 Ventas</h1>
        </div>
        <button style={S.navBtn} onClick={() => router.push("/admin/contabilidad/compras")}>📥 Compras →</button>
      </header>

      <div style={S.content}>
        <div style={S.sectionTitle}>Registrar venta</div>
        <form onSubmit={guardar} style={S.formGrid}>
          <Field label="Fecha"><input style={S.input} type="date" value={form.fecha} onChange={set("fecha")} required /></Field>
          <Field label="Perfume"><input style={S.input} type="text" placeholder="ej. Stronger With You" value={form.perfume} onChange={set("perfume")} required /></Field>
          <Field label="Marca"><input style={S.input} type="text" placeholder="ej. Armani" value={form.marca} onChange={set("marca")} required /></Field>
          <Field label="Formato">
            <select style={S.input} value={form.formato} onChange={set("formato")}>
              {FORMATOS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Cantidad"><input style={S.input} type="number" min="1" value={form.cantidad} onChange={set("cantidad")} required /></Field>
          <Field label="Precio unitario CLP"><input style={S.input} type="number" min="0" placeholder="ej. 13000" value={form.precio_unitario} onChange={set("precio_unitario")} required /></Field>
          <Field label="Canal">
            <select style={S.input} value={form.canal} onChange={set("canal")}>
              {CANALES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Total de esta venta">
            <div style={{ ...S.input, color: "#27ae60", fontWeight: 700, background: "#0f0f0f", display: "flex", alignItems: "center" }}>
              ${totalPreview.toLocaleString("es-CL")}
            </div>
          </Field>
          <Field label="Notas" span>
            <textarea style={{ ...S.input, minHeight: "66px", resize: "vertical" }} placeholder="Observaciones..." value={form.notas} onChange={set("notas")} />
          </Field>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
            <button type="submit" disabled={saving} style={S.btnPrimary}>{saving ? "Guardando..." : "📤 Registrar venta"}</button>
            <button type="button" onClick={() => setForm(initialForm)} style={S.btnSecondary}>Limpiar</button>
          </div>
        </form>

        <div style={{ ...S.sectionTitle, marginTop: "32px" }}>Historial</div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <select style={{ ...S.input, width: "auto" }} value={mesFiltro} onChange={(e) => cambiarMes(Number(e.target.value))}>
            {MESES.map((m, i) => <option key={i} value={i}>{m.label}</option>)}
          </select>
          <input style={{ ...S.input, flex: 1, minWidth: "150px" }} type="text" placeholder="Buscar perfume o marca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div style={S.totalPill}>{unidadesMes} uds · <strong>${totalMes.toLocaleString("es-CL")}</strong></div>
        </div>

        {porCanal.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
            {porCanal.map((c) => (
              <div key={c.canal} style={S.canalPill}>
                <span style={{ color: "#666" }}>{c.canal}: </span>
                <span style={{ color: "#d4af37", fontWeight: 600 }}>${c.total.toLocaleString("es-CL")}</span>
              </div>
            ))}
          </div>
        )}

        {loadingH ? <div style={S.center}><div style={S.spinner} /></div>
          : filtrado.length === 0 ? <p style={S.empty}>Sin registros para este período.</p>
          : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>{["Fecha","Perfume","Marca","Formato","Cant.","P/u","Total","Canal","Notas",""].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtrado.map((x, i) => (
                  <tr key={x.id} style={i % 2 === 0 ? S.trEven : S.trOdd}>
                    <td style={S.td}>{x.fecha}</td>
                    <td style={S.td}>{x.perfume}</td>
                    <td style={{ ...S.td, color: "#888" }}>{x.marca}</td>
                    <td style={S.td}><span style={S.badge}>{x.formato}</span></td>
                    <td style={S.td}>{x.cantidad}</td>
                    <td style={{ ...S.td, color: "#777" }}>${(x.precio_unitario || 0).toLocaleString("es-CL")}</td>
                    <td style={{ ...S.td, color: "#27ae60", fontWeight: 600 }}>${(x.total || 0).toLocaleString("es-CL")}</td>
                    <td style={S.td}><span style={S.canalBadge}>{x.canal}</span></td>
                    <td style={{ ...S.td, color: "#555", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.notas || "—"}</td>
                    <td style={S.td}><button style={S.btnDel} onClick={() => eliminar(x.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <div style={{ ...S.toast, background: toast.err ? "#c0392b" : "#d4af37", color: toast.err ? "#fff" : "#000" }}>{toast.text}</div>}
      <SpinStyle />
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(span ? { gridColumn: "1 / -1" } : {}) }}>
      <label style={{ fontSize: "0.68rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}

function SpinStyle() {
  return <style>{`@keyframes contab-spin { to { transform: rotate(360deg); } }`}</style>;
}

const S = {
  page:    { fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0a", color: "#e0e0e0", minHeight: "100vh" },
  center:  { display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" },
  spinner: { width: "28px", height: "28px", border: "2px solid #333", borderTopColor: "#d4af37", borderRadius: "50%", animation: "contab-spin 0.7s linear infinite" },
  header:  { background: "#111", borderBottom: "1px solid #2a2a2a", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  h1:      { fontSize: "1.05rem", color: "#d4af37", letterSpacing: "2px", textTransform: "uppercase", margin: 0 },
  backBtn: { background: "none", border: "1px solid #333", color: "#888", borderRadius: "6px", padding: "5px 12px", fontSize: "0.78rem", cursor: "pointer" },
  navBtn:  { background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#d4af37", borderRadius: "6px", padding: "7px 14px", fontSize: "0.8rem", cursor: "pointer" },
  content: { padding: "24px", maxWidth: "1100px", margin: "0 auto" },
  sectionTitle: { fontSize: "0.8rem", color: "#d4af37", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #1a1a1a", paddingBottom: "8px", marginBottom: "16px", marginTop: "4px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  input:   { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "9px 12px", color: "#e0e0e0", fontSize: "0.86rem", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  btnPrimary:   { background: "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "0.86rem", fontWeight: 700, cursor: "pointer" },
  btnSecondary: { background: "#1a1a1a", color: "#d4af37", border: "1px solid #333", borderRadius: "8px", padding: "10px 20px", fontSize: "0.86rem", cursor: "pointer" },
  empty:   { color: "#444", padding: "32px 0" },
  totalPill:  { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "8px 14px", fontSize: "0.82rem", color: "#27ae60", whiteSpace: "nowrap" },
  canalPill:  { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "6px 12px", fontSize: "0.78rem" },
  tableWrap: { overflowX: "auto" },
  table:   { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
  th:      { padding: "9px 12px", textAlign: "left", color: "#555", fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #1a1a1a", whiteSpace: "nowrap" },
  td:      { padding: "9px 12px", color: "#ccc", borderBottom: "1px solid #111" },
  trEven:  { background: "#0f0f0f" },
  trOdd:   { background: "#111" },
  badge:      { background: "#1a1500", color: "#d4af37", border: "1px solid #3a3000", borderRadius: "10px", padding: "2px 8px", fontSize: "0.69rem" },
  canalBadge: { background: "#0d1a0d", color: "#27ae60", border: "1px solid #1a3a1a", borderRadius: "10px", padding: "2px 8px", fontSize: "0.69rem" },
  btnDel:  { background: "none", border: "1px solid #3a1a1a", color: "#c0392b", borderRadius: "5px", padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem" },
  toast:   { position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", padding: "10px 20px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap" },
};
