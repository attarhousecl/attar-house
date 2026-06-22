// Escapa caracteres HTML en valores del usuario (nombre, dirección, notas, ítems)
// para que no se inyecte markup en los correos.
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendOrderConfirmation({ to, name, order, items, total, shipping }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Attar House <pedidos@attarhouse.cl>";
  if (!apiKey) return;

  const itemsHtml = items.map(i =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc">${esc(i.name)} · ${esc(i.format)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc;text-align:center">×${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;color:#d4af37;text-align:right">$${(i.price * i.quantity).toLocaleString("es-CL")}</td>
    </tr>`
  ).join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',sans-serif;color:#e0e0e0">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-family:Georgia,serif;color:#d4af37;font-size:1.8rem;margin:0">Attar House</h1>
      <p style="color:#555;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0">No son perfumes, es presencia</p>
    </div>

    <div style="background:#111;border-radius:12px;padding:28px;margin-bottom:20px">
      <h2 style="margin:0 0 6px;font-size:1.1rem;color:#fff">¡Gracias por tu compra, ${esc(name)}!</h2>
      <p style="margin:0 0 20px;color:#666;font-size:0.85rem">Tu pago fue confirmado. Te contactaremos pronto para coordinar el despacho.</p>

      <div style="background:#0a0a0a;border-radius:8px;padding:14px 18px;margin-bottom:20px">
        <div style="font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Número de pedido</div>
        <div style="font-family:monospace;color:#d4af37;font-size:1rem;font-weight:700">${order}</div>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead><tr>
          <th style="font-size:0.7rem;color:#555;text-align:left;padding-bottom:8px;font-weight:600">PRODUCTO</th>
          <th style="font-size:0.7rem;color:#555;text-align:center;padding-bottom:8px;font-weight:600">CANT</th>
          <th style="font-size:0.7rem;color:#555;text-align:right;padding-bottom:8px;font-weight:600">PRECIO</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr>
          <td colspan="2" style="padding-top:14px;color:#888;font-size:0.85rem">Total pagado</td>
          <td style="padding-top:14px;color:#d4af37;font-weight:700;text-align:right;font-size:1rem">$${total.toLocaleString("es-CL")}</td>
        </tr></tfoot>
      </table>
    </div>

    ${(shipping?.direccion || shipping?.comuna || shipping?.region) ? `
    <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:20px">
      <h3 style="margin:0 0 10px;font-size:0.9rem;color:#d4af37">Dirección de envío</h3>
      <p style="margin:0;color:#ccc;font-size:0.85rem;line-height:1.6">${shipping.direccion ? esc(shipping.direccion) + "<br>" : ""}${[shipping.comuna, shipping.region].filter(Boolean).map(esc).join(", ")}</p>
      ${shipping.notas ? `<p style="margin:8px 0 0;color:#777;font-size:0.78rem">Nota: ${esc(shipping.notas)}</p>` : ""}
    </div>` : `
    <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="margin:0;color:#888;font-size:0.82rem">📍 Retiro en Valdivia — te contactaremos para coordinar punto y horario.</p>
    </div>`}

    <div style="text-align:center;padding:20px 0;border-top:1px solid #1a1a1a">
      <p style="color:#444;font-size:0.75rem;margin:0">¿Tienes dudas? Escríbenos por <a href="https://wa.me/56632249728" style="color:#25D366">WhatsApp</a></p>
      <p style="color:#333;font-size:0.65rem;margin:8px 0 0">Attar House · Valdivia, Chile · attarhouse.cl</p>
    </div>
  </div>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to, subject: `Pedido confirmado ${order} — Attar House`, html }),
  }).catch(() => {});
}

// --- Helper interno: envoltorio HTML + envío via Resend ---
async function sendEmail({ to, subject, bodyHtml }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Attar House <pedidos@attarhouse.cl>";
  if (!apiKey) return false;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',sans-serif;color:#e0e0e0">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-family:Georgia,serif;color:#d4af37;font-size:1.8rem;margin:0">Attar House</h1>
      <p style="color:#555;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0">No son perfumes, es presencia</p>
    </div>
    ${bodyHtml}
    <div style="text-align:center;padding:20px 0;border-top:1px solid #1a1a1a;margin-top:24px">
      <p style="color:#444;font-size:0.75rem;margin:0">¿Tienes dudas? Escríbenos por <a href="https://wa.me/56632249728" style="color:#25D366">WhatsApp</a></p>
      <p style="color:#333;font-size:0.65rem;margin:8px 0 0">Attar House · Valdivia, Chile · attarhouse.cl</p>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to, subject, html }),
  }).catch(() => null);

  return !!(res && res.ok);
}

// Email de bienvenida al suscribirse al newsletter
export async function sendWelcomeEmail({ to }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://attarhouse.cl";
  const bodyHtml = `
    <div style="background:#111;border-radius:12px;padding:28px;margin-bottom:20px">
      <h2 style="margin:0 0 10px;font-size:1.2rem;color:#fff">¡Bienvenido/a a la casa! 🌙</h2>
      <p style="margin:0 0 16px;color:#aaa;font-size:0.9rem;line-height:1.6">
        Gracias por sumarte a Attar House. Desde ahora serás de los primeros en enterarte de nuevos ingresos,
        ediciones limitadas y promociones exclusivas de perfumería árabe y decants.
      </p>
      <div style="background:#0a0a0a;border:1px solid rgba(212,175,55,0.25);border-radius:8px;padding:16px 18px;margin-bottom:20px">
        <p style="margin:0;color:#d4af37;font-size:0.9rem;font-weight:700">🎁 Tip: prueba antes de invertir</p>
        <p style="margin:6px 0 0;color:#999;font-size:0.82rem;line-height:1.5">
          Con nuestros decants pruebas un perfume original por una fracción del precio del frasco completo.
          ¿No sabes cuál elegir? Haz nuestro Quiz de Fragancias.
        </p>
      </div>
      <div style="text-align:center">
        <a href="${siteUrl}/quiz" style="display:inline-block;background:#d4af37;color:#000;text-decoration:none;font-weight:700;font-size:0.88rem;padding:13px 28px;border-radius:8px;margin-right:8px">Hacer el Quiz</a>
        <a href="${siteUrl}/catalogo" style="display:inline-block;background:transparent;color:#d4af37;text-decoration:none;font-weight:700;font-size:0.88rem;padding:13px 28px;border-radius:8px;border:1px solid rgba(212,175,55,0.4)">Ver catálogo</a>
      </div>
    </div>`;
  return sendEmail({ to, subject: "Bienvenido/a a Attar House 🌙", bodyHtml });
}

// Email de recordatorio de carrito abandonado
export async function sendAbandonedCartEmail({ to, name, order, items, total }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://attarhouse.cl";
  const itemsHtml = (items || []).map(i =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc">${esc(i.name)} · ${esc(i.format)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc;text-align:center">×${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;color:#d4af37;text-align:right">$${(i.price * i.quantity).toLocaleString("es-CL")}</td>
    </tr>`
  ).join("");

  const bodyHtml = `
    <div style="background:#111;border-radius:12px;padding:28px;margin-bottom:20px">
      <h2 style="margin:0 0 8px;font-size:1.15rem;color:#fff">${name ? esc(name) + ", t" : "T"}u pedido te espera 👀</h2>
      <p style="margin:0 0 20px;color:#999;font-size:0.88rem;line-height:1.6">
        Notamos que dejaste estas fragancias sin terminar tu compra. Las guardamos por ti —
        pero el stock de decants es limitado y vuela rápido.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr>
          <td colspan="2" style="padding-top:14px;color:#888;font-size:0.85rem">Total</td>
          <td style="padding-top:14px;color:#d4af37;font-weight:700;text-align:right;font-size:1rem">$${(total || 0).toLocaleString("es-CL")}</td>
        </tr></tfoot>
      </table>
      <div style="text-align:center">
        <a href="${siteUrl}/checkout" style="display:inline-block;background:#d4af37;color:#000;text-decoration:none;font-weight:700;font-size:0.9rem;padding:14px 32px;border-radius:8px">Completar mi compra</a>
      </div>
      <p style="margin:18px 0 0;color:#555;font-size:0.72rem;text-align:center">
        ¿Algún problema con el pago? Respóndenos o escríbenos por WhatsApp y te ayudamos.
      </p>
    </div>`;
  return sendEmail({ to, subject: "¿Olvidaste algo? Tu pedido en Attar House te espera 🌙", bodyHtml });
}
