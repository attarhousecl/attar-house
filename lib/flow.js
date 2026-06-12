import crypto from "crypto";

const API_URL = process.env.FLOW_API_URL || "https://sandbox.flow.cl/api";
const API_KEY = process.env.FLOW_API_KEY;
const SECRET_KEY = process.env.FLOW_SECRET_KEY;

function signParams(params) {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}${params[k]}`).join("");
  return crypto.createHmac("sha256", SECRET_KEY).update(toSign).digest("hex");
}

async function flowRequest(path, params, method = "POST") {
  const signedParams = { ...params, apiKey: API_KEY };
  signedParams.s = signParams(signedParams);

  let url = `${API_URL}${path}`;
  let options = { method };

  if (method === "GET") {
    url += `?${new URLSearchParams(signedParams).toString()}`;
  } else {
    const body = new URLSearchParams(signedParams);
    options.body = body;
    options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
  }

  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Flow error: ${data.message || res.statusText}`);
  }
  return data;
}

export async function createPayment({ commerceOrder, subject, amount, email, urlConfirmation, urlReturn }) {
  return flowRequest("/payment/create", {
    commerceOrder,
    subject,
    currency: "CLP",
    amount,
    email,
    urlConfirmation,
    urlReturn,
  });
}

export async function getPaymentStatus(token) {
  return flowRequest("/payment/getStatus", { token }, "GET");
}
