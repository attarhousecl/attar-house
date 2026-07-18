"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SearchBox from "@/components/SearchBox";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/quiz", label: "Quiz" },
  { href: "/pack", label: "Pack" },
  { href: "/accesorios", label: "Accesorios" },
  { href: "/faq", label: "FAQ" },
];

// Mensajes de la cinta integrada al header (rota con fundido suave).
const ANNOUNCEMENTS = [
  "Envío gratis sobre $60.000",
  "Decant de regalo sobre $15.000",
  "100% originales, sellados de fábrica",
  "Envíos a todo Chile · Retiro en Valdivia",
  "Pago seguro con Mercado Pago",
];

function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("ah_theme", next); } catch {}
  };

  return (
    <button
      type="button"
      className="nav-icon-btn"
      onClick={toggle}
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
    >
      <i className={`ph ${theme === "dark" ? "ph-sun" : "ph-moon"}`} aria-hidden="true"></i>
    </button>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [annIndex, setAnnIndex] = useState(0);
  const [annFading, setAnnFading] = useState(false);

  const overHero = pathname === "/" && !scrolled;

  // Cierra el menú al cambiar de ruta.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Header dinámico: transparente sobre el hero, sólido con blur al hacer scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Rotación del mensaje integrado.
  useEffect(() => {
    let timeout;
    const interval = setInterval(() => {
      setAnnFading(true);
      timeout = setTimeout(() => {
        setAnnIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
        setAnnFading(false);
      }, 350);
    }, 4500);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  // Contador de favoritos, reactivo a cambios desde tarjetas/ficha.
  useEffect(() => {
    const read = () => {
      try { setFavCount(JSON.parse(localStorage.getItem("ah_wishlist") || "[]").length); }
      catch { setFavCount(0); }
    };
    read();
    window.addEventListener("ah-wishlist-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("ah-wishlist-change", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // Cierra el menú con la tecla Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`site-header ${scrolled ? "scrolled" : ""} ${overHero ? "over-hero" : ""} ${open ? "menu-open" : ""}`}
    >
      <div className="announce-strip" role="status" aria-live="polite">
        <span className={`announce-text mono ${annFading ? "fade-out" : ""}`}>
          {ANNOUNCEMENTS[annIndex]}
        </span>
      </div>

      <nav>
        <div className="container nav-content">
          <Link href="/" className="nav-brand" aria-label="Attar House — Inicio">
            <svg viewBox="0 0 100 100" className="nav-monogram" aria-hidden="true">
              <path d="M16 92 V48 L50 14 L84 48 V92" fill="none" stroke="currentColor" strokeWidth="13" />
              <path d="M16 64 H84" fill="none" stroke="currentColor" strokeWidth="13" />
            </svg>
            <span>Attar House</span>
          </Link>

          <div className="nav-center nav-links-desktop">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-btn ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-right">
            <SearchBox />
            <Link
              href="/catalogo?tab=favoritos"
              className="nav-icon-btn nav-fav-btn"
              aria-label={`Favoritos${favCount > 0 ? ` (${favCount})` : ""}`}
              onClick={() => setOpen(false)}
            >
              <i className="ph ph-heart" aria-hidden="true"></i>
              {favCount > 0 && <span className="nav-fav-badge">{favCount}</span>}
            </Link>
            <Link
              href="/cuenta"
              className={`nav-icon-btn ${pathname.startsWith("/cuenta") ? "active" : ""}`}
              aria-label="Mi cuenta"
              onClick={() => setOpen(false)}
            >
              <i className="ph ph-user" aria-hidden="true"></i>
            </Link>
            <ThemeToggle />
            <button
              type="button"
              className="mobile-menu-btn"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <i className={`ph ${open ? "ph-x" : "ph-list"}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Menú móvil a pantalla completa */}
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
        <Link href="/cuenta" className="nav-btn" onClick={() => setOpen(false)}>
          Mi cuenta
        </Link>
        <Link href="/mis-pedidos" className="nav-btn" onClick={() => setOpen(false)}>
          Mis pedidos
        </Link>
      </div>
    </header>
  );
}
