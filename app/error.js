"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <section
      className="page-section active"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      <div className="container" style={{ maxWidth: "560px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "10px" }} aria-hidden="true">⚠️</div>
        <h1 className="serif" style={{ fontSize: "2rem", color: "var(--gold-primary)", marginBottom: "12px" }}>
          Algo salió mal
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.7 }}>
          Tuvimos un problema cargando esta sección. Puedes intentarlo de nuevo o volver al inicio.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn-gold-solid" onClick={() => reset()}>Reintentar</button>
          <Link href="/" className="btn-primary"><span>Volver al inicio</span></Link>
        </div>
      </div>
    </section>
  );
}
