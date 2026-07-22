"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function EtiquetasPage() {
  const router = useRouter();
  const [perfume, setPerfume] = useState("Khamrah Qwah");
  const [brand, setBrand] = useState("Lattafa");
  const [size, setSize] = useState("5ml");
  const [rollWidth, setRollWidth] = useState("15x30_vertical");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [offsetX, setOffsetX] = useState(15);
  const [brandScale, setBrandScale] = useState(0);
  const [perfumeScale, setPerfumeScale] = useState(0);

  async function handleDownloadImage() {
    const printArea = document.getElementById("print-area");
    if (window.html2canvas && printArea) {
      const originalBorder = printArea.style.border;
      printArea.style.border = "none";
      try {
        const canvas = await window.html2canvas(printArea, { scale: 4, backgroundColor: "#FDFCFA" });
        setGeneratedImage(canvas.toDataURL("image/png"));
      } catch {
        alert("Error al generar imagen. Intenta de nuevo.");
      } finally {
        printArea.style.border = originalBorder;
      }
    } else {
      alert("Cargando herramienta... dale un segundo y aprieta de nuevo.");
    }
  }

  const perfumeFs =
    (perfume.length > 15 ? 26 : perfume.length > 8 || perfume.includes(" ") ? 32 : 40) + perfumeScale;

  return (
    <div className="et-page">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="lazyOnload"
      />

      <header className="et-header">
        <button className="et-back" onClick={() => router.push("/admin")}>
          ← Admin
        </button>
        <h1 className="et-title">✦ Generador de Etiquetas</h1>
        <span className="et-badge">Impresoras Térmicas</span>
      </header>

      <main className="et-main">
        {/* Formulario */}
        <div className="et-card">
          <h2 className="et-card-title">🏷️ Arma la Etiqueta</h2>

          <div className="et-grid2">
            <div className="et-group">
              <label>Nombre del Perfume</label>
              <input type="text" value={perfume} onChange={(e) => setPerfume(e.target.value)} />
            </div>
            <div className="et-group">
              <label>Marca / Casa</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
          </div>

          <div className="et-group" style={{ marginTop: 16 }}>
            <label>Tamaño del Decant</label>
            <div className="et-btnrow">
              {["3ml", "5ml", "10ml"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`et-sizebtn${size === s ? " active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="et-group" style={{ marginTop: 16 }}>
            <label>Formato de Etiqueta</label>
            <select value={rollWidth} onChange={(e) => setRollWidth(e.target.value)}>
              <option value="15x30_vertical">15×30 mm Vertical (Estilo Nicho Premium)</option>
              <option value="30x15">30×15 mm Horizontal</option>
            </select>
          </div>

          {rollWidth === "15x30_vertical" && (
            <div className="et-cal" style={{ marginTop: 14 }}>
              <div className="et-calrow">
                <label>Calibración Horizontal</label>
                <span className="et-calval">
                  {offsetX > 0 ? `+${offsetX} Derecha` : offsetX < 0 ? `${offsetX} Izquierda` : "Centrado 0"}
                </span>
              </div>
              <input
                type="range" min="-40" max="40" value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value))}
                className="et-range"
              />
              <p className="et-hint">Si la impresora se come el lado izquierdo, empuja hacia la derecha.</p>
            </div>
          )}

          <div className="et-cal" style={{ marginTop: 12 }}>
            <div className="et-calrow">
              <label>Tamaño de la Marca</label>
              <span className="et-calval">{brandScale > 0 ? `+${brandScale}` : brandScale < 0 ? brandScale : "Normal"}</span>
            </div>
            <input
              type="range" min="-8" max="20" value={brandScale}
              onChange={(e) => setBrandScale(parseInt(e.target.value))}
              className="et-range"
            />
          </div>

          <div className="et-cal" style={{ marginTop: 12 }}>
            <div className="et-calrow">
              <label>Tamaño del Perfume</label>
              <span className="et-calval">{perfumeScale > 0 ? `+${perfumeScale}` : perfumeScale < 0 ? perfumeScale : "Normal"}</span>
            </div>
            <input
              type="range" min="-12" max="24" value={perfumeScale}
              onChange={(e) => setPerfumeScale(parseInt(e.target.value))}
              className="et-range"
            />
            <p className="et-hint">Achica o agranda el nombre del perfume para nombres muy largos o muy cortos.</p>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="et-card">
          <h2 className="et-card-title">Vista Previa</h2>

          <div className="et-preview-box">
            {rollWidth === "15x30_vertical" ? (
              <div
                id="print-area"
                style={{
                  background: "#FDFCFA",
                  color: "#0F1613",
                  width: 250,
                  height: 500,
                  boxSizing: "border-box",
                  paddingTop: 28,
                  paddingBottom: 28,
                  paddingLeft: 28 + offsetX,
                  paddingRight: 28 - offsetX,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    border: "4px solid #0F1613",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    overflow: "hidden",
                  }}
                >
                  {/* Marca */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, paddingInline: 8, height: 60 }}>
                    <div style={{ textAlign: "center", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 16 + brandScale }}>
                      {brand || "MARCA"}
                    </div>
                  </div>

                  {/* Nombre del perfume */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, paddingInline: 8 }}>
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                        fontSize: perfumeFs,
                      }}
                    >
                      {perfume || "PERFUME"}
                    </div>
                  </div>

                  {/* ML */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 70 }}>
                    <div style={{ fontWeight: 900, letterSpacing: "-0.05em", fontSize: 38 }}>{size}</div>
                  </div>

                  {/* Attar House */}
                  <div
                    style={{
                      background: "#FDFCFA",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 80,
                      borderTop: "4px solid #0F1613",
                    }}
                  >
                    <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 20, lineHeight: 1 }}>
                      Attar
                    </span>
                    <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 20, lineHeight: 1, marginTop: 6 }}>
                      House
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="print-area"
                style={{
                  background: "#FDFCFA",
                  color: "#0F1613",
                  border: "4px solid #0F1613",
                  width: 460,
                  height: 200,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                }}
              >
                <div style={{ textAlign: "center", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", display: "flex", alignItems: "center", justifyContent: "center", height: 55, fontSize: 30 }}>
                  Attar House
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: 145 }}>
                  <div style={{ textAlign: "center", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 20 + brandScale, marginBottom: 4 }}>
                    {brand}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-0.02em",
                      height: 95,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingInline: 8,
                      fontSize: (perfume.length > 14 ? 34 : perfume.length > 9 || perfume.includes(" ") ? 42 : 56) + perfumeScale,
                      lineHeight: 1.05,
                    }}
                  >
                    {perfume}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="et-dl-btn" onClick={handleDownloadImage}>
            📥 Guardar como Imagen
          </button>
        </div>
      </main>

      {/* Modal imagen generada */}
      {generatedImage && (
        <div className="et-overlay" onClick={() => setGeneratedImage(null)}>
          <div className="et-modal" onClick={(e) => e.stopPropagation()}>
            <button className="et-modal-close" onClick={() => setGeneratedImage(null)}>✕</button>
            <h3 className="et-modal-title">✦ ¡Etiqueta lista!</h3>
            <div className="et-modal-warn">
              <strong>⚠️ IMPORTANTE:</strong> En el celu, usa los dedos para estirar la imagen hasta que rellene el rectángulo de tu app de impresión.
            </div>
            <div className="et-modal-imgwrap">
              <img src={generatedImage} alt="Etiqueta Attar House" className="et-modal-img" />
            </div>
            <p className="et-modal-hint">Mantén presionada la imagen para guardarla.</p>
            <a href={generatedImage} download="etiqueta-attar-house.png" className="et-modal-dl">
              ⬇ Descargar PNG
            </a>
          </div>
        </div>
      )}

      <EtiquetasStyles />
    </div>
  );
}

function EtiquetasStyles() {
  return (
    <style jsx global>{`
      .et-page {
        min-height: 100vh;
        background: #0F1613;
        color: #FDFCFA;
        font-family: var(--font-archivo), sans-serif;
      }
      .et-page * { box-sizing: border-box; }

      .et-header {
        background: #151D1A;
        border-bottom: 1px solid #1F2B27;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .et-back {
        background: none;
        border: 1px solid #2A3A32;
        color: #8A9690;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .et-back:hover { border-color: #8DD8A0; color: #8DD8A0; }
      .et-title { font-size: 1.1rem; color: #8DD8A0; letter-spacing: 2px; text-transform: uppercase; flex: 1; margin: 0; }
      .et-badge {
        font-size: 0.72rem;
        background: rgba(141,216,160, 0.1);
        border: 1px solid rgba(141,216,160, 0.3);
        color: #8DD8A0;
        padding: 4px 10px;
        border-radius: 20px;
        white-space: nowrap;
      }

      .et-main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px 24px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .et-card {
        background: #151D1A;
        border: 1px solid #1F2B27;
        border-radius: 16px;
        padding: 24px;
      }
      .et-card-title {
        font-size: 0.9rem;
        color: #8DD8A0;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 1px solid #1A2420;
        padding-bottom: 10px;
        margin: 0 0 20px;
      }

      .et-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .et-group { display: flex; flex-direction: column; gap: 6px; }
      .et-group label { font-size: 0.72rem; color: #8A9690; text-transform: uppercase; letter-spacing: 0.5px; }
      .et-page input[type="text"],
      .et-page select {
        background: #1A2420;
        border: 1px solid #1F2B27;
        border-radius: 6px;
        padding: 9px 12px;
        color: #FDFCFA;
        font-size: 0.86rem;
        outline: none;
        font-family: inherit;
        width: 100%;
        transition: border-color 0.2s;
      }
      .et-page input[type="text"]:focus,
      .et-page select:focus { border-color: #8DD8A0; }

      .et-btnrow { display: flex; gap: 8px; }
      .et-sizebtn {
        flex: 1;
        padding: 8px;
        border-radius: 6px;
        border: 1px solid #1F2B27;
        background: #1A2420;
        color: #8A9690;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .et-sizebtn.active { background: #8DD8A0; border-color: #8DD8A0; color: #0F1613; }
      .et-sizebtn:hover:not(.active) { border-color: rgba(141,216,160, 0.4); color: #8DD8A0; }

      .et-cal {
        background: #0F1613;
        border: 1px solid #222;
        border-radius: 8px;
        padding: 12px 14px;
      }
      .et-calrow { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .et-calrow label { font-size: 0.72rem; color: #8A9690; text-transform: uppercase; letter-spacing: 0.5px; }
      .et-calval { font-size: 0.72rem; font-weight: 700; color: #8DD8A0; background: rgba(141,216,160, 0.1); padding: 2px 8px; border-radius: 20px; }
      .et-range { width: 100%; accent-color: #8DD8A0; cursor: pointer; }
      .et-hint { font-size: 0.72rem; color: #5C6B64; margin: 6px 0 0; line-height: 1.4; }

      .et-preview-box {
        background: #1A2420;
        border: 1px solid #1F2B27;
        border-radius: 10px;
        padding: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 280px;
        overflow-x: auto;
        margin-bottom: 20px;
      }

      .et-dl-btn {
        width: 100%;
        background: #8DD8A0;
        color: #0F1613;
        border: none;
        border-radius: 10px;
        padding: 12px;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        letter-spacing: 0.5px;
      }
      .et-dl-btn:hover { opacity: 0.85; transform: translateY(-1px); }
      .et-dl-btn:active { transform: scale(0.98); }

      .et-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.88);
        backdrop-filter: blur(4px);
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .et-modal {
        background: #151D1A;
        border: 1px solid rgba(141,216,160, 0.3);
        border-radius: 16px;
        padding: 24px;
        max-width: 380px;
        width: 100%;
        position: relative;
      }
      .et-modal-close {
        position: absolute;
        top: 12px; right: 12px;
        background: #1A2420;
        border: none;
        color: #8A9690;
        width: 28px; height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .et-modal-close:hover { color: #FDFCFA; background: #1F2B27; }
      .et-modal-title { color: #FDFCFA; font-size: 1.1rem; font-weight: 700; margin: 0 0 12px; }
      .et-modal-warn {
        background: rgba(141,216,160, 0.08);
        border: 1px solid rgba(141,216,160, 0.3);
        color: #d4d0aa;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 0.78rem;
        margin-bottom: 14px;
        line-height: 1.5;
      }
      .et-modal-imgwrap {
        background: #FDFCFA;
        padding: 8px;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }
      .et-modal-img { height: 180px; object-fit: contain; }
      .et-modal-hint { text-align: center; color: #7A8985; font-size: 0.78rem; margin-bottom: 12px; }
      .et-modal-dl {
        display: block;
        text-align: center;
        background: #1A2420;
        border: 1px solid #2A3A32;
        color: #8DD8A0;
        padding: 10px;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
      }
      .et-modal-dl:hover { background: #8DD8A0; color: #0F1613; border-color: #8DD8A0; }

      @media (max-width: 768px) {
        .et-main { grid-template-columns: 1fr; padding: 16px; }
        .et-grid2 { grid-template-columns: 1fr; }
        .et-header { flex-wrap: wrap; }
      }
    `}</style>
  );
}
