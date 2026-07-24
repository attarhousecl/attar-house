"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Carga diferida del quiz. QuizExperience (+ ProductGrid, datos, tracking) es
// JS pesado que estaba en el bundle inicial del home aunque el quiz vive bien
// bajo el fold. Aqui:
//   1. dynamic(ssr:false): sale del render del servidor y del bundle inicial.
//   2. IntersectionObserver: el chunk solo se descarga cuando el bloque #quiz se
//      acerca al viewport (o si se llega directo por /#quiz).
// El placeholder reserva alto para no producir layout shift al montar el quiz.
const QuizExperience = dynamic(() => import("@/components/QuizExperience"), {
  ssr: false,
  loading: () => <div className="quiz-lazy-ph" aria-hidden="true" />,
});

export default function LazyQuiz(props) {
  const ref = useRef(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    // Fallback: si no hay IntersectionObserver, carga de inmediato.
    if (typeof IntersectionObserver === "undefined") { setLoad(true); return undefined; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <div ref={ref}>
      {load ? <QuizExperience {...props} /> : <div className="quiz-lazy-ph" aria-hidden="true" />}
    </div>
  );
}
