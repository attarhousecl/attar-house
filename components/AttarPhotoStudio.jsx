"use client";
/**
 * Attar House · Estudio Fotográfico
 * Recorta el fondo de la foto subida (100% en el navegador, sin API externa)
 * y la coloca sobre un fondo de estudio generado por capas de CSS/SVG.
 * Cada escena tiene una semilla aleatoria (luz, brillos, hojas) que se puede
 * regenerar con "Generar variación", para que no todas las fotos salgan iguales.
 */
import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { SCENES, BACKDROP_SIZE as SIZE, makeSeed, Backdrop, GroundShadow } from "./proceduralBackdrops";

function prepareCutout(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      const targetHeight = SIZE * 0.66;
      const scale = targetHeight / img.height;
      const targetWidth = img.width * scale;
      const x = (SIZE - targetWidth) / 2;
      const y = SIZE - targetHeight - SIZE * 0.1;
      ctx.drawImage(img, x, y, targetWidth, targetHeight);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
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

export default function AttarPhotoStudio({ onExit }) {
  const inputRef = useRef(null);
  const stageRef = useRef(null);
  const areaRef = useRef(null);

  const [originalDataUrl, setOriginalDataUrl] = useState(null);
  const [cutoutUrl, setCutoutUrl] = useState(null);
  const [sceneId, setSceneId] = useState("marmol");
  const [seed, setSeed] = useState(() => makeSeed("marmol"));
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const fit = () => {
      const a = areaRef.current;
      if (!a) return;
      setScale(Math.min((a.clientWidth - 32) / SIZE, (a.clientHeight - 32) / SIZE, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (areaRef.current) ro.observe(areaRef.current);
    return () => ro.disconnect();
  }, []);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setCutoutUrl(null);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage(e) {
    e.stopPropagation();
    setOriginalDataUrl(null);
    setCutoutUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectScene(id) {
    setSceneId(id);
    setSeed(makeSeed(id));
  }

  function shuffle() {
    setSeed(makeSeed(sceneId));
  }

  async function generate() {
    if (!originalDataUrl) { setError("Sube una foto primero."); return; }
    setError("");
    setBusy("recortando");
    try {
      const noBg = await removeBg(originalDataUrl);
      setBusy("posicionando");
      const positioned = await prepareCutout(noBg);
      setCutoutUrl(positioned);
    } catch (e) {
      setError("No se pudo recortar el fondo: " + e.message);
    }
    setBusy("");
  }

  const download = async () => {
    if (!stageRef.current) return;
    setBusy("exportando");
    try {
      const url = await toPng(stageRef.current, {
        width: SIZE, height: SIZE, pixelRatio: 1, cacheBust: true,
        style: { transform: "none", transformOrigin: "top left", margin: "0" },
      });
      const a = document.createElement("a");
      a.download = `attarhouse_${sceneId}.png`;
      a.href = url;
      a.click();
    } catch (e) {
      setError("No se pudo exportar: " + e.message);
    }
    setBusy("");
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
            <h2 className="ps-card-title">2. Escena</h2>
            <div className="ps-scenes">
              {SCENES.map((s) => (
                <button key={s.id} className={`ps-scene ${sceneId === s.id ? "on" : ""}`} onClick={() => selectScene(s.id)}>
                  <span className="ps-scene-label">{s.label}</span>
                  <span className="ps-scene-desc">{s.desc}</span>
                </button>
              ))}
            </div>
            <button className="ps-shuffle" onClick={shuffle}>🔀 Generar variación</button>
          </div>

          {error && <div className="ps-error">{error}</div>}

          <button className="ps-genbtn" onClick={generate} disabled={!!busy || !originalDataUrl}>
            {busy === "recortando" ? "Recortando fondo…" : busy === "posicionando" ? "Posicionando…" : "✦ Recortar y posicionar"}
          </button>
          {cutoutUrl && (
            <button className="ps-dlbtn" onClick={download} disabled={!!busy}>
              {busy === "exportando" ? "Exportando…" : "⬇ Descargar PNG (1024×1024)"}
            </button>
          )}
        </aside>

        <section className="ps-canvas" ref={areaRef}>
          <div className="ps-viewport" style={{ width: SIZE * scale, height: SIZE * scale }}>
            <div className="ps-frame" ref={stageRef} style={{ width: SIZE, height: SIZE, transform: `scale(${scale})` }}>
              <Backdrop seed={seed} />
              {cutoutUrl && <GroundShadow shadowScale={seed.shadowScale} />}
              {cutoutUrl ? (
                <img src={cutoutUrl} alt="Resultado" className="ps-result-img" />
              ) : (
                <div className="ps-ph">
                  <span style={{ fontSize: "2.5rem", opacity: 0.3 }}>🖼</span>
                  <p>{originalDataUrl ? "Pulsa “Recortar y posicionar”" : "Sube una foto para comenzar"}</p>
                </div>
              )}
            </div>
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
.ps-scenes{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.ps-scene{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px 14px;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:2px}
.ps-scene.on{border-color:var(--gold);background:rgba(212,175,55,.07)}
.ps-scene-label{font-size:.85rem;font-weight:600;color:var(--cream)}
.ps-scene.on .ps-scene-label{color:var(--gold)}
.ps-scene-desc{font-size:.72rem;color:#666}
.ps-shuffle{width:100%;border:1px dashed var(--line);background:transparent;color:var(--smoke);border-radius:8px;padding:10px;font-size:.8rem;cursor:pointer}
.ps-shuffle:hover{border-color:var(--gold);color:var(--gold)}
.ps-error{background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.4);color:#e07070;border-radius:8px;padding:10px 14px;font-size:.82rem}
.ps-genbtn{background:var(--gold);color:#000;border:none;border-radius:10px;padding:14px;font-size:.9rem;font-weight:700;cursor:pointer;width:100%}
.ps-genbtn:disabled{opacity:.4;cursor:not-allowed}
.ps-dlbtn{background:transparent;border:1px solid var(--gold);color:var(--gold);border-radius:10px;padding:13px;font-size:.88rem;font-weight:600;cursor:pointer;width:100%}
.ps-dlbtn:disabled{opacity:.4;cursor:not-allowed}
.ps-canvas{position:sticky;top:76px;display:flex;justify-content:center;min-height:300px}
.ps-viewport{position:relative;border-radius:10px;overflow:hidden;box-shadow:0 30px 80px -30px rgba(0,0,0,.8)}
.ps-frame{position:relative;transform-origin:top left;border-radius:10px;overflow:hidden}
.ps-result-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.ps-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#555;font-size:.85rem;text-align:center;padding:0 20px}
@media (max-width:860px){.ps-shell{grid-template-columns:1fr}.ps-canvas{position:static}}
`;
