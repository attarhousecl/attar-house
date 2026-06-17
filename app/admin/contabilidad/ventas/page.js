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

const emptyItem = { perfume: "", marca: "", formato: "10ml", cantidad: 1, precio_unitario: "" };

export default function VentasPage() {
  const router = useRouter();
  const sb     = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const MESES  = getMeses();

  // Cabecera de la venta (fecha + canal, se reutilizan entre ítems)
  const [fecha, setFecha]   = useState(new Date().toISOString().slice(0, 10));
  const [canal, setCanal]   = useState("WhatsApp");
  const [notas, setNotas]   = useState("");

  // Ítem en edición
  const [item, setItem]     = useState(emptyItem);

  // Carrito temporal (aún no guardado)
  const [carrito, setCarrito] = useState([]);

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
    const { data, error } = await sb.from("ventas").select("*")
      .gte("fecha", from).lte("fecha", to)
      .order("fecha", { ascending: false }).order("id", { ascending: false });
    if (error) showToast("Error al cargar historial", true);
    else setHistorial(data || []);
    setLoadingH(false);
  }, []);

  useEffect(() => { cargarHistorial(0); }, [cargarHistorial]);

  function setItemField(field) {
    return (e) => setItem((i) => ({ ...i, [field]: e.target.value }));
  }

  function agregarItem(e) {
    e.preventDefault();
    if (!item.perfume.trim() || !item.marca.trim() || !item.precio_unitario) {
      showToast("Completa perfume, marca y precio", true); return;
    }
    setCarrito((c) => [...c, { ...item, perfume: item.perfume.trim(), marca: item.marca.trim() }]);
    setItem(emptyItem);
  }

  function quitarItem(idx) {
    setCarrito((c) => c.filter((_, i) => i !== idx));
  }

  async function registrarVenta() {
    if (carrito.length === 0) { showToast("Agrega al menos un ítem", true); return; }
    setSaving(true);
    const rows = carrito.map((it) => ({
      fecha,
      canal,
      notas: notas.trim(),
      perfume:         it.perfume,
      marca:           it.marca,
      formato:         it.formato,
      cantidad:        parseInt(it.cantidad) || 1,
      precio_unitario: parseInt(it.precio_unitario) || 0,
    }));
    const { data, error } = await sb.from("ventas").insert(rows).select();
    if (error) { showToast(`Error: ${error.message}`, true); }
    else {
      setHistorial((prev) => [...(data || []).reverse(), ...prev]);
      setCarrito([]);
      setNotas("");
      showToast(`✓ ${rows.length} ítem${rows.length > 1 ? "s" : ""} registrados`);
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

  const filtrado    = busqueda ? historial.filter((x) => `${x.perfume} ${x.marca}`.toLowerCase().includes(busqueda.toLowerCase())) : historial;
  const totalMes    = historial.reduce((a, x) => a + (x.total || 0), 0);
  const unidadesMes = historial.reduce((a, x) => a + (x.cantidad || 0), 0);
  const totalCarrito = carrito.reduce((a, it) => a + (parseInt(it.cantidad) || 1) * (parseInt(it.precio_unitario) || 0), 0);

  const itemPreview = (parseInt(item.cantidad) || 1) * (parseInt(item.precio_unitario) || 0);

  const porCanal = CANALES.map((c) => ({
    canal: c,
    total: historial.filter((x) => x.canal === c).reduce((a, x) => a + (x.total || 0), 0),
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

        {/* ── Cabecera de la venta ── */}
        <div style={S.sectionTitle}>Nueva venta</div>
        <div style={S.cabecera}>
          <Field label="Fecha">
            <input style={S.input} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Canal">
            <select style={S.input} value={canal} onChange={(e) => setCanal(e.target.value)}>
              {CANALES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Notas (opcional)">
            <input style={S.input} type="text" placeholder="Nombre cliente, observaciones..." value={notas} onChange={(e) => setNotas(e.target.value)} />
          </Field>
        </div>

        {/* ── Agregar ítem ── */}
        <form onSubmit={agregarItem} style={S.itemForm}>
          <div style={S.itemFields}>
            <Field label="Perfume">
              <input style={S.input} type="text" placeholder="ej. Yara" value={item.perfume} onChange={setItemField("perfume")} />
            </Field>
            <Field label="Marca">
              <input style={S.input} type="text" placeholder="ej. Lattafa" value={item.marca} onChange={setItemField("marca")} />
            </Field>
            <Field label="Formato">
              <select style={S.input} value={item.formato} onChange={setItemField("formato")}>
                {FORMATOS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Cant.">
              <input style={{ ...S.input, width: "70px" }} type="number" min="1" value={item.cantidad} onChange={setItemField("cantidad")} />
            </Field>
            <Field label="Precio unitario">
              <input style={S.input} type="number" min="0" placeholder="ej. 7000" value={item.precio_unitario} onChange={setItemField("precio_unitario")} />
            </Field>
            <Field label="Subtotal">
              <div style={{ ...S.input, color: "#d4af37", fontWeight: 700, background: "#0f0f0f", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                ${itemPreview.toLocaleString("es-CL")}
              </div>
            </Field>
          </div>
          <button type="submit" style={S.btnAgregar}>+ Agregar ítem</button>
        </form>

        {/* ── Carrito ── */}
        {carrito.length > 0 && (
          <div style={S.carritoBox}>
            <div style={{ fontSize: "0.75rem", color: "#d4af37", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
              Ítems a registrar
            </div>
            {carrito.map((it, i) => {
              const sub = (parseInt(it.cantidad) || 1) * (parseInt(it.precio_unitario) || 0);
              return (
                <div key={i} style={S.carritoRow}>
                  <span style={{ flex: 2 }}>{it.perfume} <span style={{ color: "#666" }}>({it.marca})</span></span>
                  <span style={S.badge}>{it.formato}</span>
                  <span style={{ color: "#888" }}>×{it.cantidad}</span>
                  <span style={{ color: "#27ae60", fontWeight: 600, minWidth: "90px", textAlign: "right" }}>
                    ${sub.toLocaleString("es-CL")}
                  </span>
                  <button style={S.btnQuit} onClick={() => quitarItem(i)}>✕</button>
                </div>
              );
            })}
            <div style={S.carritoTotal}>
              <span style={{ color: "#666" }}>Total venta:</span>
              <span style={{ color: "#d4af37", fontWeight: 700, fontSize: "1.1rem" }}>
                ${totalCarrito.toLocaleString("es-CL")}
              </span>
            </div>
            <button onClick={registrarVenta} disabled={saving} style={S.btnPrimary}>
              {saving ? "Guardando..." : `📤 Registrar venta (${carrito.length} ítem${carrito.length > 1 ? "s" : ""})`}
            </button>
          </div>
        )}

        {/* ── Historial ── */}
        <div style={{ ...S.sectionTitle, marginTop: "36px" }}>Historial</div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <select style={{ ...S.input, width: "auto" }} value={mesFiltro} onChange={(e) => cambiarMes(Number(e.target.value))}>
            {MESES.map((m, i) => <option key={i} value={i}>{m.label}</option>)}
          </select>
          <input style={{ ...S.input, flex: 1, minWidth: "140px" }} type="text" placeholder="Buscar perfume o marca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
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
                <tr>{["Fecha","Perfume","Marca","Formato","Cant.","P/u","Total","Canal",""].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtrado.map((x, i) => (
                  <tr key={x.id} style={i % 2 === 0 ? S.trEven : S.trOdd}>
                    <td style={S.td}>{x.fecha}</td>
                    <td style={S.td}>{x.perfume}</td>
                    <td style={{ ...S.td, color: "#777" }}>{x.marca}</td>
                    <td style={S.td}><span style={S.badge}>{x.formato}</span></td>
                    <td style={S.td}>{x.cantidad}</td>
                    <td style={{ ...S.td, color: "#666" }}>${(x.precio_unitario || 0).toLocaleString("es-CL")}</td>
                    <td style={{ ...S.td, color: "#27ae60", fontWeight: 600 }}>${(x.total || 0).toLocaleString("es-CL")}</td>
                    <td style={S.td}><span style={S.canalBadge}>{x.canal}</span></td>
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

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "0.67rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
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
  cabecera: { display: "grid", gridTemplateColumns: "160px 180px 1fr", gap: "14px", marginBottom: "20px" },
  itemForm: { background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "16px", marginBottom: "16px" },
  itemFields: { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "14px" },
  input:   { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "9px 12px", color: "#e0e0e0", fontSize: "0.86rem", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  btnAgregar: { background: "#1a2a1a", border: "1px solid #27ae60", color: "#27ae60", borderRadius: "8px", padding: "9px 20px", fontSize: "0.86rem", fontWeight: 700, cursor: "pointer" },
  carritoBox: { background: "#0f1a0f", border: "1px solid #1a3a1a", borderRadius: "10px", padding: "16px", marginBottom: "16px" },
  carritoRow: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #1a2a1a", fontSize: "0.84rem" },
  carritoTotal: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 14px", fontSize: "0.9rem" },
  btnPrimary: { background: "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" },
  btnQuit:  { background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", padding: "2px 6px", marginLeft: "auto" },
  empty:    { color: "#444", padding: "32px 0" },
  totalPill:  { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "8px 14px", fontSize: "0.82rem", color: "#27ae60", whiteSpace: "nowrap" },
  canalPill:  { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "6px 12px", fontSize: "0.78rem" },
  tableWrap:  { overflowX: "auto" },
  table:   { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" },
  th:      { padding: "9px 12px", textAlign: "left", color: "#555", fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #1a1a1a", whiteSpace: "nowrap" },
  td:      { padding: "9px 12px", color: "#ccc", borderBottom: "1px solid #111" },
  trEven:  { background: "#0f0f0f" },
  trOdd:   { background: "#111" },
  badge:      { background: "#1a1500", color: "#d4af37", border: "1px solid #3a3000", borderRadius: "10px", padding: "2px 8px", fontSize: "0.69rem", whiteSpace: "nowrap" },
  canalBadge: { background: "#0d1a0d", color: "#27ae60", border: "1px solid #1a3a1a", borderRadius: "10px", padding: "2px 8px", fontSize: "0.69rem" },
  btnDel:  { background: "none", border: "1px solid #3a1a1a", color: "#c0392b", borderRadius: "5px", padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem" },
  toast:   { position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", padding: "10px 20px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap" },
};
