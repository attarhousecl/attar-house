import { NextResponse } from "next/server";

function redirectToResultado(request) {
  const url = new URL(request.url);
  const order = url.searchParams.get("order") || url.searchParams.get("external_reference") || "";
  return NextResponse.redirect(
    new URL(`/pedido/confirmacion/resultado?order=${encodeURIComponent(order)}`, request.url),
    303
  );
}

export async function POST(request) {
  return redirectToResultado(request);
}

export async function GET(request) {
  return redirectToResultado(request);
}
