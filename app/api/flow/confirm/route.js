import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPaymentStatus } from "@/lib/flow";

const STATUS_MAP = {
  1: "pending",
  2: "paid",
  3: "rejected",
  4: "expired",
};

export async function POST(request) {
  const formData = await request.formData();
  const token = formData.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  try {
    const payment = await getPaymentStatus(token);

    await supabaseAdmin
      .from("orders")
      .update({
        status: STATUS_MAP[payment.status] || "unknown",
        flow_payment_data: payment,
      })
      .eq("flow_token", token);

    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response("Error", { status: 500 });
  }
}
