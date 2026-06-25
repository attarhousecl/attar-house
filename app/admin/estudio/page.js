"use client";

import { useRouter } from "next/navigation";
import AttarPhotoStudio from "@/components/AttarPhotoStudio";

export default function EstudioPage() {
  const router = useRouter();
  return <AttarPhotoStudio onExit={() => router.push("/admin")} />;
}
