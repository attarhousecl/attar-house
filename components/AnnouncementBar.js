"use client";

import { useEffect, useState } from "react";

const ANNOUNCEMENTS = [
  "✨ Envío gratis a todo Chile sobre $60.000 ✨",
  "🎁 ¡Llevate un DECANT DE REGALO por compras sobre $15.000 en decants! 🎁",
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      const timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
        setFading(false);
      }, 400);
      return () => clearTimeout(timeout);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="announcement-bar">
      <span className={`announcement-text ${fading ? "fade-out" : ""}`}>
        {ANNOUNCEMENTS[index]}
      </span>
    </div>
  );
}
