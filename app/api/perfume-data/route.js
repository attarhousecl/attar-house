import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  const brand = searchParams.get("brand")?.trim();

  if (!name || !brand) {
    return Response.json({ error: "Falta nombre o marca" }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Busca información sobre el perfume "${name}" de la marca "${brand}". Devuelve SOLO este JSON exacto, sin texto adicional ni markdown:
{"name":"nombre oficial","brand":"marca oficial","gender":"Masculino|Femenino|Unisex","notes":["nota1","nota2"],"families":["familia1"],"description":"2-3 oraciones en español sobre el perfume"}`,
        },
      ],
    });

    // web_search_20250305 is server-side: Anthropic executes searches internally.
    // The final text block contains the structured response.
    const text = response.content.findLast((b) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Respuesta sin JSON", raw: text }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return Response.json(data);
  } catch (e) {
    console.error("perfume-data error:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
