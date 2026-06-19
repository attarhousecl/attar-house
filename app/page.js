import Link from "next/link";
import FaqItem from "@/components/FaqItem";

export default function Home() {
  return (
    <>
      <section id="inicio" className="page-section active">
        <div className="hero-content">
          <div className="custom-logo-hero">
            <div className="monogram">
              A<span>H</span>
            </div>
            <div className="logo-text">ATTAR HOUSE</div>
          </div>

          <h1
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
            }}
          >
            Alta Perfumería Árabe en Valdivia | Attar House
          </h1>

          <h2
            className="serif"
            style={{
              fontSize: "1.7rem",
              color: "var(--gold-primary)",
              marginBottom: "20px",
              fontWeight: 400,
              fontStyle: "italic",
              opacity: 0.85,
            }}
          >
            &quot;No son perfumes, es presencia.&quot;
          </h2>

          <p>
            Nuestra principal misión es brindarte una experiencia excepcional. Queremos que
            te sientas absolutamente cómodo y seguro de tu elección. Por ello, contamos con{" "}
            <strong>testers de todo nuestro catálogo</strong>, además de frascos sellados
            100% originales y decants para que descubras tu aroma ideal.
          </p>
          <Link href="/catalogo" className="btn-primary">
            <span>Ver Catálogo</span>
          </Link>
        </div>
      </section>

      <section id="decants" className="page-section active">
        <div className="container">
          <h2 className="section-title serif">¿Qué es un Decant?</h2>
          <p className="section-subtitle">
            Es la forma más inteligente de probar alta perfumería. Consiste en transferir la
            fragancia original a un frasco más pequeño, ideal para conocer un aroma en tu
            piel.{" "}
            <strong>
              Una vez que encuentres tu perfume ideal, también puedes adquirir el frasco
              sellado de fábrica con nosotros.
            </strong>
          </p>
          <div className="decant-steps">
            <div className="step-card">
              <i className="ph ph-flask step-icon"></i>
              <h3 className="serif">1. Perfume Original</h3>
              <p>
                Trabajamos exclusivamente con botellas 100% originales y selladas.
                Garantizamos la autenticidad de cada gota.
              </p>
            </div>
            <div className="step-card">
              <i className="ph ph-needle step-icon"></i>
              <h3 className="serif">2. Extracción Precisa</h3>
              <p>
                Extraemos el líquido utilizando jeringas estériles, evitando que el perfume
                entre en contacto con el aire para no alterar sus notas.
              </p>
            </div>
            <div className="step-card">
              <i className="ph ph-spray-bottle step-icon"></i>
              <h3 className="serif">3. Envasado Premium</h3>
              <p>
                Traspasamos el perfume a atomizadores de vidrio de alta calidad de 3ml, 5ml o
                10ml, perfectamente etiquetados.
              </p>
            </div>
          </div>

          <div className="yield-guide">
            <h2 className="section-title serif" style={{ fontSize: "2.2rem" }}>
              Rendimiento por Formato
            </h2>
            <p className="section-subtitle" style={{ marginBottom: "30px" }}>
              ¿Cuánto dura cada decant? Aquí tienes una guía aproximada de atomizaciones
              (sprays).
            </p>
            <div className="yield-grid">
              <div className="yield-card">
                <h4>3ml</h4>
                <div style={{ color: "var(--gold-light)", fontWeight: "bold", marginBottom: "8px" }}>
                  ~45 Sprays
                </div>
                <p>
                  Ideal para llevar en el bolsillo y probar la fragancia a fondo durante 1 a 2
                  semanas.
                </p>
              </div>
              <div className="yield-card">
                <h4>5ml</h4>
                <div style={{ color: "var(--gold-light)", fontWeight: "bold", marginBottom: "8px" }}>
                  ~75 Sprays
                </div>
                <p>
                  Perfecto para usar una fragancia de manera continua durante 3 a 4 semanas.
                </p>
              </div>
              <div className="yield-card">
                <h4>10ml</h4>
                <div style={{ color: "var(--gold-light)", fontWeight: "bold", marginBottom: "8px" }}>
                  ~150 Sprays
                </div>
                <p>
                  La mejor opción precio/cantidad. Te durará entre 1.5 a 2 meses de uso
                  regular.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="page-section active">
        <div className="container">
          <h2 className="section-title serif">Preguntas Frecuentes</h2>
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
        </div>
      </section>

      <section id="testimonios" className="page-section active">
        <div className="container">
          <h2 className="section-title serif">Lo que dicen nuestros clientes</h2>
          <p className="section-subtitle">Experiencias reales de personas que ya encontraron su aroma.</p>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Pedí un decant de 5ml para probar y quedé tan enamorada que compré la botella completa. La atención fue increíble, respondieron todas mis dudas al tiro.&rdquo;</p>
              <div className="testimonial-author">— Valentina R., Santiago</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Nunca había probado perfumería árabe. Me asesoraron perfecto por WhatsApp y el oud que elegí duró todo el día. Llegó súper bien empaquetado.&rdquo;</p>
              <div className="testimonial-author">— Matías C., Valdivia</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Los decants son la mejor forma de probar fragancias caras sin arriesgarse. Calidad 100% original, lo comprobé. Ya les compré tres veces.&rdquo;</p>
              <div className="testimonial-author">— Felipe M., Concepción</div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="page-section active">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="section-title serif">Conversemos</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "8px" }}>
            <i className="ph ph-clock" style={{ color: "var(--gold-primary)" }}></i>{" "}
            Respondemos en menos de 1 hora · Lunes a Sábado 10:00–21:00
          </p>
          <p style={{ color: "var(--text-muted)", marginBottom: "40px" }}>
            <i className="ph ph-map-pin" style={{ color: "var(--gold-primary)" }}></i>{" "}
            Retiro presencial disponible en Valdivia
          </p>
          <div className="social-links-big">
            <a href="https://wa.me/56632249728" target="_blank" rel="noreferrer" className="social-link-big social-link-whatsapp">
              <i className="ph ph-whatsapp-logo"></i>
              <span>Escríbenos por WhatsApp</span>
            </a>
            <a href="https://instagram.com/attar_housecl" target="_blank" rel="noreferrer" className="social-link-big">
              <i className="ph ph-instagram-logo"></i>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
