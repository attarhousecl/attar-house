import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { labelsFormatos } from "@/lib/catalogData";

const STATUS_INFO = {
  paid: {
    title: "¡Pago Confirmado!",
    icon: "ph-check-circle",
    color: "#25D366",
    message: "Gracias por tu compra. Te contactaremos pronto para coordinar el envío.",
  },
  pending: {
    title: "Pago Pendiente",
    icon: "ph-clock",
    color: "var(--gold-primary)",
    message: "Estamos esperando la confirmación de tu pago. Esto puede tardar unos minutos.",
  },
  rejected: {
    title: "Pago Rechazado",
    icon: "ph-x-circle",
    color: "var(--danger)",
    message: "Tu pago no pudo ser procesado. Puedes intentarlo nuevamente desde tu carrito.",
  },
  expired: {
    title: "Pago Expirado",
    icon: "ph-x-circle",
    color: "var(--danger)",
    message: "El tiempo para completar el pago expiró. Intenta nuevamente.",
  },
  error: {
    title: "Ocurrió un Error",
    icon: "ph-x-circle",
    color: "var(--danger)",
    message: "No pudimos procesar tu pedido. Contáctanos por WhatsApp si el problema persiste.",
  },
};

export default async function ConfirmacionResultadoPage({ searchParams }) {
  const { order } = await searchParams;

  let pedido = null;
  if (order) {
    const { data } = await supabaseAdmin.from("orders").select("*").eq("commerce_order", order).single();
    pedido = data;
  }

  if (!pedido) {
    return (
      <section className="page-section active">
        <div className="container" style={{ textAlign: "center" }}>
          <h1 className="section-title serif">Pedido no encontrado</h1>
          <p className="section-subtitle">No pudimos encontrar la información de este pedido.</p>
          <Link href="/" className="btn-primary">
            <span>Volver al inicio</span>
          </Link>
        </div>
      </section>
    );
  }

  const info = STATUS_INFO[pedido.status] || STATUS_INFO.pending;

  return (
    <section className="page-section active">
      <div className="container" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <i className={`ph ${info.icon}`} style={{ fontSize: "4rem", color: info.color, marginBottom: "20px", display: "block" }}></i>
        <h1 className="section-title serif">{info.title}</h1>
        <p className="section-subtitle">{info.message}</p>

        <div className="checkout-summary" style={{ textAlign: "left", marginTop: "30px" }}>
          <h3 className="serif">Pedido #{pedido.commerce_order}</h3>
          {pedido.items.map((i, idx) => (
            <div className="checkout-item" key={idx}>
              <div>
                <strong>{i.name}</strong>
                <p>
                  {labelsFormatos[i.format] || i.format} × {i.quantity}
                </p>
              </div>
              <div>${(i.price * i.quantity).toLocaleString("es-CL")}</div>
            </div>
          ))}
          <div className="checkout-total">
            <span>Total:</span>
            <span style={{ color: "var(--gold-primary)" }}>${pedido.total.toLocaleString("es-CL")}</span>
          </div>
        </div>

        <Link href="/" className="btn-primary" style={{ marginTop: "30px", display: "inline-block" }}>
          <span>Volver al inicio</span>
        </Link>
      </div>
    </section>
  );
}
