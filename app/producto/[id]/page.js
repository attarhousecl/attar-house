import ProductDetail from "@/components/ProductDetail";

export default async function ProductoPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
