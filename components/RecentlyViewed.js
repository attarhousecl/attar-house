"use client";

import { useEffect, useState } from "react";
import { useCatalog } from "@/context/CatalogContext";
import ProductGrid from "@/components/ProductGrid";

// Muestra los últimos perfumes que el cliente abrió (guardados en localStorage
// como "ah_recent"). Reactivo a "ah-recent-change". Se oculta si no hay nada.
export default function RecentlyViewed({ excludeId, max = 4 }) {
  const { perfumes } = useCatalog();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    const read = () => {
      try { setIds(JSON.parse(localStorage.getItem("ah_recent") || "[]")); }
      catch { setIds([]); }
    };
    read();
    window.addEventListener("ah-recent-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("ah-recent-change", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const byId = new Map(perfumes.map((p) => [p.id, p]));
  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => byId.get(id))
    .filter(Boolean)
    .slice(0, max);

  if (items.length === 0) return null;

  return (
    <div className="related-section">
      <h3 className="serif" style={{ fontSize: "1.6rem", color: "var(--gold-primary)", marginBottom: "20px" }}>
        Vistos recientemente
      </h3>
      <ProductGrid perfumes={items} variant="catalog" />
    </div>
  );
}
