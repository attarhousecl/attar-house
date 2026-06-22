import FaqItem from "@/components/FaqItem";

export const metadata = {
  title: "Preguntas Frecuentes | Attar House",
  description:
    "Resolvemos tus dudas sobre decants, frascos sellados, autenticidad, envíos a todo Chile, formas de pago y retiro en Valdivia. Compra con total tranquilidad en Attar House.",
  alternates: { canonical: "https://attarhouse.cl/faq" },
  openGraph: {
    title: "Preguntas Frecuentes | Attar House",
    description:
      "Todo sobre decants, originalidad, envíos y pagos. Compra con confianza en Attar House.",
    url: "https://attarhouse.cl/faq",
  },
};

export default function FaqPage() {
  return (
    <section id="faq" className="page-section active">
      <div className="container">
        <h1 className="section-title serif">Preguntas Frecuentes</h1>
        <p className="section-subtitle">
          Resolvemos todas tus dudas para que compres con total tranquilidad.
        </p>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <FaqItem question="¿Tienen envío gratis?">
            Sí. <strong>El envío es gratis a todo Chile en compras sobre $60.000.</strong>{" "}
            Para pedidos menores, el costo de envío varía según la región y se coordina
            directamente por WhatsApp. En Valdivia realizamos entregas presenciales sin
            costo adicional.
          </FaqItem>
          <FaqItem question="¿Puedo probar los perfumes antes de comprar?">
            ¡Por supuesto! Queremos que compres con total seguridad.{" "}
            <strong>Contamos con testers de todo nuestro catálogo a tu disposición</strong>.
            Puedes adquirir nuestros decants para probarlos tranquilamente en tu día a día,
            o contactarnos para recibir asesoría experta y asegurar que te lleves el perfume
            perfecto para ti.
          </FaqItem>
          <FaqItem question="¿Venden solo decants o también la botella completa?">
            <strong>Ofrecemos ambos formatos.</strong> Puedes adquirir nuestros decants
            (3ml, 5ml o 10ml) para descubrir cómo evoluciona la fragancia en tu piel durante
            días, o comprar el frasco original completamente sellado de fábrica si ya
            conoces el aroma y quieres la experiencia completa.
          </FaqItem>
          <FaqItem question="¿Los perfumes son 100% originales?">
            Absolutamente. Extraemos el líquido directamente de las botellas originales y
            selladas de fábrica. Garantizamos la autenticidad de cada gota de nuestros
            decants. No vendemos réplicas ni imitaciones.
          </FaqItem>
          <FaqItem question="¿Cómo se realiza el proceso de pago?">
            Al confirmar tu carrito, pasaremos a WhatsApp para coordinar tu pedido de forma
            personal. <strong>Si eres de Valdivia, puedes pagar al momento de recibir tu
            producto</strong> (Efectivo, Débito o Crédito) en entregas a coordinar o
            delivery. <strong>Para envíos a otras regiones</strong>, el pago se realiza
            mediante transferencia bancaria previa al despacho.
          </FaqItem>
          <FaqItem question="¿Cuánto demoran y cómo son los envíos?">
            Hacemos entregas presenciales en Valdivia. Para el resto de Chile, enviamos a
            través de <strong>Starken y Chilexpress</strong>. Los pedidos se despachan
            cuidadosamente empaquetados en 24 a 48 horas hábiles tras recibir tu compra.
          </FaqItem>
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "16px", fontSize: "0.9rem" }}>
            ¿Tienes otra duda? Escríbenos y te respondemos en menos de 1 hora.
          </p>
          <a
            href="https://wa.me/56632249728"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ display: "inline-block" }}
          >
            <span><i className="ph ph-whatsapp-logo"></i> Escríbenos por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
