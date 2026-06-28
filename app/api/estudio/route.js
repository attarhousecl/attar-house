import { NextResponse } from "next/server";

const BG_PROMPTS = {
  marmol:
    "Luxurious dark marble podium surface, deep dark background with elegant warm gold accent lighting, moody premium studio atmosphere, empty pedestal with no objects on it, photorealistic product photography.",
  blanco:
    "Pure crisp white seamless studio background, perfectly even bright lighting, no objects, no props, blank white surface, professional e-commerce product photography backdrop, photorealistic.",
  gris:
    "Clean solid light grey seamless studio background, even professional studio lighting, no objects, no props, blank grey surface, photorealistic.",
  bokeh:
    "Dark background with soft blurred golden bokeh light circles, warm ambient glow, premium studio atmosphere, empty surface with no objects, photorealistic product photography backdrop.",
  arena:
    "Warm sand-toned studio surface with soft diffused natural light, minimalist beige and tan tones, empty surface with no objects, photorealistic product photography backdrop.",
  tropical:
    "Dark volcanic stone surface with a shallow water reflection, softly blurred out-of-focus dark tropical palm leaves in the background, premium studio lighting, empty surface with no objects, photorealistic.",
};

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

  const { style } = body;
  let prompt = BG_PROMPTS[style] ?? BG_PROMPTS.marmol;
  // pequeña variación aleatoria para que cada generación no salga idéntica
  const variations = [
    "wide angle", "soft natural shadows", "subtle depth of field", "cinematic lighting",
    "minimalist composition", "slightly warmer tone", "slightly cooler tone", "gentle vignette",
  ];
  prompt += " " + variations[Math.floor(Math.random() * variations.length)] + ".";

  const fluxUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  try {
    const fluxRes = await fetch(fluxUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, steps: 4 }),
    });

    const fluxJson = await fluxRes.json().catch(() => ({}));
    if (!fluxRes.ok || !fluxJson?.result?.image) {
      const detail = fluxJson?.errors?.[0]?.message || JSON.stringify(fluxJson).slice(0, 300);
      throw new Error(`Cloudflare Workers AI: ${detail}`);
    }

    return NextResponse.json({ imageData: fluxJson.result.image, mimeType: "image/jpeg" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
