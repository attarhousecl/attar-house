import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createPreference } from "@/lib/mercadopago";
import { accesoriosDB } from "@/lib/catalogData";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isAllowedEmail, isValidPhoneCL, formatPhoneCL, isValidDireccion } from "@/lib/checkoutValidation";
import { isValidComuna } from "@/lib/chileComunas";
import { packQualifies, effectiveUnitPrice } from "@/lib/packDiscount";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const MAX_ITEMS = 50;
const MAX_QTY = 50;

export async function POST(request) {
  // Limita creación de pedidos por IP para frenar spam.
  const rl = rateLimit(`checkout:${clientIp(request)}`, { limit: 15, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: "Demasiadas solicitudes. Intenta más tarde." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const { items, customer, shipping, freeGift } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  if (items.length > MAX_ITEMS) {
    return Response.json({ error: "Demasiados productos en el carrito." }, { status: 400 });
  }
  if (!customer?.name || !customer?.email || !customer?.phone) {
    return Response.json({ error: "Faltan datos de contacto." }, { status: 400 });
  }

  // Validaciones anti-bot en el servidor: NO confiar en el cliente (un bot no usa
  // el formulario, le pega directo aquí). Frenan payloads basura y datos falsos.
  //
  // Email: allowlist estricto de los 5 grandes proveedores (Gmail, Hotmail,
  // Outlook, iCloud, Yahoo). Cualquier otro dominio se rechaza — ver lib/checkoutValidation.
  const email = String(customer.email).trim().toLowerCase().slice(0, 254);
  if (!isAllowedEmail(email)) {
    return Response.json({ error: "Ingresa un correo de Gmail, Hotmail, Outlook, iCloud o Yahoo." }, { status: 400 });
  }

  // Teléfono: celular chileno válido (formato +56 9 XXXX XXXX).
  if (!isValidPhoneCL(customer.phone)) {
    return Response.json({ error: "Ingresa un celular chileno válido (9 XXXX XXXX)." }, { status: 400 });
  }
  const phone = formatPhoneCL(customer.phone);
  const name = String(customer.name).trim().slice(0, 120);

  // Envío: se persisten SOLO campos conocidos (se descarta cualquier extra que
  // mande un bot, p. ej. "notas"). Si viene comuna, debe existir de verdad y
  // calzar con la región (coherencia región/comuna).
  const region = String(shipping?.region || "").trim().slice(0, 80);
  const comuna = String(shipping?.comuna || "").trim().slice(0, 80);
  const direccion = String(shipping?.direccion || "").trim().slice(0, 200);
  if (comuna && !isValidComuna(comuna, region)) {
    return Response.json({ error: "Selecciona una comuna válida para tu región." }, { status: 400 });
  }
  // Dirección: si viene, debe tener calle y número (no verifica existencia real,
  // eso requeriría una API de mapas; frena basura de bots).
  if (direccion && !isValidDireccion(direccion)) {
    return Response.json({ error: "Ingresa una dirección con calle y número (ej: Av. Picarte 1234)." }, { status: 400 });
  }
  const cleanShipping = region || comuna || direccion ? { region, comuna, direccion } : null;

  const perfumeIds = [...new Set(items.filter((i) => i.format !== "Accesorio").map((i) => i.id))];

  let perfumes = [];
  if (perfumeIds.length > 0) {
    const { data, error } = await supabaseAdmin.from("perfumes").select("*").in("id", perfumeIds);
    if (error) return Response.json({ error: "Error al verificar el catálogo." }, { status: 500 });
    perfumes = data;
  }

  const verifiedItems = [];
  for (const item of items) {
    // Valida la cantidad en el servidor: entero entre 1 y MAX_QTY.
    // Evita totales manipulados (cantidades negativas, fracciones o gigantes).
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return Response.json({ error: "Cantidad inválida." }, { status: 400 });
    }

    if (item.format === "Accesorio") {
      const acc = accesoriosDB.find((a) => a.id === item.id);
      if (!acc) return Response.json({ error: `Accesorio inválido: ${item.id}` }, { status: 400 });
      verifiedItems.push({ id: acc.id, name: acc.name, format: "Accesorio", price: acc.price, quantity: qty });
    } else {
      const perfume = perfumes.find((p) => p.id === item.id);
      if (!perfume) return Response.json({ error: `Perfume inválido: ${item.id}` }, { status: 400 });
      const priceField = `price_${item.format}`;
      const qtyField = `qty_${item.format}`;
      const price = perfume[priceField];
      if (!price) return Response.json({ error: `Formato inválido para ${perfume.name}.` }, { status: 400 });
      // Stock por cantidad: revalida contra Supabase (pudo cambiar desde que se
      // agregó al carrito). El descuento real y atómico ocurre al confirmarse el
      // pago (webhook → descontar_stock_pedido); esto es la barrera previa.
      const disponible = perfume[qtyField] ?? 0;
      if (disponible <= 0) {
        return Response.json({ error: `${perfume.name} (${item.format}) está agotado.` }, { status: 409 });
      }
      if (disponible < qty) {
        return Response.json(
          { error: `Solo quedan ${disponible} de ${perfume.name} (${item.format}).` },
          { status: 409 }
        );
      }
      verifiedItems.push({ id: perfume.id, name: perfume.name, format: item.format, price, quantity: qty });
    }
  }

  // Descuento Pack Descubrimiento: MISMA regla que el cliente (helper compartido),
  // pero recalculada aquí sobre los precios verificados de la BD (no se confía en
  // el precio que manda el navegador). Así el 10% del pack SÍ se cobra en Mercado
  // Pago y el total coincide con lo que vio el cliente en el carrito.
  const packQ = packQualifies(verifiedItems);
  const pricedItems = verifiedItems.map((i) => ({ ...i, price: effectiveUnitPrice(i, packQ) }));
  const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = pricedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Sufijo aleatorio para que el número de pedido NO sea adivinable/enumerable
  // (evita que alguien vea el contenido de otros pedidos en la página de confirmación).
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const commerceOrder = `AH${Date.now()}${rand}`;

  const { error: insertError } = await supabaseAdmin.from("orders").insert({
    commerce_order: commerceOrder,
    status: "pending",
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    shipping: cleanShipping,
    items: pricedItems,
    free_gift: freeGift || null,
    subtotal,
    total,
  });

  if (insertError) {
    console.error("[checkout] orders insert error:", insertError);
    return Response.json({ error: "No se pudo registrar el pedido." }, { status: 500 });
  }

  try {
    const preference = await createPreference({
      commerceOrder,
      items: pricedItems,
      payerEmail: email,
      backUrl: `${SITE_URL}/pedido/confirmacion?order=${commerceOrder}`,
      notificationUrl: `${SITE_URL}/api/mercadopago/webhook`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ mp_preference_id: preference.id })
      .eq("commerce_order", commerceOrder);

    // El correo de confirmación se envía desde el webhook cuando el pago se
    // APRUEBA (no aquí, que es solo creación del pedido pendiente).
    return Response.json({ redirectUrl: preference.init_point });
  } catch (e) {
    await supabaseAdmin.from("orders").update({ status: "error" }).eq("commerce_order", commerceOrder);
    return Response.json({ error: "No se pudo iniciar el pago con Mercado Pago." }, { status: 502 });
  }
}
