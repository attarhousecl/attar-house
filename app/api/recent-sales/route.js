import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Devuelve ventas reales recientes (anonimizadas) para prueba social.
// Solo expone: producto, ciudad y fecha. Sin nombres ni datos de contacto.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("items, shipping, created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error || !data) {
    return Response.json({ sales: [] });
  }

  const sales = data
    .map((o) => {
      const firstItem = Array.isArray(o.items) && o.items.length > 0 ? o.items[0] : null;
      if (!firstItem) return null;
      const city = o.shipping?.city || o.shipping?.region || "Chile";
      return { product: firstItem.name, city, at: o.created_at };
    })
    .filter(Boolean);

  return Response.json(
    { sales },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
  );
}
