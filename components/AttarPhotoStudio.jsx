"use client";
/**
 * Attar House · Estudio Fotográfico
 * Recorta el fondo de la foto subida (100% en el navegador, sin API externa)
 * y usa ese recorte para construir una máscara de inpainting: Cloudflare
 * Workers AI (stable-diffusion-v1-5-inpainting, gratis sin tarjeta) regenera
 * solo el entorno alrededor de la botella en una sola pasada, en vez de
 * recortar y pegar sobre un fondo generado por separado — así no se ve el
 * borde del recorte y la luz queda coherente con el resto de la escena.
 */
import { useState, useRef } from "react";

const SIZE = 1024;

const SCENES = [
  { id: "marmol",   label: "Mármol Oscuro",    desc: "Lujo, fondo casi negro",    swatch: "linear-gradient(135deg,#241a0e,#3d2f1e)" },
  { id: "blanco",   label: "E-commerce Blanco", desc: "Limpio y clásico",          swatch: "linear-gradient(135deg,#f5f3f0,#e4e0da)" },
  { id: "gris",     label: "E-commerce Gris",   desc: "Elegante y uniforme",       swatch: "linear-gradient(135deg,#c0c0c0,#e0e0e0)" },
  { id: "bokeh",    label: "Bokeh Dorado",       desc: "Luces difusas doradas",     swatch: "radial-gradient(circle at 35% 50%,rgba(212,175,55,.75),#0c0b08 58%)" },
  { id: "arena",    label: "Arena Cálida",       desc: "Tonos cálidos suaves",      swatch: "linear-gradient(135deg,#d4c5a0,#bfaa78)" },
  { id: "tropical", label: "Hojas Tropicales",   desc: "Verde oscuro, piedra",      swatch: "linear-gradient(135deg,#0d1a0d,#1e3820)" },
];

// Dónde y a qué tamaño se coloca la foto dentro del lienzo de 1024x1024.
function computePlacement(imgWidth, imgHeight) {
  const targetHeight = SIZE * 0.66;
  const scale = targetHeight / imgHeight;
  const targetWidth = imgWidth * scale;
  return {
    x: (SIZE - targetWidth) / 2,
    y: SIZE - targetHeight - SIZE * 0.1,
    width: targetWidth,
    height: targetHeight,
  };
}

