export default function Footer() {
  return (
    <>
      <div className="trust-badges">
        <div className="trust-badge">
          <i className="ph ph-shield-check"></i> Garantía de Autenticidad
        </div>
        <div className="trust-badge">
          <i className="ph ph-package"></i> Envíos a todo Chile
        </div>
        <div className="trust-badge">
          <i className="ph ph-credit-card"></i> Todo medio de pago
        </div>
      </div>

      <footer>
        <div className="container" style={{ textAlign: "center" }}>
          <p>&copy; 2026 Attar House. Valdivia, Chile.</p>
          <p style={{ fontSize: "0.75rem", color: "#555", marginTop: "6px" }}>
            Perfumería árabe y decants en Valdivia · Envíos a todo Chile por
            Starken y Chilexpress · Retiro presencial disponible
          </p>
        </div>
      </footer>
    </>
  );
}
