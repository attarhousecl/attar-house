/**
 * Attar Studio · Fase 3 — Fuente única de las políticas reales del negocio.
 *
 * Todo copy generado (studioCopy.js) y los "chips de política" del panel del
 * lienzo se sirven desde aquí. Si una política cambia, se edita SOLO ESTE
 * ARCHIVO — nunca a mano dentro de una plantilla.
 *
 * Valores extraídos del sitio público real (no inventados). Fuente de cada uno:
 *  - shippingThreshold, giftThreshold  -> context/CartContext.js (SHIPPING_THRESHOLD, GIFT_THRESHOLD)
 *  - codCity / método de pago Valdivia -> components/CartDrawer.js, app/faq/page.js
 *  - responseTime                      -> app/faq/page.js ("te respondemos en menos de 1 hora")
 *  - dispatchWindow, carriers          -> app/faq/page.js
 *  - trust badges (originales, testers, envío a todo Chile) -> app/page.js, components/Footer.js, components/AnnouncementBar.js
 * Este archivo vive en el carril Admin y NO importa de context/** (carril Tienda)
 * a propósito, para no acoplar carriles — si el sitio público cambia estos
 * montos o textos, hay que actualizar esta copia también.
 */

export const clpFacts = (n) => '$' + Number(n || 0).toLocaleString('es-CL');

export const BRAND_FACTS = {
  shippingThreshold: 60000, // envío gratis a todo Chile sobre este monto
  giftThreshold: 15000,     // decant de regalo sobre este monto (subtotal de decants)
  dispatchWindow: '24 a 48 horas hábiles',
  responseTime: 'menos de 1 hora',
  carriers: 'Starken y Chilexpress',
  codCity: 'Valdivia',
  codMethods: 'efectivo, débito o crédito',
  whatsapp: '+56 9 3224 9728',
  site: 'attarhouse.cl',
};

// CTAs base permitidos por la guía de marca (Fase 3, directriz 5).
export const CTA_OPTIONS = ['attarhouse.cl', 'Escríbenos por DM'];

// Chips listos para insertar en cualquier campo de texto del lienzo (panel de elemento).
export const POLICY_CHIPS = [
  { id: 'envio-gratis',   label: 'Envío gratis',        text: `Envío gratis sobre ${clpFacts(BRAND_FACTS.shippingThreshold)}` },
  { id: 'regalo',         label: 'Decant de regalo',     text: `Decant de regalo sobre ${clpFacts(BRAND_FACTS.giftThreshold)}` },
  { id: 'contra-entrega', label: 'Pago contra entrega',  text: `Pago contra entrega en ${BRAND_FACTS.codCity}` },
  { id: 'respuesta',      label: 'Respuesta rápida',     text: `Te respondemos en ${BRAND_FACTS.responseTime}` },
  { id: 'originales',     label: '100% originales',      text: '100% Originales' },
  { id: 'envio-chile',    label: 'Envío a todo Chile',   text: `Envío a todo Chile por ${BRAND_FACTS.carriers}` },
  { id: 'testers',        label: 'Testers disponibles',  text: 'Testers disponibles' },
  { id: 'despacho',       label: 'Tiempo de despacho',   text: `Despacho en ${BRAND_FACTS.dispatchWindow}` },
];