async function removeBg(dataUrl) {
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await removeBackground(dataUrl);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

async function blobToByteArray(blob) {
  const buf = await blob.arrayBuffer();
  return Array.from(new Uint8Array(buf));
}

// El recorte de fondo a veces le asigna transparencia parcial a zonas
// oscuras/brillantes de la etiqueta (las confunde con fondo), dejando
// "huecos" en la silueta. Esos huecos dejan a la IA inventar texto ahí
// — tanto al generar como al "pegar de vuelta". La solución es un cierre
// morfológico: difuminar el canal alfa para que los huecos rodeados de
// botella se rellenen, y usar SIEMPRE los píxeles de la foto original
// (no el recorte) dentro de esa silueta ya cerrada, sin depender de qué
// tan preciso sea el alfa ahí.
async function buildAssets(originalDataUrl, noBgDataUrl) {
  const [orig, noBg] = await Promise.all([loadImage(originalDataUrl), loadImage(noBgDataUrl)]);
  const placement = computePlacement(orig.width, orig.height);

  const origCanvas = document.createElement("canvas");
  origCanvas.width = SIZE;
  origCanvas.height = SIZE;
  const octx = origCanvas.getContext("2d");
  octx.drawImage(orig, placement.x, placement.y, placement.width, placement.height);
  const origData = octx.getImageData(0, 0, SIZE, SIZE);

  const alphaCanvas = document.createElement("canvas");
  alphaCanvas.width = SIZE;
  alphaCanvas.height = SIZE;
  const actx = alphaCanvas.getContext("2d");
  actx.drawImage(noBg, placement.x, placement.y, placement.width, placement.height);
  const alphaSrc = actx.getImageData(0, 0, SIZE, SIZE);
  const grayData = actx.createImageData(SIZE, SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const a = alphaSrc.data[i * 4 + 3];
    grayData.data[i * 4] = a;
    grayData.data[i * 4 + 1] = a;
    grayData.data[i * 4 + 2] = a;
    grayData.data[i * 4 + 3] = 255;
  }
  actx.putImageData(grayData, 0, 0);

  // cierre morfológico: difumina el canal alfa para rellenar huecos internos
  const closedCanvas = document.createElement("canvas");
  closedCanvas.width = SIZE;
  closedCanvas.height = SIZE;
  const cctx = closedCanvas.getContext("2d");
  cctx.filter = "blur(14px)";
  cctx.drawImage(alphaCanvas, 0, 0);
  const closedData = cctx.getImageData(0, 0, SIZE, SIZE);

  const preserve = new Uint8Array(SIZE * SIZE);
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = SIZE;
  maskCanvas.height = SIZE;
  const mctx = maskCanvas.getContext("2d");
  const maskOut = mctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const keep = closedData.data[i * 4] > 40;
    preserve[i] = keep ? 1 : 0;
    const v = keep ? 0 : 255;
    maskOut.data[i * 4] = v;
    maskOut.data[i * 4 + 1] = v;
    maskOut.data[i * 4 + 2] = v;
    maskOut.data[i * 4 + 3] = 255;
  }
  mctx.putImageData(maskOut, 0, 0);
  // suaviza apenas el borde de la máscara final (no reabre los huecos: ya están cerrados)
  const maskSoftCanvas = document.createElement("canvas");
  maskSoftCanvas.width = SIZE;
  maskSoftCanvas.height = SIZE;
  const msctx = maskSoftCanvas.getContext("2d");
  msctx.filter = "blur(3px)";
  msctx.drawImage(maskCanvas, 0, 0);

  // imagen plana para enviar como "image": foto real sobre fondo neutro
  const flatCanvas = document.createElement("canvas");
  flatCanvas.width = SIZE;
  flatCanvas.height = SIZE;
  const fctx = flatCanvas.getContext("2d");
  fctx.fillStyle = "#888888";
  fctx.fillRect(0, 0, SIZE, SIZE);
  fctx.drawImage(orig, placement.x, placement.y, placement.width, placement.height);

  // recorte "restaurable": píxeles de la foto ORIGINAL (no el alfa del recorte)
  // dentro de la silueta ya cerrada — para pegar de vuelta sin huecos
  const restoreCanvas = document.createElement("canvas");
  restoreCanvas.width = SIZE;
  restoreCanvas.height = SIZE;
  const rctx = restoreCanvas.getContext("2d");
  const restoreData = rctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (preserve[i]) {
      restoreData.data[i * 4] = origData.data[i * 4];
      restoreData.data[i * 4 + 1] = origData.data[i * 4 + 1];
      restoreData.data[i * 4 + 2] = origData.data[i * 4 + 2];
      restoreData.data[i * 4 + 3] = 255;
    }
  }
  rctx.putImageData(restoreData, 0, 0);

  const [imageBlob, maskBlob] = await Promise.all([
    new Promise((res) => flatCanvas.toBlob(res, "image/png")),
    new Promise((res) => maskSoftCanvas.toBlob(res, "image/png")),
  ]);
  return { imageBlob, maskBlob, restoreDataUrl: restoreCanvas.toDataURL("image/png") };
}

// Pega los píxeles reales de la botella (ya restaurados sin huecos) encima
// del fondo generado por la IA, así el resultado nunca depende de que el
// modelo "adivine" bien letras o logos finos.
function pasteBackOriginal(resultDataUrl, restoreDataUrl) {
  return new Promise((resolve, reject) => {
    const result = new Image();
    result.onload = () => {
      const restore = new Image();
      restore.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(result, 0, 0, SIZE, SIZE);
        ctx.drawImage(restore, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL("image/png"));
      };
      restore.onerror = reject;
      restore.src = restoreDataUrl;
    };
    result.onerror = reject;
    result.src = resultDataUrl;
  });
}

