import Link from "next/link";

export const metadata = {
  title: "Página no encontrada | Attar House",
};

export default function NotFound() {
  return (
    <section
      className="page-section active"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      <div className="container" style={{ maxWidth: "560px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "10px" }} aria-hidden="true">🫙</div>
        <h1 className="serif" style={{ fontSize: "2.2rem", color: "var(--gold-primary)", marginBottom: "12px" }}>
          Página no encontrada
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.7 }}>
          La fragancia que buscas no está en esta dirección… pero tenemos muchas más esperándote.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn-gold-solid">Volver al inicio</Link>
          <Link href="/catalogo" className="btn-primary"><span>Ver catálogo</span></Link>
        </div>
      </div>
    </section>
  );
}
