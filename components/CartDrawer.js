"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCatalog, labelsFormatos } from "@/context/CatalogContext";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [freeGift, setFreeGift] = useState("");
  const { cart, updateQty, total, decantTotal, itemCount, freeShippingEligible, freeGiftEligible, SHIPPING_THRESHOLD, GIFT_THRESHOLD } =
    useCart();
  const { arabDB } = useCatalog();

  useEffect(() => {
    if (arabDB.length > 0 && !freeGift) {
      setFreeGift(`${arabDB[0].name} (Decant 3ml)`);
    }
  }, [arabDB, freeGift]);

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
      <div className="cart-toggle" onClick={() => setOpen(true)}>
        <i className="ph ph-shopping-cart"></i>
        <span className="cart-badge">{itemCount}</span>
      </div>

      <div className={`cart-sidebar ${open ? "open" : ""}`}>
        <div className="cart-header">
          <h3 className="serif">Tu Pedido</h3>
          <button className="close-cart" onClick={() => setOpen(false)}>
            <i className="ph ph-x"></i>
          </button>
        </div>

        {cart.length > 0 && (
          <div
            className="shipping-progress"
            style={{
              display: "block",
              background: "rgba(212,175,55,0.05)",
              padding: "15px 20px",
              textAlign: "center",
              fontSize: "0.85rem",
              borderBottom: "1px solid rgba(212,175,55,0.2)",
              color: "var(--text-muted)",
              lineHeight: "1.6",
            }}
          >
            {freeGiftEligible ? (
              <div style={{ color: "var(--gold-primary)", fontWeight: 600 }}>
                <i className="ph ph-gift"></i> ¡Ganaste un decant de regalo!
              </div>
            ) : (
              <div style={{ fontSize: "0.82rem" }}>
                Agrega{" "}
                <strong style={{ color: "var(--gold-primary)" }}>
                  ${(GIFT_THRESHOLD - decantTotal).toLocaleString("es-CL")} en decants
                </strong>{" "}
                y gana un 🎁 gratis.
              </div>
            )}

            {freeShippingEligible ? (
              <div style={{ marginTop: "6px", color: "#25D366", fontWeight: "bold" }}>
                <i className="ph ph-check-circle"></i> ¡Envío gratis alcanzado!
              </div>
            ) : (
              <div style={{ marginTop: "6px", fontSize: "0.82rem" }}>
                Faltan{" "}
                <strong style={{ color: "var(--gold-primary)" }}>
                  ${(SHIPPING_THRESHOLD - total).toLocaleString("es-CL")}
                </strong>{" "}
                para envío gratis 🚚.
              </div>
            )}
          </div>
        )}

        <div className="cart-items">
          {cart.length === 0 ? (
            <p style={{ textAlign: "center", color: "#555", marginTop: "20px" }}>
              Tu carrito está vacío
            </p>
          ) : (
            cart.map((i, idx) => {
              const sub = i.price * i.quantity;
              const displayFormat = labelsFormatos[i.format] || i.format;
              return (
                <div className="cart-item" key={`${i.name}-${i.format}`}>
                  <div className="cart-item-info">
                    <h4>{i.name}</h4>
                    <p>{displayFormat}</p>
                    <b>${sub.toLocaleString("es-CL")}</b>
                  </div>
                  <div className="cart-item-actions">
                    <button className="qty-btn" onClick={() => updateQty(idx, -1)}>
                      -
                    </button>
                    <span>{i.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(idx, 1)}>
                      +
                    </button>
                    <button className="remove-btn" onClick={() => updateQty(idx, -999)}>
                      <i className="ph ph-trash"></i>
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
          <button className="btn-whatsapp-final" onClick={sendWhatsAppOrder}>
            <i className="ph ph-whatsapp-logo"></i> Enviar por WhatsApp
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
