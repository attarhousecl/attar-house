"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";
import { labelsFormatos } from "./CatalogContext";

const CartContext = createContext(null);

const SHIPPING_THRESHOLD = 60000;
const GIFT_THRESHOLD = 15000;

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  // Regalo elegido — única fuente de verdad compartida entre el carrito y el checkout.
  const [freeGift, setFreeGift] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("attar_cart"));
      if (Array.isArray(stored)) {
        // Filtra ítems con id inválido (datos viejos de localStorage)
        setCart(stored.filter((i) => i.id != null));
      }
    } catch {
      // ignore malformed localStorage data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("attar_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  // `max` = unidades disponibles del formato (perfume.qty[formatKey]). Tope de UX:
  // no deja agregar más de lo que hay. La validación dura igual es del lado servidor.
  const addToCart = (perfume, formatKey, max) => {
    const price = perfume.prices[formatKey];
    const formatLabel = labelsFormatos[formatKey] || formatKey;
    const cap = Number.isFinite(max) ? max : Infinity;
    const existing = cart.find((i) => i.name === perfume.name && i.format === formatKey);

    if (existing && existing.quantity >= cap) {
      showToast(`Solo quedan ${cap} de ${perfume.name} (${formatLabel})`);
      return;
    }

    setCart((prev) => {
      const ex = prev.find((i) => i.name === perfume.name && i.format === formatKey);
      if (ex) {
        return prev.map((i) =>
          i === ex ? { ...i, quantity: i.quantity + 1, stockMax: cap } : i
        );
      }
      return [...prev, { id: perfume.id, name: perfume.name, format: formatKey, price, quantity: 1, stockMax: cap }];
    });

    if (existing) {
      showToast(`✓ +1 ${perfume.name} (${formatLabel})`);
    } else {
      showToast(`✓ ¡Añadido! ${perfume.name} (${formatLabel})`);
    }
  };

  const addItem = ({ id, name, format, price, quantity = 1 }) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === id && i.format === format && i.price === price);
      if (ex) return prev.map((i) => (i === ex ? { ...i, quantity: i.quantity + quantity } : i));
      return [...prev, { id, name, format, price, quantity }];
    });
    showToast(`✓ ¡Añadido! ${name}`);
  };

  const addAccesorio = (accesorio) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === accesorio.name && i.format === "Accesorio");
      if (existing) return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { id: accesorio.id, name: accesorio.name, format: "Accesorio", price: accesorio.price, quantity: 1 }];
    });

    showToast(`✓ ¡Añadido! ${accesorio.name}`);
  };

  const updateQty = (idx, mod) => {
    setCart((prev) => {
      const next = [...prev];
      const item = next[idx];
      const cap = Number.isFinite(item.stockMax) ? item.stockMax : Infinity;
      const target = item.quantity + mod;
      if (mod > 0 && target > cap) {
        showToast(`Solo quedan ${cap} unidades disponibles`);
        return prev;
      }
      next[idx] = { ...item, quantity: target };
      if (next[idx].quantity <= 0) next.splice(idx, 1);
      return next;
    });
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const decantTotal = cart.reduce(
    (sum, i) => sum + (i.format.startsWith("decant") ? i.price * i.quantity : 0),
    0
  );
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const freeShippingEligible = total >= SHIPPING_THRESHOLD;
  const freeGiftEligible = decantTotal >= GIFT_THRESHOLD;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addItem,
        addAccesorio,
        updateQty,
        total,
        decantTotal,
        itemCount,
        freeShippingEligible,
        freeGiftEligible,
        freeGift,
        setFreeGift,
        SHIPPING_THRESHOLD,
        GIFT_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
