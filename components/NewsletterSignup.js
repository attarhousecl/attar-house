"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [msg, setMsg] = useState("");
  // Honeypot: campo trampa oculto. Un humano no lo ve ni lo llena; los bots que
  // rellenan todo sí. Si llega con valor, el backend lo descarta.
  const [website, setWebsite] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", website }),
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
      <h2 className="footer-nav-title">Newsletter</h2>
      <p style={{ color: "var(--text-soft)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "12px" }}>
        Nuevos ingresos y promos exclusivas. Sin spam.
      </p>

      {status === "ok" ? (
        <p role="status" aria-live="polite" style={{ color: "var(--accent)", fontSize: "0.82rem", fontWeight: 600 }}>{msg}</p>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Honeypot anti-bot: oculto para humanos (fuera de pantalla, sin tab,
              aria-hidden). No lo quites: es la trampa que atrapa a los bots. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-label="Tu correo electrónico"
            style={{
              background: "rgba(var(--ink-rgb), 0.05)",
              border: "1px solid rgba(var(--accent-rgb), 0.25)",
              borderRadius: "6px",
              padding: "10px 12px",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              background: "var(--accent)",
              color: "var(--accent-contrast)",
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