export default function AttarPhotoStudio({ onExit }) {
  const inputRef = useRef(null);

  const [originalDataUrl, setOriginalDataUrl] = useState(null);
  const [noBgDataUrl, setNoBgDataUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [sceneId, setSceneId] = useState("marmol");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setNoBgDataUrl(null);
    setResultUrl(null);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage(e) {
    e.stopPropagation();
    setOriginalDataUrl(null);
    setNoBgDataUrl(null);
    setResultUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function fetchInpainted(imageBlob, maskBlob) {
    const [imageB64, mask] = await Promise.all([blobToBase64(imageBlob), blobToByteArray(maskBlob)]);
    const res = await fetch("/api/estudio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style: sceneId, imageB64, mask }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return `data:${data.mimeType};base64,${data.imageData}`;
  }

  async function generate() {
    if (!originalDataUrl) { setError("Sube una foto primero."); return; }
    setError("");
    try {
      let noBg = noBgDataUrl;
      if (!noBg) {
        setBusy("recortando");
        noBg = await removeBg(originalDataUrl);
        setNoBgDataUrl(noBg);
      }
      setBusy("preparando");
      const { imageBlob, maskBlob, restoreDataUrl: restored } = await buildAssets(originalDataUrl, noBg);
      setBusy("generando");
      const aiResult = await fetchInpainted(imageBlob, maskBlob);
      setBusy("ajustando");
      const final = await pasteBackOriginal(aiResult, restored);
      setResultUrl(final);
    } catch (e) {
      setError("No se pudo generar la foto: " + e.message);
    }
    setBusy("");
  }

  function selectScene(id) {
    setSceneId(id);
  }

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.download = `attarhouse_${sceneId}.png`;
    a.href = resultUrl;
    a.click();
  };

  return (
    <div className="ps-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="ps-top">
        <div className="ps-mark">Attar House<span>Estudio Fotográfico</span></div>
        <div className="ps-spacer" />
        {onExit && <button className="ps-btn ghost" onClick={onExit}>Salir</button>}
      </header>

      <div className="ps-shell">
        <aside className="ps-controls">
          <div className="ps-card">
            <h2 className="ps-card-title">1. Sube tu Perfume</h2>
            <p className="ps-hint">El fondo se recorta automáticamente en tu navegador.</p>
            <div className="ps-upload" onClick={() => inputRef.current?.click()}>
              {originalDataUrl ? (
                <div className="ps-preview-wrap">
                  <img src={originalDataUrl} alt="Vista previa" className="ps-preview-img" />
                  <button className="ps-remove" onClick={removeImage}>✕</button>
                </div>
              ) : (
                <div className="ps-upload-ph">
                  <span className="ps-upload-icon">⬆</span>
                  <span>Haz clic para subir</span>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} style={{ display: "none" }} />
          </div>

          <div className="ps-card">
            <h2 className="ps-card-title">2. Escena (generada por IA)</h2>
            <div className="ps-scenes">
              {SCENES.map((s) => (
                <button key={s.id} className={`ps-scene ${sceneId === s.id ? "on" : ""}`} onClick={() => selectScene(s.id)}>
                  <div className="ps-scene-swatch" style={{ background: s.swatch }} />
                  <div className="ps-scene-info">
                    <span className="ps-scene-label">{s.label}</span>
                    <span className="ps-scene-desc">{s.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="ps-error">{error}</div>}

          <button className={busy ? "ps-genbtn busy" : "ps-genbtn"} onClick={generate} disabled={!!busy || !originalDataUrl}>
            {busy === "recortando" ? "Recortando fondo…"
              : busy === "preparando" ? "Preparando máscara…"
              : busy === "generando" ? "Generando ambiente con IA…"
              : busy === "ajustando" ? "Restaurando botella…"
              : resultUrl ? "🔀 Generar variación" : "✦ Generar Foto"}
          </button>
          {noBgDataUrl && !busy && (
            <p className="ps-hint" style={{ textAlign: "center", marginTop: -4 }}>
              Recorte ya guardado — la próxima variación será más rápida.
            </p>
          )}
          {resultUrl && (
            <button className="ps-dlbtn" onClick={download} disabled={!!busy}>
              ⬇ Descargar PNG (1024×1024)
            </button>
          )}
        </aside>

        <section className={“ps-canvas”}>
          <div className={“ps-box”}>
            {resultUrl
              ? <img src={resultUrl} alt=”Resultado” className={“ps-result-img”} />
              : (
                <div className={“ps-ph”}>
                  <span style={{ fontSize: “2.5rem”, opacity: 0.3 }}>{“🖼”}</span>
                  <p>{busy ? “” : originalDataUrl ? “Pulsa Generar Foto” : “Sube una foto para comenzar”}</p>
                </div>
              )
            }
            {busy && (
              <div className={“ps-overlay”}>
                <div className={“ps-ring”} />
                <p className={“ps-overlay-label”}>
                  {busy === “recortando” ? “Recortando fondo…”
                    : busy === “preparando” ? “Preparando mascara…”
                    : busy === “generando” ? “IA generando ambiente…”
                    : “Restaurando botella…”}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const CSS = `
.ps-page{--ink:#0c0b09;--gold:#d4af37;--cream:#f3ede1;--smoke:#8c857a;--line:rgba(212,175,55,.22);
  position:fixed;inset:0;overflow:auto;background:var(--ink);color:var(--cream);font-family:var(--font-inter-studio),system-ui,sans-serif;z-index:2000}
.ps-page *{box-sizing:border-box}
.ps-top{display:flex;align-items:center;gap:18px;padding:14px 24px;border-bottom:1px solid var(--line);background:rgba(21,18,12,.7);position:sticky;top:0;z-index:10}
.ps-mark{font-family:var(--font-cormorant),serif;font-size:22px}
.ps-mark span{display:block;font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:var(--smoke);margin-top:4px}
.ps-spacer{flex:1}
.ps-btn{border:1px solid var(--gold);border-radius:999px;background:transparent;color:var(--cream);font-weight:600;font-size:13px;padding:8px 16px;cursor:pointer}
.ps-shell{max-width:1100px;margin:0 auto;padding:32px 24px;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.ps-controls{display:flex;flex-direction:column;gap:16px}
.ps-card{background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px}
.ps-card-title{font-size:.9rem;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;font-weight:700}
.ps-hint{font-size:.78rem;color:#666;margin:0 0 12px}
.ps-upload{display:flex;align-items:center;justify-content:center;width:100%;height:120px;border:2px dashed #2a2a2a;border-radius:10px;cursor:pointer;background:#0d0d0d;overflow:hidden}
.ps-upload:hover{border-color:var(--gold)}
.ps-upload-ph{display:flex;flex-direction:column;align-items:center;gap:4px;color:#555;font-size:.85rem}
.ps-upload-icon{font-size:1.5rem;color:var(--gold)}
.ps-preview-wrap{position:relative;height:100%;display:flex;align-items:center;justify-content:center;padding:8px}
.ps-preview-img{max-height:100px;max-width:100%;object-fit:contain;border-radius:6px}
.ps-remove{position:absolute;top:4px;right:4px;background:#c0392b;color:#fff;border:none;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:.7rem}
.ps-scenes{display:flex;flex-direction:column;gap:7px}
.ps-scene{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:9px 12px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px}
.ps-scene.on{border-color:var(--gold);background:rgba(212,175,55,.07)}
.ps-scene-swatch{width:30px;height:30px;border-radius:6px;flex:0 0 auto;border:1px solid rgba(255,255,255,.08)}
.ps-scene-info{display:flex;flex-direction:column;gap:2px;flex:1;text-align:left}
.ps-scene-label{font-size:.83rem;font-weight:600;color:var(--cream)}
.ps-scene.on .ps-scene-label{color:var(--gold)}
.ps-scene-desc{font-size:.7rem;color:#666}
.ps-error{background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.4);color:#e07070;border-radius:8px;padding:10px 14px;font-size:.82rem}
.ps-genbtn{background:var(--gold);color:#000;border:none;border-radius:10px;padding:14px;font-size:.9rem;font-weight:700;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:10px}
.ps-genbtn:disabled{opacity:.4;cursor:not-allowed}
.ps-genbtn.busy::before{content:'';width:16px;height:16px;border:2px solid rgba(0,0,0,.25);border-top-color:#000;border-radius:50%;animation:ps-spin .75s linear infinite;flex:0 0 auto}
@keyframes ps-spin{to{transform:rotate(360deg)}}
.ps-dlbtn{background:transparent;border:1px solid var(--gold);color:var(--gold);border-radius:10px;padding:13px;font-size:.88rem;font-weight:600;cursor:pointer;width:100%}
.ps-dlbtn:disabled{opacity:.4;cursor:not-allowed}
.ps-canvas{position:sticky;top:76px;display:flex;justify-content:center;min-height:300px}
.ps-box{position:relative;width:100%;max-width:480px;aspect-ratio:1/1;border-radius:10px;overflow:hidden;box-shadow:0 30px 80px -30px rgba(0,0,0,.8);background:#0d0d0d}
.ps-result-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.ps-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#555;font-size:.85rem;text-align:center;padding:0 20px}
.ps-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(12,11,9,.72);backdrop-filter:blur(6px)}
.ps-ring{width:52px;height:52px;border:3px solid rgba(212,175,55,.2);border-top-color:var(--gold);border-radius:50%;animation:ps-spin .85s linear infinite}
.ps-overlay-label{font-size:.82rem;color:var(--cream);opacity:.75;margin:0;letter-spacing:.04em}
@media (max-width:860px){.ps-shell{grid-template-columns:1fr}.ps-canvas{position:static}}
`;
