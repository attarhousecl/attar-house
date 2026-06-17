import ProductDetail from "@/components/ProductDetail";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: p } = await supabaseAdmin
    .from("perfumes")
    .select("name, brand, description, image_url")
    .eq("id", id)
    .single();

  if (!p) return { title: "Attar House" };

  const image = p.image_url?.startsWith("http")
    ? p.image_url
    : `${process.env.NEXT_PUBLIC_SITE_URL}/images/${p.image_url}`;

  return {
    title: `${p.name} · ${p.brand} — Attar House`,
    description: p.description?.slice(0, 155) || `Decant de ${p.name} por ${p.brand}. Disponible en Attar House Chile.`,
    openGraph: {
      title: `${p.name} · ${p.brand}`,
      description: p.description?.slice(0, 155) || `Decant de ${p.name} disponible en Attar House.`,
      images: p.image_url ? [{ url: image, width: 800, height: 800 }] : [],
      type: "website",
      siteName: "Attar House",
    },
  };
}

export default async function ProductoPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
