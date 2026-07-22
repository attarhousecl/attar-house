import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, clientIp } from "@/lib/rateLimit";

// GET: historial de pedidos del cliente AUTENTICADO (Supabase Auth).
// El email se toma del token verificado en el servidor — nunca del cliente —
// así que no permite enumerar pedidos ajenos.
export async function GET(request) {
  const rl = rateLimit(`mis-pedidos-auth:${clientIp(request)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
  }

  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return Response.json({ error: "Inicia sesión para ver tus pedidos." }, { status: 401 });
  }

  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  if (authError || !email) {
    return Response.json({ error: "Sesión inválida o expirada." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("commerce_order, status, items, total, created_at")
    .eq("customer_email", email)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[mis-pedidos] auth query error:", error);
    return Response.json({ error: "No se pudieron cargar tus pedidos." }, { status: 500 });
  }

  return Response.json({ orders: data || [] });
}

// Consulta de estado de pedido para clientes.
// Seguridad: búsqueda SOLO por número de pedido EXACTO (que ahora es no-adivinable,
// AH<timestamp><random>), resuelta en el servidor con service_role. Devuelve
// únicamente campos seguros — nunca PII de contacto (nombre/email/teléfono/dirección).
// Se elimina la búsqueda por email del diseño anterior, que permitía a cualquiera
// enumerar pedidos ajenos (IDOR).
export async function POST(request) {
  const rl = rateLimit(`mis-pedidos:${clientIp(request)}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const order = String(body?.order || "").trim().toUpperCase().slice(0, 60);
  if (!/^AH[0-9A-Z]{6,}$/.test(order)) {
    return Response.json({ error: "Ingresa un número de pedido válido (ej: AH1234567890...)." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("commerce_order, status, items, total, created_at")
    .eq("commerce_order", order)
    .maybeSingle();

  if (error) {
    console.error("[mis-pedidos] query error:", error);
    return Response.json({ error: "No se pudo consultar el pedido." }, { status: 500 });
  }

  return Response.json({ order: data || null });
}
