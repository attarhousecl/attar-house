"use client";

import { useEffect, useRef, useState } from "react";

// Video de atmósfera del hero (marca/perfume.mp4, ~3.4MB). Silencioso, en loop
// y detrás de un velo carbón para que el titular siempre se lea.
//
// Rendimiento: el video NO se carga en la ruta crítica. Pesa ~3.4MB y competía
// con el LCP, el JS de arranque y el resto de recursos. Ahora se difiere hasta
// que el navegador queda ocioso (requestIdleCallback, con respaldo por timeout),
// y se OMITE por completo con prefers-reduced-motion. Mientras tanto el hero
// muestra el degradado del velo (atmósfera de marca), sin pantalla en negro.
export default function HeroVideo() {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);

  // Difiere la asignación del src (y por tanto la descarga) fuera del arranque.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let idleId;
    let timeoutId;
    const load = () => setSrc("/videos/perfume.mp4");

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(load, { timeout: 3000 });
    } else {
      timeoutId = setTimeout(load, 1500);
    }
    return () => {
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Al asignarse el src, arranca la reproducción (autoplay silencioso).
  useEffect(() => {
    if (!src) return;
    const video = ref.current;
    if (!video) return;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      className="hero-video"
      src={src || undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
