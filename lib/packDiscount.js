// Descuento "Pack Descubrimiento": 10% off cuando el pedido lleva >= 3 decants de
// 10ml. Se calcula DINÁMICAMENTE sobre el contenido actual del carrito (no se
// "hornea" al agregar), para que al quitar o agregar ítems el descuento se
// ajuste solo. Compartido por el cliente (mostrar) y el servidor (cobrar): misma
// regla, mismo número, sin discrepancias con lo que finalmente cobra Mercado Pago.

export const PACK_FORMAT = "decant10";
export const PACK_MIN = 3; // unidades mínimas de 10ml para activar el descuento
export const PACK_RATE = 0.1; // 10%

// Unidades de decant 10ml en el carrito (suma de cantidades).
export function packUnits(items) {
  return (items || [])
    .filter((i) => i && i.format === PACK_FORMAT)
    .reduce((n, i) => n + (Number(i.quantity) || 0), 0);
}

// ¿El pedido califica para el descuento del pack?
export function packQualifies(items) {
  return packUnits(items) >= PACK_MIN;
}

// Precio unitario efectivo de un ítem: 10% off si es 10ml y el carrito califica.
export function effectiveUnitPrice(item, qualifies) {
  if (qualifies && item && item.format === PACK_FORMAT) {
    return Math.round(item.price * (1 - PACK_RATE));
  }
  return item.price;
}

// Monto total del descuento (para la línea "Descuento pack"). 0 si no califica.
export function packDiscount(items) {
  if (!packQualifies(items)) return 0;
  return (items || []).reduce((sum, i) => {
    if (!i || i.format !== PACK_FORMAT) return sum;
    return sum + (i.price - effectiveUnitPrice(i, true)) * i.quantity;
  }, 0);
}
