"use client";

import { useEffect, useState } from "react";

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return "esta semana";
}

export default function SocialProof() {
  const [sales, setSales] = useState([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  // Carga ventas reales una vez
  useEffect(() => {
    let cancelled = false;
    fetch("/api/recent-sales")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d.sales)) setSales(d.sales); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Ciclo mostrar/ocultar
  useEffect(() => {
    if (sales.length === 0) return;
    let showTimer, hideTimer;

    const ciclo = () => {
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setIdx((i) => (i + 1) % sales.length);
      }, 5000); // visible 5s
    };

    // primer toast tras 4s
    showTimer = setTimeout(ciclo, 4000);
    const interval = setInterval(ciclo, 13000); // cada 13s

    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); clearInterval(interval); };
  }, [sales.length]);

  if (sales.length === 0) return null;
  const venta = sales[idx];
  if (!venta) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 997,
        maxWidth: "290px",
        background: "rgba(17,17,17,0.97)",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: "12px",
        padding: "12px 14px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        transform: visible ? "translateY(0)" : "translateY(140%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.45s ease",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>🛍️</div>
      <div style={{ fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.35 }}>
        <div style={{ fontSize: "0.8rem", color: "#e8e8e8", fontWeight: 600 }}>
          Alguien compró <span style={{ color: "#d4af37" }}>{venta.product}</span>
        </div>
        <div style={{ fontSize: "0.68rem", color: "#888", marginTop: "2px" }}>
          📍 {venta.city} · {tiempoRelativo(venta.at)}
        </div>
      </div>
    </div>
  );
}
