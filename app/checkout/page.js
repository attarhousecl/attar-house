"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCatalog, labelsFormatos } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { COMUNAS_POR_REGION, isValidComuna } from "@/lib/chileComunas";
import { isValidPhoneCL, isAllowedEmail, isValidDireccion } from "@/lib/checkoutValidation";

// El orden (norte a sur) y los nombres coinciden con las llaves de COMUNAS_POR_REGION.
const REGIONES = Object.keys(COMUNAS_POR_REGION);

export default function CheckoutPage() {
  const { cart, subtotal, packDiscount, total, freeGiftEligible, freeGift, setFreeGift } = useCart();
  const { arabDB } = useCatalog();
  const { showToast } = useToast();
  const { user, loading: authLoading, displayName, phone } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    comuna: "",
    direccion: "",
  });
  const [loading, setLoading] = useState(false);

  // Con sesión iniciada, precarga nombre, correo y celular del perfil (el
  // correo del pedido queda ligado a la cuenta y aparece en su historial).
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || displayName || "",
      email: f.email || user.email || "",
      phone: f.phone || phone || "",
    }));
  }, [user, displayName, phone]);

  // Comunas disponibles según la región elegida (desplegable dependiente).
  const comunasDisponibles = COMUNAS_POR_REGION[form.region] || [];

  useEffect(() => {
    if (arabDB.length > 0 && !freeGift) {
      setFreeGift(`${arabDB[0].name} (Decant 3ml)`);
    }
  }, [arabDB, freeGift, setFreeGift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Al cambiar de región, la comuna anterior deja de ser válida: se limpia.
    if (name === "region") {
      setForm((f) => ({ ...f, region: value, comuna: "" }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      showToast("⚠️ Completa tu nombre, correo y teléfono.");
      return;
    }
    if (!isAllowedEmail(form.email)) {
      showToast("⚠️ Ingresa un correo de Gmail, Hotmail, Outlook, iCloud o Yahoo.");
      return;
    }
    if (!isValidPhoneCL(form.phone)) {
      showToast("⚠️ Ingresa un celular chileno válido (9 XXXX XXXX).");
      return;
    }
    // Comuna es opcional, pero si se ingresa debe existir y coincidir con la región.
    if (form.comuna && !isValidComuna(form.comuna, form.region)) {
      showToast("⚠️ Selecciona una comuna válida para tu región.");
      return;
    }
    // Dirección es opcional, pero si se ingresa debe tener calle y número.
    if (form.direccion && !isValidDireccion(form.direccion)) {
      showToast("⚠️ Ingresa una dirección con calle y número (ej: Av. Picarte 1234).");
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

  // Comprar requiere cuenta: así el pedido queda ligado al historial del cliente.
  if (!authLoading && !user) {
    return (
      <section id="checkout" className="page-section active">
        <div className="container" style={{ textAlign: "center", maxWidth: "560px" }}>
          <h1 className="section-title serif">Finalizar Compra</h1>
          <p className="section-subtitle" style={{ marginBottom: "26px" }}>
            Para comprar necesitas iniciar sesión: tu pedido quedará guardado en tu
            cuenta y podrás seguir su estado en cualquier momento.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/cuenta?next=/checkout" className="btn-gold-solid">
              Iniciar sesión o crear cuenta
            </Link>
            <Link href="/catalogo" className="quiz-btn-ghost">
              Seguir mirando
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section id="checkout" className="page-section active">
        <div className="container" style={{ textAlign: "center" }}>
          <h1 className="section-title serif">Finalizar Compra</h1>
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
        <h1 className="section-title serif" style={{ marginBottom: "40px" }}>
          Finalizar Compra
        </h1>
        <div className="checkout-grid">
          <div className="checkout-summary">
            <h3 className="serif">Tu Pedido</h3>
            {cart.map((i) => (
              <div className="checkout-item" key={`${i.id}-${i.format}-${i.price}`}>
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
                <label className="form-label" htmlFor="free-gift-select">🎁 Elige tu regalo (Decant 3ml)</label>
                <select
                  id="free-gift-select"
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
            {packDiscount > 0 && (
              <>
                <div className="checkout-item" style={{ color: "var(--text-muted)" }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-CL")}</span>
                </div>
                <div className="checkout-item" style={{ color: "#25D366" }}>
                  <span>🎁 Descuento pack (10%)</span>
                  <span>-${packDiscount.toLocaleString("es-CL")}</span>
                </div>
              </>
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
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9 1234 5678"
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
                <select
                  id="comuna"
                  name="comuna"
                  className="form-select"
                  value={form.comuna}
                  onChange={handleChange}
                  disabled={!form.region}
                >
                  <option value="">
                    {form.region ? "Selecciona tu comuna" : "Elige región primero"}
                  </option>
                  {comunasDisponibles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="form-label" htmlFor="direccion">Dirección</label>
            <input
              id="direccion"
              name="direccion"
              className="form-input"
              type="text"
              autoComplete="street-address"
              placeholder="Calle y número (ej: Av. Picarte 1234)"
              value={form.direccion}
              onChange={handleChange}
            />

            <button className="btn-add-cart-gold" type="submit" disabled={loading}>
              {loading ? "Procesando..." : "Pagar con Mercado Pago"}
            </button>
            <p style={{ marginTop: "14px", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              <i className="ph ph-lock-key" style={{ color: "var(--gold-primary)" }}></i>{" "}
              Pago 100% seguro vía Mercado Pago · Débito, crédito o transferencia
              <br />
              ¿Prefieres coordinar por WhatsApp? Vuelve al carrito y elige esa opción.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
