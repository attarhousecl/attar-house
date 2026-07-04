import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { cookies } from "next/headers";

// Lee cookies y escribe en DB: nunca debe optimizarse a estático.
export const dynamic = "force-dynamic";

const SID_COOKIE = "ah_sid";       // id de sesión (httpOnly) → base del session_hash
const DONE_COOKIE = "ah_reviews";  // lista legible (CSV) de perfume_id ya reseñados por esta sesión
const SID_MAX_AGE = 60 * 60 * 24 * 365; // 1 año
const DONE_MAX_AGE = 60 * 60 * 24 * 180; // ~6 meses
const IS_PROD = process.env.NODE_ENV === "production";

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Marca este perfume como reseñado en la cookie legible (CSV de ids). La usa el
// cliente para ocultar SOLO el form de los productos ya reseñados. Los ids de
// perfume son slugs (a-z, 0-9, -), así que la coma es un separador seguro.
function markReviewed(cookieStore, perfumeId) {
  const current = (cookieStore.get(DONE_COOKIE)?.value || "").split(",").filter(Boolean);
  if (!current.includes(perfumeId)) current.push(perfumeId);
  cookieStore.set(DONE_COOKIE, current.join(","), { maxAge: DONE_MAX_AGE, path: "/", sameSite: "lax", secure: IS_PROD });
}

export async function POST(request) {
  // Frena spam de reseñas por IP.
  const rl = rateLimit(`reviews:${clientIp(request)}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Validación server-side (no confiar en el cliente): longitudes y rango del rating.
  const perfumeId = String(body?.perfumeId || "").trim().slice(0, 64);
  const authorName = String(body?.name || "").trim().slice(0, 40);
  const comment = String(body?.text || "").trim().slice(0, 300);
  const rating = Number(body?.rating);

  if (!perfumeId) return Response.json({ error: "Producto inválido." }, { status: 400 });
  if (!authorName || !comment) return Response.json({ error: "Completa tu nombre y comentario." }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Selecciona una puntuación de 1 a 5." }, { status: 400 });
  }

  // El producto debe existir (evita reseñas colgando de ids inventados).
  const { data: perfume } = await supabaseAdmin.from("perfumes").select("id").eq("id", perfumeId).maybeSingle();
  if (!perfume) return Response.json({ error: "Producto inválido." }, { status: 400 });

  const cookieStore = await cookies();
  const sid = cookieStore.get(SID_COOKIE)?.value || crypto.randomUUID();
  const sessionHash = await sha256Hex(sid);

  // Refuerzo server-side de "una reseña por producto por sesión".
  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("session_hash", sessionHash)
    .eq("perfume_id", perfumeId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Ya reseñó este producto: idempotente, solo refresca la marca legible.
    markReviewed(cookieStore, perfumeId);
    return Response.json({ ok: true, already: true });
  }

  // Insert SIEMPRE con approved=false: la reseña queda pendiente de moderación.
  const { error } = await supabaseAdmin.from("reviews").insert({
    perfume_id: perfumeId,
    author_name: authorName,
    rating,
    comment,
    approved: false,
    session_hash: sessionHash,
  });

  if (error) {
    // 23505 = chocó con el índice único (session_hash, perfume_id) por doble
    // submit en carrera: se trata como "ya enviada", no como error.
    if (error.code === "23505") {
      markReviewed(cookieStore, perfumeId);
      return Response.json({ ok: true, already: true });
    }
    console.error("[reviews] insert error:", error);
    return Response.json({ error: "No se pudo guardar tu reseña." }, { status: 500 });
  }

  // Cookies: sid httpOnly (no accesible a JS); ah_reviews legible para ocultar
  // el form solo en los productos ya reseñados.
  cookieStore.set(SID_COOKIE, sid, { maxAge: SID_MAX_AGE, path: "/", httpOnly: true, sameSite: "lax", secure: IS_PROD });
  markReviewed(cookieStore, perfumeId);

  return Response.json({ ok: true, pending: true });
}
