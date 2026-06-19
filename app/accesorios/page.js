"use client";

import { accesoriosDB } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";

export default function AccesoriosPage() {
  const { addAccesorio } = useCart();

  return (
    <section id="accesorios" className="page-section active">
      <div className="container">
        <h2 className="section-title serif">Accesorios</h2>
        <p className="section-subtitle">
          Detalles pensados para cuidar, transportar y lucir tus decants como se merecen.
        </p>
        <div className="product-grid">
          {accesoriosDB.map((acc, index) => (
            <div
              className="product-card accesorio-card"
              key={acc.id}
              style={{ animationDelay: `${Math.min(index, 10) * 0.05}s` }}
            >
              <div className="card-image-area accesorio-icon-area">
                <i className={acc.icon}></i>
              </div>
              <div className="card-body">
                <h3 className="product-title serif">{acc.name}</h3>
                <p className="accesorio-desc">{acc.description}</p>
                <div className="accesorio-price">${acc.price.toLocaleString("es-CL")}</div>
                <button className="btn-view-detail" onClick={() => addAccesorio(acc)}>
                  <i className="ph ph-shopping-cart" style={{ marginRight: "6px" }}></i>
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
