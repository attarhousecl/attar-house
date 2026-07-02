/**
 * Attar Studio · Fase 3 — Generador de copy con tono de marca (sin IA, basado en reglas).
 *
 * copyFor(tpl, perfume, variantIndex) devuelve un parche de campos para esa
 * plantilla, listo para aplicar con patch()/patchSlide() — nunca toca `layout`,
 * así que el diseño personalizado del usuario (Fase 2) se conserva.
 *
 * Directrices de marca (obligatorias, ver brief Fase 3):
 *  1. Tono elegante/directo/cercano; máx. 1 chilenismo por pieza, solo si suma.
 *  2. El tagline "No son perfumes, es presencia" está reservado (nunca se genera).
 *  3. "Riesgo mínimo" (probar antes de comprometerse) sobre todo en producto/versus/tabla.
 *  4. Precios siempre reales (clp), nunca inventados; sin descuentos falsos.
 *  5. CTA base desde brandFacts.js (CTA_OPTIONS).
 *  6. Sin emojis en titulares; máx. 2 en textos secundarios.
 *
 * Nota deliberada: "testimonio" NUNCA genera cita/nombre/ciudad de cliente —
 * inventar un testimonio atribuido a una persona real sería un testimonio falso.
 * El generador solo aporta una línea de apoyo genérica (extra), no atribuida.
 */
import { CTA_OPTIONS } from './brandFacts';

const clp = (n) => '$' + Number(n || 0).toLocaleString('es-CL');

const perfumeNotes = (p) => {
  const arr = Array.isArray(p?.notes) ? p.notes : [];
  return arr.map((n) => (typeof n === 'string' ? n : n?.name || '')).filter(Boolean);
};
const perfumeFamilies = (p) => {
  const arr = Array.isArray(p?.families) ? p.families : [];
  return arr.map((n) => (typeof n === 'string' ? n : n?.name || '')).filter(Boolean);
};
const lowestPrice = (p) => {
  const vals = [p?.price_decant3, p?.price_decant5, p?.price_decant10, p?.price_sellado].filter((x) => x > 0);
  return vals.length ? Math.min(...vals) : 0;
};
const perfumeMeta = (p) => {
  const parts = [];
  if (p?.stock_decant3  && p?.price_decant3)  parts.push(`3ml ${clp(p.price_decant3)}`);
  if (p?.stock_decant5  && p?.price_decant5)  parts.push(`5ml ${clp(p.price_decant5)}`);
  if (p?.stock_decant10 && p?.price_decant10) parts.push(`10ml ${clp(p.price_decant10)}`);
  if (p?.stock_sellado  && p?.price_sellado)  parts.push(`Sellado ${clp(p.price_sellado)}`);
  return parts.join(' · ') || 'Consultar formatos';
};

// máx. 1 uso por pieza — se reserva a UNA sola ranura por plantilla, nunca a dos campos a la vez
const CHILENISMOS = ['cachai', 'al tiro', 'la firme'];

const pick = (arr, idx, offset = 0) => arr[(idx + offset) % arr.length];
const cta = (idx) => pick(CTA_OPTIONS, idx);

// El tagline de marca está reservado a bio/web/logo — nunca debe salir de aquí.
export const RESERVED_TAGLINE = 'No son perfumes, es presencia';

const RIESGO_MINIMO = [
  'Riesgo mínimo: pruébalo en decant antes de comprometerte con el frasco.',
  'Prueba primero, decide después — sin apostar por el sellado de entrada.',
  'Decant desde poco y nada: confirma que te acomoda antes de dar el paso.',
];

function copyProducto(p, i) {
  const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
  const eyebrow = pick([p.brand, (p.brand || '').toUpperCase(), `Casa ${p.brand}`], i);
  const chip = pick([
    'Disponible en Valdivia',
    'Pruébalo en decant, sin compromiso',
    `Riesgo mínimo, cachai`,
  ], i, 1);
  return { eyebrow, notes, chip, meta: perfumeMeta(p) };
}

