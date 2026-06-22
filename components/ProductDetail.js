"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCatalog, labelsFormatos } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";
import ReviewSection from "./ReviewSection";
import RelatedProducts from "./RelatedProducts";

const ATOMIZACIONES = {
  decant3:  { sprays: 30,  dias: "7–10 días" },
  decant5:  { sprays: 50,  dias: "2–3 semanas" },
  decant10: { sprays: 100, dias: "1–2 meses" },
};

export default function ProductDetail({ id }) {
  const { perfumes, loading } = useCatalog();
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [wished, setWished] = useState(false);

  const perfume = perfumes.find((p) => p.id === id);

  // Estado de favorito para este perfume (mismo almacenamiento que las tarjetas).
  useEffect(() => {
    if (!id) return;
    try { setWished(JSON.parse(localStorage.getItem("ah_wishlist") || "[]").includes(id)); }
    catch { setWished(false); }
  }, [id]);

  function toggleWishlist() {
    try {
      const list = JSON.parse(localStorage.getItem("ah_wishlist") || "[]");
      const next = wished ? list.filter((x) => x !== id) : [...list, id];
      localStorage.setItem("ah_wishlist", JSON.stringify(next));
      setWished(!wished);
      window.dispatchEvent(new Event("ah-wishlist-change"));
    } catch {}
  }

  const options = perfume
    ? Object.keys(perfume.prices)
        .filter((k) => perfume.prices[k] !== 0)
        .map((k) => ({
          key: k,
          label: labelsFormatos[k] || k,
          price: perfume.prices[k],
          disabled: perfume.stock[k] === false,
        }))
    : [];

  useEffect(() => {
    if (options.length === 0) return;
    const firstAvailable = options.find((o) => !o.disabled);
    setSelectedFormat(firstAvailable ? firstAvailable.key : options[0].key);
  }, [perfume?.id]);

  // Señala que esta página tiene barra de compra fija (mobile) para subir los FABs.
  useEffect(() => {
    document.body.classList.add("has-buy-bar");
    return () => document.body.classList.remove("has-buy-bar");
  }, []);

  if (loading) {
    return (
      <section id="detalle-perfume" className="page-section active">
        <div className="container" id="detalle-container">
          <div className="detail-grid" aria-busy="true" aria-label="Cargando producto">
            <div className="sk" style={{ minHeight: "380px", borderRadius: "16px" }} />
            <div>
              <div className="sk" style={{ height: "14px", width: "40%", marginBottom: "16px" }} />
              <div className="sk" style={{ height: "34px", width: "70%", marginBottom: "20px" }} />
              <div className="sk" style={{ height: "12px", width: "100%", marginBottom: "8px" }} />
              <div className="sk" style={{ height: "12px", width: "94%", marginBottom: "8px" }} />
              <div className="sk" style={{ height: "12px", width: "82%", marginBottom: "24px" }} />
              <div className="sk" style={{ height: "12px", width: "50%" }} />
            </div>
            <div className="sk" style={{ minHeight: "280px", borderRadius: "16px" }} />
          </div>
        </div>
      </section>
    );
  }

  if (!perfume) {
    return (
      <section id="detalle-perfume" className="page-section active">
        <div className="container" id="detalle-container">
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 20px" }}>
            No encontramos este perfume.
          </p>
          <div style={{ textAlign: "center" }}>
            <Link href="/catalogo" className="btn-back">
              <i className="ph ph-arrow-left"></i> Volver al catálogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const esDisenador = perfume.inspiration === "Diseñador Original";
  const esNicho = perfume.inspiration === "Nicho";
  const backHref = esDisenador ? "/disenador" : "/catalogo";
  const labelVolver = esDisenador ? "Volver a Diseñador" : "Volver al catálogo";

  const stockCount = Object.values(perfume.stock).filter(Boolean).length;
  const showUrgency = !esDisenador && !esNicho && stockCount <= 2;

  const selectedOpt = options.find((o) => o.key === selectedFormat);
  const canAddToCart = !!selectedOpt && !selectedOpt.disabled;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addToCart(perfume, selectedFormat);
  };

  return (
    <section id="detalle-perfume" className="page-section active">
      <div className="container" id="detalle-container">
        <Link href={backHref} className="btn-back">
          <i className="ph ph-arrow-left"></i> {labelVolver}
        </Link>
        <div className="detail-grid">
          <div className="detail-image-col">
            {perfume.imageUrl && !imgError ? (
              <Image
                src={perfume.imageUrl}
                alt={perfume.name}
                fill
                priority
                sizes="(max-width: 950px) 90vw, 460px"
                className="real-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="detail-arch">
                <div className={`bottle ${perfume.bottleClass}`}></div>
              </div>
            )}
          </div>
          <div className="detail-info-col">
            <div className="detail-brand">
              {perfume.brand} | {perfume.gender}
            </div>
            <h2 className="detail-title serif">{perfume.name}</h2>
            <div className="inspiration-badge">
              Inspirado en: <strong>{perfume.inspiration}</strong>
            </div>
            <p className="detail-desc">{perfume.description}</p>
            <div className="detail-notes">
              <h4>Notas Olfativas Principales</h4>
              <div className="notes-tags" style={{ justifyContent: "flex-start" }}>
                {perfume.notes.map((n) => (
                  <span className="note-tag" key={n}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="detail-action-col">
            <div className="purchase-box">
              <h4
                style={{
                  marginBottom: "15px",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--gold-primary)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  paddingBottom: "10px",
                }}
              >
                Elige tu formato
              </h4>
              <div className="format-options">
                {options.map((o) => (
                  <button
                    type="button"
                    key={o.key}
                    className={`format-option ${selectedFormat === o.key ? "selected" : ""}`}
                    disabled={o.disabled}
                    onClick={() => setSelectedFormat(o.key)}
                    aria-pressed={selectedFormat === o.key}
                  >
                    <span className="fo-main">
                      <span className="fo-label">{o.label}</span>
                      {ATOMIZACIONES[o.key] && (
                        <span className="fo-sub">~{ATOMIZACIONES[o.key].sprays} atomizaciones</span>
                      )}
                    </span>
                    <span className="fo-price">
                      {o.disabled ? "Agotado" : `$${o.price.toLocaleString("es-CL")}`}
                    </span>
                  </button>
                ))}
              </div>
              {selectedFormat && ATOMIZACIONES[selectedFormat] && (
                <div style={{ display: "flex", gap: "16px", margin: "10px 0 14px", padding: "10px 14px", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "8px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <span>💨 <strong style={{ color: "var(--gold-primary)" }}>~{ATOMIZACIONES[selectedFormat].sprays}</strong> atomizaciones</span>
                  <span>📅 Rinde aprox. <strong style={{ color: "var(--gold-primary)" }}>{ATOMIZACIONES[selectedFormat].dias}</strong></span>
                </div>
              )}
              {showUrgency && (
                <div style={{ background: "rgba(220,60,30,0.08)", border: "1px solid rgba(220,60,30,0.25)", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px", fontSize: "0.75rem", color: "#e07060" }}>
                  ⚠ Últimas unidades disponibles
                </div>
              )}
              <button className="btn-add-cart-gold" onClick={handleAddToCart} disabled={!canAddToCart}>
                <i className="ph ph-shopping-cart" style={{ fontSize: "1.2rem" }}></i>{" "}
                {canAddToCart
                  ? `Añadir al Carrito · $${selectedOpt.price.toLocaleString("es-CL")}`
                  : "Agotado"}
              </button>
              <button
                type="button"
                onClick={toggleWishlist}
                aria-pressed={wished}
                style={{
                  width: "100%", marginTop: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  background: "transparent",
                  border: `1px solid ${wished ? "rgba(220,0,80,0.5)" : "var(--border-gold)"}`,
                  color: wished ? "#e05a7a" : "var(--text-muted)",
                  borderRadius: "8px", padding: "11px",
                  fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px",
                  cursor: "pointer", fontFamily: "var(--font-montserrat), sans-serif", transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "1rem", lineHeight: 1 }}>{wished ? "♥" : "♡"}</span>
                {wished ? "Guardado en favoritos" : "Guardar en favoritos"}
              </button>
              <div style={{ marginTop: "18px", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.9" }}>
                <p>✓ Autenticidad Garantizada</p>
                <p>✓ Envíos a todo Chile por Starken</p>
                <p>✓ Retiro gratis en Valdivia</p>
                <p style={{ marginTop: "6px", color: "rgba(212,175,55,0.7)" }}>
                  🚚 Envío gratis en pedidos sobre $60.000
                </p>
              </div>
            </div>
          </div>
        </div>

        <ReviewSection perfumeId={perfume.id} />

        <RelatedProducts perfume={perfume} />
      </div>

      {/* Barra de compra fija (solo mobile): "añadir al carrito" siempre a un toque. */}
      <div className="mobile-buy-bar">
        <div className="mbb-info">
          <span className="mbb-label">{selectedOpt ? selectedOpt.label : "Formato"}</span>
          <span className="mbb-price">{selectedOpt ? `$${selectedOpt.price.toLocaleString("es-CL")}` : ""}</span>
        </div>
        <button className="mbb-btn" onClick={handleAddToCart} disabled={!canAddToCart}>
          <i className="ph ph-shopping-cart" aria-hidden="true"></i>
          {canAddToCart ? "Añadir" : "Agotado"}
        </button>
      </div>
    </section>
  );
}
