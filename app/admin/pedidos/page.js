"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const STATUS_LABEL = { paid: "Pagado", pending: "Pendiente", rejected: "Rechazado", error: "Error", unknown: "Desconocido" };
const STATUS_COLOR = { paid: "#8DD8A0", pending: "#8DD8A0", rejected: "#E89166", error: "#E89166", unknown: "#5C6B64" };
const FILTROS = ["Todos", "Pagado", "Pendiente", "Rechazado"];

export default function PedidosPage() {
  const router = useRouter();
  const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    sb.from("orders").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, []);

  const visibles = orders.filter((o) => {
    if (filtro === "Todos") return true;
    return STATUS_LABEL[o.status] === filtro;
  });

  const counts = {
    Todos: orders.length,
    Pagado: orders.filter((o) => o.status === "paid").length,
    Pendiente: orders.filter((o) => o.status === "pending").length,
    Rechazado: orders.filter((o) => ["rejected", "error"].includes(o.status)).length,
  };

  const totalPagado = orders.filter((o) => o.status === "paid").reduce((s, o) => s + (o.total || 0), 0);

  function fmt(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={S.backBtn} onClick={() => router.push("/admin")}>← Admin</button>
          <h1 style={S.h1}>📋 Pedidos</h1>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#8DD8A0", fontWeight: 700 }}>
          {counts.Pagado} pagados · ${totalPagado.toLocaleString("es-CL")}
        </div>
      </header>

      <div style={S.content}>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{ ...S.filtroBtn, ...(filtro === f ? S.filtroActive : {}) }}>
              {f}
              <span style={{ marginLeft: "6px", fontSize: "0.7rem" }}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={S.center}><div style={S.spinner} /></div>
        ) : visibles.length === 0 ? (
          <div style={S.empty}>No hay pedidos{filtro !== "Todos" ? ` con estado "${filtro}"` : ""}.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {visibles.map((order) => {
              const isOpen = expanded === order.id;
              const items = order.items || [];
              return (
                <div key={order.id} style={S.card}>
                  <div style={S.cardTop} onClick={() => setExpanded(isOpen ? null : order.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                      <span style={{ ...S.statusBadge, background: STATUS_COLOR[order.status] + "22", color: STATUS_COLOR[order.status], borderColor: STATUS_COLOR[order.status] + "55" }}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.88rem", color: "#FDFCFA", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {order.customer_name || "—"}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#5C6B64", marginTop: "2px" }}>
                          {order.commerce_order} · {fmt(order.created_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.95rem", color: "#8DD8A0", fontWeight: 700 }}>
                        ${(order.total || 0).toLocaleString("es-CL")}
                      </div>
                      <span style={{ color: "#41504A", fontSize: "0.8rem" }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={S.cardBody}>
                      <div style={S.detailGrid}>
                        <Detail label="Teléfono" value={order.customer_phone} />
                        <Detail label="Email" value={order.customer_email} />
                        {order.shipping?.direccion && <Detail label="Dirección" value={order.shipping.direccion} />}
                        {order.shipping?.comuna && <Detail label="Comuna" value={order.shipping.comuna} />}
                        {order.shipping?.region && <Detail label="Región" value={order.shipping.region} />}
                        {order.shipping?.notas && <Detail label="Notas" value={order.shipping.notas} />}
                        {order.free_gift && <Detail label="Regalo" value={order.free_gift} />}
                      </div>

                      <div style={{ marginTop: "14px" }}>
                        <div style={S.itemsTitle}>Productos</div>
                        {items.map((item, i) => (
                          <div key={i} style={S.itemRow}>
                            <span style={{ color: "#C5CAC7" }}>{item.name}</span>
                            <span style={{ color: "#7A8985", fontSize: "0.78rem" }}>{item.format} ×{item.quantity}</span>
                            <span style={{ color: "#8DD8A0", marginLeft: "auto" }}>${(item.price * item.quantity).toLocaleString("es-CL")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SpinStyle />
    </div>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: "0.65rem", color: "#5C6B64", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "0.82rem", color: "#C5CAC7" }}>{value}</div>
    </div>
  );
}

function SpinStyle() {
  return <style>{`@keyframes ped-spin { to { transform: rotate(360deg); } }`}</style>;
}

const S = {
  page:     { fontFamily: "var(--font-archivo), sans-serif", background: "#0F1613", color: "#FDFCFA", minHeight: "100vh" },
  header:   { background: "#151D1A", borderBottom: "1px solid #1F2B27", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  h1:       { fontSize: "1.05rem", color: "#8DD8A0", letterSpacing: "2px", textTransform: "uppercase", margin: 0 },
  backBtn:  { background: "none", border: "1px solid #2A3A32", color: "#7A8985", borderRadius: "6px", padding: "5px 12px", fontSize: "0.78rem", cursor: "pointer" },
  content:  { padding: "24px", maxWidth: "860px", margin: "0 auto" },
  center:   { display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" },
  // Sin mezclar shorthand (border) con longhand (borderColor): React lo
  // reporta como bug de estilos al alternar entre estados.
  spinner:  { width: "28px", height: "28px", borderWidth: "2px", borderStyle: "solid", borderColor: "#8DD8A0 #2A3A32 #2A3A32 #2A3A32", borderRadius: "50%", animation: "ped-spin 0.7s linear infinite" },
  empty:    { textAlign: "center", color: "#41504A", padding: "48px 0", fontSize: "0.9rem" },
  filtroBtn: { background: "#1A2420", border: "1px solid #1F2B27", color: "#7A8985", borderRadius: "20px", padding: "6px 16px", fontSize: "0.8rem", cursor: "pointer" },
  filtroActive: { background: "#8DD8A0", border: "1px solid #8DD8A0", color: "#0F1613", fontWeight: 700 },
  card:     { background: "#151D1A", border: "1px solid #1A2420", borderRadius: "10px", overflow: "hidden" },
  cardTop:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", gap: "12px" },
  cardBody: { padding: "0 16px 16px", borderTop: "1px solid #1A2420" },
  statusBadge: { fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", borderWidth: "1px", borderStyle: "solid", whiteSpace: "nowrap", flexShrink: 0 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "14px" },
  itemsTitle: { fontSize: "0.65rem", color: "#5C6B64", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" },
  itemRow:  { display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: "1px solid #1A2420", fontSize: "0.82rem" },
};
