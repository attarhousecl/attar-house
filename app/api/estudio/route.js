import { NextResponse } from "next/server";

const BG_PROMPTS = {
  marmol:
    "Luxurious dark marble podium surface, deep dark background with elegant warm gold accent lighting, moody premium studio atmosphere, photorealistic product photography.",
  blanco:
    "Pure crisp white seamless studio background, perfectly even bright lighting, professional e-commerce product photography backdrop, photorealistic.",
  gris:
    "Clean solid light grey seamless studio background, even professional studio lighting, photorealistic.",
  bokeh:
    "Dark background with soft blurred golden bokeh light circles, warm ambient glow, premium studio atmosphere, photorealistic product photography backdrop.",
  arena:
    "Warm sand-toned studio surface with soft diffused natural light, minimalist beige and tan tones, photorealistic product photography backdrop.",
  tropical:
    "Dark volcanic stone surface with a shallow water reflection, softly blurred out-of-focus dark tropical palm leaves in the background, premium studio lighting, photorealistic.",
};

export const maxDuration = 60;

export async function POST(request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: "CLOUDFLARE_ACCOUNT_ID o CLOUDFLARE_API_TOKEN no están configuradas en el servidor." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { style, imageB64, mask } = body;
  if (!imageB64 || !Array.isArray(mask)) {
    return NextResponse.json({ error: "Falta imageB64 o mask." }, { status: 400 });
  }

  let prompt = BG_PROMPTS[style] ?? BG_PROMPTS.marmol;
  // pequeña variación aleatoria para que cada generación no salga idéntica
  const variations = [
    "wide angle", "soft natural shadows", "subtle depth of field", "cinematic lighting",
    "minimalist composition", "slightly warmer tone", "slightly cooler tone", "gentle vignette",
  ];
  prompt += " " + variations[Math.floor(Math.random() * variations.length)] + ".";
  prompt += " Keep the product bottle in the center exactly as is, only change the surrounding environment.";

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_b64: imageB64,
        mask,
        num_steps: 20,
        strength: 0.9,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("image")) {
      const errJson = await res.json().catch(() => ({}));
      const detail = errJson?.errors?.[0]?.message || JSON.stringify(errJson).slice(0, 300);
      throw new Error(`Cloudflare Workers AI: ${detail}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return NextResponse.json({ imageData: buf.toString("base64"), mimeType: "image/png" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
