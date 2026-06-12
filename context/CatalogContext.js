"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export const labelsFormatos = {
  sellado: "Sellado",
  decant10: "10ml",
  decant5: "5ml",
  decant3: "3ml",
  Accesorio: "Accesorio",
};

export const accesoriosDB = [
  {
    id: "llavero-porta-decant",
    name: "Llavero porta decant",
    description: "Estuche elegante para transporte seguro.",
    price: 1500,
    icon: "ph ph-briefcase",
  },
  {
    id: "soporte-individual",
    name: "Soporte Individual",
    description: "Base minimalista para lucir decants.",
    price: 500,
    icon: "ph ph-codepen-logo",
  },
];

const CatalogContext = createContext(null);

function mapPerfume(r) {
  return {
    id: r.id,
    brand: r.brand,
    name: r.name,
    gender: r.gender,
    imageUrl: r.image_url || "",
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
  const arabDB = perfumes.filter((p) => p.inspiration !== "Diseñador Original");

  return (
    <CatalogContext.Provider
      value={{ perfumes, designerDB, arabDB, accesoriosDB, loading, error }}
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
