"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Revela su contenido con un fade-up al entrar en viewport.
 * Seguro: el contenido es visible por defecto (SSR / sin JS / reduced-motion).
 * Solo oculta y anima los bloques que están BAJO el fold al montar; usa un
 * listener de scroll que evalúa la posición real, por lo que es robusto ante
 * saltos instantáneos, enlaces con hash y scroll rápido (nunca deja contenido
 * atascado en invisible).
 */
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [state, setState] = useState("idle"); // idle (visible) | hidden | shown

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Si ya está (casi) visible al montar, no animamos.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState("hidden");

    let raf = 0;
    const reveal = () => {
      setState("shown");
      cleanup();
    };
    const check = () => {
      raf = 0;
      if (!ref.current) return;
      // top < 85% vh cubre tanto entrar en viewport como haberlo dejado arriba.
      if (ref.current.getBoundingClientRect().top < window.innerHeight * 0.85) reveal();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return cleanup;
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${state} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
