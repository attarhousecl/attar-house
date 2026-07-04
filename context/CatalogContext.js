"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { labelsFormatos, accesoriosDB } from "@/lib/catalogData";

export { labelsFormatos, accesoriosDB };

const CatalogContext = createContext(null);

function mapPerfume(r) {
  return {
    id: r.id,
    brand: r.brand,
    name: r.name,
    gender: r.gender,
    imageUrl: r.image_url
      ? (r.image_url.startsWith("http") || r.image_url.startsWith("/")
          ? r.image_url
          : `/images/${r.image_url}`)
      : "",
    bottleClass: r.bottle_class || "bottle-asad",
    notes: r.notes || [],
    families: r.families || [],
    popularity: r.popularity || 80,
    inspiration: r.inspiration || "",
    description: r.description || "",
    prices: {
      sellado: r.price_sellado || 0,
      decant10: r.price_decant10 || 0,
      decant5: r.price_decant5 || 0,
      decant3: r.price_decant3 || 0,
    },
    stock: {
      sellado: r.stock_sellado,
      decant10: r.stock_decant10,
      decant5: r.stock_decant5,
      decant3: r.stock_decant3,
    },
    // Cantidad real por formato (fuente de verdad). Los booleanos stock_* de arriba
    // se derivan de estos vía trigger; qty permite mostrar "Quedan N" y topar el carrito.
    qty: {
      sellado: r.qty_sellado ?? 0,
      decant10: r.qty_decant10 ?? 0,
      decant5: r.qty_decant5 ?? 0,
      decant3: r.qty_decant3 ?? 0,
    },
    stockLow: r.stock_low || false,
  };
}

export function CatalogProvider({ children }) {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPerfumes = useCallback(async () => {
    const { data: rows, error: err } = await supabase
      .from("perfumes")
      .select("*")
      .order("popularity", { ascending: false });

    if (err) throw new Error(`Supabase error: ${err.message}`);
    setPerfumes(rows.map(mapPerfume));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadPerfumes();
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const channel = supabase
      .channel("perfumes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "perfumes" }, () => {
        loadPerfumes().catch((e) => console.error("Error al refrescar catálogo:", e));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [loadPerfumes]);

  const designerDB = perfumes.filter((p) => p.inspiration === "Diseñador Original");
  const nichoDB = perfumes.filter((p) => p.inspiration === "Nicho");
  const arabDB = perfumes.filter((p) => p.inspiration !== "Diseñador Original" && p.inspiration !== "Nicho");

  return (
    <CatalogContext.Provider
      value={{ perfumes, designerDB, nichoDB, arabDB, accesoriosDB, loading, error }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
