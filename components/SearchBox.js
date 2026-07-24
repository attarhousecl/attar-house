"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCatalog } from "@/context/CatalogContext";
import { useScrollLock } from "@/lib/useScrollLock";
import { IconSearch, IconDrop } from "@/components/NavIcons";

export default function SearchBox() {
  const { perfumes } = useCatalog();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  // El modal se renderiza vía portal al <body>: si quedara dentro del <header>
  // (que tiene backdrop-filter), su position:fixed quedaria atrapado dentro del
  // header en vez de cubrir el viewport.
  useEffect(() => setMounted(true), []);

  // Bloqueo de scroll compartido (iOS-safe) mientras el buscador está abierto.
  useScrollLock(open);

  useEffect(() => {
    if (!open) { setQ(""); return undefined; }
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return perfumes
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          (p.notes || []).some((n) => n.toLowerCase().includes(term)) ||
          (p.families || []).some((f) => f.toLowerCase().includes(term)) ||
          (p.inspiration || "").toLowerCase().includes(term)
        );
      })
      .slice(0, 8);
  }, [q, perfumes]);

  // Resetea el resaltado al cambiar la búsqueda.
  useEffect(() => { setActive(0); }, [q]);

  const go = (id) => {
    setOpen(false);
    router.push(`/producto/${id}`);
  };

  const onInputKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = results[active] || results[0];
      if (sel) go(sel.id);
    }
  };

  return (
    <>
      <button
        className="nav-search-btn"
        onClick={() => setOpen(true)}
        aria-label="Buscar perfumes"
      >
        <IconSearch />
      </button>

      {mounted && open && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(3,3,3,0.8)", backdropFilter: "blur(6px)",
            display: "flex", justifyContent: "center", alignItems: "flex-start",
            padding: "80px 20px 20px",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar perfumes"
            style={{
              width: "100%", maxWidth: "620px",
              background: "var(--bg-card)", border: "1px solid rgba(var(--accent-rgb), 0.25)",
              borderRadius: "16px", overflow: "hidden",
              boxShadow: "0 24px 60px rgba(var(--shadow-rgb), 0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid rgba(var(--ink-rgb), 0.06)" }}>
              <IconSearch style={{ color: "var(--gold-primary)", fontSize: "1.3rem" }} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKeyDown}
                aria-label="Buscar perfumes"
                placeholder="Busca por nombre, marca, nota o inspiración..."
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "var(--text-main)", fontSize: "1rem", fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => setOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-soft)", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {q.trim().length < 2 ? (
                <p style={{ padding: "28px 20px", color: "var(--text-soft)", fontSize: "0.85rem", textAlign: "center" }}>
                  Escribe al menos 2 letras para buscar
                </p>
              ) : results.length === 0 ? (
                <p style={{ padding: "28px 20px", color: "var(--text-soft)", fontSize: "0.85rem", textAlign: "center" }}>
                  No encontramos nada para &ldquo;{q}&rdquo;. Prueba otra palabra.
                </p>
              ) : (
                results.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => go(p.id)}
                    onMouseEnter={() => setActive(idx)}
                    aria-selected={active === idx}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px", width: "100%",
                      padding: "12px 20px", background: active === idx ? "rgba(var(--accent-rgb), 0.1)" : "transparent", border: "none",
                      borderBottom: "1px solid rgba(var(--ink-rgb), 0.04)", cursor: "pointer",
                      textAlign: "left", fontFamily: "inherit",
                    }}
                  >
                    <div style={{ width: "44px", height: "44px", flexShrink: 0, borderRadius: "8px", overflow: "hidden", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} width={44} height={44} style={{ width: "44px", height: "44px", objectFit: "cover" }} />
                      ) : (
                        <IconDrop style={{ color: "var(--gold-primary)", fontSize: "1.3rem" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{p.brand}</div>
                      <div style={{ fontSize: "0.92rem", color: "#e8e8e8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    </div>
                    {(() => {
                      const pr = [p.prices?.decant3, p.prices?.decant5, p.prices?.decant10, p.prices?.sellado].find((v) => v > 0);
                      return pr ? (
                        <div style={{ color: "var(--gold-primary)", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          ${pr.toLocaleString("es-CL")}
                        </div>
                      ) : null;
                    })()}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
