"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Contraseña incorrecta.");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "#111", border: "1px solid #2a2a2a", borderRadius: "16px",
        padding: "48px 40px", width: "100%", maxWidth: "380px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "2rem", color: "#d4af37", letterSpacing: "4px", textTransform: "uppercase" }}>
            ⚗ Attar House
          </div>
          <div style={{ color: "#555", fontSize: "0.82rem", marginTop: "6px" }}>Panel de administración</div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: "0.72rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: "6px", padding: "10px 12px", color: "#e0e0e0",
              fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
            }}
          />
          {error && (
            <p style={{ color: "#c0392b", fontSize: "0.8rem", marginTop: "8px" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", marginTop: "20px", background: "#d4af37", color: "#000",
              border: "none", borderRadius: "8px", padding: "11px", fontSize: "0.9rem",
              fontWeight: "700", cursor: "pointer", opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Verificando..." : "Entrar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
