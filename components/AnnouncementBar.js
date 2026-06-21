"use client";

import { useEffect, useState } from "react";

const ANNOUNCEMENTS = [
  "✨ Envío gratis sobre $60.000",
  "🎁 Decant de regalo sobre $15.000",
  "💯 Testers 100% originales",
  "🚚 Envíos a todo Chile · Retiro en Valdivia",
  "🔒 Pago seguro con Mercado Pago",
  "🔮 Haz nuestro Quiz de Fragancias",
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let timeout;
    const interval = setInterval(() => {
      setFading(true);
      timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
        setFading(false);
      }, 400);
    }, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="announcement-bar">
      <span className={`announcement-text ${fading ? "fade-out" : ""}`}>
        {ANNOUNCEMENTS[index]}
      </span>
    </div>
  );
}
