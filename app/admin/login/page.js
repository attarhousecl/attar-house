"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
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

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "#111", border: "1px solid #2a2a2a", borderRadius: "16px",
        padding: "48px 40px", width: "100%", maxWidth: "400px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "2rem", color: "#d4af37", letterSpacing: "4px", textTransform: "uppercase" }}>
            ⚗ Attar House
          </div>
          <div style={{ color: "#555", fontSize: "0.82rem", marginTop: "6px" }}>Panel de administración</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              style={{
                width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: "6px", padding: "10px 12px", color: "#e0e0e0",
                fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: "6px", padding: "10px 12px", color: "#e0e0e0",
                fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#c0392b", fontSize: "0.8rem", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "6px", background: "#d4af37", color: "#000",
              border: "none", borderRadius: "8px", padding: "11px",
              fontSize: "0.9rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Verificando..." : "Entrar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
