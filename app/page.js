import Link from "next/link";
import FeaturedProducts from "@/components/FeaturedProducts";
import Reveal from "@/components/Reveal";

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
              marginBottom: "18px",
              fontWeight: 400,
              fontStyle: "italic",
              opacity: 0.85,
            }}
          >
            &quot;No son perfumes, es presencia.&quot;
          </h2>

          <p>
            Perfumería árabe, de nicho y diseñador <strong>100% original</strong>. Pruébala en
            decant desde 3ml y descubre tu firma antes de invertir en el frasco completo.
          </p>

          <div className="hero-actions">
            <Link href="/catalogo" className="btn-gold-solid">
              Ver Catálogo
            </Link>
            <Link href="/quiz" className="btn-primary">
              <span>🔮 Descubre tu aroma</span>
            </Link>
          </div>

          <div className="hero-trust">
            <span><i className="ph ph-seal-check"></i> 100% Originales</span>
            <span><i className="ph ph-truck"></i> Envío a todo Chile</span>
            <span><i className="ph ph-hand-heart"></i> Testers disponibles</span>
          </div>
        </div>
      </section>

      <FeaturedProducts />

      <section className="home-block">
        <div className="container">
          <h2 className="section-title serif">Encuentra tu aroma ideal</h2>
          <p className="section-subtitle">
            ¿No sabes por dónde empezar? Te ayudamos a elegir y a probar sin arriesgar.
          </p>
          <Reveal className="home-highlights">
            <Link href="/quiz" className="highlight-panel">
              <span className="hp-watermark">🔮</span>
              <span className="hp-icon">🔮</span>
              <h3>Quiz de Fragancias</h3>
              <p>
                Responde 5 preguntas rápidas sobre tu estilo y ocasión, y te recomendamos
                las fragancias que más van contigo.
              </p>
              <span className="hp-link">
                Hacer el quiz <i className="ph ph-arrow-right"></i>
              </span>
            </Link>

            <Link href="/pack" className="highlight-panel">
              <span className="hp-watermark">🎁</span>
              <span className="hp-icon">🎁</span>
              <h3>Pack Descubrimiento</h3>
              <p>
                Arma tu propio set eligiendo de 3 a 5 decants de 10ml y llévate un{" "}
                <strong style={{ color: "var(--gold-light)" }}>10% de descuento</strong> en todo el pack.
              </p>
              <span className="hp-link">
                Armar mi pack <i className="ph ph-arrow-right"></i>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="decants" className="page-section home-section active">
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
          <Reveal className="decant-steps">
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
          </Reveal>

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
