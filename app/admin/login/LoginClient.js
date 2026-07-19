"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

// Login del panel con el sistema de marca (Marca.html): atmósfera carbón/bosque
// y tarjeta papel. Valores literales de la paleta a propósito: este árbol vive
// dentro de .admin-scope (que fija la piel dorada antigua del panel), así que
// aquí no se usan las variables compartidas.
const C = {
  carbon: "#0F1613",
  carbon2: "#14201B",
  bosque: "#1D3A2E",
  papel: "#FDFCFA",
  superficie: "#F8F7F4",
  bruma: "#E8E5DF",
  borde: "#E0DDD2",
  tinta: "#0D1411",
  piedra: "#7A8985",
  accion: "#2D6745",
  accionHover: "#245839",
  error: "#A8442A",
  errorSuave: "#F6E7E1",
};

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const label = {
    display: "block", fontFamily: "var(--font-plex-mono), monospace",
    fontSize: "0.66rem", color: C.piedra, textTransform: "uppercase",
    letterSpacing: "0.16em", marginBottom: "7px",
  };
  const input = {
    width: "100%", background: C.superficie, border: `1px solid ${C.borde}`,
    borderRadius: "8px", padding: "12px 14px", color: C.tinta,
    fontSize: "1rem", outline: "none", boxSizing: "border-box",
    fontFamily: "var(--font-archivo), sans-serif",
    transition: "border-color 0.25s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-archivo), sans-serif",
        background: `radial-gradient(ellipse 90% 70% at 50% 20%, rgba(45,103,69,0.28) 0%, transparent 55%), linear-gradient(180deg, ${C.carbon} 0%, ${C.carbon2} 55%, ${C.bosque} 140%)`,
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Marca sobre el fondo carbón */}
        <div style={{ textAlign: "center", marginBottom: "26px", color: C.papel }}>
          <svg viewBox="0 0 100 100" style={{ width: "46px", height: "46px", marginBottom: "12px" }} aria-hidden="true">
            <path d="M16 92 V48 L50 14 L84 48 V92" fill="none" stroke="currentColor" strokeWidth="13" />
            <path d="M16 64 H84" fill="none" stroke="currentColor" strokeWidth="13" />
          </svg>
          <div style={{ fontSize: "1.15rem", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase" }}>
            Attar House
          </div>
          <div style={{ fontFamily: "var(--font-plex-mono), monospace", fontSize: "0.64rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#C5CAC7", marginTop: "6px" }}>
            Panel de administración
          </div>
        </div>

        {/* Tarjeta papel */}
        <div
          style={{
            background: C.papel,
            border: `1px solid ${C.borde}`,
            borderRadius: "14px",
            padding: "32px 28px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={label} htmlFor="admin-email">Correo electrónico</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                autoComplete="email"
                style={input}
                onFocus={(e) => (e.target.style.borderColor = C.accion)}
                onBlur={(e) => (e.target.style.borderColor = C.borde)}
              />
            </div>
            <div>
              <label style={label} htmlFor="admin-pass">Contraseña</label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={input}
                onFocus={(e) => (e.target.style.borderColor = C.accion)}
                onBlur={(e) => (e.target.style.borderColor = C.borde)}
              />
            </div>

            {error && (
              <p style={{ background: C.errorSuave, border: `1px solid ${C.error}`, color: C.error, borderRadius: "8px", padding: "10px 14px", fontSize: "0.84rem", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                background: loading ? C.bruma : C.accion,
                color: loading ? C.piedra : C.papel,
                border: "none", borderRadius: "8px", padding: "13px",
                fontSize: "0.92rem", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-archivo), sans-serif",
                transition: "background 0.25s",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = C.accionHover; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = C.accion; }}
            >
              {loading ? "Verificando…" : "Entrar →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "18px", fontFamily: "var(--font-plex-mono), monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.piedra }}>
          Solo personal autorizado · Valdivia
        </p>
      </div>
    </div>
  );
}
