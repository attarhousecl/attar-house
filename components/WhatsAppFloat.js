"use client";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/56632249728?text=Hola%20Attar%20House%2C%20tengo%20una%20consulta"
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position: "fixed",
        bottom: "108px",
        right: "30px",
        width: "56px",
        height: "56px",
        background: "#25D366",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(37,211,102,0.4)",
        zIndex: 998,
        transition: "transform 0.2s, box-shadow 0.2s",
        textDecoration: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,211,102,0.4)"; }}
    >
      <i className="ph ph-whatsapp-logo" style={{ fontSize: "1.6rem", color: "#fff" }}></i>
    </a>
  );
}
