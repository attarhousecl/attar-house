"use client";

import { useEffect } from "react";

// Bloqueo de scroll robusto y compartido por TODOS los overlays de la tienda
// (menu movil, buscador, carrito, splash). Antes cada uno hacia su propio
// `body.style.overflow = "hidden"` o clase con `overflow:hidden`, con dos
// problemas de raiz:
//   1. iOS Safari IGNORA `overflow:hidden` en html/body — el fondo seguia
//      desplazandose bajo el overlay.
//   2. Al haber varios duenos, cerrar uno reseteaba el lock de los demas
//      (el fondo se desbloqueaba con otro overlay aun abierto).
//
// Solucion: tecnica `position:fixed` en el body (unica que funciona en iOS),
// con CONTEO DE REFERENCIAS: el body queda bloqueado hasta que el ULTIMO
// overlay libera, y se preserva/restaura la posicion de scroll exacta.

let lockCount = 0;
let savedScrollY = 0;

function engage() {
  lockCount += 1;
  if (lockCount > 1) return; // ya bloqueado por otro overlay
  savedScrollY = window.scrollY;
  const { body } = document;
  // Compensa el ancho de la scrollbar (desktop) para evitar layout shift.
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return; // aun bloqueado por otro overlay
  const { body } = document;
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.paddingRight = "";
  window.scrollTo(0, savedScrollY);
}

// Bloquea el scroll del fondo mientras `active` sea true. Idempotente y seguro
// ante varios overlays simultaneos gracias al contador compartido.
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    engage();
    return release;
  }, [active]);
}
