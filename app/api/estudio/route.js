import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminUser } from "@/lib/adminAuth";

// Tamaño máximo de la imagen recibida en base64 (~8 MB) para evitar abuso/DoS.
const MAX_IMAGE_B64 = 8_000_000;

const BG_PROMPTS = {
  ecommerce_white:
    "Pure crisp white seamless studio background, perfectly even bright lighting, no objects, no props, blank white surface, professional e-commerce product photography backdrop, photorealistic.",
  ecommerce_grey:
    "Clean solid light grey seamless studio background (#F5F5F5), even professional studio lighting, no objects, no props, blank grey surface, photorealistic.",
  luxury_dark:
    "Luxurious dark marble podium surface, deep dark background with elegant warm gold accent lighting, moody premium studio atmosphere, empty pedestal with no objects on it, photorealistic.",
  exotic_nature:
    "Dark volcanic stone surface with a shallow water reflection, softly blurred out-of-focus dark tropical palm leaves in the background, premium studio lighting, empty surface with no objects, photorealistic.",
};

function shadowSvg(size) {
  const cx = size / 2;
  const cy = size * 0.86;
  const rx = size * 0.16;
  const ry = size * 0.035;
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="black" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="black" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#g)"/>
  </svg>`;
}

export async function POST(request) {
  // Endpoint caro (Cloudflare Workers AI + procesamiento con sharp).
  // Solo admin autenticado, para evitar abuso de costos / DoS.
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

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

  const { imageData, style, customPrompt } = body;
  if (!imageData || typeof imageData !== "string") {
    return NextResponse.json({ error: "Falta imageData (la botella recortada)." }, { status: 400 });
  }
  if (imageData.length > MAX_IMAGE_B64) {
    return NextResponse.json({ error: "La imagen es demasiado grande." }, { status: 413 });
  }

  let prompt = BG_PROMPTS[style] ?? BG_PROMPTS.luxury_dark;
  // Limita el texto libre del usuario que se añade al prompt de generación.
  if (typeof customPrompt === "string" && customPrompt.trim()) {
    prompt += " Additional instructions: " + customPrompt.trim().slice(0, 300);
  }

  const fluxUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  let bgBase64;
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
    bgBase64 = fluxJson.result.image;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const SIZE = 1024;
    const bgBuffer = Buffer.from(bgBase64, "base64");
    const cutoutBuffer = Buffer.from(imageData, "base64");

    const background = await sharp(bgBuffer).resize(SIZE, SIZE, { fit: "cover" }).toBuffer();
    const shadow = await sharp(Buffer.from(shadowSvg(SIZE))).png().toBuffer();

    const final = await sharp(background)
      .composite([
        { input: shadow, top: 0, left: 0 },
        { input: cutoutBuffer, top: 0, left: 0 },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    return NextResponse.json({
      imageData: final.toString("base64"),
      mimeType: "image/jpeg",
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al componer la imagen: " + error.message }, { status: 500 });
  }
}
