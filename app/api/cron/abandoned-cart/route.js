import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendAbandonedCartEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Recordatorio de carrito abandonado.
// Lo dispara Vercel Cron (ver vercel.json). Protegido con CRON_SECRET.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }
  }

  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();   // dejar ~1h de margen
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(); // no molestar pedidos muy viejos

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("commerce_order, customer_name, customer_email, items, total")
    .eq("status", "pending")
    .eq("cart_reminder_sent", false)
    .lt("created_at", oneHourAgo)
    .gt("created_at", sevenDaysAgo)
    .limit(50);

  if (error) {
    console.error("[cron/abandoned-cart] query error:", error);
    return Response.json({ error: "Error al consultar pedidos." }, { status: 500 });
  }

  let sent = 0;
  for (const o of orders || []) {
    if (!o.customer_email) continue;

    const ok = await sendAbandonedCartEmail({
      to: o.customer_email,
      name: o.customer_name,
      order: o.commerce_order,
      items: o.items,
      total: o.total,
    });

    // Marcamos como enviado aunque falle el email, para no reintentar en bucle
    await supabaseAdmin
      .from("orders")
      .update({ cart_reminder_sent: true })
      .eq("commerce_order", o.commerce_order);

    if (ok) sent++;
  }

  return Response.json({ ok: true, checked: orders?.length || 0, sent });
}
