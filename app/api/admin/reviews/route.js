import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";

// Moderación de reseñas (panel admin). La tabla `reviews` tiene RLS que solo
// permite SELECT público de aprobadas; todo lo demás pasa por aquí con
// service role, protegido por getAdminUser() (sesión Supabase + correo admin).
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  return null;
}

// GET: lista reseñas (pendientes primero, luego por fecha desc).
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, perfume_id, author_name, rating, comment, approved, created_at, perfumes(name, brand)")
    .order("approved", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("[admin/reviews] list error:", error);
    return Response.json({ error: "No se pudieron cargar las reseñas." }, { status: 500 });
  }

  return Response.json({ reviews: data || [] });
}

// PATCH: aprobar u ocultar una reseña. Body: { id, approved }
export async function PATCH(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const id = String(body?.id || "").trim();
  const approved = Boolean(body?.approved);
  if (!id) return Response.json({ error: "Reseña inválida." }, { status: 400 });

  const { error } = await supabaseAdmin.from("reviews").update({ approved }).eq("id", id);
  if (error) {
    console.error("[admin/reviews] update error:", error);
    return Response.json({ error: "No se pudo actualizar la reseña." }, { status: 500 });
  }

  return Response.json({ ok: true });
}

// DELETE: elimina una reseña definitivamente. Body: { id }
export async function DELETE(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const id = String(body?.id || "").trim();
  if (!id) return Response.json({ error: "Reseña inválida." }, { status: 400 });

  const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);
  if (error) {
    console.error("[admin/reviews] delete error:", error);
    return Response.json({ error: "No se pudo eliminar la reseña." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
