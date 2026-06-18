import { NextResponse } from "next/server";

const SPECS =
  " Square 1:1 aspect ratio. High-end e-commerce product photography. FULL BLEED IMAGE. The background environment MUST extend completely to the very edges of the image. NO FRAMES. NO BORDERS. NO WHITE EDGES. Fill the entire canvas. NO WATERMARKS, NO LOGOS, NO TEXT IN BACKGROUND. ";

const STYLE_PROMPTS = {
  ecommerce_white:
    "Pure crisp white background (#FFFFFF). Soft, realistic drop shadow beneath the bottle to ground it. Even, bright studio lighting, perfectly sharp focus." + SPECS,
  ecommerce_grey:
    "Clean, solid light grey background (#F5F5F5). Soft, realistic drop shadow beneath the bottle. High-end studio lighting, sharp focus." + SPECS,
  luxury_dark:
    "Place the bottle on a luxurious dark marble podium. Dark background with elegant gold accents or subtle warm lighting. Photorealistic." + SPECS,
  exotic_nature:
    "Place the bottle on a dark volcanic stone base. Shallow water reflection. Background consists of moody, out-of-focus dark tropical palm leaves. Premium studio lighting." + SPECS,
};

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no está configurada en el servidor. Agrégala a .env.local." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { imageData, mimeType, style, customPrompt } = body;

  if (!imageData || !mimeType) {
    return NextResponse.json({ error: "Faltan imageData o mimeType." }, { status: 400 });
  }

  let prompt = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.luxury_dark;
  if (customPrompt?.trim()) {
    prompt += " Additional instructions: " + customPrompt.trim();
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: imageData } },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  let attempts = 0;
  const delays = [1000, 2000, 4000];

  while (attempts <= delays.length) {
    try {
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini error ${res.status}`);
      }

      const result = await res.json();
      const generatedPart = result.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);

      if (!generatedPart?.inlineData) {
        throw new Error("Gemini no devolvió una imagen válida.");
      }

      return NextResponse.json({
        imageData: generatedPart.inlineData.data,
        mimeType: generatedPart.inlineData.mimeType || "image/png",
      });
    } catch (error) {
      if (attempts === delays.length) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      await new Promise((r) => setTimeout(r, delays[attempts]));
      attempts++;
    }
  }
}
