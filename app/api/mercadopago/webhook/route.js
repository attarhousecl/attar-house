import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPayment } from "@/lib/mercadopago";

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

async function verifySignature(request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // Skip if not configured yet

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
  return computed === v1;
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

    await supabaseAdmin
      .from("orders")
      .update({
        status: STATUS_MAP[payment.status] || "unknown",
        mp_payment_data: payment,
      })
      .eq("commerce_order", payment.external_reference);

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
