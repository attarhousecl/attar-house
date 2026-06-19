import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BASE_URL = "https://attarhouse.cl";

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/catalogo", changeFrequency: "daily", priority: 0.9 },
  { path: "/quiz", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pack", changeFrequency: "weekly", priority: 0.7 },
  { path: "/accesorios", changeFrequency: "weekly", priority: 0.6 },
  { path: "/disenador", changeFrequency: "monthly", priority: 0.6 },
  { path: "/mis-pedidos", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap() {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const { data, error } = await supabaseAdmin
      .from("perfumes")
      .select("id, created_at");

    if (error || !data) {
      return staticEntries;
    }

    const productEntries = data.map((perfume) => ({
      url: `${BASE_URL}/producto/${perfume.id}`,
      lastModified: perfume.created_at ? new Date(perfume.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
