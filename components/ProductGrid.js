import ProductCard from "./ProductCard";

export default function ProductGrid({ perfumes, variant = "catalog", emptyMessage }) {
  if (perfumes.length === 0) {
    return (
      <div className="product-grid">
        <p
          style={{
            color: "var(--text-muted)",
            gridColumn: "1/-1",
            textAlign: "center",
            marginTop: "40px",
            padding: "40px",
          }}
        >
          <i
            className="ph ph-magnifying-glass"
            style={{ fontSize: "2rem", display: "block", marginBottom: "10px", color: "var(--border-gold)" }}
          ></i>
          {emptyMessage || "No encontramos perfumes con esos filtros."}
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {perfumes.map((p, index) => (
        <ProductCard key={p.id} perfume={p} variant={variant} index={index} />
      ))}
    </div>
  );
}
