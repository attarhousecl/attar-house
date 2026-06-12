import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createPayment } from "@/lib/flow";
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
    return Response.json({ error: "No se pudo registrar el pedido." }, { status: 500 });
  }

  try {
    const flowResponse = await createPayment({
      commerceOrder,
      subject: `Pedido Attar House ${commerceOrder}`,
      amount: total,
      email: customer.email,
      urlConfirmation: `${SITE_URL}/api/flow/confirm`,
      urlReturn: `${SITE_URL}/pedido/confirmacion?order=${commerceOrder}`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ flow_token: flowResponse.token })
      .eq("commerce_order", commerceOrder);

    return Response.json({ redirectUrl: `${flowResponse.url}?token=${flowResponse.token}` });
  } catch (e) {
    await supabaseAdmin.from("orders").update({ status: "error" }).eq("commerce_order", commerceOrder);
    return Response.json({ error: "No se pudo iniciar el pago con Flow." }, { status: 502 });
  }
}
