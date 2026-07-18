"use client";

import { useEffect, useRef } from "react";

// Video de atmósfera del hero (marca/perfume.mp4). Silencioso, en loop y
// detrás de un velo carbón para que el titular siempre se lea. Con
// prefers-reduced-motion el video queda pausado (funciona como imagen).
export default function HeroVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      video.pause();
      return;
    }
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/videos/perfume.mp4" type="video/mp4" />
    </video>
  );
}
