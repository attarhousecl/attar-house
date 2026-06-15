const API_URL = "https://api.mercadopago.com";
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

async function mpRequest(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Mercado Pago error: ${data.message || res.statusText}`);
  }
  return data;
}

export async function createPreference({ commerceOrder, items, payerEmail, backUrl, notificationUrl }) {
  return mpRequest("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((i) => ({
        title: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        currency_id: "CLP",
      })),
      payer: { email: payerEmail },
      external_reference: commerceOrder,
      back_urls: { success: backUrl, pending: backUrl, failure: backUrl },
      auto_return: "approved",
      notification_url: notificationUrl,
    }),
  });
}

export async function getPayment(paymentId) {
  return mpRequest(`/v1/payments/${paymentId}`);
}
