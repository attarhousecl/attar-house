import Link from "next/link";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroVideo from "@/components/HeroVideo";
import DecantExplorer from "@/components/DecantExplorer";
import LazyQuiz from "@/components/LazyQuiz";
import Reveal from "@/components/Reveal";
import WhatsAppLink from "@/components/WhatsAppLink";

const SITE_URL = "https://attarhouse.cl";
const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Attar House",
  description:
    "Perfumería árabe, de nicho y diseñador en decants y frascos sellados. 100% original. Retiro en Valdivia y envíos a todo Chile.",
  url: SITE_URL,
  image: `${SITE_URL}/images/his-confession.png`,
  telephone: "+56632249728",
  priceRange: "$$",
  currenciesAccepted: "CLP",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Valdivia",
    addressRegion: "Los Ríos",
    addressCountry: "CL",
  },
  areaServed: { "@type": "Country", name: "Chile" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "21:00",
    },
  ],
  sameAs: ["https://instagram.com/attar_housecl"],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c") }}
      />
      <section id="inicio" className="hero">
        <HeroVideo />
        <div className="hero-veil" aria-hidden="true"></div>
        <div className="hero-content">
          <div className="hero-kicker mono">Casa de descubrimiento · Valdivia</div>

          <h1 className="hero-title">
            Huele antes de comprar.
            <span className="sr-only"> Alta perfumería árabe y decants en Valdivia | Attar House</span>
          </h1>

          <p className="hero-sub">
            Decants desde 3ml de perfumería árabe, de nicho y diseñador,{" "}
            <strong>100% original</strong>. Descubre tu firma antes de invertir en el
            frasco completo.
          </p>

          <div className="hero-actions">
            <Link href="/catalogo" className="btn-gold-solid">
              Ver catálogo
            </Link>
            <Link href="/#quiz" className="btn-hero-ghost">
              <span>🔮 Descubrir mi aroma</span>
            </Link>
          </div>

          <div className="hero-trust">
            <span><i className="ph ph-seal-check"></i> 100% Originales</span>
            <span><i className="ph ph-truck"></i> Envío a todo Chile</span>
            <span><i className="ph ph-lock"></i> Pago con Mercado Pago</span>
          </div>
        </div>
        <div className="hero-scroll mono" aria-hidden="true">↓ Desliza para descubrir</div>
      </section>

      <FeaturedProducts />

      <section id="quiz" className="home-block">
        <div className="container">
          <div className="kicker" style={{ textAlign: "center", marginBottom: "10px" }}>
            🔮 Quiz de fragancias
          </div>
          <h2 className="section-title serif">Encuentra tu aroma ideal</h2>
          <p className="section-subtitle" style={{ marginBottom: "36px" }}>
            Responde 5 preguntas rápidas aquí mismo y te recomendamos las fragancias que
            más van contigo.
          </p>
          <div className="home-quiz-shell">
            <LazyQuiz embed />
          </div>

          <Link href="/pack" className="pack-banner">
            <span className="pack-banner-icon" aria-hidden="true">🎁</span>
            <span className="pack-banner-text">
              <strong>Pack Descubrimiento</strong>
              <span>Elige 3 a 5 decants de 10ml y llévate un 10% de descuento en todo el pack.</span>
            </span>
            <span className="pack-banner-cta">
              Armar mi pack <i className="ph ph-arrow-right" aria-hidden="true"></i>
            </span>
          </Link>
        </div>
      </section>

      <section id="decants" className="page-section home-section active">
        <div className="container">
          <div className="kicker" style={{ textAlign: "center", marginBottom: "10px" }}>
            La forma inteligente de probar
          </div>
          <h2 className="section-title serif">¿Qué es un decant?</h2>
          <p className="section-subtitle">
            Transferimos la fragancia original y sellada a un atomizador de vidrio más
            pequeño, con jeringas estériles y perfectamente etiquetado.{" "}
            <strong>
              Cuando encuentres tu perfume ideal, también puedes llevarte el frasco sellado
              de fábrica con nosotros.
            </strong>
          </p>

          <Reveal className="de-steps">
            <div className="de-step">
              <i className="ph ph-flask" aria-hidden="true"></i>
              <span><strong>Original sellado</strong> · botellas 100% auténticas</span>
            </div>
            <div className="de-step">
              <i className="ph ph-needle" aria-hidden="true"></i>
              <span><strong>Extracción precisa</strong> · jeringas estériles, sin contacto con el aire</span>
            </div>
            <div className="de-step">
              <i className="ph ph-spray-bottle" aria-hidden="true"></i>
              <span><strong>Envasado premium</strong> · atomizador de vidrio etiquetado</span>
            </div>
          </Reveal>

          <p className="de-hint mono">Elige un formato para ver cuánto te rinde</p>
          <DecantExplorer />
        </div>
      </section>

      <section id="testimonios" className="page-section home-section active">
        <div className="container">
          <h2 className="section-title serif">Lo que dicen nuestros clientes</h2>
          <p className="section-subtitle">Experiencias reales de personas que ya encontraron su aroma.</p>
          <Reveal className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars" role="img" aria-label="5 de 5 estrellas"><span aria-hidden="true">★★★★★</span></div>
              <p className="testimonial-text">&ldquo;Pedí un decant de 5ml para probar y quedé tan enamorada que compré la botella completa. La atención fue increíble, respondieron todas mis dudas al tiro.&rdquo;</p>
              <div className="testimonial-author">— Valentina R., Santiago</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars" role="img" aria-label="5 de 5 estrellas"><span aria-hidden="true">★★★★★</span></div>
              <p className="testimonial-text">&ldquo;Nunca había probado perfumería árabe. Me asesoraron perfecto por WhatsApp y el oud que elegí duró todo el día. Llegó súper bien empaquetado.&rdquo;</p>
              <div className="testimonial-author">— Matías C., Valdivia</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars" role="img" aria-label="5 de 5 estrellas"><span aria-hidden="true">★★★★★</span></div>
              <p className="testimonial-text">&ldquo;Los decants son la mejor forma de probar fragancias caras sin arriesgarse. Calidad 100% original, lo comprobé. Ya les compré tres veces.&rdquo;</p>
              <div className="testimonial-author">— Felipe M., Concepción</div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contacto" className="page-section home-section active">
        <div className="container">
          <div className="kicker" style={{ textAlign: "center", marginBottom: "10px" }}>
            Estamos para ayudarte
          </div>
          <h2 className="section-title serif">Conversemos</h2>
          <p className="section-subtitle" style={{ marginBottom: "40px" }}>
            ¿Dudas sobre una fragancia o tu pedido? Te asesoramos como en la tienda.
          </p>

          <div className="contact-panel">
            <div className="contact-info">
              <div className="contact-row">
                <span className="contact-row-icon"><i className="ph ph-chat-circle-text" aria-hidden="true"></i></span>
                <span className="contact-row-text">
                  <strong>Respondemos en menos de 1 hora</strong>
                  <span>Atención personalizada, sin bots</span>
                </span>
              </div>
              <div className="contact-row">
                <span className="contact-row-icon"><i className="ph ph-clock" aria-hidden="true"></i></span>
                <span className="contact-row-text">
                  <strong>Lunes a Sábado</strong>
                  <span className="mono">10:00 – 21:00</span>
                </span>
              </div>
              <div className="contact-row">
                <span className="contact-row-icon"><i className="ph ph-map-pin" aria-hidden="true"></i></span>
                <span className="contact-row-text">
                  <strong>Retiro presencial en Valdivia</strong>
                  <span>Coordinamos día y hora contigo</span>
                </span>
              </div>
            </div>

            <div className="contact-actions">
              <WhatsAppLink
                href="https://wa.me/56632249728"
                target="_blank"
                rel="noreferrer"
                className="contact-btn contact-btn-wa"
              >
                <i className="ph ph-whatsapp-logo" aria-hidden="true"></i>
                <span className="contact-btn-text">
                  <strong>Escríbenos por WhatsApp</strong>
                  <span>+56 63 224 9728</span>
                </span>
                <i className="ph ph-arrow-right contact-btn-arrow" aria-hidden="true"></i>
              </WhatsAppLink>
              <a
                href="https://instagram.com/attar_housecl"
                target="_blank"
                rel="noreferrer"
                className="contact-btn contact-btn-ig"
              >
                <i className="ph ph-instagram-logo" aria-hidden="true"></i>
                <span className="contact-btn-text">
                  <strong>Síguenos en Instagram</strong>
                  <span>@attar_housecl</span>
                </span>
                <i className="ph ph-arrow-right contact-btn-arrow" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
