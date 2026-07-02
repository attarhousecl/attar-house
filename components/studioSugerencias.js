/**
 * Attar Studio · Fase 3 — Módulo B: qué publicar hoy.
 *
 * Funciones puras de análisis en memoria sobre el catálogo ya cargado
 * (misma query que usa el tab "Catálogo", sin queries nuevas). No tocan
 * React ni Supabase — solo arman la cola de propuestas priorizadas.
 *
 * Nota: "Populares" siempre propone la plantilla "producto" (no "testimonio")
 * porque un testimonio generado atribuiría una cita a un cliente inventado —
 * eso sería una reseña falsa. Los testimonios reales los escribe el admin.
 */

const DAY_MS = 86400000;
const LAUNCH_WINDOW_DAYS = 14;
const MAX_PER_CATEGORY = 5;

const familiesOf = (p) => (Array.isArray(p?.families) ? p.families : []).map((n) => (typeof n === 'string' ? n : n?.name || '')).filter(Boolean);

const daysAgo = (dateStr) => {
  const t = new Date(dateStr).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / DAY_MS);
};

const FORMAT_LABEL = { stock_decant3: 'decant 3ml', stock_decant5: 'decant 5ml', stock_decant10: 'decant 10ml', stock_sellado: 'sellado' };
const FORMAT_KEYS = Object.keys(FORMAT_LABEL);

function buildLanzamientos(perfumes) {
  return perfumes
    .map((p) => ({ p, days: daysAgo(p.created_at) }))
    .filter((x) => x.days !== null && x.days >= 0 && x.days <= LAUNCH_WINDOW_DAYS)
    .sort((a, b) => a.days - b.days)
    .slice(0, MAX_PER_CATEGORY)
    .map(({ p, days }) => ({
      key: `lanzamiento-${p.id}`,
      category: 'lanzamiento',
      template: 'lanzamiento',
      perfume: p,
      reason: days === 0 ? 'Lanzamiento hoy' : days === 1 ? 'Lanzamiento hace 1 día' : `Lanzamiento hace ${days} días`,
      thumb: p.image_url,
    }));
}

function buildUltimasUnidades(perfumes) {
  return perfumes
    .map((p) => {
      const disponibles = FORMAT_KEYS.filter((k) => p[k]);
      const agotados = FORMAT_KEYS.filter((k) => !p[k]);
      return { p, disponibles, agotados };
    })
    // queda algo, pero no todo: al menos un formato agotado y al menos uno disponible
    .filter((x) => x.agotados.length > 0 && x.disponibles.length > 0)
    .sort((a, b) => a.disponibles.length - b.disponibles.length) // lo más escaso primero
    .slice(0, MAX_PER_CATEGORY)
    .map(({ p, disponibles }) => {
      const labels = disponibles.map((k) => FORMAT_LABEL[k]);
      const lista = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
      return {
        key: `ultimas-${p.id}`,
        category: 'ultimas',
        template: 'countdown',
        perfume: p,
        reason: `Solo queda en ${lista}`,
        thumb: p.image_url,
      };
    });
}

function buildPopulares(perfumes) {
  return perfumes
    .slice()
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, MAX_PER_CATEGORY)
    .map((p, i) => ({
      key: `popular-${p.id}`,
      category: 'popular',
      template: 'producto',
      perfume: p,
      reason: i === 0 ? 'El más popular del catálogo' : `Popular · top ${i + 1}`,
      thumb: p.image_url,
    }));
}

function buildVersusFamilia(perfumes) {
  const pairs = [];
  const seen = new Set();
  for (let i = 0; i < perfumes.length; i++) {
    for (let j = i + 1; j < perfumes.length; j++) {
      const a = perfumes[i], b = perfumes[j];
      const famA = familiesOf(a), famB = familiesOf(b);
      const shared = famA.filter((f) => famB.includes(f));
      if (!shared.length) continue;
      const key = [a.id, b.id].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ a, b, family: shared[0], score: (a.popularity ?? 0) + (b.popularity ?? 0) });
    }
  }
  return pairs
    .sort((x, y) => y.score - x.score)
    .slice(0, MAX_PER_CATEGORY)
    .map(({ a, b, family }) => ({
      key: `versus-${a.id}-${b.id}`,
      category: 'versus',
      template: 'versus',
      perfume: a,
      perfume2: b,
      reason: `Versus: ambos comparten la familia ${family}`,
      thumb: a.image_url,
    }));
}

/**
 * Analiza el catálogo ya cargado y devuelve las 4 categorías de propuestas.
 * `perfumes` es el mismo array que ya usa el tab "Catálogo" (necesita
 * incluir `created_at` en el select para la categoría de lanzamientos).
 */
export function buildSuggestions(perfumes) {
  const list = Array.isArray(perfumes) ? perfumes.filter((p) => p?.id) : [];
  return {
    lanzamientos: buildLanzamientos(list),
    ultimasUnidades: buildUltimasUnidades(list),
    populares: buildPopulares(list),
    versusFamilia: buildVersusFamilia(list),
  };
}
