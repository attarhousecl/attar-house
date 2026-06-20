"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ perfume, variant = "catalog", index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const [wished, setWished] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return JSON.parse(localStorage.getItem("ah_wishlist") || "[]").includes(perfume.id); } catch { return false; }
  });

  const isDesigner = variant === "designer";
  const isNicho = variant === "nicho";
  const isOut = !isDesigner && !isNicho && !perfume.stock.decant3;
  const isPopular = !isDesigner && !isNicho && perfume.popularity >= 95;
  const isLowStock = !isOut && perfume.stockLow;

  const hasSellado = !isDesigner && !isNicho && perfume.prices.sellado > 0 && perfume.stock.sellado !== false;
  const cardClass = `product-card ${isDesigner ? "designer-card" : ""} ${isNicho ? "nicho-card" : ""} ${isOut ? "card-disabled" : ""}`.trim();

  function toggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const list = JSON.parse(localStorage.getItem("ah_wishlist") || "[]");
      const next = wished ? list.filter((id) => id !== perfume.id) : [...list, perfume.id];
      localStorage.setItem("ah_wishlist", JSON.stringify(next));
      setWished(!wished);
    } catch {}
  }

  return (
    <Link
      href={`/producto/${perfume.id}`}
      className={cardClass}
      style={{ animationDelay: `${Math.min(index, 10) * 0.05}s` }}
    >
      <div className="card-image-area">
        {isDesigner && <span className="designer-badge-card">✦ Diseñador</span>}
        {isNicho && <span className="nicho-badge-card">◆ Nicho</span>}
        {isOut && <span className="sold-out-badge">Agotado</span>}
        {isLowStock && <span className="low-stock-badge">⚡ Últimas unidades</span>}
        {hasSellado && <span className="sellado-badge">✦ Hay Sellado</span>}
        <button className={`wishlist-btn ${wished ? "active" : ""}`} onClick={toggleWishlist} aria-label="Guardar en favoritos">
          {wished ? "♥" : "♡"}
        </button>
        <div className="product-image-container">
          {perfume.imageUrl && !imgError ? (
            <Image
              src={perfume.imageUrl}
              alt={
                isDesigner
                  ? perfume.name
                  : `Decant de perfume árabe ${perfume.name} en Valdivia`
              }
              fill
              sizes="(max-width: 768px) 50vw, 260px"
              priority={index < 4}
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
