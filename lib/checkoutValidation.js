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

// ── Email ───────────────────────────────────────────────────────────────────
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Proveedores prioritarios pedidos por el negocio.
const PREFERIDOS = new Set([
  "gmail.com",
  "hotmail.com", "hotmail.cl", "hotmail.es",
  "outlook.com", "outlook.cl", "outlook.es",
  "icloud.com", "me.com", "mac.com",
]);

// Red de seguridad: dominios basura/desechables y typos evidentes de los grandes.
// Todo lo demás (empresa, universidad, yahoo, proton, .cl, etc.) se acepta para no
// perder ventas de clientes reales.
const DESECHABLES = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "yopmail.com", "trashmail.com", "sharklasers.com",
  "getnada.com", "maildrop.cc", "throwawaymail.com", "fakeinbox.com",
  "dispostable.com", "mvrht.com", "moakt.com", "example.com", "example.org",
  "test.com", "test.cl", "correo.com", "email.com", "asdf.com", "aaa.com",
]);

const TYPOS = new Set([
  "gmial.com", "gmai.com", "gmal.com", "gnail.com", "gmail.co", "gmail.cm",
  "gmail.con", "gmails.com", "gmailcom.com", "hotmial.com", "hotmai.com",
  "hotmal.com", "hotnail.com", "hormail.com", "hotmail.co", "hotmail.con",
  "outlok.com", "outllok.com", "outook.com", "outlook.co", "iclod.com",
  "icloud.co", "iclould.com", "iclou.com", "yaho.com", "yahooo.com",
]);

export function emailDomain(email) {
  const at = String(email || "").lastIndexOf("@");
  return at === -1 ? "" : String(email).slice(at + 1).trim().toLowerCase();
}

// Política "4 preferidos + red de seguridad": formato válido, no desechable, no
// typo, y el dominio con forma real (label.tld, TLD de ≥2 letras).
export function isAllowedEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return false;
  const dom = emailDomain(e);
  if (!dom || dom.length > 253) return false;
  if (PREFERIDOS.has(dom)) return true;
  if (DESECHABLES.has(dom) || TYPOS.has(dom)) return false;
  // Estructura de dominio real: al menos un punto y TLD alfabético de 2+ letras.
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(dom)) {
    return false;
  }
  return true;
}
