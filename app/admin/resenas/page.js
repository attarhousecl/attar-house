"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// Moderación de reseñas: las nuevas llegan con approved=false y NO se ven en
// la tienda hasta aprobarse aquí. Lecturas y cambios via /api/admin/reviews
// (service role en el servidor, protegido por correo admin).
const FILTROS = ["Pendientes", "Aprobadas", "Todas"];

export default function ResenasPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("Pendientes");
  const [busy, setBusy] = useState(null); // id en proceso

  const cargar = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudieron cargar las reseñas.");
        setReviews([]);
      } else {
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      }
    } catch {
      setError("No se pudieron cargar las reseñas.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function moderar(id, action) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "delete" ? { id } : { id, approved: action === "approve" }),
      });
      if (res.ok) {
        if (action === "delete") {
          setReviews((rs) => rs.filter((r) => r.id !== id));
        } else {
          setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, approved: action === "approve" } : r)));
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo aplicar el cambio.");
      }
    } catch {
      setError("No se pudo aplicar el cambio.");
    }
    setBusy(null);
  }

  const pendientes = reviews.filter((r) => !r.approved);
  const visibles = reviews.filter((r) => {
    if (filtro === "Pendientes") return !r.approved;
    if (filtro === "Aprobadas") return r.approved;
    return true;
  });

  const counts = { Pendientes: pendientes.length, Aprobadas: reviews.length - pendientes.length, Todas: reviews.length };

  function fmt(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={S.backBtn} onClick={() => router.push("/admin")}>← Admin</button>
          <h1 style={S.h1}>⭐ Reseñas</h1>
        </div>
        <div style={{ fontSize: "0.8rem", color: pendientes.length > 0 ? "#F0A855" : "#8DD8A0", fontWeight: 700 }}>
          {pendientes.length > 0 ? `${pendientes.length} pendiente${pendientes.length !== 1 ? "s" : ""} de aprobación` : "Sin pendientes"}
        </div>
      </header>

      <div style={S.content}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{ ...S.filtro, ...(filtro === f ? S.filtroActivo : {}) }}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {error && <p style={{ color: "#E89166", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</p>}

        {loading ? (
          <p style={{ color: "#6B7A73" }}>Cargando reseñas…</p>
        ) : visibles.length === 0 ? (
          <p style={{ color: "#6B7A73", padding: "30px 0", textAlign: "center" }}>
            {filtro === "Pendientes" ? "🎉 No hay reseñas esperando aprobación." : "No hay reseñas en esta vista."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {visibles.map((r) => (
              <div key={r.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#7A8985", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "3px" }}>
                      {r.perfumes?.brand ? `${r.perfumes.brand} · ` : ""}{r.perfumes?.name || r.perfume_id}
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "#FDFCFA", fontWeight: 600 }}>
                      {r.author_name}{" "}
                      <span style={{ color: "#8DD8A0", fontSize: "0.85rem", letterSpacing: "2px" }}>
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={r.approved ? S.badgeOk : S.badgePend}>
                      {r.approved ? "Pública" : "Pendiente"}
                    </span>
                    <div style={{ fontSize: "0.7rem", color: "#6B7A73", marginTop: "5px" }}>{fmt(r.created_at)}</div>
                  </div>
                </div>

                <p style={{ color: "#C5CAC7", fontSize: "0.88rem", lineHeight: 1.6, margin: "10px 0 14px" }}>{r.comment}</p>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {r.approved ? (
                    <button style={S.btnGhost} disabled={busy === r.id} onClick={() => moderar(r.id, "hide")}>
                      Ocultar
                    </button>
                  ) : (
                    <button style={S.btnAprobar} disabled={busy === r.id} onClick={() => moderar(r.id, "approve")}>
                      ✓ Aprobar
                    </button>
                  )}
                  <button
                    style={S.btnEliminar}
                    disabled={busy === r.id}
                    onClick={() => { if (window.confirm("¿Eliminar esta reseña definitivamente?")) moderar(r.id, "delete"); }}
                  >
                    Eliminar
                  </button>
                  {busy === r.id && <span style={{ color: "#6B7A73", fontSize: "0.78rem", alignSelf: "center" }}>Aplicando…</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#0F1613", color: "#FDFCFA", fontFamily: "var(--font-archivo), sans-serif" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px",
    padding: "16px 24px", borderBottom: "1px solid #1F2B27", background: "#151D1A",
    position: "sticky", top: 0, zIndex: 10,
  },
  h1: { fontSize: "1.15rem", margin: 0, color: "#8DD8A0" },
  backBtn: {
    background: "transparent", border: "1px solid #1F2B27", color: "#7A8985",
    borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem",
  },
  content: { padding: "24px", maxWidth: "860px", margin: "0 auto" },
  filtro: {
    background: "transparent", border: "1px solid #1F2B27", color: "#7A8985",
    borderRadius: "20px", padding: "7px 16px", cursor: "pointer", fontSize: "0.8rem",
  },
  filtroActivo: { background: "#8DD8A0", border: "1px solid #8DD8A0", color: "#0F1613", fontWeight: 700 },
  card: { background: "#151D1A", border: "1px solid #1F2B27", borderRadius: "12px", padding: "18px 20px" },
  badgeOk: {
    fontSize: "0.68rem", fontWeight: 700, color: "#8DD8A0", background: "rgba(141,216,160, 0.12)",
    border: "1px solid rgba(141,216,160, 0.35)", padding: "4px 12px", borderRadius: "20px",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  badgePend: {
    fontSize: "0.68rem", fontWeight: 700, color: "#F0A855", background: "rgba(240,168,85, 0.1)",
    border: "1px solid rgba(240,168,85, 0.35)", padding: "4px 12px", borderRadius: "20px",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  btnAprobar: {
    background: "#8DD8A0", border: "none", color: "#0F1613", fontWeight: 700,
    borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontSize: "0.82rem",
  },
  btnGhost: {
    background: "transparent", border: "1px solid #1F2B27", color: "#C5CAC7",
    borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontSize: "0.82rem",
  },
  btnEliminar: {
    background: "transparent", border: "1px solid rgba(232,145,102, 0.5)", color: "#E89166",
    borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontSize: "0.82rem",
  },
};
