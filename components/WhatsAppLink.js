"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  canClickWhatsApp,
  registerWhatsAppClick,
  msUntilNextClick,
} from "@/lib/waRateLimit";

const LIMIT_MESSAGE =
  "¿Muchas consultas? Escríbenos directo o intenta más tarde 🙌";

// Enlace <a> a WhatsApp con rate limit centralizado (ver lib/waRateLimit.js).
// Reemplaza a un <a> normal: acepta href, className, style, children y el resto
// de props (aria-label, onMouseEnter, etc.), así cada botón conserva su estilo.
// Al alcanzar el límite muestra un aviso amable y se deshabilita hasta que pase
// la ventana de tiempo.
export default function WhatsAppLink({ children, style, onClick, ...rest }) {
  const { showToast } = useToast();
  const [blocked, setBlocked] = useState(false);

  // Estado inicial siempre "no bloqueado" (coincide con el render del servidor,
  // sin desajuste de hidratación); se recalcula tras montar y por temporizador.
  useEffect(() => {
    let timer;
    const sync = () => {
      const over = !canClickWhatsApp();
      setBlocked(over);
      if (over) {
        timer = setTimeout(sync, msUntilNextClick() + 250);
      }
    };
    sync();
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e) => {
    if (!canClickWhatsApp()) {
      e.preventDefault();
      setBlocked(true);
      showToast(LIMIT_MESSAGE);
      return;
    }
    registerWhatsAppClick();
    if (!canClickWhatsApp()) setBlocked(true);
    onClick?.(e);
  };

  const finalStyle = blocked
    ? { ...style, opacity: 0.5, cursor: "not-allowed" }
    : style;

  return (
    <a
      {...rest}
      style={finalStyle}
      aria-disabled={blocked || undefined}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
