"use client";

import { useEffect, useState } from "react";
import { useScrollLock } from "@/lib/useScrollLock";

// Intro de marca (~3s): tres pulsos de spray revelan "Att" → "ar" → "house"
// y luego la cortina se disuelve hacia el inicio. Se muestra una vez por
// sesión y se salta por completo con prefers-reduced-motion.
const SEEN_KEY = "ah_splash_seen";
const TOTAL_MS = 3000;
const LEAVE_MS = 650;

export default function SplashIntro() {
  // null = decidiendo (no render en SSR), true = visible, false = no mostrar
  const [show, setShow] = useState(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // El splash es de la tienda: en el panel /admin no se muestra.
    if (window.location.pathname.startsWith("/admin")) { setShow(false); return; }
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) { setShow(false); return; }
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    setShow(true);
  }, []);

  // Bloqueo de scroll compartido (iOS-safe) mientras la intro está visible.
  useScrollLock(show === true);

  useEffect(() => {
    if (!show) return undefined;
    const t1 = setTimeout(() => setLeaving(true), TOTAL_MS);
    const t2 = setTimeout(() => setShow(false), TOTAL_MS + LEAVE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  if (!show) return null;

  const skip = () => {
    setLeaving(true);
    setTimeout(() => setShow(false), 300);
  };

  return (
    <div className={`splash ${leaving ? "splash-leave" : ""}`} aria-hidden="true">
      {/* El video (perfume.mp4, ~3.4MB) se quito de aqui: apenas se veia tras el
          velo y el spray, pero se descargaba en el primer render — el mayor costo
          de payload del arranque. La intro queda con la animacion de spray sobre
          el degradado de marca (igual de premium, sin descargar el video). */}
      <div className="splash-veil" aria-hidden="true"></div>
      <div className="splash-inner">
        <svg viewBox="0 0 100 100" className="splash-monogram" aria-hidden="true">
          <path d="M16 92 V48 L50 14 L84 48 V92" fill="none" stroke="currentColor" strokeWidth="13" />
          <path d="M16 64 H84" fill="none" stroke="currentColor" strokeWidth="13" />
        </svg>
        <div className="splash-word">
          <span className="splash-seg seg-1">
            <span className="splash-mist" />
            <span className="splash-text">Att</span>
          </span>
          <span className="splash-seg seg-2">
            <span className="splash-mist" />
            <span className="splash-text">ar</span>
          </span>
          <span className="splash-seg seg-3">
            <span className="splash-mist" />
            <span className="splash-text">house</span>
          </span>
        </div>
        <div className="splash-kicker">Casa de descubrimiento · Valdivia</div>
      </div>
      <button type="button" className="splash-skip" onClick={skip}>
        Saltar
      </button>
    </div>
  );
}
