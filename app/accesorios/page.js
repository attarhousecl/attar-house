"use client";

import { accesoriosDB } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";

export default function AccesoriosPage() {
  const { addAccesorio } = useCart();

  return (
    <section id="accesorios" className="page-section active">
      <div className="container">
        <h2 className="section-title serif">Accesorios</h2>
        <div className="product-grid">
          {accesoriosDB.map((acc) => (
            <div className="product-card" style={{ cursor: "default" }} key={acc.id}>
              <div className="product-image-container">
                <i className={acc.icon} style={{ fontSize: "3rem", color: "var(--gold-primary)" }}></i>
              </div>
              <h3 className="product-title">{acc.name}</h3>
              <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "10px" }}>
                {acc.description}
              </p>
              <div style={{ fontWeight: "bold", color: "var(--gold-primary)", marginBottom: "15px" }}>
                ${acc.price.toLocaleString("es-CL")}
              </div>
              <button className="btn-add-cart" onClick={() => addAccesorio(acc)}>
                Añadir al Carrito
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