function copyPromo(p, i) {
  const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
  const eyebrow = pick(['Oferta', 'Esta semana', 'Precio especial'], i);
  const chip = pick(['Disponible ahora', 'Antes que se agote el stock', `Escríbenos por DM`], i, 1);
  return { eyebrow, notes, from: '', price: clp(lowestPrice(p)), chip };
}

function copyLanzamiento(p, i) {
  const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
  const eyebrow = pick(['Nuevo en Attar House', 'Recién llegado', 'Ya disponible'], i);
  const meta = pick(['Ya disponible', 'Recién llegado a la casa', 'Pruébalo primero en decant'], i, 1);
  return { eyebrow, notes, meta };
}

function copyInspirado(p, i) {
  const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
  const eyebrow = pick(['Inspirado en', 'Nuestra versión de', 'Basado en'], i);
  const target = p.inspiration || 'una fragancia de diseñador';
  const meta = pick([
    `Desde ${clp(lowestPrice(p))} en decant`,
    'Mismas notas, riesgo mínimo antes de comprar',
    `Consulta formatos por DM`,
  ], i, 1);
  return { eyebrow, target, notes, meta };
}

function copyTestimonio(p, i) {
  // Deliberado: sin cita/nombre/ciudad generados (ver nota al inicio del archivo).
  const extra = pick([
    'Pruébalo en decant antes de comprometerte con el frasco.',
    'Notas reales, sin sorpresas al abrir el frasco.',
    'Así se siente en la piel — pruébalo tú también.',
  ], i);
  return { extra };
}

function copyComparativa(p, i) {
  const eyebrow = pick(['Formatos', 'Elige tu formato', 'Precios'], i);
  const extra = pick(RIESGO_MINIMO, i, 1);
  return { eyebrow, extra };
}

function copyCountdown(p, i) {
  const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
  const eyebrow = pick(['Oferta relámpago', 'Por tiempo limitado', 'Última llamada'], i);
  const endsText = pick(['Antes que se acabe', 'Disponible por poco tiempo', 'Escríbenos antes que se agote'], i, 1);
  const chip = pick(['Stock limitado', 'Consulta disponibilidad', cta(i)], i, 2);
  return { eyebrow, notes, endsText, price: clp(lowestPrice(p)), chip };
}

function copyCarrusel(p, i) {
  const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
  const eyebrow = pick([p.brand, (p.brand || '').toUpperCase(), `Casa ${p.brand}`], i);
  const extra = pick(RIESGO_MINIMO, i, 1);
  return { eyebrow, notes, price: clp(lowestPrice(p)), extra };
}

function copyVersus(p, i) {
  const price = clp(lowestPrice(p));
  const lSub = pick([
    `Riesgo mínimo: decant desde ${price}, confirma que te acomoda antes de dar el paso.`,
    'Pruébalo en decant antes de comprometerte con el frasco completo.',
    'Notas reales, sin sorpresas — decide después de probar.',
  ], i);
  return { lHead: p.name, lSub };
}

function copyTabla(p, i) {
  const title = pick(['Por qué somos tu mejor opción', 'Lo que nos hace diferentes', 'Razones para elegirnos'], i);
  const extra = pick(RIESGO_MINIMO, i, 1);
  return { title, extra };
}

const GENERATORS = {
  producto: copyProducto,
  promo: copyPromo,
  lanzamiento: copyLanzamiento,
  inspirado: copyInspirado,
  testimonio: copyTestimonio,
  comparativa: copyComparativa,
  countdown: copyCountdown,
  carrusel: copyCarrusel,
  versus: copyVersus,
  tabla: copyTabla,
};

/**
 * Genera un parche de copy para la plantilla `tpl` a partir de un perfume real.
 * `variantIndex` cicla las variantes — incrementarlo en cada clic de "Sugerir
 * copy" garantiza una combinación distinta a la anterior (los bancos de frases
 * tienen 3 opciones, así que cualquier incremento cambia al menos un campo).
 */
export function copyFor(tpl, perfume, variantIndex = 0) {
  const gen = GENERATORS[tpl];
  if (!gen || !perfume) return {};
  const idx = Math.max(0, Math.floor(variantIndex)) % 3;
  return gen(perfume, idx);
}

export const COPY_CAPABLE = Object.keys(GENERATORS);
