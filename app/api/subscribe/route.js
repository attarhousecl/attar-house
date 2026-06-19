import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendWelcomeEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const email = (body?.email || "").trim().toLowerCase();
  const source = (body?.source || "footer").slice(0, 40);

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Ingresa un email válido." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("subscribers").insert({ email, source });

  // 23505 = duplicado: ya estaba suscrito, lo tratamos como éxito sin reenviar bienvenida
  if (error && error.code === "23505") {
    return Response.json({ ok: true, already: true });
  }
  if (error) {
    console.error("[subscribe] insert error:", error);
    return Response.json({ error: "No se pudo completar la suscripción." }, { status: 500 });
  }

  sendWelcomeEmail({ to: email }).catch(() => {});
  return Response.json({ ok: true });
}
