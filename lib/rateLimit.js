// Rate limiter en memoria (best-effort). En serverless cada instancia tiene su
// propio mapa, así que NO es un límite global exacto — es una primera barrera
// barata contra abuso/bots. Para límites robustos y distribuidos usar Vercel KV
// o Upstash Redis.
const buckets = new Map();

// Devuelve { ok, remaining, retryAfter }. `key` debe identificar al cliente
// (p. ej. `subscribe:<ip>`).
export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();

  // Limpieza perezosa para que el Map no crezca sin límite.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (now > v.reset) buckets.delete(k);
    }
  }

  const entry = buckets.get(key);
  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, remaining: limit - entry.count };
}

// Extrae la IP del cliente de los headers que pone Vercel/proxy.
export function clientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
