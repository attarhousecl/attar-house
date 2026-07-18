"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useCatalog } from "@/context/CatalogContext";
import ProductGrid from "@/components/ProductGrid";

const PREGUNTAS = [
  {
    id: "ocasion",
    titulo: "La ocasión",
    pregunta: "¿Para qué momento buscas la fragancia?",
    ayuda: "Piensa en dónde la usarías más seguido.",
    opciones: [
      { label: "Uso diario", emoji: "☀️", value: "diario" },
      { label: "Salir de noche", emoji: "🌙", value: "noche" },
      { label: "Trabajo / Reuniones", emoji: "💼", value: "trabajo" },
      { label: "Evento especial", emoji: "✨", value: "especial" },
    ],
  },
  {
    id: "intensidad",
    titulo: "La intensidad",
    pregunta: "¿Qué tan intenso te gusta el perfume?",
    ayuda: "De una brisa suave a una estela que deja huella.",
    opciones: [
      { label: "Suave y fresco", emoji: "🌿", value: "suave" },
      { label: "Equilibrado", emoji: "⚖️", value: "equilibrado" },
      { label: "Intenso y duradero", emoji: "🔥", value: "intenso" },
      { label: "Muy potente", emoji: "💣", value: "brutal" },
    ],
  },
  {
    id: "familia",
    titulo: "El aroma",
    pregunta: "¿Qué tipo de aroma prefieres?",
    ayuda: "Elige la familia que más te llame.",
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
    titulo: "Para quién",
    pregunta: "¿El perfume es para ti o para regalar?",
    ayuda: "Nos ayuda a afinar la selección.",
    opciones: [
      { label: "Para mí (Masculino)", emoji: "👨", value: "Masculino" },
      { label: "Para mí (Femenino)", emoji: "👩", value: "Femenino" },
      { label: "Unisex / Lo comparto", emoji: "🤝", value: "Unisex" },
      { label: "Es un regalo", emoji: "🎁", value: "regalo" },
    ],
  },
  {
    id: "presupuesto",
    titulo: "El presupuesto",
    pregunta: "¿Cuánto quieres invertir en un decant?",
    ayuda: "Siempre puedes partir por un formato pequeño.",
    opciones: [
      { label: "Menos de $4.000", emoji: "💰", value: "bajo" },
      { label: "$4.000 – $7.000", emoji: "💰", value: "medio" },
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

// Etiqueta legible de una respuesta para los chips de resumen.
function labelDeRespuesta(pregunta, valor) {
  const op = pregunta.opciones.find((o) =>
    Array.isArray(o.value) && Array.isArray(valor)
      ? o.value.join() === valor.join()
      : o.value === valor
  );
  return op ? `${op.emoji} ${op.label}` : null;
}

const QUIZ_STORE_KEY = "attar_quiz_state";

export default function QuizPage() {
  const { perfumes } = useCatalog();
  const [empezado, setEmpezado] = useState(false);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultados, setResultados] = useState(null);
  const [saliendo, setSaliendo] = useState(false);
  const [pendingIds, setPendingIds] = useState(null);
  // Respuestas a la espera de que el catálogo termine de cargar para calcular.
  const [pendingCompute, setPendingCompute] = useState(null);

  // Restaura el estado guardado al volver atrás (no perder los resultados).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(QUIZ_STORE_KEY) || "null");
      if (saved?.respuestas) setRespuestas(saved.respuestas);
      if (saved?.ids?.length) { setPendingIds(saved.ids); setEmpezado(true); }
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
    track("quiz_complete", { ...nuevas });
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

    // Pequeña pausa para que se vea la selección antes de avanzar.
    setSaliendo(true);
    setTimeout(() => {
      setSaliendo(false);
      if (paso < PREGUNTAS.length - 1) {
        setPaso(paso + 1);
      } else if (perfumes.length === 0) {
        // Catálogo todavía cargando: espera a tenerlo antes de mostrar resultados.
        setPendingCompute(nuevas);
      } else {
        finalizar(nuevas);
      }
    }, 260);
  }

  function reiniciar() {
    setPaso(0);
    setRespuestas({});
    setResultados(null);
    setPendingIds(null);
    setPendingCompute(null);
    setEmpezado(true);
    try { sessionStorage.removeItem(QUIZ_STORE_KEY); } catch {}
  }

  // ---------- Resultados ----------
  if (resultados) {
    const chips = PREGUNTAS.map((p) => labelDeRespuesta(p, respuestas[p.id])).filter(Boolean);
    return (
      <div className="quiz-page">
        <div className="quiz-wrap quiz-wrap-wide">
          <div className="quiz-head">
            <div className="kicker">Quiz de fragancias</div>
            <h1 className="quiz-title">Tu selección personalizada</h1>
            <p className="quiz-sub">Según tus respuestas, estas fragancias son para ti.</p>
            {chips.length > 0 && (
              <div className="quiz-chips">
                {chips.map((c) => (
                  <span key={c} className="quiz-chip">{c}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "40px" }}>
            <ProductGrid perfumes={resultados} variant="catalog" />
          </div>

          <div className="quiz-result-actions">
            <button onClick={reiniciar} className="quiz-btn-ghost">
              ↺ Volver a hacer el quiz
            </button>
            <Link href="/pack" className="quiz-btn-ghost">
              🎁 Armar mi pack con estos
            </Link>
            <Link href="/catalogo" className="btn-gold-solid">
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
      <div className="quiz-page quiz-center">
        <div className="quiz-head" style={{ textAlign: "center" }}>
          <div className="quiz-emoji">✨</div>
          <h1 className="quiz-title">Preparando tus recomendaciones…</h1>
          <p className="quiz-sub">Estamos analizando tus respuestas.</p>
        </div>
      </div>
    );
  }

  // ---------- Bienvenida ----------
  if (!empezado) {
    return (
      <div className="quiz-page quiz-center">
        <div className="quiz-wrap">
          <div className="quiz-head" style={{ textAlign: "center" }}>
            <div className="quiz-emoji">🔮</div>
            <div className="kicker">Quiz de fragancias</div>
            <h1 className="quiz-title">Descubre tu aroma en 5 preguntas</h1>
            <p className="quiz-sub">
              Cuéntanos cómo te gusta oler y te recomendamos los decants perfectos para
              partir. Toma menos de 1 minuto y puedes repetirlo cuando quieras.
            </p>
          </div>
          <div className="quiz-welcome-actions">
            <button onClick={() => setEmpezado(true)} className="btn-gold-solid">
              Comenzar
            </button>
            <Link href="/catalogo" className="quiz-btn-ghost">
              Prefiero explorar solo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Preguntas ----------
  const pregunta = PREGUNTAS[paso];
  const seleccionado = respuestas[pregunta.id];

  return (
    <div className="quiz-page quiz-center">
      <div className="quiz-wrap">
        {/* Progreso: pasos navegables (solo hacia atrás o ya respondidos) */}
        <div className="quiz-progress" role="list" aria-label="Progreso del quiz">
          {PREGUNTAS.map((p, i) => {
            const respondida = respuestas[p.id] !== undefined;
            const activa = i === paso;
            const alcanzable = i < paso || respondida;
            return (
              <button
                key={p.id}
                type="button"
                role="listitem"
                className={`quiz-step ${activa ? "active" : ""} ${respondida ? "done" : ""}`}
                disabled={!alcanzable || activa}
                onClick={() => alcanzable && setPaso(i)}
                aria-label={`Paso ${i + 1}: ${p.titulo}${respondida ? " (respondida)" : ""}`}
              >
                <span className="quiz-step-dot">{respondida && !activa ? "✓" : i + 1}</span>
                <span className="quiz-step-label">{p.titulo}</span>
              </button>
            );
          })}
        </div>
        <div className="quiz-bar" aria-hidden="true">
          <div className="quiz-bar-fill" style={{ width: `${((paso + 1) / PREGUNTAS.length) * 100}%` }} />
        </div>

        <div className={`quiz-card ${saliendo ? "leaving" : ""}`} key={pregunta.id}>
          <div className="quiz-head">
            <div className="kicker">Pregunta {paso + 1} de {PREGUNTAS.length}</div>
            <h1 className="quiz-question">{pregunta.pregunta}</h1>
            <p className="quiz-help">{pregunta.ayuda}</p>
          </div>

          <div className="quiz-options">
            {pregunta.opciones.map((op) => {
              const isSel = Array.isArray(op.value) && Array.isArray(seleccionado)
                ? op.value.join() === seleccionado.join()
                : op.value === seleccionado;
              return (
                <button
                  key={op.label}
                  type="button"
                  className={`quiz-option ${isSel ? "selected" : ""}`}
                  onClick={() => elegir(op.value)}
                  aria-pressed={isSel}
                >
                  <span className="quiz-option-emoji" aria-hidden="true">{op.emoji}</span>
                  <span className="quiz-option-label">{op.label}</span>
                  <span className="quiz-option-check" aria-hidden="true">✓</span>
                </button>
              );
            })}
          </div>

          <div className="quiz-nav">
            {paso > 0 ? (
              <button onClick={() => setPaso(paso - 1)} className="quiz-btn-ghost">
                ← Anterior
              </button>
            ) : (
              <Link href="/" className="quiz-btn-ghost">← Salir</Link>
            )}
            {seleccionado !== undefined && paso < PREGUNTAS.length - 1 && (
              <button onClick={() => setPaso(paso + 1)} className="quiz-btn-ghost">
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
