"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("ok");
        setMsg(data.already ? "¡Ya estabas suscrito/a! 🌙" : "¡Listo! Revisa tu correo 🎁");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error || "No se pudo suscribir.");
      }
    } catch {
      setStatus("error");
      setMsg("Error de conexión. Intenta de nuevo.");
    }
  }

  return (
    <div className="footer-nav">
      <h5 className="footer-nav-title">Newsletter</h5>
      <p style={{ color: "#888", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "12px" }}>
        Nuevos ingresos y promos exclusivas. Sin spam.
      </p>

      {status === "ok" ? (
        <p role="status" aria-live="polite" style={{ color: "#d4af37", fontSize: "0.82rem", fontWeight: 600 }}>{msg}</p>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-label="Tu correo electrónico"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: "6px",
              padding: "10px 12px",
              color: "#e0e0e0",
              fontSize: "0.85rem",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              background: "#d4af37",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              padding: "10px 12px",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: status === "loading" ? "default" : "pointer",
            }}
          >
            {status === "loading" ? "Enviando..." : "Suscribirme"}
          </button>
          {status === "error" && (
            <span role="alert" style={{ color: "#e0584f", fontSize: "0.75rem" }}>{msg}</span>
          )}
        </form>
      )}
    </div>
  );
}
