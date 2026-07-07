import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPayment } from "@/lib/mercadopago";
import { sendTelegramAlert } from "@/lib/telegram";
import { sendOrderConfirmation } from "@/lib/email";

// El webhook lee headers/query de la request: nunca debe optimizarse a estático.
export const dynamic = "force-dynamic";

const STATUS_MAP = {
  approved: "paid",
  pending: "pending",
  in_process: "pending",
  authorized: "pending",
  rejected: "rejected",
  cancelled: "rejected",
  refunded: "rejected",
  charged_back: "rejected",
};

// Comparación en tiempo constante para evitar timing attacks sobre la firma.
function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignature(request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  // Fail-closed: sin secret configurado NO podemos verificar, así que rechazamos.
  // Asegúrate de tener MERCADOPAGO_WEBHOOK_SECRET seteada en el entorno.
  if (!secret) {
    console.error("[webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado — notificación rechazada.");
    return false;
  }

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature) {
    console.warn("[mp-webhook] sin header x-signature — se rechaza (¿URL configurada como IPN legacy y no Webhooks?).");
    return false;
  }

  const url = new URL(request.url);
  // MP arma el manifiesto con el data.id; si es alfanumérico debe ir en minúsculas.
  const dataId = (url.searchParams.get("data.id") || url.searchParams.get("id") || "").toLowerCase();
  const ts = signature.match(/ts=([^,]+)/)?.[1];
  const v1 = signature.match(/v1=([^,]+)/)?.[1];
  if (!ts || !v1) {
    console.warn("[mp-webhook] x-signature sin ts/v1 — se rechaza.");
    return false;
  }

  const manifest = `id:${dataId};request-id:${requestId || ""};ts:${ts};`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const computed = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const ok = safeEqualHex(computed, v1);
  if (!ok) {
    console.error("[mp-webhook] firma inválida — ¿MERCADOPAGO_WEBHOOK_SECRET no coincide con el de la cuenta actual? dataId=%s", dataId);
  }
  return ok;
}

async function handleNotification(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || url.searchParams.get("topic");
  const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
  // Log de entrada: confirma en Vercel que MP SÍ está llegando al endpoint correcto.
  console.log("[mp-webhook] recibido: method=%s type=%s id=%s", request.method, type, paymentId);

  if (!(await verifySignature(request))) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (type !== "payment" || !paymentId) {
    // Otras notificaciones (merchant_order, etc.): confirmamos recepción sin procesar.
    console.log("[mp-webhook] notificación ignorada (type=%s) — respondo 200.", type);
    return new Response("OK", { status: 200 });
  }

  try {
    const payment = await getPayment(paymentId);
    const newStatus = STATUS_MAP[payment.status] || "unknown";
    console.log(
      "[mp-webhook] pago %s: mp_status=%s -> %s | external_reference=%s",
      paymentId, payment.status, newStatus, payment.external_reference
    );

    const { data: order, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, mp_payment_data: payment })
      .eq("commerce_order", payment.external_reference)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("[mp-webhook] error al actualizar orders:", updateError.message);
      return new Response("Error", { status: 500 });
    }
    if (!order) {
      // No hay pedido con ese external_reference: no es reintentable, respondo 200
      // para que MP no reintente en loop, pero lo dejo registrado.
      console.warn("[mp-webhook] ningún pedido coincide con external_reference=%s — respondo 200.", payment.external_reference);
      return new Response("OK", { status: 200 });
    }
    console.log("[mp-webhook] pedido %s actualizado a %s (confirmation_sent=%s)", order.commerce_order, newStatus, order.confirmation_sent);

    // Solo al APROBARSE el pago, y solo una vez.
    // Idempotencia a prueba de carreras: MP reintenta el webhook y puede llegar en
    // paralelo. "Reclamamos" el envío con un UPDATE condicional (confirmation_sent
    // false -> true) que devuelve fila SOLO al primer webhook que gane. Así jamás
    // se manda Telegram/email dos veces, aunque lleguen reintentos simultáneos.
    if (newStatus === "paid" && order && !order.confirmation_sent) {
      const { data: claimed } = await supabaseAdmin
        .from("orders")
        .update({ confirmation_sent: true })
        .eq("commerce_order", order.commerce_order)
        .eq("confirmation_sent", false)
        .select()
        .maybeSingle();

      if (claimed) {
        // Escapa los valores del cliente: el mensaje va con parse_mode HTML a Telegram,
        // así que datos como customer_name podrían inyectar etiquetas/enlaces falsos.
        const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const items = (order.items || [])
          .map((i) => `• ${esc(i.name)} (${esc(i.format)}) ×${i.quantity} — $${(i.price * i.quantity).toLocaleString("es-CL")}`)
          .join("\n");
        await sendTelegramAlert(
          `🛒 <b>Nuevo pedido pagado</b>\n` +
          `📋 <code>${esc(order.commerce_order)}</code>\n` +
          `👤 ${esc(order.customer_name)} · ${esc(order.customer_phone)}\n` +
          `📧 ${esc(order.customer_email)}\n\n` +
          `${items}\n\n` +
          `💰 <b>Total: $${(order.total || 0).toLocaleString("es-CL")}</b>`
        );
        console.log("[mp-webhook] Telegram enviado para %s", order.commerce_order);

        // Correo de confirmación al cliente — SOLO con el pago aprobado.
        // Aislado en su propio try: un fallo de correo NO debe tumbar el webhook
        // (ya reclamamos el envío; devolver 500 haría que MP reintente en vano).
        try {
          await sendOrderConfirmation({
            to: order.customer_email,
            name: order.customer_name,
            order: order.commerce_order,
            items: order.items || [],
            total: order.total || 0,
            shipping: order.shipping,
          });
        } catch (mailErr) {
          console.error("[mp-webhook] fallo al enviar correo de confirmación (%s):", order.commerce_order, mailErr?.message || mailErr);
        }
      } else {
        console.log("[mp-webhook] confirmación ya reclamada por otro webhook para %s — no reenvío.", order.commerce_order);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    // Log del error real: sin esto, cualquier fallo (token de otra cuenta -> getPayment 404,
    // caída de red, etc.) moría en silencio y MP reintentaba sin dejar rastro.
    console.error("[mp-webhook] error procesando notificación:", e?.message || e);
    return new Response("Error", { status: 500 });
  }
}

export async function POST(request) {
  return handleNotification(request);
}

export async function GET(request) {
  return handleNotification(request);
}
