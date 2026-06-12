"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCatalog, labelsFormatos } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";
import ReviewSection from "./ReviewSection";

export default function ProductDetail({ id }) {
  const { perfumes, loading } = useCatalog();
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("");

  const perfume = perfumes.find((p) => p.id === id);

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

  if (loading) {
    return (
      <section id="detalle-perfume" className="page-section active">
        <div className="container" id="detalle-container">
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 20px" }}>
            Cargando...
          </p>
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
  const backHref = esDisenador ? "/disenador" : "/catalogo";
  const labelVolver = esDisenador ? "Volver a Diseñador" : "Volver al catálogo";

  const handleAddToCart = () => {
    if (!selectedFormat) return;
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
              <img
                src={perfume.imageUrl}
                alt={perfume.name}
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
            <ReviewSection perfumeId={perfume.id} />
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
              <select
                className="format-select"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                {options.map((o) =>
                  o.disabled ? (
                    <option key={o.key} disabled>
                      {o.label} - AGOTADO
                    </option>
                  ) : (
                    <option key={o.key} value={o.key}>
                      {o.label} - ${o.price.toLocaleString("es-CL")}
                    </option>
                  )
                )}
              </select>
              <button className="btn-add-cart-gold" onClick={handleAddToCart}>
                <i className="ph ph-shopping-cart" style={{ fontSize: "1.2rem" }}></i> Añadir al Carrito
              </button>
              <div style={{ marginTop: "18px", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.8" }}>
                <p>✓ Autenticidad Garantizada</p>
                <p>✓ Envíos a todo Chile por Starken</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
