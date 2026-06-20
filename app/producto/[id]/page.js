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

  const { data: p } = await supabaseAdmin
    .from("perfumes")
    .select("name, brand, description, image_url, price_decant3, price_decant10")
    .eq("id", id)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://attarhouse.cl";
  const imageUrl = p?.image_url
    ? (p.image_url.startsWith("http") ? p.image_url : `${siteUrl}/images/${p.image_url}`)
    : null;

  const jsonLd = p ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.name} — ${p.brand}`,
    description: p.description || `Decant de ${p.name} por ${p.brand}. Disponible en Attar House Chile.`,
    brand: { "@type": "Brand", name: p.brand },
    ...(imageUrl ? { image: imageUrl } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "CLP",
      price: p.price_decant3 || p.price_decant10 || 0,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Attar House" },
      url: `${siteUrl}/producto/${id}`,
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <ProductDetail id={id} />
    </>
  );
}
