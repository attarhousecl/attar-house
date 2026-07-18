"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

  return (
    <div style={{ fontFamily: "var(--font-montserrat), sans-serif", background: "var(--bg-base)", color: "var(--text-main)", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--accent)", fontSize: "0.8rem", textDecoration: "none" }}>← Volver</Link>

        <div style={{ textAlign: "center", margin: "24px 0 40px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎁</div>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", color: "var(--accent)", fontSize: "2rem", margin: "0 0 8px" }}>Pack Descubrimiento</h1>
          <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", margin: 0 }}>Elige {MIN_ITEMS}–{MAX_ITEMS} decants de 10ml y obtén <strong style={{ color: "var(--accent)" }}>10% de descuento</strong></p>
        </div>

        <div className="pack-grid">
          {/* Left: selector */}
          <div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar perfume..."
              aria-label="Buscar perfume para el pack"
              style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-gold)", borderRadius: "8px", padding: "10px 16px", color: "var(--text-main)", fontSize: "0.88rem", marginBottom: "16px", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            {filtrados.length === 0 && (
              <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", textAlign: "center", padding: "32px 0" }}>
                {search.trim()
                  ? `No encontramos decants para "${search}".`
                  : "Pronto habrá más decants disponibles para armar tu pack."}
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {filtrados.map(p => {
                const isSelected = !!selected.find(s => s.id === p.id);
                const isDisabled = !isSelected && selected.length >= MAX_ITEMS;
                return (
                  <button
                    key={p.id}
                    onClick={() => !isDisabled && toggleSelect(p)}
                    style={{
                      background: isSelected ? "rgba(var(--accent-rgb), 0.12)" : "var(--bg-card)",
                      border: isSelected ? "2px solid var(--accent)" : "1px solid var(--bg-card)",
                      borderRadius: "10px", padding: "14px 12px", cursor: isDisabled ? "default" : "pointer",
                      textAlign: "left", opacity: isDisabled ? 0.4 : 1, transition: "all 0.2s",
                    }}
                  >
                    {p.imageUrl && (
                      <div style={{ position: "relative", width: "100%", height: "80px", marginBottom: "8px" }}>
                        <Image src={p.imageUrl} alt={p.name} fill sizes="180px" style={{ objectFit: "contain" }} />
                      </div>
                    )}
                    <div style={{ fontSize: "0.65rem", color: "var(--text-soft)", marginBottom: "2px" }}>{p.brand}</div>
                    <div style={{ fontSize: "0.82rem", color: isSelected ? "var(--accent)" : "var(--text-muted)", fontWeight: 600, marginBottom: "4px", lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-soft)" }}>
                      <span style={{ textDecoration: "line-through", marginRight: "4px" }}>${p.prices[FORMAT].toLocaleString("es-CL")}</span>
                      <span style={{ color: "var(--accent)" }}>${Math.round(p.prices[FORMAT] * (1 - PACK_DISCOUNT)).toLocaleString("es-CL")}</span>
                    </div>
                    {isSelected && <div style={{ marginTop: "6px", fontSize: "0.65rem", color: "var(--accent)", fontWeight: 700 }}>✓ Seleccionado</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: summary */}
          <div className="pack-summary" style={{ position: "sticky", top: "80px", alignSelf: "flex-start" }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card)", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px", color: "var(--accent)", fontSize: "0.95rem" }}>Tu Pack</h3>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-soft)", marginBottom: "12px" }}>
                <span>{selected.length} / {MAX_ITEMS} seleccionados</span>
                <span style={{ color: selected.length >= MIN_ITEMS ? "var(--exito)" : "var(--accent)" }}>
                  {selected.length < MIN_ITEMS ? `Faltan ${MIN_ITEMS - selected.length} para activar` : "¡Descuento activo!"}
                </span>
              </div>

              <div style={{ height: "4px", background: "var(--bg-card)", borderRadius: "2px", marginBottom: "20px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(selected.length / MAX_ITEMS) * 100}%`, background: listo ? "var(--exito)" : "var(--accent)", transition: "width 0.3s" }} />
              </div>

              {selected.length > 0 ? (
                <div style={{ marginBottom: "16px" }}>
                  {selected.map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--bg-card)", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>{p.name}</span>
                      <button onClick={() => toggleSelect(p)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-soft)", fontSize: "0.78rem", textAlign: "center", padding: "12px 0" }}>Selecciona perfumes para armar tu pack</p>
              )}

              {selected.length > 0 && (
                <div style={{ paddingTop: "12px", borderTop: "1px solid var(--bg-card)", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-soft)", marginBottom: "4px" }}>
                    <span>Subtotal</span><span>${subtotal.toLocaleString("es-CL")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: listo ? "var(--exito)" : "#333", marginBottom: "8px" }}>
                    <span>Descuento 10%</span><span>-${descuento.toLocaleString("es-CL")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent)", fontWeight: 700, fontSize: "1rem" }}>
                    <span>Total</span><span>${total.toLocaleString("es-CL")}</span>
                  </div>
                </div>
              )}

              <button
                onClick={agregarAlCarrito}
                disabled={!listo}
                style={{ marginTop: "20px", width: "100%", background: listo ? "var(--accent)" : "var(--bg-card)", color: listo ? "#000" : "#333", border: "none", borderRadius: "8px", padding: "14px", fontWeight: 700, fontSize: "0.88rem", cursor: listo ? "pointer" : "default", transition: "all 0.2s" }}
              >
                {listo ? `Agregar pack al carrito` : `Selecciona al menos ${MIN_ITEMS}`}
              </button>

              <p style={{ marginTop: "12px", fontSize: "0.7rem", color: "var(--text-soft)", textAlign: "center" }}>Cada decant es de {FORMAT_LABEL} (~100 atomizaciones)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
