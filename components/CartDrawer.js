"use client";

import { useState } from "react";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="cart-toggle" onClick={() => setOpen(true)}>
        <i className="ph ph-shopping-cart"></i>
        <span className="cart-badge">0</span>
      </div>

      {open && <div className="sidebar-overlay show" onClick={() => setOpen(false)} />}

      <div className={`cart-sidebar ${open ? "open" : ""}`}>
        <div className="cart-header">
          <h3 className="serif">Tu Pedido</h3>
          <button className="close-cart" onClick={() => setOpen(false)}>
            <i className="ph ph-x"></i>
          </button>
        </div>
        <div className="cart-items">
          <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "40px" }}>
            Tu carrito está vacío.
          </p>
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span style={{ color: "var(--gold-primary)" }}>$0</span>
          </div>
        </div>
      </div>
    </>
  );
}
