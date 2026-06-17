"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProductCard({ perfume, variant = "catalog", index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const isDesigner = variant === "designer";
  const isOut = !isDesigner && !perfume.stock.decant3;
  const isPopular = !isDesigner && perfume.popularity >= 95;

  const cardClass = `product-card ${isDesigner ? "designer-card" : ""} ${isOut ? "card-disabled" : ""}`.trim();

  return (
    <Link
      href={`/producto/${perfume.id}`}
      className={cardClass}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="card-image-area">
        {isDesigner && <span className="designer-badge-card">✦ Diseñador</span>}
        {isOut && <span className="sold-out-badge">Agotado</span>}
        <div className="product-image-container">
          {perfume.imageUrl && !imgError ? (
            <img
              src={perfume.imageUrl}
              alt={
                isDesigner
                  ? perfume.name
                  : `Decant de perfume árabe ${perfume.name} en Valdivia`
              }
              className="real-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="arch-frame">
              <div className={`bottle ${perfume.bottleClass}`}></div>
            </div>
          )}
        </div>
      </div>
      <div className="card-body">
        {isPopular && <span className="popularity-badge">⭐ Popular</span>}
        <div className="product-brand">{perfume.brand}</div>
        <h3 className="product-title serif">{perfume.name}</h3>
        <span className="gender-tag">{perfume.gender}</span>
        <div className="notes-tags">
          {perfume.notes.slice(0, 3).map((n) => (
            <span className="note-tag" key={n}>
              {n}
            </span>
          ))}
        </div>
        <div className="card-price">
          Decant 3ml desde <strong>${perfume.prices.decant3.toLocaleString("es-CL")}</strong>
        </div>
        <button className="btn-view-detail">
          {isOut ? "No Disponible" : "Ver Detalles"}
        </button>
      </div>
    </Link>
  );
}
