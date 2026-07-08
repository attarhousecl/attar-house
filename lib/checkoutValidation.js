// Validaciones compartidas del checkout (cliente + servidor). El servidor es la
// autoridad: los bots no usan el formulario, le pegan directo a /api/checkout, así
// que estas reglas SIEMPRE se re-chequean en app/api/checkout/route.js.

// ── Teléfono ────────────────────────────────────────────────────────────────
// Celular chileno: 9 dígitos que empiezan en 9 (formato +56 9 XXXX XXXX). Se
// acepta con o sin prefijo 56 y con espacios/guiones/paréntesis, que se limpian.
// No verifica que la línea "exista" de verdad (eso requeriría un servicio de SMS);
// valida el formato, que es lo que frena basura de bots y typos.
export function normalizePhoneCL(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("56")) d = d.slice(2); // quita prefijo país
  return d;
}

export function isValidPhoneCL(raw) {
  return /^9\d{8}$/.test(normalizePhoneCL(raw));
}

// Formato canónico para guardar/mostrar: +56 9 XXXX XXXX (o el original si no valida).
export function formatPhoneCL(raw) {
  const d = normalizePhoneCL(raw);
  if (!/^9\d{8}$/.test(d)) return String(raw || "").trim();
  return `+56 9 ${d.slice(1, 5)} ${d.slice(5)}`;
}

// ── Dirección ─────────────────────────────────────────────────────────────
// No se puede verificar que una calle EXISTA sin una API de mapas (pago); esto
// valida el FORMATO para frenar basura de bots ("asdf", vacío): exige calle
// (letras) + numeración (un número, o "s/n" para direcciones rurales).
export function isValidDireccion(raw) {
  const s = String(raw || "").trim();
  if (s.length < 5) return false;
  const tieneLetras = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(s);
  const tieneNumero = /\d/.test(s) || /\bs\/?n\b/i.test(s);
  return tieneLetras && tieneNumero;
}

// ── Email ───────────────────────────────────────────────────────────────────
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowlist ESTRICTO: solo los 5 grandes proveedores (con variantes regionales).
// Cualquier otro dominio se rechaza — incluidos los inventados ("chupalo.com"),
// desechables y typos, que quedan fuera automáticamente por no estar en la lista.
// Tradeoff conocido: también deja fuera correos de empresa/universidad/proton; si
// un cliente real usa otro proveedor legítimo, se agrega su dominio aquí.
const ALLOWED = new Set([
  "gmail.com",
  "hotmail.com", "hotmail.cl", "hotmail.es",
  "outlook.com", "outlook.cl", "outlook.es",
  "icloud.com", "me.com", "mac.com",
  "yahoo.com", "yahoo.es", "yahoo.cl",
]);

export function emailDomain(email) {
  const at = String(email || "").lastIndexOf("@");
  return at === -1 ? "" : String(email).slice(at + 1).trim().toLowerCase();
}

// Válido solo si el formato es correcto y el dominio está en el allowlist.
export function isAllowedEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return false;
  return ALLOWED.has(emailDomain(e));
}
