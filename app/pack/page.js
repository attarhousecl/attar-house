"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useCatalog } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

const PACK_DISCOUNT = 0.10;
const MIN_ITEMS = 3;
const MAX_ITEMS = 5;
const FORMAT = "decant10";
const FORMAT_LABEL = "Decant 10ml";

export default function PackPage() {
  const { perfumes } = useCatalog();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const disponibles = useMemo(
    () => perfumes.filter(p => p.prices[FORMAT] > 0 && p.stock[FORMAT] !== false),
    [perfumes]
  );

  const filtrados = useMemo(() => {
    if (!search.trim()) return disponibles;
    const q = search.toLowerCase();
    return disponibles.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }, [disponibles, search]);

  const subtotal = selected.reduce((s, p) => s + p.prices[FORMAT], 0);
  const descuento = Math.round(subtotal * PACK_DISCOUNT);
  const total = subtotal - descuento;
  const listo = selected.length >= MIN_ITEMS;

  function toggleSelect(perfume) {
    if (selected.find(p => p.id === perfume.id)) {
      setSelected(selected.filter(p => p.id !== perfume.id));
    } else if (selected.length < MAX_ITEMS) {
      setSelected([...selected, perfume]);
    } else {
      showToast(`Máximo ${MAX_ITEMS} decants por pack.`);
    }
  }

  function agregarAlCarrito() {
    if (!listo) return;
    // Se agrega a precio COMPLETO: el 10% lo aplica el carrito de forma dinámica
    // (>=3 decants de 10ml) y el servidor lo re-aplica al cobrar. Así, si el
    // cliente luego quita ítems y baja de 3, el descuento se ajusta solo.
    selected.forEach(p => {
      addItem({ id: p.id, name: p.name, format: FORMAT, price: p.prices[FORMAT], quantity: 1 });
    });
    showToast(`Pack de ${selected.length} decants agregado con 10% off 🎉`);
    setSelected([]);
  }

  const estadoTexto = selected.length < MIN_ITEMS
    ? `Elige ${MIN_ITEMS - selected.length} más para activar el 10%`
    : "¡Descuento del 10% activo!";

  const resumen = (
    <>
      <div className="pack-progress-head">
        <span className="mono">{selected.length} / {MAX_ITEMS}</span>
        <span className={listo ? "pack-status ok" : "pack-status"}>{estadoTexto}</span>
      </div>
      <div className="pack-progress-bar" aria-hidden="true">
        <div
          className={`pack-progress-fill ${listo ? "ok" : ""}`}
          style={{ width: `${(selected.length / MAX_ITEMS) * 100}%` }}
        />
      </div>
    </>
  );

  return (
    <div className="pack-page">
      <div className="pack-wrap">
        <div className="pack-head">
          <div className="kicker">🎁 Arma tu set y ahorra</div>
          <h1 className="pack-title">Pack Descubrimiento</h1>
          <p className="pack-sub">
            Elige de {MIN_ITEMS} a {MAX_ITEMS} decants de 10ml (~100 sprays cada uno) y
            llévate un <strong>10% de descuento</strong> en todo el pack.
          </p>
        </div>

        <div className="pack-grid">
          {/* Selector */}
          <div className="pack-picker">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o marca…"
              aria-label="Buscar perfume para el pack"
              className="form-input pack-search"
            />
            {filtrados.length === 0 && (
              <p className="pack-empty">
                {search.trim()
                  ? `No encontramos decants para "${search}".`
                  : "Pronto habrá más decants disponibles para armar tu pack."}
              </p>
            )}
            <div className="pack-cards">
              {filtrados.map(p => {
                const isSelected = !!selected.find(s => s.id === p.id);
                const isDisabled = !isSelected && selected.length >= MAX_ITEMS;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleSelect(p)}
                    className={`pack-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <span className="pack-card-check" aria-hidden="true">✓</span>
                    {p.imageUrl && (
                      <span className="pack-card-img">
                        <Image src={p.imageUrl} alt="" fill sizes="180px" style={{ objectFit: "contain" }} />
                      </span>
                    )}
                    <span className="pack-card-brand">{p.brand}</span>
                    <span className="pack-card-name">{p.name}</span>
                    <span className="pack-card-price">
                      <s>${p.prices[FORMAT].toLocaleString("es-CL")}</s>{" "}
                      <strong>${Math.round(p.prices[FORMAT] * (1 - PACK_DISCOUNT)).toLocaleString("es-CL")}</strong>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen desktop (sticky) */}
          <aside className="pack-summary">
            <div className="pack-summary-card">
              <h3>Tu pack</h3>
              {resumen}

              {selected.length > 0 ? (
                <div className="pack-selected">
                  {selected.map(p => (
                    <div key={p.id} className="pack-selected-item">
                      <span>{p.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleSelect(p)}
                        aria-label={`Quitar ${p.name} del pack`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pack-hint">Toca los perfumes para agregarlos a tu pack.</p>
              )}

              {selected.length > 0 && (
                <div className="pack-totals">
                  <div><span>Subtotal</span><span>${subtotal.toLocaleString("es-CL")}</span></div>
                  <div className={listo ? "ok" : ""}><span>Descuento 10%</span><span>-${descuento.toLocaleString("es-CL")}</span></div>
                  <div className="pack-total-row"><span>Total</span><span>${total.toLocaleString("es-CL")}</span></div>
                </div>
              )}

              <button
                type="button"
                onClick={agregarAlCarrito}
                disabled={!listo}
                className="btn-gold-solid pack-cta"
              >
                {listo ? "Agregar pack al carrito" : `Selecciona al menos ${MIN_ITEMS}`}
              </button>
              <p className="pack-note mono">Cada decant es {FORMAT_LABEL} · ~100 atomizaciones</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Barra fija móvil: lo elegido siempre a la vista, nunca "al fondo" */}
      <div className={`pack-mobile-bar ${selected.length > 0 ? "has-items" : ""}`}>
        {selected.length > 0 && (
          <div className="pack-mobile-chips" aria-label="Perfumes seleccionados">
            {selected.map(p => (
              <button
                key={p.id}
                type="button"
                className="pack-mobile-chip"
                onClick={() => toggleSelect(p)}
                aria-label={`Quitar ${p.name} del pack`}
              >
                {p.name} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
        <div className="pack-mobile-row">
          <div className="pack-mobile-info">
            <span className="mono pack-mobile-count">{selected.length}/{MAX_ITEMS} · {listo ? "10% activo" : `faltan ${Math.max(0, MIN_ITEMS - selected.length)}`}</span>
            <span className="pack-mobile-total">${total.toLocaleString("es-CL")}</span>
          </div>
          <button
            type="button"
            onClick={agregarAlCarrito}
            disabled={!listo}
            className="pack-mobile-cta"
          >
            {listo ? "Agregar pack" : `Mínimo ${MIN_ITEMS}`}
          </button>
        </div>
      </div>
    </div>
  );
}
