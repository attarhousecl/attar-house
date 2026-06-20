import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPayment } from "@/lib/mercadopago";
import { sendTelegramAlert } from "@/lib/telegram";
import { sendOrderConfirmation } from "@/lib/email";

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
  if (!signature) return false;

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id") || "";
  const ts = signature.match(/ts=([^,]+)/)?.[1];
  const v1 = signature.match(/v1=([^,]+)/)?.[1];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId || ""};ts:${ts};`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const computed = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return safeEqualHex(computed, v1);
}

async function handleNotification(request) {
  if (!(await verifySignature(request))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || url.searchParams.get("topic");
  const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

  if (type !== "payment" || !paymentId) {
    return new Response("OK", { status: 200 });
  }

  try {
    const payment = await getPayment(paymentId);
    const newStatus = STATUS_MAP[payment.status] || "unknown";

    const { data: order } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, mp_payment_data: payment })
      .eq("commerce_order", payment.external_reference)
      .select()
      .single();

    // Solo al APROBARSE el pago, y solo una vez (idempotente ante reintentos del webhook).
    if (newStatus === "paid" && order && !order.confirmation_sent) {
      const items = (order.items || [])
        .map((i) => `• ${i.name} (${i.format}) ×${i.quantity} — $${(i.price * i.quantity).toLocaleString("es-CL")}`)
        .join("\n");
      await sendTelegramAlert(
        `🛒 <b>Nuevo pedido pagado</b>\n` +
        `📋 <code>${order.commerce_order}</code>\n` +
        `👤 ${order.customer_name} · ${order.customer_phone}\n` +
        `📧 ${order.customer_email}\n\n` +
        `${items}\n\n` +
        `💰 <b>Total: $${(order.total || 0).toLocaleString("es-CL")}</b>`
      );

      // Correo de confirmación al cliente — SOLO con el pago aprobado.
      await sendOrderConfirmation({
        to: order.customer_email,
        name: order.customer_name,
        order: order.commerce_order,
        items: order.items || [],
        total: order.total || 0,
        shipping: order.shipping,
      });

      await supabaseAdmin
        .from("orders")
        .update({ confirmation_sent: true })
        .eq("commerce_order", order.commerce_order);
    }

    return new Response("OK", { status: 200 });
  } catch {
    return new Response("Error", { status: 500 });
  }
}

export async function POST(request) {
  return handleNotification(request);
}

export async function GET(request) {
  return handleNotification(request);
}
