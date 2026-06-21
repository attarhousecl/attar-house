"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";
import ProductGrid from "@/components/ProductGrid";

const PREGUNTAS = [
  {
    id: "ocasion",
    pregunta: "¿Para qué ocasión buscas la fragancia?",
    opciones: [
      { label: "Uso diario", emoji: "☀️", value: "diario" },
      { label: "Salir de noche", emoji: "🌙", value: "noche" },
      { label: "Trabajo / Reuniones", emoji: "💼", value: "trabajo" },
      { label: "Evento especial", emoji: "✨", value: "especial" },
    ],
  },
  {
    id: "intensidad",
    pregunta: "¿Qué tan intenso te gusta el perfume?",
    opciones: [
      { label: "Suave y fresco", emoji: "🌿", value: "suave" },
      { label: "Equilibrado", emoji: "⚖️", value: "equilibrado" },
      { label: "Intenso y duradero", emoji: "🔥", value: "intenso" },
      { label: "Muy potente, que deje huella", emoji: "💣", value: "brutal" },
    ],
  },
  {
    id: "familia",
    pregunta: "¿Qué tipo de aroma prefieres?",
    opciones: [
      { label: "Amaderado / Oud", emoji: "🌳", value: ["Amaderado"] },
      { label: "Dulce / Gourmand", emoji: "🍯", value: ["Dulce", "Gourmand", "Vainilla"] },
      { label: "Cítrico / Fresco", emoji: "🍋", value: ["Cítrico", "Fresco", "Aromático"] },
      { label: "Especiado / Oriental", emoji: "🌶️", value: ["Especiado", "Oriental"] },
      { label: "Frutal", emoji: "🍓", value: ["Frutal"] },
      { label: "Floral / Romántico", emoji: "🌹", value: ["Floral", "Almizcle"] },
    ],
  },
  {
    id: "genero",
    pregunta: "¿El perfume es para ti o para regalar?",
    opciones: [
      { label: "Para mí (Masculino)", emoji: "👨", value: "Masculino" },
      { label: "Para mí (Femenino)", emoji: "👩", value: "Femenino" },
      { label: "Unisex / Lo comparto", emoji: "🤝", value: "Unisex" },
      { label: "Es un regalo", emoji: "🎁", value: "regalo" },
    ],
  },
  {
    id: "presupuesto",
    pregunta: "¿Cuánto quieres invertir en un decant?",
    opciones: [
      { label: "Menos de $4.000", emoji: "💰", value: "bajo" },
      { label: "$4.000 – $7.000", emoji: "💰💰", value: "medio" },
      { label: "Más de $7.000", emoji: "💎", value: "alto" },
      { label: "El precio no importa", emoji: "🌟", value: "sin-limite" },
    ],
  },
];

function scoreMatch(perfume, respuestas) {
  let score = 0;

  const familias = respuestas.familia; // array de familias seleccionadas
  if (Array.isArray(familias)) {
    const sel = familias.map(s => s.toLowerCase());
    if (perfume.families.some(f => sel.includes(f.toLowerCase()))) score += 3;
    if (familias.includes("Amaderado") && perfume.notes.some(n => ["oud","madera","sándalo","sandalo","cedro"].some(k => n.toLowerCase().includes(k)))) score += 2;
    if ((familias.includes("Dulce") || familias.includes("Gourmand")) && perfume.notes.some(n => ["vainilla","caramelo","chocolate","café","cafe","miel","azúcar","azucar"].some(k => n.toLowerCase().includes(k)))) score += 2;
    if (familias.includes("Cítrico") && perfume.notes.some(n => ["limón","limon","bergamota","naranja","mandarina","cítrico","citrico"].some(k => n.toLowerCase().includes(k)))) score += 2;
  }

  const genero = respuestas.genero;
  if (genero && genero !== "regalo") {
    if (perfume.gender === genero) score += 2;
    else if (perfume.gender === "Unisex") score += 1;
  } else if (genero === "regalo") {
    score += 1;
  }

  const intensidad = respuestas.intensidad;
  if (intensidad === "brutal" || intensidad === "intenso") {
    if (perfume.popularity >= 90) score += 1;
    if (perfume.families.some(f => { const x = f.toLowerCase(); return x.includes("oriental") || x.includes("amaderado") || x.includes("especiado") || x.includes("dulce"); })) score += 1;
  }
  if (intensidad === "suave") {
    if (perfume.families.some(f => { const x = f.toLowerCase(); return x.includes("fresco") || x.includes("cítrico") || x.includes("citrico") || x.includes("floral") || x.includes("aromático") || x.includes("aromatico"); })) score += 1;
  }

  const ppto = respuestas.presupuesto;
  if (ppto === "bajo" && perfume.prices.decant3 < 4000) score += 1;
  if (ppto === "medio" && perfume.prices.decant3 >= 4000 && perfume.prices.decant3 <= 7000) score += 1;
  if (ppto === "alto" && perfume.prices.decant3 > 7000) score += 1;
  if (ppto === "sin-limite") score += 0.5;

  return score;
}

function computeResultados(perfumes, respuestas) {
  const ranked = perfumes
    .filter((p) => p.prices.decant3 > 0)
    .map((p) => ({ perfume: p, score: scoreMatch(p, respuestas) }))
    .sort((a, b) => b.score - a.score || (b.perfume.popularity || 0) - (a.perfume.popularity || 0));

  // Prioriza coincidencias reales; si hay muy pocas, completa con favoritos.
  const matches = ranked.filter((r) => r.score > 0);
  const base = matches.length >= 3 ? matches : ranked;
  return base.slice(0, 6).map((r) => r.perfume);
}

