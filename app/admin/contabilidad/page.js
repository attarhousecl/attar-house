"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function fmt(n) {
  return "$" + Math.round(n || 0).toLocaleString("es-CL");
}
function mesRange(offset = 0) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + offset;
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
    label: start.toLocaleString("es-CL", { month: "long", year: "numeric" }),
  };
}

export default function ContabilidadDashboard() {
  const router = useRouter();
  const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mesActual, setMesActual] = useState({ ingresos: 0, gastos: 0 });
  const [mesAnterior, setMesAnterior] = useState({ ingresos: 0, gastos: 0 });
  const [grafico, setGrafico] = useState([]);
  const [topPerfumes, setTopPerfumes] = useState([]);
  const [inventario, setInventario] = useState([]);
  const toastTimer = useRef(null);
  const [toast, setToast] = useState(null);

  function showToast(text, err = false) {
    setToast({ text, err });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { from: f0, to: t0 } = mesRange(0);
      const { from: f1, to: t1 } = mesRange(-1);

      const [
        { data: ventasMes },
        { data: comprasMes },
        { data: ventasAnt },
        { data: comprasAnt },
        { data: todasVentas },
        { data: todasCompras },
      ] = await Promise.all([
        sb.from("ventas").select("*").gte("fecha", f0).lte("fecha", t0),
        sb.from("compras").select("*").gte("fecha", f0).lte("fecha", t0),
        sb.from("ventas").select("*").gte("fecha", f1).lte("fecha", t1),
        sb.from("compras").select("*").gte("fecha", f1).lte("fecha", t1),
        sb.from("ventas").select("*").order("fecha", { ascending: false }),
        sb.from("compras").select("*").order("fecha", { ascending: false }),
      ]);

      const sumar = (arr, campo) => (arr || []).reduce((a, x) => a + (x[campo] || 0), 0);

      setMesActual({
        ingresos: sumar(ventasMes, "total"),
        gastos: sumar(comprasMes, "costo_total"),
      });
      setMesAnterior({
        ingresos: sumar(ventasAnt, "total"),
        gastos: sumar(comprasAnt, "costo_total"),
      });

      const graf = [];
      for (let i = -5; i <= 0; i++) {
        const { from, to, label } = mesRange(i);
        const v = (todasVentas || []).filter((x) => x.fecha >= from && x.fecha <= to);
        const c = (todasCompras || []).filter((x) => x.fecha >= from && x.fecha <= to);
        graf.push({
          label: label.slice(0, 3),
          ingresos: sumar(v, "total"),
          gastos: sumar(c, "costo_total"),
        });
      }
      setGrafico(graf);

      const perfMap = {};
      (todasVentas || []).forEach((v) => {
        const k = `${v.marca}||${v.perfume}`;
        if (!perfMap[k]) perfMap[k] = { perfume: v.perfume, marca: v.marca, ingresos: 0, gastos: 0 };
        perfMap[k].ingresos += v.total || 0;
      });
      (todasCompras || []).forEach((c) => {
        const k = `${c.marca}||${c.perfume}`;
        if (!perfMap[k]) perfMap[k] = { perfume: c.perfume, marca: c.marca, ingresos: 0, gastos: 0 };
        perfMap[k].gastos += c.costo_total || 0;
      });
      const top = Object.values(perfMap)
        .map((p) => ({
          ...p,
          ganancia: p.ingresos - p.gastos,
          margen: p.ingresos > 0 ? ((p.ingresos - p.gastos) / p.ingresos) * 100 : 0,
        }))
        .filter((p) => p.ingresos > 0)
        .sort((a, b) => b.ganancia - a.ganancia)
        .slice(0, 8);
      setTopPerfumes(top);

      const invMap = {};
      (todasCompras || []).forEach((c) => {
        const k = `${c.marca}||${c.perfume}`;
        if (!invMap[k]) invMap[k] = { perfume: c.perfume, marca: c.marca, compradas: 0, mlVendidos: 0 };
        invMap[k].compradas += c.cantidad || 0;
      });
      (todasVentas || []).forEach((v) => {
        const k = `${v.marca}||${v.perfume}`;
        if (!invMap[k]) invMap[k] = { perfume: v.perfume, marca: v.marca, compradas: 0, mlVendidos: 0 };
        const ml = v.formato === "Sellado" ? 100 : parseInt(v.formato) || 10;
        invMap[k].mlVendidos += (v.cantidad || 0) * ml;
      });
      const inv = Object.values(invMap)
        .map((x) => ({ ...x, restante: Math.max(0, x.compradas - x.mlVendidos / 100) }))
        .sort((a, b) => a.restante - b.restante);
      setInventario(inv);
    } catch (e) {
      setError(e.message);
      showToast("Error cargando datos", true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const ganancia = mesActual.ingresos - mesActual.gastos;
  const gananciaAnt = mesAnterior.ingresos - mesAnterior.gastos;
  const margen = mesActual.ingresos > 0 ? ((ganancia / mesActual.ingresos) * 100).toFixed(1) : "0.0";
  const maxBar = Math.max(...grafico.map((g) => Math.max(g.ingresos, g.gastos)), 1);
  const { label: labelMes } = mesRange(0);

  const delta = (act, ant) =>
    ant > 0 ? `${((act - ant) / ant * 100).toFixed(1)}% vs mes ant.` : "Sin datos previos";

  if (loading) return (
    <div style={S.page}>
      <div style={S.center}><div style={S.spinner} /></div>
      <SpinStyle />
    </div>
  );

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button style={S.backBtn} onClick={() => router.push("/admin")}>← Admin</button>
          <h1 style={S.h1}>💰 Contabilidad</h1>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.navBtn} onClick={() => router.push("/admin/contabilidad/compras")}>📥 Compras</button>
          <button style={S.navBtn} onClick={() => router.push("/admin/contabilidad/ventas")}>📤 Ventas</button>
        </div>
      </header>

      <div style={S.content}>
        {error && <p style={S.errorMsg}>{error}</p>}

        <div style={S.sectionTitle}>Resumen — {labelMes}</div>
        <div style={S.kpiGrid}>
          <KPI label="Ingresos" value={fmt(mesActual.ingresos)} sub={delta(mesActual.ingresos, mesAnterior.ingresos)} color="#8DD8A0" />
          <KPI label="Gastos" value={fmt(mesActual.gastos)} sub={delta(mesActual.gastos, mesAnterior.gastos)} color="#E89166" />
          <KPI label="Ganancia neta" value={fmt(ganancia)} sub={`vs ${fmt(gananciaAnt)} mes anterior`} color={ganancia >= 0 ? "#8DD8A0" : "#E89166"} />
          <KPI label="Margen" value={`${margen}%`} sub="sobre ingresos del mes" color="#B589C7" />
        </div>

        <div style={S.sectionTitle}>Últimos 6 meses</div>
        <div style={S.chartBox}>
          {grafico.map((g, i) => (
            <div key={i} style={S.chartCol}>
              <div style={S.barsWrap}>
                <div title={`Ingresos: ${fmt(g.ingresos)}`} style={{ ...S.bar, height: `${(g.ingresos / maxBar) * 100}%`, background: "#8DD8A0" }} />
                <div title={`Gastos: ${fmt(g.gastos)}`}   style={{ ...S.bar, height: `${(g.gastos   / maxBar) * 100}%`, background: "#E89166" }} />
              </div>
              <div style={S.chartLabel}>{g.label}</div>
            </div>
          ))}
          <div style={S.chartLegend}>
            <span style={{ color: "#8DD8A0" }}>■ Ingresos</span>
            <span style={{ color: "#E89166" }}>■ Gastos</span>
          </div>
        </div>

        <div style={S.sectionTitle}>Perfumes más rentables</div>
        {topPerfumes.length === 0 ? (
          <p style={S.empty}>Sin datos de ventas aún. <button style={S.linkBtn} onClick={() => router.push("/admin/contabilidad/ventas")}>Registra tu primera venta →</button></p>
        ) : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {["#", "Perfume", "Marca", "Ingresos", "Gastos", "Ganancia", "Margen"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topPerfumes.map((p, i) => (
                  <tr key={i} style={i % 2 === 0 ? S.trEven : S.trOdd}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>{p.perfume}</td>
                    <td style={{ ...S.td, color: "#7A8985" }}>{p.marca}</td>
                    <td style={{ ...S.td, color: "#8DD8A0" }}>{fmt(p.ingresos)}</td>
                    <td style={{ ...S.td, color: "#E89166" }}>{fmt(p.gastos)}</td>
                    <td style={{ ...S.td, color: p.ganancia >= 0 ? "#8DD8A0" : "#E89166", fontWeight: 600 }}>{fmt(p.ganancia)}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ flex: 1, height: "5px", background: "#1A2420", borderRadius: "3px", minWidth: "50px" }}>
                          <div style={{ width: `${Math.min(100, Math.max(0, p.margen))}%`, height: "100%", background: "#8DD8A0", borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#B8C0BC" }}>{p.margen.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={S.sectionTitle}>Inventario estimado</div>
        <p style={{ fontSize: "0.73rem", color: "#5C6B64", marginBottom: "14px" }}>
          Estimación: botellas compradas vs. ml vendidos (1 botella ≈ 100ml).
        </p>
        {inventario.length === 0 ? (
          <p style={S.empty}>Sin datos aún.</p>
        ) : (
          <div style={S.invGrid}>
            {inventario.map((x, i) => {
              const color = x.restante < 0.5 ? "#E89166" : x.restante < 1.5 ? "#8DD8A0" : "#8DD8A0";
              return (
                <div key={i} style={{ ...S.invCard, borderLeft: `3px solid ${color}` }}>
                  <div style={{ fontWeight: 600, fontSize: "0.86rem", color: "#FDFCFA" }}>{x.perfume}</div>
                  <div style={{ fontSize: "0.72rem", color: "#6B7A73" }}>{x.marca}</div>
                  <div style={{ marginTop: "8px", fontSize: "0.82rem", color, fontWeight: 700 }}>
                    {x.restante < 0.5 ? "⚠ Agotado" : `~${x.restante.toFixed(1)} bot.`}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#41504A", marginTop: "2px" }}>
                    {x.compradas} compradas · {(x.mlVendidos / 100).toFixed(1)} equiv. vendidas
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && <div style={{ ...S.toast, background: toast.err ? "#E89166" : "#8DD8A0", color: toast.err ? "#FDFCFA" : "#0F1613" }}>{toast.text}</div>}
      <SpinStyle />
    </div>
  );
}

function KPI({ label, value, sub, color }) {
  return (
    <div style={S.kpi}>
      <div style={{ fontSize: "0.68rem", color: "#5C6B64", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "1.55rem", fontWeight: 700, color, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "#5C6B64", marginTop: "4px" }}>{sub}</div>
    </div>
  );
}

function SpinStyle() {
  return <style>{`@keyframes contab-spin { to { transform: rotate(360deg); } }`}</style>;
}

const S = {
  page:    { fontFamily: "var(--font-archivo), sans-serif", background: "#0F1613", color: "#FDFCFA", minHeight: "100vh" },
  center:  { display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" },
  spinner: { width: "30px", height: "30px", border: "2px solid #2A3A32", borderTopColor: "#8DD8A0", borderRadius: "50%", animation: "contab-spin 0.7s linear infinite" },
  header:  { background: "#151D1A", borderBottom: "1px solid #1F2B27", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  h1:      { fontSize: "1.05rem", color: "#8DD8A0", letterSpacing: "2px", textTransform: "uppercase", margin: 0 },
  backBtn: { background: "none", border: "1px solid #2A3A32", color: "#7A8985", borderRadius: "6px", padding: "5px 12px", fontSize: "0.78rem", cursor: "pointer" },
  navBtn:  { background: "#1A2420", border: "1px solid #1F2B27", color: "#8DD8A0", borderRadius: "6px", padding: "7px 14px", fontSize: "0.8rem", cursor: "pointer" },
  content: { padding: "24px", maxWidth: "1100px", margin: "0 auto" },
  sectionTitle: { fontSize: "0.8rem", color: "#8DD8A0", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #1A2420", paddingBottom: "8px", marginBottom: "16px", marginTop: "28px" },
  errorMsg: { color: "#E89166", background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: "8px", padding: "12px 16px", fontSize: "0.85rem" },
  empty:   { color: "#41504A", padding: "32px 0" },
  linkBtn: { background: "none", border: "none", color: "#8DD8A0", cursor: "pointer", fontSize: "inherit", textDecoration: "underline" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" },
  kpi:     { background: "#151D1A", border: "1px solid #1A2420", borderRadius: "10px", padding: "16px 18px" },
  chartBox: { background: "#151D1A", border: "1px solid #1A2420", borderRadius: "10px", padding: "20px 16px 12px", display: "flex", alignItems: "flex-end", gap: "6px", height: "160px", position: "relative" },
  chartCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" },
  barsWrap: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: "2px" },
  bar:      { flex: 1, borderRadius: "3px 3px 0 0", minHeight: "2px", transition: "height 0.4s" },
  chartLabel: { fontSize: "0.68rem", color: "#5C6B64" },
  chartLegend: { position: "absolute", top: "10px", right: "14px", display: "flex", gap: "10px", fontSize: "0.7rem" },
  tableWrap: { overflowX: "auto" },
  table:   { width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" },
  th:      { padding: "9px 12px", textAlign: "left", color: "#5C6B64", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #1A2420" },
  td:      { padding: "9px 12px", color: "#C5CAC7" },
  trEven:  { background: "#151D1A" },
  trOdd:   { background: "#0f0f0f" },
  invGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "10px" },
  invCard: { background: "#151D1A", border: "1px solid #1A2420", borderRadius: "8px", padding: "14px" },
  toast:   { position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", padding: "10px 20px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap" },
};
