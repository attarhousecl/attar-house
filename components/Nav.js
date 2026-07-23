"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import SearchBox from "@/components/SearchBox";
import { useScrollLock } from "@/lib/useScrollLock";
import { IconHeart, IconUser, IconMoon, IconSun, IconList, IconClose } from "@/components/NavIcons";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/pack", label: "Pack" },
  { href: "/accesorios", label: "Accesorios" },
  { href: "/faq", label: "FAQ" },
];

// Enlaces extra que solo viven en el menú móvil (en desktop están en el header
// como iconos de cuenta).
const DRAWER_EXTRA = [
  { href: "/cuenta", label: "Mi cuenta" },
  { href: "/mis-pedidos", label: "Mis pedidos" },
];

// Mensajes de la cinta integrada al header (rota con fundido suave).
const ANNOUNCEMENTS = [
  "Envío gratis sobre $60.000",
  "Decant de regalo sobre $15.000",
  "100% originales, sellados de fábrica",
  "Envíos a todo Chile · Retiro en Valdivia",
  "Pago seguro con Mercado Pago",
];

// Aislada en su propio componente: su intervalo re-renderiza solo la cinta,
// no toda la navbar (menú incluido).
function AnnounceStrip() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let timeout;
    const interval = setInterval(() => {
      setFading(true);
      timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
        setFading(false);
      }, 350);
    }, 4500);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  return (
    <div className="announce-strip" role="status" aria-live="polite">
      <span className={`announce-text mono ${fading ? "fade-out" : ""}`}>
        {ANNOUNCEMENTS[index]}
      </span>
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    // Solo por la visita actual: al entrar de nuevo, el sitio parte en claro.
    try { sessionStorage.setItem("ah_theme", next); } catch {}
  };

  return (
    <button
      type="button"
      className="nav-icon-btn"
      onClick={toggle}
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const drawerRef = useRef(null);
  const openerRef = useRef(null);

  const overHero = pathname === "/" && !scrolled;

  const closeMenu = useCallback(() => setOpen(false), []);

  // Bloqueo de scroll robusto (iOS-safe, compartido) solo mientras el menú
  // está abierto. Al cerrar restaura la posición exacta.
  useScrollLock(open);

  // Cierra el menú al cambiar de ruta.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Header dinámico: transparente sobre el hero, sólido con blur al hacer scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // Accesibilidad del menú abierto: Escape para cerrar, focus-trap dentro del
  // drawer y restauración del foco al botón que lo abrió al cerrar.
  useEffect(() => {
    if (!open) return undefined;
    const drawer = drawerRef.current;
    const opener = openerRef.current;

    // Mueve el foco al primer elemento enfocable del drawer. setTimeout (no rAF)
    // porque rAF no dispara en pestañas en segundo plano y el foco quedaría sin
    // mover; el drawer ya no es inert cuando corre este efecto (post-commit).
    const focusables = () =>
      drawer ? drawer.querySelectorAll('a[href], button:not([disabled])') : [];
    const focusTimer = setTimeout(() => {
      const first = focusables()[0];
      if (first) first.focus();
    }, 50);

    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault(); lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault(); firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      // Restaura el foco al botón hamburguesa (si sigue en el DOM).
      if (opener && typeof opener.focus === "function") opener.focus();
    };
  }, [open]);

  return (
    <header
      className={`site-header ${scrolled ? "scrolled" : ""} ${overHero ? "over-hero" : ""} ${open ? "menu-open" : ""}`}
    >
      <AnnounceStrip />

      <nav aria-label="Principal">
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
            >
              <IconHeart />
              {favCount > 0 && <span className="nav-fav-badge">{favCount}</span>}
            </Link>
            <Link
              href="/cuenta"
              className={`nav-icon-btn ${pathname.startsWith("/cuenta") ? "active" : ""}`}
              aria-label="Mi cuenta"
            >
              <IconUser />
            </Link>
            <ThemeToggle />
            <button
              ref={openerRef}
              type="button"
              className="mobile-menu-btn"
              aria-label="Abrir menú"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <IconList />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay móvil: scrim (cubre toda la pantalla, cierra al tocar) + drawer.
          El drawer va por encima del header y de los botones flotantes. */}
      <div
        className={`nav-scrim ${open ? "show" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        id="mobile-menu"
        className={`nav-drawer ${open ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        inert={!open ? true : undefined}
      >
        <div className="nav-drawer-head">
          <span className="nav-drawer-brand">Attar House</span>
          <button
            type="button"
            className="nav-drawer-close"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            <IconClose />
          </button>
        </div>
        <nav className="nav-drawer-links" aria-label="Menú móvil">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-btn ${pathname === link.href ? "active" : ""}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          {DRAWER_EXTRA.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-btn ${pathname === link.href ? "active" : ""}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </header>
  );
}
