"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_LABEL = { paid: "✅ Pagado", pending: "⏳ Pendiente", rejected: "❌ Rechazado", error: "⚠️ Error" };
const STATUS_COLOR = { paid: "#27ae60", pending: "#d4af37", rejected: "#c0392b", error: "#c0392b" };

export default function MisPedidosPage() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function buscar(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    // Búsqueda por número de pedido vía ruta de servidor (sin exponer la BD al
    // navegador; sin lookup por email para no permitir enumerar pedidos ajenos).
    try {
      const res = await fetch("/api/mis-pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: query.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      setOrders(data.order ? [data.order] : []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }

  function fmt(date) {
    return new Date(date).toLocaleString("es-CL", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={{ fontFamily: "var(--font-montserrat), sans-serif", background: "#0a0a0a", color: "#e0e0e0", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "#d4af37", fontSize: "0.8rem", textDecoration: "none" }}>← Volver al inicio</Link>

        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "2rem", color: "#d4af37", margin: "20px 0 8px" }}>Mis Pedidos</h1>
        <p style={{ color: "#666", fontSize: "0.88rem", marginBottom: "32px" }}>Ingresa tu número de pedido (lo encuentras en tu correo de confirmación, ej: AH…) para ver el estado.</p>

        <form onSubmit={buscar} style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tu número de pedido (ej: AH…)"
            aria-label="Número de pedido"
            style={{ flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "12px 16px", color: "#e0e0e0", fontSize: "0.9rem", fontFamily: "inherit" }}
          />
          <button type="submit" disabled={loading} style={{ background: "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "12px 22px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", whiteSpace: "nowrap" }}>
            {loading ? "..." : "Buscar"}
          </button>
        </form>

        {searched && !loading && orders !== null && (
          orders.length === 0 ? (
            <div style={{ textAlign: "center", color: "#777", padding: "40px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔍</div>
              <p>No encontramos pedidos con ese número o email.</p>
              <p style={{ fontSize: "0.78rem", marginTop: "8px" }}>¿Tienes dudas? <a href="https://wa.me/56632249728" target="_blank" rel="noreferrer" style={{ color: "#25D366" }}>Escríbenos por WhatsApp</a></p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {orders.map(order => (
                <div key={order.commerce_order} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Pedido</div>
                      <div style={{ fontFamily: "monospace", color: "#d4af37", fontSize: "0.95rem", fontWeight: 700 }}>{order.commerce_order}</div>
                      <div style={{ fontSize: "0.72rem", color: "#777", marginTop: "3px" }}>{fmt(order.created_at)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: STATUS_COLOR[order.status] || "#888", background: (STATUS_COLOR[order.status] || "#888") + "18", border: `1px solid ${(STATUS_COLOR[order.status] || "#888")}44`, padding: "4px 12px", borderRadius: "20px" }}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                      <div style={{ fontSize: "1rem", color: "#d4af37", fontWeight: 700, marginTop: "8px" }}>${(order.total || 0).toLocaleString("es-CL")}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "12px" }}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#ccc", padding: "4px 0" }}>
                        <span>{item.name} · {item.format} ×{item.quantity}</span>
                        <span style={{ color: "#888" }}>${(item.price * item.quantity).toLocaleString("es-CL")}</span>
                      </div>
                    ))}
                  </div>

                  {order.status === "pending" && (
                    <div style={{ marginTop: "14px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.78rem", color: "#d4af37" }}>
                      Tu pago está siendo procesado. Te notificaremos cuando se confirme.
                    </div>
                  )}
                  {order.status === "paid" && (
                    <div style={{ marginTop: "14px", background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.78rem", color: "#27ae60" }}>
                      ¡Pago confirmado! Pronto recibirás un mensaje con los datos de despacho. <a href="https://wa.me/56632249728" target="_blank" rel="noreferrer" style={{ color: "#25D366" }}>Consultar por WhatsApp</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
