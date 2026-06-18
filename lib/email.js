export async function sendOrderConfirmation({ to, name, order, items, total, shipping }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Attar House <pedidos@attarhouse.cl>";
  if (!apiKey) return;

  const itemsHtml = items.map(i =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc">${i.name} · ${i.format}</td>
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
      <h2 style="margin:0 0 6px;font-size:1.1rem;color:#fff">¡Gracias por tu compra, ${name}!</h2>
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

    ${shipping?.region && shipping.region !== "Valdivia" ? `
    <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:20px">
      <h3 style="margin:0 0 10px;font-size:0.9rem;color:#d4af37">Dirección de envío</h3>
      <p style="margin:0;color:#ccc;font-size:0.85rem;line-height:1.6">${shipping.address || ""}<br>${shipping.city || ""}, ${shipping.region || ""}</p>
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
