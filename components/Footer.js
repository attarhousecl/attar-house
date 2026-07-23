import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import WhatsAppLink from "@/components/WhatsAppLink";

export default function Footer() {
  return (
    <>
      <div className="trust-badges">
        <div className="trust-badge">
          <i className="ph ph-shield-check"></i> Garantía de Autenticidad
        </div>
        <div className="trust-badge">
          <i className="ph ph-package"></i> Envíos a todo Chile
        </div>
        <div className="trust-badge">
          <i className="ph ph-credit-card"></i> Todo medio de pago
        </div>
      </div>

      <footer>
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-monogram">A<span>H</span></div>
            <p className="footer-tagline">No son perfumes, es presencia.</p>
          </div>

          <div className="footer-nav">
            <h2 className="footer-nav-title">Tienda</h2>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/disenador">Diseñador</Link>
            <Link href="/accesorios">Accesorios</Link>
          </div>

          <div className="footer-nav">
            <h2 className="footer-nav-title">Información</h2>
            <Link href="/#decants">¿Qué es un Decant?</Link>
            <Link href="/faq">Preguntas Frecuentes</Link>
            <Link href="/#contacto">Contacto</Link>
          </div>

          <div className="footer-nav">
            <h2 className="footer-nav-title">Síguenos</h2>
            <a href="https://instagram.com/attar_housecl" target="_blank" rel="noreferrer">
              <i className="ph ph-instagram-logo"></i> Instagram
            </a>
            <WhatsAppLink href="https://wa.me/56632249728" target="_blank" rel="noreferrer">
              <i className="ph ph-whatsapp-logo"></i> WhatsApp
            </WhatsAppLink>
          </div>

          <NewsletterSignup />
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Attar House · Valdivia, Chile · Starken y Chilexpress · Retiro presencial disponible</p>
        </div>
      </footer>
    </>
  );
}
