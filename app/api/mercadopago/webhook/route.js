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

async function handleNotification(request) {
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
  } catch (e) {
    return new Response("Error", { status: 500 });
  }
}

export async function POST(request) {
  return handleNotification(request);
}

export async function GET(request) {
  return handleNotification(request);
}
