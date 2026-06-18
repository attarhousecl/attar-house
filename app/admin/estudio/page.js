"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const STYLES = [
  { value: "luxury_dark", label: "Lujo Oscuro", desc: "Mármol negro, ideal para tu tienda" },
  { value: "ecommerce_white", label: "E-commerce Blanco", desc: "Limpio y clásico" },
  { value: "ecommerce_grey", label: "E-commerce Gris", desc: "Elegante y uniforme" },
  { value: "exotic_nature", label: "Naturaleza Exótica", desc: "Hojas tropicales y agua" },
];

function prepareImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      const targetHeight = canvas.height * 0.7;
      const scale = targetHeight / img.height;
      const targetWidth = img.width * scale;
      const x = (canvas.width - targetWidth) / 2;
      const y = (canvas.height - targetHeight) / 2;
      ctx.drawImage(img, x, y, targetWidth, targetHeight);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
}

function cropBorders(base64Data, mimeType) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      const zoom = 1.06;
      const sw = img.width / zoom;
      const sh = img.height / zoom;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1024, 1024);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = `data:${mimeType};base64,${base64Data}`;
  });
}

export default function EstudioPage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [originalDataUrl, setOriginalDataUrl] = useState(null);
  const [style, setStyle] = useState("luxury_dark");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage(e) {
    e.stopPropagation();
    setOriginalDataUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function generate() {
    if (!originalDataUrl) { setError("Sube una imagen primero."); return; }
    setError("");
    setLoading(true);
    setResultUrl(null);

    try {
      const processed = await prepareImage(originalDataUrl);
      const parts = processed.split(",");
      const mimeType = parts[0].match(/:(.*?);/)[1];
      const imageData = parts[1];

      const res = await fetch("/api/estudio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, mimeType, style, customPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      const cropped = await cropBorders(data.imageData, data.mimeType);
      setResultUrl(cropped);
    } catch (err) {
      setError(err.message || "Error al generar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="es-page">
      <header className="es-header">
        <button className="es-back" onClick={() => router.push("/admin")}>← Admin</button>
        <h1 className="es-title">📸 Estudio Fotográfico IA</h1>
        <span className="es-badge">Gemini 2.5 Flash</span>
      </header>

      <main className="es-main">
        {/* Controles */}
        <div className="es-controls">
          <div className="es-card">
            <h2 className="es-card-title">1. Sube tu Perfume</h2>
            <p className="es-hint">PNG sin fondo recomendado para mejores resultados.</p>
            <div className="es-upload" onClick={() => inputRef.current?.click()}>
              {originalDataUrl ? (
                <div className="es-preview-wrap">
                  <img src={originalDataUrl} alt="Vista previa" className="es-preview-img" />
                  <button className="es-remove" onClick={removeImage}>✕</button>
                </div>
              ) : (
                <div className="es-upload-ph">
                  <span className="es-upload-icon">⬆</span>
                  <span>Haz clic para subir</span>
                  <span className="es-upload-sub">PNG, JPG o WebP</span>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="es-card">
            <h2 className="es-card-title">2. Estilo del Entorno</h2>
            <div className="es-styles">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  className={`es-stylebtn${style === s.value ? " active" : ""}`}
                  onClick={() => setStyle(s.value)}
                >
                  <span className="es-style-label">{s.label}</span>
                  <span className="es-style-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="es-card">
            <h2 className="es-card-title">3. Detalles (Opcional)</h2>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ej: Añadir un ligero reflejo en la base..."
              rows={2}
              className="es-textarea"
            />
          </div>

          <div className="es-infobox">
            <strong>⚙ Sistema Anti-Bordes Activado</strong>
            <ul>
              <li>Lienzo transparente para obligar a la IA a rellenar (1:1).</li>
              <li>Guillotina automática: recorte del 6% post-generación.</li>
            </ul>
          </div>

          {error && <div className="es-error">{error}</div>}

          <button className="es-genbtn" onClick={generate} disabled={loading || !originalDataUrl}>
            {loading ? "⏳ Generando..." : "✦ Generar Fotografía 1:1"}
          </button>
        </div>

        {/* Resultado */}
        <div className="es-result">
          <div className="es-card" style={{ marginBottom: 0 }}>
            <h2 className="es-card-title">Resultado Final (1:1)</h2>
            <div className="es-canvas">
              {loading && (
                <div className="es-loading">
                  <span className="es-spinner" />
                  <p>Generando y recortando...</p>
                </div>
              )}
              {!loading && resultUrl && (
                <img src={resultUrl} alt="Resultado generado" className="es-result-img" />
              )}
              {!loading && !resultUrl && (
                <div className="es-ph">
                  <span style={{ fontSize: "2.5rem", opacity: 0.25 }}>🖼</span>
                  <p>Vista previa 1024×1024 px</p>
                </div>
              )}
            </div>
            {resultUrl && (
              <a href={resultUrl} download="perfume-attar-house-1x1.jpg" className="es-dlbtn">
                ⬇ Descargar (1024×1024 px)
              </a>
            )}
          </div>
        </div>
      </main>

      <EstudioStyles />
    </div>
  );
}

function EstudioStyles() {
  return (
    <style jsx global>{`
      @keyframes es-spin { to { transform: rotate(360deg); } }

      .es-page {
        min-height: 100vh;
        background: #0a0a0a;
        color: #e0e0e0;
        font-family: "Segoe UI", sans-serif;
      }
      .es-page * { box-sizing: border-box; }

      .es-header {
        background: #111;
        border-bottom: 1px solid #2a2a2a;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .es-back {
        background: none;
        border: 1px solid #333;
        color: #999;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .es-back:hover { border-color: #d4af37; color: #d4af37; }
      .es-title { font-size: 1.1rem; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; flex: 1; margin: 0; }
      .es-badge {
        font-size: 0.72rem;
        background: rgba(212,175,55,0.1);
        border: 1px solid rgba(212,175,55,0.3);
        color: #d4af37;
        padding: 4px 10px;
        border-radius: 20px;
        white-space: nowrap;
      }

      .es-main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px 24px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        align-items: start;
      }

      .es-controls { display: flex; flex-direction: column; gap: 16px; }

      .es-card {
        background: #111;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
        padding: 20px;
      }
      .es-card-title {
        font-size: 0.9rem;
        color: #d4af37;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 14px;
        font-weight: 700;
      }
      .es-hint { font-size: 0.78rem; color: #666; margin: 0 0 12px; }

      .es-upload {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 120px;
        border: 2px dashed #2a2a2a;
        border-radius: 10px;
        cursor: pointer;
        background: #0d0d0d;
        transition: border-color 0.2s;
        overflow: hidden;
      }
      .es-upload:hover { border-color: #d4af37; }
      .es-upload-ph {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: #555;
        font-size: 0.85rem;
      }
      .es-upload-icon { font-size: 1.5rem; color: #d4af37; }
      .es-upload-sub { font-size: 0.72rem; color: #444; }
      .es-preview-wrap { position: relative; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; }
      .es-preview-img { max-height: 100px; max-width: 100%; object-fit: contain; border-radius: 6px; }
      .es-remove {
        position: absolute;
        top: 4px; right: 4px;
        background: #c0392b;
        color: #fff;
        border: none;
        width: 22px; height: 22px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.7rem;
        display: flex; align-items: center; justify-content: center;
      }

      .es-styles { display: flex; flex-direction: column; gap: 8px; }
      .es-stylebtn {
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        padding: 10px 14px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .es-stylebtn.active { border-color: #d4af37; background: rgba(212,175,55,0.07); }
      .es-stylebtn:hover:not(.active) { border-color: rgba(212,175,55,0.3); }
      .es-style-label { font-size: 0.85rem; font-weight: 600; color: #e0e0e0; }
      .es-stylebtn.active .es-style-label { color: #d4af37; }
      .es-style-desc { font-size: 0.72rem; color: #666; }

      .es-textarea {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 6px;
        padding: 9px 12px;
        color: #e0e0e0;
        font-size: 0.86rem;
        font-family: inherit;
        resize: vertical;
        outline: none;
        transition: border-color 0.2s;
      }
      .es-textarea:focus { border-color: #d4af37; }

      .es-infobox {
        background: rgba(212,175,55,0.05);
        border: 1px solid rgba(212,175,55,0.2);
        border-radius: 8px;
        padding: 12px 14px;
        font-size: 0.75rem;
        color: #aaa;
        line-height: 1.5;
      }
      .es-infobox strong { color: #d4af37; display: block; margin-bottom: 6px; font-size: 0.78rem; }
      .es-infobox ul { margin: 0; padding-left: 16px; }

      .es-error {
        background: rgba(192,57,43,0.1);
        border: 1px solid rgba(192,57,43,0.4);
        color: #e07070;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 0.82rem;
      }

      .es-genbtn {
        background: #d4af37;
        color: #000;
        border: none;
        border-radius: 10px;
        padding: 14px;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
        letter-spacing: 0.5px;
      }
      .es-genbtn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
      .es-genbtn:disabled { opacity: 0.4; cursor: not-allowed; }

      .es-result { position: sticky; top: 76px; }

      .es-canvas {
        background: #0d0d0d;
        border: 2px dashed #2a2a2a;
        border-radius: 10px;
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        margin-bottom: 14px;
      }
      .es-ph {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #555;
        font-size: 0.85rem;
      }
      .es-loading {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #d4af37;
        font-size: 0.88rem;
        font-weight: 500;
      }
      .es-loading p { margin: 0; }
      .es-spinner {
        width: 36px; height: 36px;
        border: 3px solid #333;
        border-bottom-color: #d4af37;
        border-radius: 50%;
        animation: es-spin 1s linear infinite;
        display: inline-block;
      }
      .es-result-img { width: 100%; height: 100%; object-fit: cover; }

      .es-dlbtn {
        display: block;
        text-align: center;
        background: #1a1a1a;
        border: 1px solid #333;
        color: #d4af37;
        padding: 11px;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
      }
      .es-dlbtn:hover { background: #d4af37; color: #000; border-color: #d4af37; }

      @media (max-width: 768px) {
        .es-main { grid-template-columns: 1fr; padding: 16px; }
        .es-result { position: static; }
      }
    `}</style>
  );
}
