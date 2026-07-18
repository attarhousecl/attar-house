"use client";

import { useState } from "react";

// "¿Qué es un decant?" + "Rendimiento por formato" fusionados: el visitante
// presiona 3ml / 5ml / 10ml y el panel muestra la información de ese formato
// (sprays, duración e ideal para quién), con un vial que se llena según el tamaño.
const FORMATOS = [
  {
    id: "3ml",
    ml: "3ml",
    sprays: "~30 sprays",
    duracion: "1 a 2 semanas",
    titulo: "Para descubrir",
    desc: "Ideal para llevar en el bolsillo y probar la fragancia a fondo en tu piel antes de decidir.",
    fill: 34,
  },
  {
    id: "5ml",
    ml: "5ml",
    sprays: "~50 sprays",
    duracion: "3 a 4 semanas",
    titulo: "Para acompañarte",
    desc: "Perfecto para usar una fragancia de manera continua y confirmar que es la tuya.",
    fill: 58,
  },
  {
    id: "10ml",
    ml: "10ml",
    sprays: "~100 sprays",
    duracion: "1.5 a 2 meses",
    titulo: "Mejor precio por ml",
    desc: "La mejor relación precio/cantidad: uso regular por semanas antes de invertir en el frasco sellado.",
    fill: 86,
  },
];

export default function DecantExplorer() {
  const [sel, setSel] = useState("5ml");
  const f = FORMATOS.find((x) => x.id === sel);

  return (
    <div className="decant-explorer">
      <div className="de-formats" role="tablist" aria-label="Formatos de decant">
        {FORMATOS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={sel === x.id}
            className={`de-format ${sel === x.id ? "selected" : ""}`}
            onClick={() => setSel(x.id)}
          >
            <span className="de-format-ml">{x.ml}</span>
            <span className="de-format-sprays mono">{x.sprays}</span>
          </button>
        ))}
      </div>

      <div className="de-panel" key={f.id} role="tabpanel">
        <div className="de-vial" aria-hidden="true">
          <span className="de-vial-cap"></span>
          <span className="de-vial-body">
            <span className="de-vial-fill" style={{ height: `${f.fill}%` }}></span>
          </span>
          <span className="de-vial-label mono">{f.ml}</span>
        </div>
        <div className="de-info">
          <h3 className="de-info-title">{f.titulo}</h3>
          <p className="de-info-desc">{f.desc}</p>
          <div className="de-facts">
            <div className="de-fact">
              <span className="de-fact-label mono">Rendimiento</span>
              <span className="de-fact-value">{f.sprays}</span>
            </div>
            <div className="de-fact">
              <span className="de-fact-label mono">Duración aprox.</span>
              <span className="de-fact-value">{f.duracion}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
