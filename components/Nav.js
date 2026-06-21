"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SearchBox from "@/components/SearchBox";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/quiz", label: "🔮 Quiz" },
  { href: "/pack", label: "🎁 Pack" },
  { href: "/accesorios", label: "Accesorios" },
  { href: "/faq", label: "FAQ" },
  { href: "/mis-pedidos", label: "Mis Pedidos" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Cierra el menú al cambiar de ruta.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Cierra el menú con la tecla Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav>
      <div className="container nav-content">
        <Link href="/" className="nav-brand">
          Attar House
        </Link>
        <div className="nav-right">
          <SearchBox />
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <i className={`ph ${open ? "ph-x" : "ph-list"}`} aria-hidden="true"></i>
          </button>
          <div className={`nav-links ${open ? "show" : ""}`}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-btn ${pathname === link.href ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