const QUIZ_STORE_KEY = "attar_quiz_state";

export default function QuizPage() {
  const { perfumes } = useCatalog();
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultados, setResultados] = useState(null);
  const [pendingIds, setPendingIds] = useState(null);
  // Respuestas a la espera de que el catálogo termine de cargar para calcular.
  const [pendingCompute, setPendingCompute] = useState(null);

  // Restaura el estado guardado al volver atrás (no perder los resultados).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(QUIZ_STORE_KEY) || "null");
      if (saved?.respuestas) setRespuestas(saved.respuestas);
      if (saved?.ids?.length) setPendingIds(saved.ids);
    } catch {}
  }, []);

  // Cuando el catálogo carga, reconstruye los resultados desde los IDs guardados.
  useEffect(() => {
    if (!pendingIds || perfumes.length === 0) return;
    const byId = new Map(perfumes.map((p) => [p.id, p]));
    const restored = pendingIds.map((id) => byId.get(id)).filter(Boolean);
    if (restored.length) setResultados(restored);
    setPendingIds(null);
  }, [pendingIds, perfumes]);

  // Si el catálogo aún no estaba listo al terminar el quiz, calcula en cuanto llegue.
  useEffect(() => {
    if (!pendingCompute || perfumes.length === 0) return;
    finalizar(pendingCompute);
    setPendingCompute(null);
  }, [pendingCompute, perfumes]); // eslint-disable-line react-hooks/exhaustive-deps

  function finalizar(nuevas) {
    const scored = computeResultados(perfumes, nuevas);
    setResultados(scored);
    try {
      sessionStorage.setItem(
        QUIZ_STORE_KEY,
        JSON.stringify({ respuestas: nuevas, ids: scored.map((p) => p.id) })
      );
    } catch {}
  }

  function elegir(valor) {
    const nuevas = { ...respuestas, [PREGUNTAS[paso].id]: valor };
    setRespuestas(nuevas);

    if (paso < PREGUNTAS.length - 1) {
      setPaso(paso + 1);
    } else if (perfumes.length === 0) {
      // Catálogo todavía cargando: espera a tenerlo antes de mostrar resultados.
      setPendingCompute(nuevas);
    } else {
      finalizar(nuevas);
    }
  }

  function reiniciar() {
    setPaso(0);
    setRespuestas({});
    setResultados(null);
    setPendingIds(null);
    setPendingCompute(null);
    try { sessionStorage.removeItem(QUIZ_STORE_KEY); } catch {}
  }

  if (resultados) {
    return (
      <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0a", minHeight: "100vh", padding: "40px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✨</div>
            <h1 style={{ fontFamily: "var(--font-playfair), serif", color: "#d4af37", fontSize: "2rem", margin: "0 0 8px" }}>Tus fragancias recomendadas</h1>
            <p style={{ color: "#666", fontSize: "0.88rem" }}>Basado en tus preferencias, estos perfumes son para ti</p>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <ProductGrid perfumes={resultados} variant="catalog" />
          </div>

          <div style={{ textAlign: "center", display: "flex", gap: "16px", justifyContent: "center" }}>
            <button onClick={reiniciar} style={{ background: "transparent", border: "1px solid #333", color: "#888", borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontSize: "0.85rem" }}>
              Volver a intentar
            </button>
            <Link href="/catalogo" style={{ background: "#d4af37", color: "#000", borderRadius: "8px", padding: "12px 24px", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Terminó el quiz pero el catálogo aún carga: pantalla de espera (no resultados vacíos).
  if (pendingCompute) {
    return (
      <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0a", minHeight: "100vh", padding: "40px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>✨</div>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", color: "#d4af37", fontSize: "1.6rem", margin: "0 0 8px" }}>Preparando tus recomendaciones…</h1>
          <p style={{ color: "#666", fontSize: "0.88rem" }}>Estamos analizando tus respuestas.</p>
        </div>
      </div>
    );
  }

  const pregunta = PREGUNTAS[paso];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0a", minHeight: "100vh", padding: "40px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "560px", width: "100%" }}>
        <Link href="/" style={{ color: "#d4af37", fontSize: "0.8rem", textDecoration: "none" }}>← Volver</Link>

        <div style={{ textAlign: "center", margin: "24px 0 32px" }}>
          <p style={{ color: "#888", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Pregunta {paso + 1} de {PREGUNTAS.length}</p>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", color: "#d4af37", fontSize: "1.6rem", margin: "0 0 8px" }}>Quiz de Fragancias</h1>
          <p style={{ color: "#e0e0e0", fontSize: "1rem", margin: 0 }}>{pregunta.pregunta}</p>
        </div>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "2px", marginBottom: "32px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((paso + 1) / PREGUNTAS.length) * 100}%`, background: "#d4af37", transition: "width 0.4s ease" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pregunta.opciones.map(op => (
            <button
              key={op.label}
              onClick={() => elegir(op.value)}
              style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "18px 22px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s, background 0.2s", color: "#e0e0e0", fontSize: "0.95rem" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4af37"; e.currentTarget.style.background = "rgba(212,175,55,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.background = "#111"; }}
            >
              <span style={{ fontSize: "1.5rem" }}>{op.emoji}</span>
              <span>{op.label}</span>
            </button>
          ))}
        </div>

        {paso > 0 && (
          <button onClick={() => setPaso(paso - 1)} style={{ marginTop: "20px", background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "0.8rem", display: "block", margin: "20px auto 0" }}>
            ← Pregunta anterior
          </button>
        )}
      </div>
    </div>
  );
}
