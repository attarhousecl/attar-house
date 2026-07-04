// Rate limit del lado CLIENTE para los botones/enlaces de WhatsApp.
// Objetivo: frenar el abuso casual (que "revienten" el WhatsApp) contando los
// clicks por navegador dentro de una ventana de tiempo. Se guarda en
// localStorage, así que NO es a prueba de balas: alguien decidido puede borrar
// el storage o usar otro navegador. Frena el spam accidental/casual, nada más.
//
// TODO (solo si se pide): para un límite real por IP, mover esto a una API route
// con rate limit distribuido (Upstash / Vercel KV) usando lib/rateLimit.js como
// base. No implementar ahora.

// --- Configuración (ajustar SOLO aquí) ---------------------------------------
export const WA_MAX_CLICKS = 5;              // máximo de clicks por ventana
export const WA_WINDOW_MS = 30 * 60 * 1000;  // ventana: 30 minutos

const STORAGE_KEY = "ah_wa_clicks";

// Lee los timestamps guardados y descarta los que caen fuera de la ventana.
// Falla en "abierto" (devuelve []) si el storage no está disponible: nunca
// bloqueamos a un cliente legítimo por un error de localStorage.
function readRecentClicks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const now = Date.now();
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter((ts) => typeof ts === "number" && now - ts < WA_WINDOW_MS);
  } catch {
    return [];
  }
}

// ¿Puede el visitante disparar WhatsApp ahora? En el servidor devuelve true
// (no hay storage; el componente re-evalúa tras montar en el cliente).
export function canClickWhatsApp() {
  if (typeof window === "undefined") return true;
  return readRecentClicks().length < WA_MAX_CLICKS;
}

// Registra un click (llamar SOLO cuando el click se permite y va a abrir WA).
export function registerWhatsAppClick() {
  if (typeof window === "undefined") return;
  try {
    const clicks = readRecentClicks();
    clicks.push(Date.now());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clicks));
  } catch {
    // Storage no disponible: no pasa nada, seguimos permitiendo el uso normal.
  }
}

// Milisegundos hasta que se libere un cupo (para re-habilitar el botón).
// Devuelve 0 si aún hay cupo disponible.
export function msUntilNextClick() {
  const clicks = readRecentClicks();
  if (clicks.length < WA_MAX_CLICKS) return 0;
  const oldest = Math.min(...clicks);
  return Math.max(0, WA_WINDOW_MS - (Date.now() - oldest));
}
