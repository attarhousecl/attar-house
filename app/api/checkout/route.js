import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createPreference } from "@/lib/mercadopago";
import { accesoriosDB } from "@/lib/catalogData";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function POST(request) {
  const body = await request.json();
  const { items, customer, shipping, freeGift } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  if (!customer?.name || !customer?.email || !customer?.phone) {
    return Response.json({ error: "Faltan datos de contacto." }, { status: 400 });
  }

  const perfumeIds = [...new Set(items.filter((i) => i.format !== "Accesorio").map((i) => i.id))];

  let perfumes = [];
  if (perfumeIds.length > 0) {
    const { data, error } = await supabaseAdmin.from("perfumes").select("*").in("id", perfumeIds);
    if (error) return Response.json({ error: "Error al verificar el catálogo." }, { status: 500 });
    perfumes = data;
  }

  const verifiedItems = [];
  for (const item of items) {
    if (item.format === "Accesorio") {
      const acc = accesoriosDB.find((a) => a.id === item.id);
      if (!acc) return Response.json({ error: `Accesorio inválido: ${item.id}` }, { status: 400 });
      verifiedItems.push({ id: acc.id, name: acc.name, format: "Accesorio", price: acc.price, quantity: item.quantity });
    } else {
      const perfume = perfumes.find((p) => p.id === item.id);
      if (!perfume) return Response.json({ error: `Perfume inválido: ${item.id}` }, { status: 400 });
      const priceField = `price_${item.format}`;
      const stockField = `stock_${item.format}`;
      const price = perfume[priceField];
      if (!price) return Response.json({ error: `Formato inválido para ${perfume.name}.` }, { status: 400 });
      if (perfume[stockField] === false) return Response.json({ error: `${perfume.name} (${item.format}) está agotado.` }, { status: 400 });
      verifiedItems.push({ id: perfume.id, name: perfume.name, format: item.format, price, quantity: item.quantity });
    }
  }

  const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;

  const commerceOrder = `AH${Date.now()}`;

  const { error: insertError } = await supabaseAdmin.from("orders").insert({
    commerce_order: commerceOrder,
    status: "pending",
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    shipping: shipping || null,
    items: verifiedItems,
    free_gift: freeGift || null,
    subtotal,
    total,
  });

  if (insertError) {
    console.error("[checkout] orders insert error:", insertError);
    return Response.json({ error: "No se pudo registrar el pedido.", detail: insertError.message }, { status: 500 });
  }

  try {
    const preference = await createPreference({
      commerceOrder,
      items: verifiedItems,
      payerEmail: customer.email,
      backUrl: `${SITE_URL}/pedido/confirmacion?order=${commerceOrder}`,
      notificationUrl: `${SITE_URL}/api/mercadopago/webhook`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ mp_preference_id: preference.id })
      .eq("commerce_order", commerceOrder);

    return Response.json({ redirectUrl: preference.init_point });
  } catch (e) {
    await supabaseAdmin.from("orders").update({ status: "error" }).eq("commerce_order", commerceOrder);
    return Response.json({ error: "No se pudo iniciar el pago con Mercado Pago." }, { status: 502 });
  }
}
