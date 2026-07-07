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
        // Filtra ítems corruptos o de versiones viejas del carrito. Exige id,
        // format (string) y precio/cantidad numéricos: un item sin format haría
        // reventar total/decantTotal (i.format.startsWith) y tumbaría la tienda.
        setCart(
          stored.filter(
            (i) =>
              i &&
              i.id != null &&
              typeof i.format === "string" &&
              Number.isFinite(i.price) &&
              Number.isFinite(i.quantity) &&
              i.quantity > 0
          )
        );
      }
    } catch {
      // ignore malformed localStorage data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("attar_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (perfume, formatKey) => {
    const price = perfume.prices[formatKey];
    const formatLabel = labelsFormatos[formatKey] || formatKey;
    const existing = cart.find((i) => i.name === perfume.name && i.format === formatKey);

    setCart((prev) => {
      const ex = prev.find((i) => i.name === perfume.name && i.format === formatKey);
      if (ex) return prev.map((i) => (i === ex ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { id: perfume.id, name: perfume.name, format: formatKey, price, quantity: 1 }];
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
      next[idx] = { ...next[idx], quantity: next[idx].quantity + mod };
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
