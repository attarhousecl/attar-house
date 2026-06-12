"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCatalog, labelsFormatos } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";

const REGIONES = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "Metropolitana de Santiago", "Libertador General Bernardo O'Higgins",
  "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos", "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo", "Magallanes y de la Antártica Chilena",
];

export default function CheckoutPage() {
  const { cart, total, freeGiftEligible } = useCart();
  const { arabDB } = useCatalog();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    comuna: "",
    direccion: "",
    notas: "",
  });
  const [freeGift, setFreeGift] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (arabDB.length > 0 && !freeGift) {
      setFreeGift(`${arabDB[0].name} (Decant 3ml)`);
    }
  }, [arabDB, freeGift]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      showToast("⚠️ Completa tu nombre, correo y teléfono.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customer: { name: form.name, email: form.email, phone: form.phone },
          shipping: {
            region: form.region,
            comuna: form.comuna,
            direccion: form.direccion,
            notas: form.notas,
          },
          freeGift: freeGiftEligible ? freeGift : null,
        }),
      });
      const data = await res.json();

      if (data.error) {
        showToast(`⚠️ ${data.error}`);
        setLoading(false);
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      showToast("⚠️ No se pudo conectar con el servidor de pagos.");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section id="checkout" className="page-section active">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="section-title serif">Finalizar Compra</h2>
          <p className="section-subtitle">Tu carrito está vacío.</p>
          <Link href="/catalogo" className="btn-primary">
            <span>Ver Catálogo</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="checkout" className="page-section active">
      <div className="container">
        <h2 className="section-title serif" style={{ marginBottom: "40px" }}>
          Finalizar Compra
        </h2>
        <div className="checkout-grid">
          <div className="checkout-summary">
            <h3 className="serif">Tu Pedido</h3>
            {cart.map((i) => (
              <div className="checkout-item" key={`${i.id}-${i.format}`}>
                <div className="checkout-item-info">
                  <strong>{i.name}</strong>
                  <p>
                    {labelsFormatos[i.format] || i.format} × {i.quantity}
                  </p>
                </div>
                <div>${(i.price * i.quantity).toLocaleString("es-CL")}</div>
              </div>
            ))}
            {freeGiftEligible && (
              <div className="form-group">
                <label className="form-label">🎁 Elige tu regalo (Decant 3ml)</label>
                <select
                  className="form-select"
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
            <div className="checkout-total">
              <span>Total:</span>
              <span style={{ color: "var(--gold-primary)" }}>${total.toLocaleString("es-CL")}</span>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3 className="serif">Datos de Contacto y Envío</h3>

            <label className="form-label" htmlFor="name">Nombre completo</label>
            <input
              id="name"
              name="name"
              className="form-input"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <div>
                <label className="form-label" htmlFor="email">Correo</label>
                <input
                  id="email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  className="form-input"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label className="form-label" htmlFor="region">Región</label>
                <select id="region" name="region" className="form-select" value={form.region} onChange={handleChange}>
                  <option value="">Selecciona tu región</option>
                  {REGIONES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="comuna">Comuna</label>
                <input
                  id="comuna"
                  name="comuna"
                  className="form-input"
                  type="text"
                  value={form.comuna}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="form-label" htmlFor="direccion">Dirección</label>
            <input
              id="direccion"
              name="direccion"
              className="form-input"
              type="text"
              value={form.direccion}
              onChange={handleChange}
            />

            <label className="form-label" htmlFor="notas">Notas adicionales (opcional)</label>
            <textarea
              id="notas"
              name="notas"
              className="form-textarea"
              rows={3}
              value={form.notas}
              onChange={handleChange}
            ></textarea>

            <button className="btn-add-cart-gold" type="submit" disabled={loading}>
              {loading ? "Procesando..." : "Pagar con Flow"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
