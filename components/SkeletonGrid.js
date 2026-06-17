export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card-skeleton" key={i}></div>
      ))}
    </div>
  );
}
