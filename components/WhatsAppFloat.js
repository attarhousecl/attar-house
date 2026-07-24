"use client";

import WhatsAppLink from "@/components/WhatsAppLink";

// Botón flotante de WhatsApp. Todo el estilo (medida, posición, sombra, hover)
// vive en .whatsapp-float (app/globals.css), con los mismos tokens --fab-* que
// el botón del carrito para que sean un par consistente y alineado.
export default function WhatsAppFloat() {
  return (
    <WhatsAppLink
      href="https://wa.me/56632249728?text=Hola%20Attar%20House%2C%20tengo%20una%20consulta"
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="whatsapp-float"
    >
      <i className="ph ph-whatsapp-logo" aria-hidden="true"></i>
    </WhatsAppLink>
  );
}
