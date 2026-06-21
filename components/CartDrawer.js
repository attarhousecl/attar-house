"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCatalog, labelsFormatos } from "@/context/CatalogContext";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { cart, updateQty, total, decantTotal, itemCount, freeShippingEligible, freeGiftEligible, freeGift, setFreeGift, SHIPPING_THRESHOLD, GIFT_THRESHOLD } =
    useCart();
  const { arabDB } = useCatalog();

  useEffect(() => {
    if (arabDB.length > 0 && !freeGift) {
      setFreeGift(`${arabDB[0].name} (Decant 3ml)`);
    }
  }, [arabDB, freeGift, setFreeGift]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let t = "¡Hola Attar House! Me gustaría realizar el siguiente pedido:\n\n";
    cart.forEach((i) => {
      const sub = i.price * i.quantity;
      const displayFormat = labelsFormatos[i.format] || i.format;
      t += `▪ ${i.quantity}x ${i.name} (${displayFormat}) - $${sub.toLocaleString("es-CL")}\n`;
    });

    t += `\n*Total Estimado: $${total.toLocaleString("es-CL")}*\n`;

    if (freeShippingEligible) t += `🚚 *¡Mi pedido califica para ENVÍO GRATIS!*\n`;
    if (freeGiftEligible) t += `🎁 *Mi pedido incluye un regalo: ${freeGift}*\n`;

    t += `\nQuedo atento/a para coordinar el pago y la entrega.`;

    const urlSegura = `https://wa.me/56632249728?text=${encodeURIComponent(t)}`;
    window.open(urlSegura, "_blank");
  };

  return (
    <>
      <button
        type="button"
        className="cart-toggle"
        onClick={() => setOpen(true)}
        aria-label={`Abrir carrito (${itemCount} ${itemCount === 1 ? "artículo" : "artículos"})`}
      >
        <i className="ph ph-shopping-cart" aria-hidden="true"></i>
        <span className="cart-badge">{itemCount}</span>
      </button>

      {open && <div className="cart-overlay" onClick={() => setOpen(false)} />}

      <div className={`cart-sidebar ${open ? "open" : ""}`}>
        <div className="cart-header">
          <h3 className="serif">Tu Pedido</h3>
          <button className="close-cart" onClick={() => setOpen(false)} aria-label="Cerrar carrito">
            <i className="ph ph-x" aria-hidden="true"></i>
          </button>
        </div>

        {cart.length > 0 && (
          <div style={{ background: "rgba(212,175,55,0.04)", padding: "14px 18px", borderBottom: "1px solid rgba(212,175,55,0.15)", fontSize: "0.8rem" }}>
            {/* Barra envío gratis */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", color: "var(--text-muted)" }}>
                <span>🚚 Envío gratis</span>
                {freeShippingEligible
                  ? <span style={{ color: "#25D366", fontWeight: 700 }}>¡Alcanzado!</span>
                  : <span>Faltan <strong style={{ color: "#d4af37" }}>${(SHIPPING_THRESHOLD - total).toLocaleString("es-CL")}</strong></span>
                }
              </div>
              <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (total / SHIPPING_THRESHOLD) * 100)}%`, background: freeShippingEligible ? "#25D366" : "#d4af37", borderRadius: "3px", transition: "width 0.4s ease" }} />
              </div>
            </div>
            {/* Barra regalo */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", color: "var(--text-muted)" }}>
                <span>🎁 Decant de regalo</span>
                {freeGiftEligible
                  ? <span style={{ color: "#d4af37", fontWeight: 700 }}>¡Ganaste!</span>
                  : <span>Faltan <strong style={{ color: "#d4af37" }}>${(GIFT_THRESHOLD - decantTotal).toLocaleString("es-CL")}</strong></span>
                }
              </div>
              <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (decantTotal / GIFT_THRESHOLD) * 100)}%`, background: freeGiftEligible ? "#d4af37" : "rgba(212,175,55,0.5)", borderRadius: "3px", transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>
        )}

        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", color: "#666", marginTop: "40px", padding: "0 20px" }}>
              <i className="ph ph-shopping-bag" style={{ fontSize: "2.4rem", color: "var(--gold-dark)" }} aria-hidden="true"></i>
              <p style={{ marginTop: "12px", marginBottom: "18px" }}>Tu carrito está vacío</p>
              <a
                href="/catalogo"
                onClick={() => setOpen(false)}
                style={{ display: "inline-block", border: "1px solid var(--gold-primary)", color: "var(--gold-primary)", padding: "10px 22px", borderRadius: "8px", textDecoration: "none", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}
              >
                Ver catálogo
              </a>
            </div>
          ) : (
            cart.map((i, idx) => {
              const sub = i.price * i.quantity;
              const displayFormat = labelsFormatos[i.format] || i.format;
              return (
                <div className="cart-item" key={`${i.id}-${i.format}-${i.price}`}>
                  <div className="cart-item-info">
                    <h4>{i.name}</h4>
                    <p>{displayFormat}</p>
                    <b>${sub.toLocaleString("es-CL")}</b>
                  </div>
                  <div className="cart-item-actions">
                    <button className="qty-btn" onClick={() => updateQty(idx, -1)} aria-label={`Quitar uno de ${i.name}`}>
                      -
                    </button>
                    <span>{i.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(idx, 1)} aria-label={`Agregar uno de ${i.name}`}>
                      +
                    </button>
                    <button className="remove-btn" onClick={() => updateQty(idx, -999)} aria-label={`Eliminar ${i.name} del carrito`}>
                      <i className="ph ph-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {freeGiftEligible && (
          <div
            className="free-gift-container"
            style={{ padding: "20px", borderBottom: "1px solid #333", display: "block" }}
          >
            <h4 style={{ fontSize: "0.9rem", color: "var(--gold-primary)", marginBottom: "10px" }}>
              🎁 ELIGE TU REGALO
            </h4>
            <select
              className="free-gift-select"
              aria-label="Elige tu decant de regalo"
              style={{ width: "100%", padding: "10px", background: "#000", color: "#fff", border: "1px solid #333", borderRadius: "6px" }}
              value={freeGift}
              onChange={(e) => setFreeGift(e.target.value)}
            >
              {arabDB.map((p) => (
                <option key={p.id} value={`${p.name} (Decant 3ml)`}>
                  {p.name} - Decant 3ml
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span style={{ color: "var(--gold-primary)" }}>${total.toLocaleString("es-CL")}</span>
          </div>
          <a
            href="/checkout"
            className="btn-add-cart-gold"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", marginBottom: "10px" }}
            onClick={() => setOpen(false)}
          >
            <i className="ph ph-credit-card" style={{ fontSize: "1.2rem" }}></i> Pagar con Mercado Pago
          </a>
          <button className="btn-whatsapp-final" onClick={sendWhatsAppOrder}>
            <i className="ph ph-whatsapp-logo"></i> Pedir por WhatsApp
          </button>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              marginTop: "15px",
              textTransform: "none",
            }}
          >
            Pago contra entrega en Valdivia. Transferencia bancaria para envíos a regiones.
          </p>
        </div>
      </div>
    </>
  );
}
