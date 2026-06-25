"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import AttarStudio from "@/components/AttarStudio";

export default function PublicidadPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return <AttarStudio supabase={supabase} onExit={() => router.push("/admin")} />;
}
