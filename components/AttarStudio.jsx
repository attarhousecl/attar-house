'use client';
/**
 * Attar House · Estudio Publicitario
 * Componente React para tu admin (Next.js + Supabase).
 *
 * Requisitos:
 *   npm i html-to-image
 *   Fuentes: Cormorant Garamond + Inter (next/font o <link> de Google Fonts).
 *
 * Uso (App Router) — app/admin/publicidad/page.js:
 *   'use client';
 *   import { createBrowserClient } from '@supabase/ssr';     // o tu cliente browser existente
 *   import AttarStudio from '@/components/AttarStudio';
 *   const supabase = createBrowserClient(URL, ANON_KEY);
 *   export default function Page(){ return <AttarStudio supabase={supabase} />; }
 *
 * Props:
 *   supabase  -> tu cliente browser de @supabase/supabase-js (con sesión iniciada)
 *   onExit?   -> callback opcional para cerrar/volver
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { SCENES as BG_SCENES, makeSeed as makeBgSeed, Backdrop as ProceduralBackdrop } from './proceduralBackdrops';

const DIM = {
  story:  { w: 1080, h: 1920, label: 'Story · 9:16' },
  feed:   { w: 1080, h: 1080, label: 'Feed · 1:1' },
  feed45: { w: 1080, h: 1350, label: 'Feed · 4:5' },
};

const TEMPLATES = [
  { id: 'producto',    label: 'Producto' },
  { id: 'versus',      label: 'Versus' },
  { id: 'tabla',       label: 'Tabla' },
  { id: 'promo',       label: 'Promo' },
  { id: 'lanzamiento', label: 'Lanzamiento' },
  { id: 'inspirado',   label: 'Inspirado en' },
  { id: 'testimonio',  label: 'Testimonio' },
  { id: 'comparativa', label: 'Precios' },
  { id: 'countdown',   label: 'Urgencia' },
  { id: 'carrusel',    label: 'Carrusel' },
];

// Todas las plantillas admiten fondo de escena procedural + texto libre movible
const SCENE_CAPABLE = ['producto', 'versus', 'tabla', 'promo', 'lanzamiento', 'inspirado', 'testimonio', 'comparativa', 'countdown', 'carrusel'];

const THEMES = [
  { id: 'noir',     label: 'Noir',     bg: '#0c0b09', ink: '#f3ede1', muted: '#8c857a', line: 'rgba(243,237,225,.12)' },
  { id: 'ivory',    label: 'Marfil',   bg: '#f3ede1', ink: '#1c1814', muted: '#9a9286', line: 'rgba(28,24,20,.14)' },
  { id: 'burdeos',  label: 'Burdeos',  bg: '#1a0a0d', ink: '#f0e3d8', muted: '#a4827f', line: 'rgba(240,227,216,.14)' },
  { id: 'esmeralda', label: 'Esmeralda', bg: '#07120d', ink: '#eef0e6', muted: '#80a08f', line: 'rgba(238,240,230,.14)' },
];
const themeOf = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

const clp = (n) => '$' + Number(n || 0).toLocaleString('es-CL');

// Normaliza notes (jsonb): array de strings u objetos {name}
const perfumeNotes = (p) => {
  const arr = Array.isArray(p?.notes) ? p.notes : [];
  return arr.map((n) => (typeof n === 'string' ? n : n?.name || '')).filter(Boolean);
};
// Línea de formatos disponibles con precio
const perfumeMeta = (p) => {
  const parts = [];
  if (p?.stock_decant3  && p?.price_decant3)  parts.push(`3ml ${clp(p.price_decant3)}`);
  if (p?.stock_decant5  && p?.price_decant5)  parts.push(`5ml ${clp(p.price_decant5)}`);
  if (p?.stock_decant10 && p?.price_decant10) parts.push(`10ml ${clp(p.price_decant10)}`);
  if (p?.stock_sellado  && p?.price_sellado)  parts.push(`Sellado ${clp(p.price_sellado)}`);
  return parts.join(' · ') || 'Consultar formatos';
};
const lowestPrice = (p) => {
  const vals = [p?.price_decant3, p?.price_decant5, p?.price_decant10, p?.price_sellado].filter((x) => x > 0);
  return vals.length ? Math.min(...vals) : 0;
};
// Filas de precios por formato para la plantilla "Precios" (comparativa)
const priceRows = (p) => ([
  { label: '3ml decant', price: p?.stock_decant3 && p?.price_decant3 ? clp(p.price_decant3) : 'No disponible', best: false },
  { label: '5ml decant', price: p?.stock_decant5 && p?.price_decant5 ? clp(p.price_decant5) : 'No disponible', best: false },
  { label: '10ml decant', price: p?.stock_decant10 && p?.price_decant10 ? clp(p.price_decant10) : 'No disponible', best: true },
  { label: 'Sellado', price: p?.stock_sellado && p?.price_sellado ? clp(p.price_sellado) : 'No disponible', best: false },
]);

// Vuelca los datos de un perfume del catálogo en todas las plantillas a la vez
// (usado al hacer clic en el catálogo y al generar en lote)
const mapPerfumeToContent = (p, c) => {
  const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
  const img = p.image_url || null;
  const slides = c.carrusel.slides.slice();
  const i = c.carrusel.activeSlide;
  slides[i] = { ...slides[i], eyebrow: p.brand, name: p.name, notes, price: clp(lowestPrice(p)), img };
  return {
    ...c,
    producto:    { ...c.producto, eyebrow: p.brand, name: p.name, notes, meta: perfumeMeta(p), img },
    lanzamiento: { ...c.lanzamiento, name: p.name, notes, eyebrow: 'Nuevo en Attar House', img },
    promo:       { ...c.promo, name: p.name, notes, price: clp(lowestPrice(p)), img },
    versus:      { ...c.versus, lHead: p.name, lSub: p.description || c.versus.lSub, img },
    inspirado:   { ...c.inspirado, name: p.name, target: p.inspiration || c.inspirado.target, notes, meta: perfumeMeta(p), img },
    comparativa: { ...c.comparativa, name: p.name, img, rows: priceRows(p) },
    countdown:   { ...c.countdown, name: p.name, notes, price: clp(lowestPrice(p)), img },
    carrusel:    { ...c.carrusel, slides },
  };
};

// Capas de texto libre movibles + oscurecido de fondo, comunes a todas las plantillas
const FREE = { texts: [], scrim: 0 };

let TEXT_SEQ = 0;
const newText = (over = {}) => ({
  id: 't' + (TEXT_SEQ++) + Math.random().toString(36).slice(2, 7),
  text: 'Texto nuevo',
  x: 50, y: 50, size: 46, width: 80,
  color: 'ink', font: 'serif', weight: 600, align: 'center',
  spacing: 0, line: 1.15, upper: false, rotate: 0, pill: false,
  ...over,
});

const defaultContent = () => ({
  versus: {
    lHead: 'Attar House', lSub: 'Aroma potente y duradero. Asesoría real, no algoritmo.',
    rHead: 'Otros', rSub: 'Aromas que se desvanecen rápido.', img: null, rImg: null, extra: '', imgScale: 1, rImgScale: 1,
    bg: 'solido', bgSeed: null, ...FREE,
  },
  tabla: {
    title: 'Por qué somos tu mejor opción',
    img: null, extra: '', imgScale: 1, bg: 'solido', bgSeed: null, ...FREE,
    rows: [
      { feat: 'Fragancias originales', o: 'x' },
      { feat: 'Asesoría personal', o: 'x' },
      { feat: 'Pago contra entrega en Valdivia', o: 'dash' },
      { feat: 'Respuesta rápida', o: 'dash' },
      { feat: 'Envío gratis sobre el monto', o: 'dash' },
    ],
  },
  producto: { eyebrow: 'Casa', name: 'Elige un perfume', notes: '—', meta: 'Decant · Sellado', chip: 'Disponible en Valdivia', img: null, bg: 'solido', bgSeed: null, extra: '', imgScale: 1, ...FREE },
  promo:    { eyebrow: 'Oferta', name: 'Nombre del perfume', notes: '—', from: '', price: '', chip: 'Solo esta semana', img: null, bg: 'solido', bgSeed: null, extra: '', imgScale: 1, ...FREE },
  lanzamiento: { eyebrow: 'Nuevo en Attar House', name: 'Nombre del perfume', notes: '—', meta: 'Ya disponible', img: null, bg: 'solido', bgSeed: null, extra: '', imgScale: 1, ...FREE },
  inspirado: { eyebrow: 'Inspirado en', target: 'Fragancia original', name: 'Nuestra versión', notes: '—', meta: 'Desde · decant', img: null, bg: 'solido', bgSeed: null, extra: '', imgScale: 1, ...FREE },
  testimonio: {
    quote: '"Llegó antes de lo esperado y el aroma dura todo el día. Mi favorito hasta ahora."',
    name: 'Camila R.', location: 'Valdivia', stars: 5, img: null, extra: '', imgScale: 1, bg: 'solido', bgSeed: null, ...FREE,
  },
  comparativa: {
    eyebrow: 'Formatos', name: 'Elige un perfume', img: null, bg: 'solido', bgSeed: null, extra: '', imgScale: 1, ...FREE,
    rows: [
      { label: '3ml decant', price: '', best: false },
      { label: '5ml decant', price: '', best: false },
      { label: '10ml decant', price: '', best: true },
      { label: 'Sellado', price: '', best: false },
    ],
  },
  countdown: {
    eyebrow: 'Oferta relámpago', name: 'Nombre del perfume', notes: '—', endsText: 'Termina en 24 horas',
    price: '', chip: 'Stock limitado', img: null, bg: 'solido', bgSeed: null, extra: '', imgScale: 1, ...FREE,
  },
  carrusel: {
    activeSlide: 0, bg: 'solido', bgSeed: null, ...FREE,
    slides: [
      { eyebrow: 'Casa', name: 'Perfume 1', notes: '—', price: '', img: null, extra: '', imgScale: 1 },
      { eyebrow: 'Casa', name: 'Perfume 2', notes: '—', price: '', img: null, extra: '', imgScale: 1 },
      { eyebrow: 'Casa', name: 'Perfume 3', notes: '—', price: '', img: null, extra: '', imgScale: 1 },
    ],
  },
});

export default function AttarStudio({ supabase, onExit }) {
  const [format, setFormat]   = useState('story');
  const [theme, setTheme]     = useState('noir');
  const [accent, setAccent]   = useState('#c6a15b');
  const [tpl, setTpl]         = useState('producto');
  const [content, setContent] = useState(defaultContent);
  const [perfumeId, setPerfumeId] = useState(null);

  const [products, setProducts] = useState([]);
  const [query, setQuery]   = useState('');
  const [tab, setTab]       = useState('design');  // design | catalog | saved
  const [selectedIds, setSelectedIds] = useState([]); // selección para generar en lote
  const [batchProgress, setBatchProgress] = useState(null); // {i, total} mientras genera
  const [designs, setDesigns] = useState([]);
  const [designId, setDesignId] = useState(null);
  const [title, setTitle]   = useState('Sin título');
  const [busy, setBusy]     = useState('');
  const [scale, setScale]   = useState(0.4);
  const [logo, setLogoState] = useState(null); // logo propio, persiste en este navegador
  const [logoScale, setLogoScaleState] = useState(1); // tamaño del logo, persiste igual

  const stageRef = useRef(null);
  const areaRef  = useRef(null);

  // ---- cargar logo guardado en este navegador ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem('attarhouse_studio_logo');
      if (saved) setLogoState(saved);
      const savedScale = parseFloat(localStorage.getItem('attarhouse_studio_logo_scale'));
      if (savedScale > 0) setLogoScaleState(savedScale);
    } catch { /* localStorage no disponible */ }
  }, []);

  const setLogo = (dataUrl) => {
    setLogoState(dataUrl);
    try {
      if (dataUrl) localStorage.setItem('attarhouse_studio_logo', dataUrl);
      else localStorage.removeItem('attarhouse_studio_logo');
    } catch { /* localStorage no disponible */ }
  };

  const setLogoScale = (scale) => {
    setLogoScaleState(scale);
    try { localStorage.setItem('attarhouse_studio_logo_scale', String(scale)); } catch { /* localStorage no disponible */ }
  };

  const onUploadLogo = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setLogo(ev.target.result);
    r.readAsDataURL(f);
  };

  // ---- cargar catálogo ----
  useEffect(() => {
    if (!supabase) return;
    supabase.from('perfumes')
      .select('id,brand,name,notes,families,image_url,inspiration,description,price_sellado,price_decant10,price_decant5,price_decant3,stock_sellado,stock_decant10,stock_decant5,stock_decant3,popularity')
      .order('popularity', { ascending: false })
      .then(({ data }) => setProducts(data || []));
  }, [supabase]);

  // ---- cargar diseños guardados ----
  const loadDesigns = useCallback(() => {
    if (!supabase) return;
    supabase.from('studio_designs')
      .select('id,title,template,format,theme,accent,content,perfume_id,thumbnail_url,created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setDesigns(data || []));
  }, [supabase]);
  useEffect(() => { if (tab === 'saved') loadDesigns(); }, [tab, loadDesigns]);

  // ---- ajustar escala del preview ----
  useEffect(() => {
    const fit = () => {
      const a = areaRef.current; if (!a) return;
      const { w, h } = DIM[format];
      setScale(Math.min((a.clientWidth - 64) / w, (a.clientHeight - 64) / h, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (areaRef.current) ro.observe(areaRef.current);
    return () => ro.disconnect();
  }, [format]);

  // ---- helpers de estado ----
  const patch = (fields) => setContent((c) => ({ ...c, [tpl]: { ...c[tpl], ...fields } }));
  const patchSlide = (fields) => setContent((c) => {
    const slides = c.carrusel.slides.slice();
    const i = c.carrusel.activeSlide;
    slides[i] = { ...slides[i], ...fields };
    return { ...c, carrusel: { ...c.carrusel, slides } };
  });
  // arrastrar una capa de texto sobre la vista previa -> actualiza su posición
  const dragText = useCallback((id, x, y) => {
    setContent((c) => {
      const t = c[tpl];
      if (!t || !t.texts) return c;
      return { ...c, [tpl]: { ...t, texts: t.texts.map((l) => (l.id === id ? { ...l, x, y } : l)) } };
    });
  }, [tpl]);
  const cur = content[tpl];
  const curSlide = tpl === 'carrusel' ? cur.slides[cur.activeSlide] : null;

  const applyPerfume = (p) => {
    setPerfumeId(p.id);
    setContent((c) => mapPerfumeToContent(p, c));
    setTab('design');
  };

  const onUpload = (e, field = 'img') => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => (tpl === 'carrusel' ? patchSlide({ [field]: ev.target.result }) : patch({ [field]: ev.target.result }));
    r.readAsDataURL(f);
  };

  // ---- fondo de escena procedural (solo plantillas con foto de producto) ----
  const setBgScene = (sceneId) => patch({ bg: sceneId, bgSeed: sceneId === 'solido' ? null : makeBgSeed(sceneId) });
  const shuffleBg = () => patch({ bgSeed: makeBgSeed(cur.bg) });

  // ---- render del PNG ----
  // Importante: el lienzo se muestra reducido con transform:scale en el preview.
  // Para exportar a 1080 real, forzamos transform:none solo en la copia capturada.
  const renderPng = async () => {
    const { w, h } = DIM[format];
    return toPng(stageRef.current, {
      width: w, height: h, pixelRatio: 1, cacheBust: true, backgroundColor: null,
      style: { transform: 'none', transformOrigin: 'top left', margin: '0' },
    });
  };

  const download = async () => {
    setBusy('export');
    try {
      const url = await renderPng();
      const a = document.createElement('a');
      a.download = `attarhouse_${tpl}_${format}.png`; a.href = url; a.click();
    } catch (e) { alert('No se pudo exportar: ' + e.message); }
    setBusy('');
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---- exporta las 3 tarjetas del carrusel, una por una ----
  const downloadCarousel = async () => {
    setBusy('export');
    try {
      for (let i = 0; i < cur.slides.length; i++) {
        patch({ activeSlide: i });
        await wait(300); // deja repintar el lienzo (cambio de slide + carga de imagen)
        const url = await renderPng();
        const a = document.createElement('a');
        a.download = `attarhouse_carrusel_${i + 1}_${format}.png`; a.href = url; a.click();
        await wait(350); // evita que el navegador bloquee descargas múltiples seguidas
      }
    } catch (e) { alert('No se pudo exportar el carrusel: ' + e.message); }
    setBusy('');
  };

  const toggleSelect = (id) => setSelectedIds((ids) => (
    ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  ));

  // ---- genera una imagen por cada perfume seleccionado, en lote ----
  const batchGenerate = async () => {
    const picked = products.filter((p) => selectedIds.includes(p.id));
    if (!picked.length) return;
    setBusy('batch');
    try {
      for (let i = 0; i < picked.length; i++) {
        setBatchProgress({ i: i + 1, total: picked.length });
        const p = picked[i];
        setContent((c) => mapPerfumeToContent(p, c));
        await wait(400); // deja que la imagen del producto cargue antes de capturar
        const url = await renderPng();
        const a = document.createElement('a');
        const slug = `${p.brand}_${p.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        a.download = `attarhouse_${tpl}_${slug}.png`; a.href = url; a.click();
        await wait(350);
      }
    } catch (e) { alert('No se pudo generar el lote: ' + e.message); }
    setBatchProgress(null);
    setBusy('');
  };

  const save = async () => {
    if (!supabase) { alert('Falta el cliente de Supabase'); return; }
    setBusy('save');
    try {
      const dataUrl = await renderPng();
      const blob = await (await fetch(dataUrl)).blob();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión iniciada');
      const id = designId || (crypto?.randomUUID?.() ?? `${Date.now()}`);
      const path = `${user.id}/${id}.png`;
      const up = await supabase.storage.from('studio-assets')
        .upload(path, blob, { upsert: true, contentType: 'image/png' });
      if (up.error) throw up.error;
      const { data: { publicUrl } } = supabase.storage.from('studio-assets').getPublicUrl(path);
      const row = {
        id, title, template: tpl, format, theme, accent,
        content: cur, perfume_id: perfumeId, export_url: publicUrl, thumbnail_url: publicUrl,
      };
      const { error } = await supabase.from('studio_designs').upsert(row);
      if (error) throw error;
      setDesignId(id);
      alert('Diseño guardado en tu sitio ✓');
    } catch (e) { alert('No se pudo guardar: ' + e.message); }
    setBusy('');
  };

  const openDesign = (d, duplicate = false) => {
    setDesignId(duplicate ? null : d.id);
    setTitle(duplicate ? `${d.title} (copia)` : d.title);
    setTpl(d.template);
    setFormat(d.format); setTheme(d.theme); setAccent(d.accent || '#c6a15b');
    setPerfumeId(d.perfume_id);
    setContent((c) => ({ ...c, [d.template]: { ...c[d.template], ...(d.content || {}) } }));
    setTab('design');
  };

  const deleteDesign = async (d) => {
    if (!supabase) return;
    if (!confirm(`¿Eliminar "${d.title}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('studio_designs').delete().eq('id', d.id);
    if (error) { alert('No se pudo eliminar: ' + error.message); return; }
    if (designId === d.id) setDesignId(null);
    loadDesigns();
  };

  const filtered = products.filter((p) => {
    const q = query.toLowerCase();
    return !q || `${p.brand} ${p.name}`.toLowerCase().includes(q);
  });

  const { w, h } = DIM[format];
  const tall = format !== 'feed';

  return (
    <div className="attar-studio">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* TOPBAR */}
      <div className="as-top">
        <div className="as-mark">Attar House<span>Estudio</span></div>
        <Seg label="Formato" value={format} onChange={setFormat}
             opts={Object.entries(DIM).map(([k, v]) => [k, v.label])} />
        <Seg label="Tema" value={theme} onChange={setTheme}
             opts={THEMES.map((t) => [t.id, t.label])} />
        <label className="as-accent">Acento
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </label>
        <div className="as-spacer" />
        <input className="as-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        {tpl === 'carrusel' ? (
          <button className="as-btn ghost" disabled={busy} onClick={downloadCarousel}>
            {busy === 'export' ? '…' : `Descargar las ${cur.slides.length} (PNG)`}</button>
        ) : (
          <button className="as-btn ghost" disabled={busy} onClick={download}>
            {busy === 'export' ? '…' : 'Descargar PNG'}</button>
        )}
        <button className="as-btn" disabled={busy} onClick={save}>
          {busy === 'save' ? 'Guardando…' : 'Guardar en mi sitio'}</button>
        {onExit && <button className="as-btn ghost" onClick={onExit}>Salir</button>}
      </div>

      <div className="as-shell">
        {/* CONTROLES */}
        <aside className="as-controls">
          <div className="as-tabs">
            {[['design', 'Diseño'], ['catalog', 'Catálogo'], ['saved', 'Mis diseños']].map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'design' && (
            <>
              <div className="as-card">
                <div className="as-subh" style={{ marginTop: 0 }}>Logo propio</div>
                <p className="as-hint" style={{ marginTop: 0, marginBottom: 10 }}>
                  Se usa en el pie de todas tus plantillas en lugar del texto "Attar House". Se guarda en este navegador.
                </p>
                {logo && (
                  <div className="as-logopreview">
                    <img src={logo} alt="Logo" />
                    <button className="as-mini del" title="Quitar logo" onClick={() => setLogo(null)}>×</button>
                  </div>
                )}
                <label className={`as-upload ${logo ? 'has' : ''}`}>
                  {logo ? 'Logo cargado · cambiar' : 'Subir mi logo'}
                  <input type="file" accept="image/*" onChange={onUploadLogo} hidden />
                </label>
                {logo && (
                  <div className="as-field" style={{ marginTop: 12, marginBottom: 0 }}>
                    <label>Tamaño del logo · {Math.round(logoScale * 100)}%</label>
                    <input
                      type="range" min="0.4" max="3" step="0.1"
                      value={logoScale}
                      onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                      className="as-range"
                    />
                  </div>
                )}
              </div>
              <div className="as-tplgrid">
                {TEMPLATES.map((t) => (
                  <button key={t.id} className={`as-tpl ${tpl === t.id ? 'on' : ''}`} onClick={() => setTpl(t.id)}>{t.label}</button>
                ))}
              </div>
              {SCENE_CAPABLE.includes(tpl) && (
                <div className="as-card">
                  <div className="as-subh" style={{ marginTop: 0 }}>Fondo</div>
                  <div className="as-scenegrid">
                    <button className={`as-scenebtn ${cur.bg === 'solido' ? 'on' : ''}`} onClick={() => setBgScene('solido')}>Sólido</button>
                    {BG_SCENES.map((s) => (
                      <button key={s.id} className={`as-scenebtn ${cur.bg === s.id ? 'on' : ''}`} onClick={() => setBgScene(s.id)}>{s.label}</button>
                    ))}
                  </div>
                  {cur.bg !== 'solido' && (
                    <>
                      <button className="as-shuffle" onClick={shuffleBg}>🔀 Generar variación</button>
                      <div className="as-field" style={{ marginTop: 12, marginBottom: 0 }}>
                        <label>Oscurecer fondo · {cur.scrim || 0}%</label>
                        <input type="range" min="0" max="85" step="5" value={cur.scrim || 0}
                          onChange={(e) => patch({ scrim: parseInt(e.target.value, 10) })} className="as-range" />
                      </div>
                    </>
                  )}
                </div>
              )}
              <Fields tpl={tpl} cur={cur} curSlide={curSlide} patch={patch} patchSlide={patchSlide} onUpload={onUpload}
                      setContent={setContent} />
              <TextLayers cur={cur} patch={patch} />
            </>
          )}

          {tab === 'catalog' && (
            <>
              <input className="as-search" placeholder="Buscar perfume…" value={query}
                     onChange={(e) => setQuery(e.target.value)} />
              {selectedIds.length > 0 && (
                <button className="as-batchbtn" disabled={!!busy} onClick={batchGenerate}>
                  {busy === 'batch'
                    ? `Generando ${batchProgress?.i || 0}/${batchProgress?.total || selectedIds.length}…`
                    : `✦ Generar ${selectedIds.length} imagen${selectedIds.length > 1 ? 'es' : ''} (${tpl})`}
                </button>
              )}
              <div className="as-list">
                {filtered.map((p) => (
                  <div key={p.id} className="as-item">
                    <input
                      type="checkbox"
                      className="as-check"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button className="as-itembody" onClick={() => applyPerfume(p)}>
                      {p.image_url
                        ? <img src={p.image_url} alt="" crossOrigin="anonymous" />
                        : <span className="ph" />}
                      <span className="meta"><b>{p.name}</b><i>{p.brand} · {perfumeNotes(p).slice(0,2).join(', ')}</i></span>
                    </button>
                  </div>
                ))}
                {!filtered.length && <p className="as-empty">Sin resultados.</p>}
              </div>
            </>
          )}

          {tab === 'saved' && (
            <div className="as-saved">
              {designs.map((d) => (
                <div key={d.id} className="as-savedcard">
                  <button className="as-savedbody" onClick={() => openDesign(d)}>
                    {d.thumbnail_url && <img src={d.thumbnail_url} alt="" />}
                    <span><b>{d.title}</b><i>{d.template} · {d.format}</i></span>
                  </button>
                  <button className="as-mini" title="Duplicar" onClick={() => openDesign(d, true)}>⎘</button>
                  <button className="as-mini del" title="Eliminar" onClick={() => deleteDesign(d)}>×</button>
                </div>
              ))}
              {!designs.length && <p className="as-empty">Aún no guardas diseños.</p>}
            </div>
          )}
        </aside>

        {/* PREVIEW */}
        <section className="as-canvas" ref={areaRef}>
          <div className="as-frame" style={{ width: w * scale, height: h * scale }}>
            <Stage stageRef={stageRef} tpl={tpl} cur={cur} curSlide={curSlide} w={w} h={h} tall={tall}
                   theme={theme} accent={accent} scale={scale} logo={logo} logoScale={logoScale} onDragText={dragText} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- Subcomponentes ---------------- */

function Seg({ label, value, onChange, opts }) {
  return (
    <div className="as-group">
      <span className="as-lbl">{label}</span>
      <div className="as-seg">
        {opts.map(([k, l]) => (
          <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multi }) {
  return (
    <div className="as-field">
      <label>{label}</label>
      {multi
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function Upload({ has, onUpload, field = 'img', label = 'Subir foto (PNG sin fondo)' }) {
  return (
    <label className={`as-upload ${has ? 'has' : ''}`}>
      {has ? 'Imagen cargada · cambiar' : label}
      <input type="file" accept="image/*" onChange={(e) => onUpload(e, field)} hidden />
    </label>
  );
}

function SizeSlider({ value, onChange, label = 'Tamaño de la foto' }) {
  return (
    <div className="as-field" style={{ marginTop: -4 }}>
      <label>{label} · {Math.round((value ?? 1) * 100)}%</label>
      <input
        type="range" min="0.4" max="2.2" step="0.1"
        value={value ?? 1}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="as-range"
      />
    </div>
  );
}

const TEXT_COLORS = [['ink', 'Tinta'], ['accent', 'Acento'], ['muted', 'Suave'], ['#FDFCFA', 'Blanco'], ['#151D1A', 'Negro']];
const TEXT_WEIGHTS = [[300, 'Fina'], [400, 'Normal'], [600, 'Media'], [700, 'Negrita']];
const TEXT_ALIGN = [['left', 'Izq'], ['center', 'Centro'], ['right', 'Der']];

function TextLayers({ cur, patch }) {
  const texts = cur.texts || [];
  const setTexts = (t) => patch({ texts: t });
  const add = () => setTexts([...texts, newText({ y: texts.length ? 62 : 50 })]);
  const update = (id, f) => setTexts(texts.map((l) => (l.id === id ? { ...l, ...f } : l)));
  const remove = (id) => setTexts(texts.filter((l) => l.id !== id));
  const reorder = (id, dir) => {
    const i = texts.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= texts.length) return;
    const arr = texts.slice();
    const [it] = arr.splice(i, 1);
    arr.splice(j, 0, it);
    setTexts(arr);
  };
  return (
    <div className="as-card">
      <div className="as-subh" style={{ marginTop: 0 }}>Capas de texto</div>
      <p className="as-hint" style={{ marginTop: 0, marginBottom: 12 }}>
        Agrega textos y arrastralos directamente sobre la vista previa, o ajusta con las barras. Ideales para llenar los espacios vacios.
      </p>
      {texts.map((l, i) => (
        <TextLayer key={l.id} layer={l} idx={i} total={texts.length}
          onChange={(f) => update(l.id, f)} onRemove={() => remove(l.id)} onReorder={(d) => reorder(l.id, d)} />
      ))}
      {!texts.length && <p className="as-hint" style={{ marginTop: 0, marginBottom: 12 }}>Aun no hay textos.</p>}
      <button className="as-addrow" onClick={add}>+ Agregar texto</button>
    </div>
  );
}

function TextLayer({ layer, idx, total, onChange, onRemove, onReorder }) {
  const [open, setOpen] = useState(true);
  const label = (layer.text || '').trim().replace(/\s+/g, ' ').slice(0, 22) || 'Texto';
  return (
    <div className="as-layer">
      <div className="as-layerhead">
        <button className="as-layertoggle" onClick={() => setOpen((o) => !o)}>
          <span className="as-layercaret">{open ? '▾' : '▸'}</span>
          <b>{idx + 1}.</b> <i>{label}</i>
        </button>
        <button className="as-mini" title="Subir capa" disabled={idx === 0} onClick={() => onReorder(-1)}>↑</button>
        <button className="as-mini" title="Bajar capa" disabled={idx === total - 1} onClick={() => onReorder(1)}>↓</button>
        <button className="as-mini del" title="Eliminar" onClick={onRemove}>×</button>
      </div>
      {open && (
        <div className="as-layerbody">
          <div className="as-field">
            <label>Texto</label>
            <textarea value={layer.text} onChange={(e) => onChange({ text: e.target.value })} />
          </div>
          <div className="as-field">
            <label>Color</label>
            <div className="as-seg wrap">
              {TEXT_COLORS.map(([v, l]) => (
                <button key={v} className={layer.color === v ? 'on' : ''} onClick={() => onChange({ color: v })}>{l}</button>
              ))}
            </div>
            <input type="color" className="as-colorin"
              value={/^#/.test(layer.color) ? layer.color : '#c6a15b'}
              onChange={(e) => onChange({ color: e.target.value })} />
          </div>
          <div className="as-field">
            <label>Fuente</label>
            <div className="as-seg wrap">
              <button className={layer.font === 'serif' ? 'on' : ''} onClick={() => onChange({ font: 'serif' })}>Serif</button>
              <button className={layer.font === 'sans' ? 'on' : ''} onClick={() => onChange({ font: 'sans' })}>Sans</button>
            </div>
          </div>
          <div className="as-field">
            <label>Grosor</label>
            <div className="as-seg wrap">
              {TEXT_WEIGHTS.map(([v, l]) => (
                <button key={v} className={layer.weight === v ? 'on' : ''} onClick={() => onChange({ weight: v })}>{l}</button>
              ))}
            </div>
          </div>
          <div className="as-field">
            <label>Alineacion</label>
            <div className="as-seg wrap">
              {TEXT_ALIGN.map(([v, l]) => (
                <button key={v} className={layer.align === v ? 'on' : ''} onClick={() => onChange({ align: v })}>{l}</button>
              ))}
            </div>
          </div>
          <div className="as-togglerow">
            <button className={`as-chiptoggle ${layer.upper ? 'on' : ''}`} onClick={() => onChange({ upper: !layer.upper })}>MAYUS</button>
            <button className={`as-chiptoggle ${layer.pill ? 'on' : ''}`} onClick={() => onChange({ pill: !layer.pill })}>Fondo</button>
          </div>
          <LayerRange label="Horizontal" suf="%" min={0} max={100} step={1} value={layer.x} on={(v) => onChange({ x: v })} />
          <LayerRange label="Vertical" suf="%" min={0} max={100} step={1} value={layer.y} on={(v) => onChange({ y: v })} />
          <LayerRange label="Tamano" suf="px" min={16} max={160} step={2} value={layer.size} on={(v) => onChange({ size: v })} />
          <LayerRange label="Ancho" suf="%" min={20} max={100} step={2} value={layer.width} on={(v) => onChange({ width: v })} />
          <LayerRange label="Espaciado" suf="" min={0} max={50} step={1} value={layer.spacing} on={(v) => onChange({ spacing: v })} />
          <LayerRange label="Rotacion" suf="°" min={-45} max={45} step={1} value={layer.rotate} on={(v) => onChange({ rotate: v })} />
          <LayerRange label="Interlineado" suf="" min={90} max={200} step={5}
            value={Math.round((layer.line || 1.2) * 100)} on={(v) => onChange({ line: v / 100 })} last />
        </div>
      )}
    </div>
  );
}

function LayerRange({ label, suf, min, max, step, value, on, last }) {
  return (
    <div className="as-field" style={last ? { marginBottom: 0 } : undefined}>
      <label>{label} · {value}{suf}</label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => on(parseFloat(e.target.value))} className="as-range" />
    </div>
  );
}

const STARS_OPTS = [1, 2, 3, 4, 5];

function Fields({ tpl, cur, curSlide, patch, patchSlide, onUpload, setContent }) {
  const f = (k) => (v) => patch({ [k]: v });
  const fSlide = (k) => (v) => patchSlide({ [k]: v });
  if (tpl === 'versus') return (
    <>
      <div className="as-subh">Lado Attar House</div>
      <Field label="Título" value={cur.lHead} onChange={f('lHead')} />
      <Field label="Descripción" value={cur.lSub} onChange={f('lSub')} multi />
      <Upload has={!!cur.img} onUpload={onUpload} field="img" label="Subir foto (lado Attar House)" />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <div className="as-subh">Lado Otros</div>
      <Field label="Título" value={cur.rHead} onChange={f('rHead')} />
      <Field label="Descripción" value={cur.rSub} onChange={f('rSub')} multi />
      <Upload has={!!cur.rImg} onUpload={onUpload} field="rImg" label="Subir foto (lado Otros)" />
      {cur.rImg && <SizeSlider value={cur.rImgScale ?? 1} onChange={f('rImgScale')} />}
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'tabla') return (
    <>
      <Field label="Título" value={cur.title} onChange={f('title')} multi />
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <div className="as-subh">Filas</div>
      {cur.rows.map((r, i) => (
        <div className="as-row" key={i}>
          <input value={r.feat} onChange={(e) => {
            const rows = cur.rows.slice(); rows[i] = { ...r, feat: e.target.value }; patch({ rows });
          }} />
          <button className="as-mini" onClick={() => {
            const next = r.o === 'x' ? 'dash' : r.o === 'dash' ? 'check' : 'x';
            const rows = cur.rows.slice(); rows[i] = { ...r, o: next }; patch({ rows });
          }}>{r.o === 'x' ? '✕' : r.o === 'dash' ? '—' : '✓'}</button>
          <button className="as-mini del" onClick={() => {
            const rows = cur.rows.slice(); rows.splice(i, 1); patch({ rows });
          }}>×</button>
        </div>
      ))}
      <button className="as-addrow" onClick={() => patch({ rows: [...cur.rows, { feat: 'Nueva ventaja', o: 'x' }] })}>+ Agregar fila</button>
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'producto') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <Field label="Casa / Marca" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Etiqueta" value={cur.chip} onChange={f('chip')} />
      <Field label="Formatos / precios" value={cur.meta} onChange={f('meta')} multi />
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'promo') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <Field label="Etiqueta superior" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Precio antes (opcional)" value={cur.from} onChange={f('from')} />
      <Field label="Precio ahora" value={cur.price} onChange={f('price')} />
      <Field label="Etiqueta inferior" value={cur.chip} onChange={f('chip')} />
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'lanzamiento') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <Field label="Etiqueta superior" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Pie" value={cur.meta} onChange={f('meta')} multi />
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'inspirado') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <Field label="Etiqueta (Inspirado en)" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Fragancia original" value={cur.target} onChange={f('target')} />
      <Field label="Nuestra versión" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Pie / desde" value={cur.meta} onChange={f('meta')} multi />
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'testimonio') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <Field label="Cita del cliente" value={cur.quote} onChange={f('quote')} multi />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Ciudad" value={cur.location} onChange={f('location')} />
      <div className="as-field">
        <label>Estrellas</label>
        <div className="as-seg">
          {STARS_OPTS.map((n) => (
            <button key={n} className={cur.stars === n ? 'on' : ''} onClick={() => patch({ stars: n })}>{n}★</button>
          ))}
        </div>
      </div>
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'comparativa') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <Field label="Casa / Marca" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <div className="as-subh">Precios por formato</div>
      {cur.rows.map((r, i) => (
        <div className="as-row" key={i}>
          <input value={r.label} onChange={(e) => {
            const rows = cur.rows.slice(); rows[i] = { ...r, label: e.target.value }; patch({ rows });
          }} />
          <input value={r.price} placeholder="Precio" onChange={(e) => {
            const rows = cur.rows.slice(); rows[i] = { ...r, price: e.target.value }; patch({ rows });
          }} />
          <button className={`as-mini ${r.best ? 'on' : ''}`} title="Marcar como mejor valor" onClick={() => {
            const rows = cur.rows.map((row, j) => ({ ...row, best: j === i ? !row.best : row.best }));
            patch({ rows });
          }}>★</button>
        </div>
      ))}
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'countdown') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      {cur.img && <SizeSlider value={cur.imgScale} onChange={f('imgScale')} />}
      <Field label="Etiqueta superior" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Texto de urgencia" value={cur.endsText} onChange={f('endsText')} />
      <Field label="Precio" value={cur.price} onChange={f('price')} />
      <Field label="Etiqueta inferior" value={cur.chip} onChange={f('chip')} />
      <Field label="Texto extra (opcional)" value={cur.extra} onChange={f('extra')} multi />
    </>
  );
  if (tpl === 'carrusel') return (
    <>
      <div className="as-subh" style={{ marginTop: 0 }}>Tarjeta</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
        <div className="as-seg" style={{ flex: 1 }}>
          {cur.slides.map((_, i) => (
            <button key={i} className={cur.activeSlide === i ? 'on' : ''} onClick={() => patch({ activeSlide: i })}>{i + 1}</button>
          ))}
        </div>
        <button className="as-mini" title="Agregar tarjeta" onClick={() => setContent((c) => ({
          ...c, carrusel: {
            ...c.carrusel,
            slides: [...c.carrusel.slides, { eyebrow: 'Casa', name: `Perfume ${c.carrusel.slides.length + 1}`, notes: '—', price: '', img: null, extra: '', imgScale: 1 }],
          },
        }))}>+</button>
        {cur.slides.length > 2 && (
          <button className="as-mini del" title="Quitar última tarjeta" onClick={() => setContent((c) => {
            const slides = c.carrusel.slides.slice(0, -1);
            return { ...c, carrusel: { ...c.carrusel, slides, activeSlide: Math.min(c.carrusel.activeSlide, slides.length - 1) } };
          })}>−</button>
        )}
      </div>
      <Upload has={!!curSlide.img} onUpload={onUpload} />
      {curSlide.img && <SizeSlider value={curSlide.imgScale} onChange={fSlide('imgScale')} />}
      <Field label="Casa / Marca" value={curSlide.eyebrow} onChange={fSlide('eyebrow')} />
      <Field label="Nombre" value={curSlide.name} onChange={fSlide('name')} />
      <Field label="Notas" value={curSlide.notes} onChange={fSlide('notes')} />
      <Field label="Precio" value={curSlide.price} onChange={fSlide('price')} />
      <Field label="Texto extra (opcional)" value={curSlide.extra} onChange={fSlide('extra')} multi />
      <p className="as-hint">Elige el perfume desde el Catálogo para esta tarjeta, luego cambia de tarjeta arriba y repite.</p>
    </>
  );
  return null;
}

/* ---------------- Lienzo / plantillas ---------------- */

const GhostBottle = ({ s = 1, theme }) => {
  const bw = 230 * s, bh = 320 * s, cap = 96 * s;
  const dark = theme === 'noir' || theme === 'burdeos' || theme === 'esmeralda';
  const fill = dark
    ? 'linear-gradient(160deg,#2b2820,#191710)'
    : 'linear-gradient(160deg,#d9d3c6,#c7c0b2)';
  return (
    <div style={{ width: bw, height: bh, borderRadius: '14px 14px 18px 18px', background: fill, position: 'relative' }}>
      <div style={{ width: cap, height: cap, borderRadius: '50%', background: fill, position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: -cap * 0.55 }} />
    </div>
  );
};

const Mark = ({ type, color }) => {
  const c = { stroke: color, fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' };
  if (type === 'check') return <svg width="46" height="46" viewBox="0 0 24 24" {...c}><path d="M5 12.5l4.5 4.5L19 7" /></svg>;
  if (type === 'x')     return <svg width="42" height="42" viewBox="0 0 24 24" {...c}><path d="M7 7l10 10M17 7L7 17" /></svg>;
  return <svg width="40" height="40" viewBox="0 0 24 24" {...c}><path d="M6 12h12" /></svg>;
};

// Capa de texto libre: absoluta por %, arrastrable sobre la vista previa.
function TextRender({ layer, w, h, scale, ink, accent, muted, serif, sans, onDrag }) {
  const color = layer.color === 'ink' ? ink
    : layer.color === 'accent' ? accent
    : layer.color === 'muted' ? muted
    : layer.color;
  const font = layer.font === 'sans' ? sans : serif;
  const onPointerDown = (e) => {
    if (!onDrag) return;
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, ox = layer.x ?? 50, oy = layer.y ?? 50, s = scale || 1;
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    const move = (ev) => {
      const nx = Math.max(0, Math.min(100, ox + ((ev.clientX - sx) / s) / w * 100));
      const ny = Math.max(0, Math.min(100, oy + ((ev.clientY - sy) / s) / h * 100));
      onDrag(layer.id, Math.round(nx * 10) / 10, Math.round(ny * 10) / 10);
    };
    const up = (ev) => {
      try { el.releasePointerCapture(ev.pointerId); } catch (err) { /* noop */ }
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  };
  return (
    <div onPointerDown={onPointerDown} style={{
      position: 'absolute', left: (layer.x ?? 50) + '%', top: (layer.y ?? 50) + '%',
      transform: 'translate(-50%,-50%) rotate(' + (layer.rotate || 0) + 'deg)',
      width: (layer.width ?? 80) + '%', textAlign: layer.align || 'center',
      fontFamily: font, fontWeight: layer.weight || 600, fontSize: layer.size ?? 40,
      color, lineHeight: layer.line || 1.2, whiteSpace: 'pre-line',
      letterSpacing: ((layer.spacing || 0) / 100) + 'em',
      textTransform: layer.upper ? 'uppercase' : 'none',
      cursor: onDrag ? 'move' : 'default', touchAction: 'none',
      padding: layer.pill ? '.35em .75em' : 0,
      background: layer.pill ? 'rgba(0,0,0,.42)' : 'transparent',
      borderRadius: layer.pill ? 16 : 0,
    }}>
      {layer.text}
    </div>
  );
}

function Stage({ stageRef, tpl, cur, curSlide, w, h, tall, theme, accent, scale, logo, logoScale = 1, onDragText }) {
  const th = themeOf(theme);
  const ink = th.ink, bg = th.bg, muted = th.muted, line = th.line;
  const dark = theme === 'noir' || theme === 'burdeos' || theme === 'esmeralda';
  const serif = 'var(--font-cormorant), Georgia, serif';
  const sans  = 'var(--font-inter-studio), system-ui, sans-serif';
  const m = 46;

  const hasScene = SCENE_CAPABLE.includes(tpl) && cur.bg && cur.bg !== 'solido' && cur.bgSeed;

  const base = {
    width: w, height: h, background: hasScene ? '#0F1613' : bg, color: ink, position: 'absolute', top: 0, left: 0,
    transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden', fontFamily: serif,
  };
  const scene = hasScene ? <ProceduralBackdrop seed={cur.bgSeed} width={w} height={h} uid="-as" /> : null;
  const scrim = (hasScene && cur.scrim) ? (
    <div style={{ position: 'absolute', inset: 0, background: '#0F1613', opacity: (cur.scrim || 0) / 100, pointerEvents: 'none' }} />
  ) : null;
  const frame = (
    <svg style={{ position: 'absolute', inset: m, pointerEvents: 'none' }} width={w - m * 2} height={h - m * 2}>
      <rect x="0.5" y="0.5" width={w - m * 2 - 1} height={h - m * 2 - 1} fill="none"
            stroke={dark ? 'rgba(198,161,91,.28)' : 'rgba(28,24,20,.18)'} strokeWidth="1" />
    </svg>
  );
  const foot = logo ? (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: tall ? 64 : 42, display: 'flex', justifyContent: 'center' }}>
      <img src={logo} alt="" style={{ height: (tall ? 56 : 40) * logoScale, maxWidth: '80%', objectFit: 'contain', opacity: .92 }} />
    </div>
  ) : (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: tall ? 70 : 48, textAlign: 'center',
      fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.5em', fontSize: 24, color: accent, opacity: .85 }}>
      ATTAR HOUSE
    </div>
  );
  const Img = ({ src, style, scale = 1 }) => (
    <img src={src} crossOrigin="anonymous" alt="" style={{ objectFit: 'contain', ...style, transform: scale !== 1 ? `scale(${scale})` : style?.transform }} />
  );

  let body = null;

  if (tpl === 'versus') {
    const hs = tall ? 112 : 88, ss = tall ? 34 : 30, top = tall ? 170 : 120, ph = tall ? 720 : 430;
    const Col = ({ head, sub, color, img, ghost, imgScale = 1 }) => (
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ color, fontSize: hs, fontWeight: 600, marginTop: top, textAlign: 'center', maxWidth: '84%', lineHeight: .98 }}>{head}</div>
        <div style={{ color, fontFamily: sans, fontWeight: 300, fontSize: ss, marginTop: tall ? 34 : 24, textAlign: 'center', maxWidth: '78%', lineHeight: 1.35 }}>{sub}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: ph, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: tall ? 80 : 46, opacity: img ? 1 : (ghost ? .55 : 1) }}>
          {img ? <Img src={img} scale={imgScale} style={{ width: '100%', height: '100%', objectPosition: 'bottom' }} /> : <GhostBottle s={ghost ? 0.9 : 1} theme={theme} />}
        </div>
      </div>
    );
    body = (
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <Col head={cur.lHead} sub={cur.lSub} color={accent} img={cur.img} imgScale={cur.imgScale ?? 1} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: `linear-gradient(180deg,transparent,${line},transparent)` }} />
        <Col head={cur.rHead} sub={cur.rSub} color={muted} img={cur.rImg} ghost imgScale={cur.rImgScale ?? 1} />
      </div>
    );
  }

  if (tpl === 'tabla') {
    const hasImg = !!cur.img;
    if (tall) {
      const sideX = 100;
      const titleTop = hasImg ? 520 : 150;
      const tableTop = titleTop + 150;
      const colW = 150, featW = w - sideX * 2 - colW * 2, rowH = 150;
      body = (
        <>
          {hasImg && (
            <div style={{ position: 'absolute', top: 120, left: 0, right: 0, height: 420, display: 'flex', justifyContent: 'center' }}>
              <Img src={cur.img} scale={cur.imgScale} style={{ height: '100%' }} />
            </div>
          )}
          <div style={{ position: 'absolute', top: titleTop, left: 0, right: 0, padding: `0 ${sideX}px`, textAlign: 'center', color: accent, fontWeight: 600, fontSize: 72 }}>{cur.title}</div>
          <div style={{ position: 'absolute', top: tableTop, left: sideX, right: sideX }}>
            <div style={{ display: 'grid', gridTemplateColumns: `${featW}px ${colW}px ${colW}px`, fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.14em', color: muted, fontSize: 22, paddingBottom: 18 }}>
              <span /><span style={{ textAlign: 'center' }}>Nosotros</span><span style={{ textAlign: 'center' }}>Otros</span>
            </div>
            {cur.rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: `${featW}px ${colW}px ${colW}px`, alignItems: 'center', height: rowH, borderTop: `1px solid ${line}` }}>
                <div style={{ fontFamily: sans, fontSize: 34 }}>{r.feat}</div>
                <div style={{ display: 'flex', justifyContent: 'center', color: accent }}><Mark type="check" color={accent} /></div>
                <div style={{ display: 'flex', justifyContent: 'center', color: muted }}><Mark type={r.o} color={muted} /></div>
              </div>
            ))}
          </div>
        </>
      );
    } else {
      // Feed cuadrado: imagen a la izquierda, tabla a la derecha
      const imgW = hasImg ? 360 : 0;
      const tableX = hasImg ? imgW + 40 : 80;
      const tableW = w - tableX - 60;
      const colW = 110, featW = tableW - colW * 2, rowH = 104;
      body = (
        <>
          {hasImg && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: imgW, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0 60px 40px' }}>
              <Img src={cur.img} scale={cur.imgScale} style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </div>
          )}
          <div style={{ position: 'absolute', top: 80, left: tableX, width: tableW, color: accent, fontWeight: 600, fontSize: 48, lineHeight: 1.1, marginBottom: 16 }}>{cur.title}</div>
          <div style={{ position: 'absolute', top: 180, left: tableX, width: tableW }}>
            <div style={{ display: 'grid', gridTemplateColumns: `${featW}px ${colW}px ${colW}px`, fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.1em', color: muted, fontSize: 18, paddingBottom: 14 }}>
              <span /><span style={{ textAlign: 'center' }}>Nos.</span><span style={{ textAlign: 'center' }}>Otros</span>
            </div>
            {cur.rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: `${featW}px ${colW}px ${colW}px`, alignItems: 'center', height: rowH, borderTop: `1px solid ${line}` }}>
                <div style={{ fontFamily: sans, fontSize: 26 }}>{r.feat}</div>
                <div style={{ display: 'flex', justifyContent: 'center', color: accent }}><Mark type="check" color={accent} /></div>
                <div style={{ display: 'flex', justifyContent: 'center', color: muted }}><Mark type={r.o} color={muted} /></div>
              </div>
            ))}
          </div>
        </>
      );
    }
  }

  if (tpl === 'producto' || tpl === 'lanzamiento') {
    const imgTop = tall ? 180 : 90, imgH = tall ? 820 : 540, infoTop = imgTop + imgH + (tall ? 40 : 24);
    body = (
      <>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
          {cur.img ? <Img src={cur.img} scale={cur.imgScale} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.5 : 1.1} theme={theme} />}
        </div>
        <div style={{ position: 'absolute', top: infoTop, left: 0, right: 0, textAlign: 'center', padding: '0 90px' }}>
          <div style={{ fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.32em', fontSize: 24, color: muted }}>{cur.eyebrow}</div>
          <div style={{ fontWeight: 600, fontSize: tall ? 96 : 78, marginTop: 18, lineHeight: 1 }}>{cur.name}</div>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 30, marginTop: 22, color: muted, letterSpacing: '.04em' }}>{cur.notes}</div>
          {tpl === 'producto' && (
            <div style={{ display: 'inline-block', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.2em', fontSize: 21, marginTop: 28, padding: '14px 30px', border: `1px solid ${accent}`, borderRadius: 999, color: accent }}>{cur.chip}</div>
          )}
          <div style={{ fontFamily: sans, fontSize: 28, marginTop: 28, color: accent, letterSpacing: '.04em', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{cur.meta}</div>
        </div>
      </>
    );
  }

  if (tpl === 'promo') {
    const imgTop = tall ? 170 : 80, imgH = tall ? 760 : 500, infoTop = imgTop + imgH + (tall ? 30 : 18);
    body = (
      <>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
          {cur.img ? <Img src={cur.img} scale={cur.imgScale} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.4 : 1.05} theme={theme} />}
        </div>
        <div style={{ position: 'absolute', top: infoTop, left: 0, right: 0, textAlign: 'center', padding: '0 90px' }}>
          <div style={{ fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.3em', fontSize: 24, color: accent }}>{cur.eyebrow}</div>
          <div style={{ fontWeight: 600, fontSize: tall ? 88 : 72, marginTop: 16 }}>{cur.name}</div>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 28, marginTop: 18, color: muted }}>{cur.notes}</div>
          <div style={{ marginTop: 30, display: 'flex', gap: 22, alignItems: 'baseline', justifyContent: 'center' }}>
            {cur.from && <span style={{ fontFamily: sans, fontSize: 34, color: muted, textDecoration: 'line-through' }}>{cur.from}</span>}
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: tall ? 104 : 88, color: accent }}>{cur.price}</span>
          </div>
          <div style={{ display: 'inline-block', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.2em', fontSize: 21, marginTop: 26, padding: '14px 30px', border: `1px solid ${accent}`, borderRadius: 999, color: accent }}>{cur.chip}</div>
        </div>
      </>
    );
  }

  if (tpl === 'inspirado') {
    const imgTop = tall ? 220 : 90, imgH = tall ? 720 : 480, infoTop = imgTop + imgH + (tall ? 36 : 22);
    body = (
      <>
        <div style={{ position: 'absolute', top: tall ? 130 : 60, left: 0, right: 0, textAlign: 'center', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.34em', fontSize: 24, color: muted }}>
          {cur.eyebrow} <span style={{ color: accent }}>{cur.target}</span>
        </div>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
          {cur.img ? <Img src={cur.img} scale={cur.imgScale} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.4 : 1.05} theme={theme} />}
        </div>
        <div style={{ position: 'absolute', top: infoTop, left: 0, right: 0, textAlign: 'center', padding: '0 90px' }}>
          <div style={{ fontWeight: 600, fontSize: tall ? 92 : 76 }}>{cur.name}</div>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 30, marginTop: 20, color: muted }}>{cur.notes}</div>
          <div style={{ fontFamily: sans, fontSize: 28, marginTop: 26, color: accent, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{cur.meta}</div>
        </div>
      </>
    );
  }

  if (tpl === 'testimonio') {
    const qSize = tall ? 50 : 40;
    body = (
      <>
        <div style={{ position: 'absolute', top: tall ? 220 : 90, left: 0, right: 0, textAlign: 'center', fontSize: 90, color: accent, opacity: .5, fontFamily: serif }}>"</div>
        <div style={{ position: 'absolute', top: tall ? 320 : 150, left: 0, right: 0, padding: '0 130px', textAlign: 'center', fontSize: qSize, lineHeight: 1.4, fontStyle: 'italic' }}>
          {cur.quote}
        </div>
        <div style={{ position: 'absolute', top: tall ? 660 : 360, left: 0, right: 0, textAlign: 'center', fontSize: 36, color: accent, letterSpacing: 6 }}>
          {'★'.repeat(cur.stars || 5)}
        </div>
        <div style={{ position: 'absolute', top: tall ? 740 : 420, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 600, fontSize: 30 }}>{cur.name}</div>
        <div style={{ position: 'absolute', top: tall ? 786 : 462, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontSize: 22, color: muted, letterSpacing: '.1em', textTransform: 'uppercase' }}>{cur.location}</div>
        {cur.img && (
          <div style={{ position: 'absolute', bottom: tall ? 140 : 60, left: 0, right: 0, height: tall ? 340 : 220, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .85 }}>
            <Img src={cur.img} scale={cur.imgScale} style={{ maxWidth: '40%', maxHeight: '100%' }} />
          </div>
        )}
      </>
    );
  }

  if (tpl === 'comparativa') {
    const imgTop = tall ? 130 : 56, imgH = tall ? 620 : 380;
    const contentTop = imgTop + imgH;
    const contentBottom = tall ? 230 : 150; // deja espacio reservado para el pie/logo
    const rowH = tall ? 108 : 80, cardPad = tall ? 36 : 26;
    body = (
      <>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 160px' }}>
          {cur.img ? <Img src={cur.img} scale={cur.imgScale} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.1 : 0.85} theme={theme} />}
        </div>
        <div style={{
          position: 'absolute', top: contentTop, bottom: contentBottom, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 90px',
        }}>
          <div style={{ fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.28em', fontSize: tall ? 24 : 20, color: muted }}>{cur.eyebrow}</div>
          <div style={{ fontWeight: 600, fontSize: tall ? 76 : 58, marginTop: 14, textAlign: 'center', lineHeight: 1.05 }}>{cur.name}</div>
          <div style={{ width: 64, height: 1, background: accent, opacity: .6, margin: tall ? '30px 0 36px' : '20px 0 26px' }} />
          <div style={{
            width: '100%', maxWidth: tall ? 660 : 540, border: `1px solid ${line}`, borderRadius: 18,
            padding: tall ? '8px 36px' : '6px 26px', background: dark ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.015)',
          }}>
            {cur.rows.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: rowH,
                borderTop: i ? `1px solid ${line}` : 'none', margin: r.best ? `0 -${cardPad}px` : 0, padding: r.best ? `0 ${cardPad}px` : 0,
                background: r.best ? `${accent}1a` : 'transparent', borderRadius: r.best ? 12 : 0,
              }}>
                <span style={{ fontFamily: sans, fontSize: tall ? 34 : 27, fontWeight: r.best ? 700 : 400, color: r.best ? accent : ink, letterSpacing: '.02em' }}>
                  {r.best && '★ '}{r.label}
                </span>
                <span style={{ fontFamily: serif, fontSize: tall ? 44 : 34, fontWeight: 600, color: r.best ? accent : ink }}>{r.price}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (tpl === 'countdown') {
    const imgTop = tall ? 160 : 70, imgH = tall ? 700 : 460, infoTop = imgTop + imgH + (tall ? 24 : 14);
    body = (
      <>
        <div style={{
          position: 'absolute', top: tall ? 70 : 36, left: '50%', transform: 'translateX(-50%)',
          fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.16em', fontSize: 22, fontWeight: 700,
          padding: '10px 22px', borderRadius: 999, background: accent, color: '#1a1404',
        }}>{cur.endsText}</div>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
          {cur.img ? <Img src={cur.img} scale={cur.imgScale} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.4 : 1.05} theme={theme} />}
        </div>
        <div style={{ position: 'absolute', top: infoTop, left: 0, right: 0, textAlign: 'center', padding: '0 90px' }}>
          <div style={{ fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.3em', fontSize: 24, color: muted }}>{cur.eyebrow}</div>
          <div style={{ fontWeight: 600, fontSize: tall ? 84 : 68, marginTop: 16 }}>{cur.name}</div>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 28, marginTop: 16, color: muted }}>{cur.notes}</div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: tall ? 96 : 80, color: accent, marginTop: 22 }}>{cur.price}</div>
          <div style={{ display: 'inline-block', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.2em', fontSize: 21, marginTop: 22, padding: '14px 30px', border: `1px solid ${accent}`, borderRadius: 999, color: accent }}>{cur.chip}</div>
        </div>
      </>
    );
  }

  if (tpl === 'carrusel') {
    const s = curSlide;
    const imgTop = tall ? 200 : 100, imgH = tall ? 760 : 500, infoTop = imgTop + imgH + (tall ? 40 : 24);
    body = (
      <>
        <div style={{
          position: 'absolute', top: tall ? 60 : 30, left: '50%', transform: 'translateX(-50%)',
          fontFamily: sans, fontSize: 22, color: muted, letterSpacing: '.2em',
        }}>{cur.activeSlide + 1} / {cur.slides.length}</div>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
          {s.img ? <Img src={s.img} scale={s.imgScale} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.5 : 1.1} theme={theme} />}
        </div>
        <div style={{ position: 'absolute', top: infoTop, left: 0, right: 0, textAlign: 'center', padding: '0 90px' }}>
          <div style={{ fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.32em', fontSize: 24, color: muted }}>{s.eyebrow}</div>
          <div style={{ fontWeight: 600, fontSize: tall ? 90 : 74, marginTop: 18, lineHeight: 1 }}>{s.name}</div>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 28, marginTop: 20, color: muted }}>{s.notes}</div>
          <div style={{ fontFamily: serif, fontSize: tall ? 50 : 42, fontWeight: 600, marginTop: 24, color: accent }}>{s.price}</div>
        </div>
      </>
    );
  }

  const extraText = tpl === 'carrusel' ? curSlide.extra : cur.extra;
  const extra = extraText ? (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: tall ? 118 : 88, textAlign: 'center', padding: '0 90px',
      fontFamily: sans, fontWeight: 300, fontSize: tall ? 26 : 22, color: muted, letterSpacing: '.02em', lineHeight: 1.4,
    }}>
      {extraText}
    </div>
  ) : null;

  // Capas de texto libre: absolutas por %, arrastrables sobre la vista previa.
  const textLayers = (cur.texts || []).map((l) => (
    <TextRender key={l.id} layer={l} w={w} h={h} scale={scale}
      ink={ink} accent={accent} muted={muted} serif={serif} sans={sans} onDrag={onDragText} />
  ));

  return (
    <div ref={stageRef} style={base}>
      {scene}
      {scrim}
      {frame}
      {body}
      {extra}
      {textLayers}
      {foot}
    </div>
  );
}

/* ---------------- estilos del panel ---------------- */
/* Interfaz del Estudio en tema CLARO del sistema de marca (Marca.html):
   papel/Blanco Humo, tinta, verde acción. Solo cambia el chrome de la
   herramienta — las plantillas del arte generado conservan sus estilos. */
const CSS = `
.attar-studio{--ink:#F5F5F5;--noir:#FDFCFA;--gold:#2D6745;--gold-b:#3E7D57;--cream:#0D1411;--smoke:#7A8985;--line:#E0DDD2;--panel:#FFFFFF;--soft:rgba(45,103,69,.08);
  position:fixed;inset:0;display:flex;flex-direction:column;background:var(--ink);color:var(--cream);
  font-family:var(--font-archivo),system-ui,sans-serif;z-index:2000}
.attar-studio *{box-sizing:border-box}
.as-top{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:14px 20px;border-bottom:1px solid var(--line);background:rgba(253,252,250,.95);backdrop-filter:blur(8px)}
.as-mark{font-family:var(--font-archivo),sans-serif;font-weight:600;letter-spacing:.06em;font-size:19px;color:#1D3A2E}
.as-mark span{display:block;font-family:var(--font-plex-mono),monospace;font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:var(--smoke);margin-top:4px}
.as-group{display:flex;align-items:center}
.as-lbl{font-family:var(--font-plex-mono),monospace;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--smoke);margin-right:8px}
.as-seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:var(--panel)}
.as-seg button{border:0;background:transparent;color:var(--smoke);font-size:12px;padding:8px 13px;cursor:pointer;transition:color .2s,background .2s}
.as-seg button:hover{color:var(--cream)}
.as-seg button.on{background:var(--gold);color:#FDFCFA;font-weight:600}
.as-accent{display:flex;align-items:center;gap:7px;font-family:var(--font-plex-mono),monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--smoke)}
.as-accent input{width:26px;height:26px;border:1px solid var(--line);border-radius:6px;background:var(--panel);padding:0;cursor:pointer}
.as-range{width:100%;accent-color:var(--gold);cursor:pointer}
.as-spacer{flex:1}
.as-title{background:var(--panel);border:1px solid var(--line);border-radius:8px;color:var(--cream);padding:8px 12px;font-size:13px;width:150px;transition:border-color .2s}
.as-title:focus{outline:none;border-color:var(--gold)}
.as-btn{border:1px solid var(--gold);border-radius:999px;background:var(--gold);color:#FDFCFA;font-weight:600;font-size:13px;padding:10px 18px;cursor:pointer;transition:background .2s,box-shadow .2s}
.as-btn:hover:not(:disabled){background:#245839;box-shadow:0 6px 16px rgba(45,103,69,.25)}
.as-btn.ghost{background:transparent;color:var(--cream);border-color:var(--line)}
.as-btn.ghost:hover:not(:disabled){border-color:var(--gold);color:var(--gold);background:transparent;box-shadow:none}
.as-btn:disabled{opacity:.55;cursor:not-allowed}
.as-shell{flex:1;display:grid;grid-template-columns:330px 1fr;min-height:0}
.as-controls{border-right:1px solid var(--line);padding:18px;overflow:auto;background:var(--noir)}
.as-tabs{display:flex;gap:6px;margin-bottom:16px}
.as-tabs button{flex:1;border:1px solid var(--line);background:var(--panel);color:var(--smoke);border-radius:8px;padding:8px;font-size:12px;cursor:pointer;transition:all .2s}
.as-tabs button.on{border-color:var(--gold);color:var(--gold);background:var(--soft);font-weight:600}
.as-tplgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:18px}
.as-tpl{border:1px solid var(--line);background:var(--panel);color:var(--smoke);border-radius:9px;padding:9px 4px;font-size:11px;cursor:pointer;transition:all .2s}
.as-tpl.on{border-color:var(--gold);color:var(--gold);background:var(--soft);font-weight:600}
.as-field{margin-bottom:13px}
.as-field label{display:block;font-family:var(--font-plex-mono),monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--smoke);margin-bottom:6px}
.as-field input,.as-field textarea,.as-search{width:100%;background:var(--panel);border:1px solid var(--line);border-radius:8px;color:var(--cream);font-size:14px;padding:9px 11px;font-family:inherit;transition:border-color .2s}
.as-field textarea{min-height:54px;resize:vertical}
.as-field input:focus,.as-field textarea:focus,.as-search:focus{outline:none;border-color:var(--gold)}
.as-subh{font-family:var(--font-archivo),sans-serif;font-weight:600;font-size:15px;letter-spacing:.02em;color:#1D3A2E;margin:18px 0 11px;padding-bottom:7px;border-bottom:1px solid var(--line)}
.as-upload{display:block;border:1px dashed var(--line);background:var(--panel);border-radius:9px;padding:11px;text-align:center;color:var(--smoke);font-size:12px;cursor:pointer;margin-bottom:13px;transition:border-color .2s,color .2s}
.as-upload:hover{border-color:var(--gold);color:var(--gold)}
.as-upload.has{border-style:solid;border-color:var(--gold);color:var(--gold)}
.as-row{display:grid;grid-template-columns:1fr auto auto;gap:6px;margin-bottom:7px}
.as-row input{background:var(--panel);border:1px solid var(--line);border-radius:7px;color:var(--cream);padding:8px;font-size:13px}
.as-row input:focus{outline:none;border-color:var(--gold)}
.as-mini{width:34px;height:34px;border:1px solid var(--line);background:var(--panel);color:var(--cream);border-radius:7px;cursor:pointer;flex:0 0 auto;transition:all .2s}
.as-mini:hover{border-color:var(--gold)}
.as-mini.del{color:var(--smoke)}
.as-mini.del:hover{color:#A8442A;border-color:#A8442A}
.as-mini.on{border-color:var(--gold);color:var(--gold);background:var(--soft)}
.as-addrow{width:100%;border:1px dashed var(--line);background:transparent;color:var(--smoke);border-radius:8px;padding:9px;font-size:12px;cursor:pointer;margin-top:4px;transition:all .2s}
.as-addrow:hover{border-color:var(--gold);color:var(--gold)}
.as-search{margin-bottom:12px}
.as-hint{font-size:11px;color:var(--smoke);line-height:1.5;margin:8px 0 0}
.as-card{border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:14px;margin-bottom:16px;box-shadow:0 2px 8px rgba(18,26,22,.04)}
.as-scenegrid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.as-scenebtn{border:1px solid var(--line);background:var(--panel);color:var(--smoke);border-radius:8px;padding:8px 4px;font-size:11px;cursor:pointer;transition:all .2s}
.as-scenebtn.on{border-color:var(--gold);color:var(--gold);background:var(--soft);font-weight:600}
.as-shuffle{width:100%;border:1px dashed var(--line);background:transparent;color:var(--smoke);border-radius:8px;padding:9px;font-size:12px;cursor:pointer;transition:all .2s}
.as-shuffle:hover{border-color:var(--gold);color:var(--gold)}
.as-logopreview{display:flex;align-items:center;gap:10px;margin-bottom:10px;background:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.as-logopreview img{height:32px;max-width:160px;object-fit:contain}
.as-logopreview .as-mini{margin-left:auto}
.as-batchbtn{width:100%;background:var(--gold);color:#FDFCFA;border:none;border-radius:8px;padding:11px;font-size:12px;font-weight:700;letter-spacing:.04em;cursor:pointer;margin-bottom:12px;transition:background .2s}
.as-batchbtn:hover:not(:disabled){background:#245839}
.as-batchbtn:disabled{opacity:.55;cursor:not-allowed}
.as-list,.as-saved{display:flex;flex-direction:column;gap:7px}
.as-item,.as-savedcard{display:flex;align-items:center;gap:8px}
.as-check{flex:0 0 auto;width:16px;height:16px;cursor:pointer;accent-color:var(--gold)}
.as-itembody,.as-savedbody{flex:1;display:flex;align-items:center;gap:11px;border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:8px;cursor:pointer;text-align:left;color:var(--cream);min-width:0;transition:all .2s}
.as-itembody:hover,.as-savedbody:hover{border-color:var(--gold);background:var(--soft)}
.as-itembody img,.as-savedbody img,.as-itembody .ph{width:42px;height:52px;object-fit:contain;border-radius:6px;background:#F0EDEA;flex:0 0 auto}
.as-savedbody img{width:48px;height:48px}
.as-itembody .meta,.as-savedbody span{display:flex;flex-direction:column;gap:2px;min-width:0}
.as-itembody b,.as-savedbody b{font-size:13px}
.as-itembody i,.as-savedbody i{font-size:11px;color:var(--smoke);font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.as-empty{color:var(--smoke);font-size:13px;text-align:center;padding:20px}
.as-canvas{display:flex;align-items:center;justify-content:center;padding:32px;overflow:hidden;background:#E8E5DF}
.as-frame{position:relative;overflow:hidden;border-radius:8px;box-shadow:0 30px 70px -28px rgba(18,26,22,.45),0 0 0 1px rgba(18,26,22,.06)}
.as-seg.wrap{display:flex;flex-wrap:wrap;width:100%;border-radius:8px}
.as-seg.wrap button{flex:1 0 auto}
.as-colorin{margin-top:7px;width:100%;height:30px;border:1px solid var(--line);border-radius:7px;background:var(--panel);padding:2px;cursor:pointer}
.as-layer{border:1px solid var(--line);background:var(--panel);border-radius:9px;margin-bottom:10px;overflow:hidden}
.as-layerhead{display:flex;align-items:center;gap:5px;padding:7px 8px;background:rgba(13,20,17,.03)}
.as-layertoggle{flex:1;display:flex;align-items:center;gap:6px;background:transparent;border:0;color:var(--cream);cursor:pointer;text-align:left;font-size:12px;min-width:0}
.as-layertoggle i{color:var(--smoke);font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.as-layercaret{color:var(--gold);font-size:11px}
.as-layerhead .as-mini{width:28px;height:28px;font-size:12px}
.as-layerhead .as-mini:disabled{opacity:.35;cursor:default}
.as-layerbody{padding:11px 10px 12px}
.as-togglerow{display:flex;gap:6px;margin-bottom:13px}
.as-chiptoggle{flex:1;border:1px solid var(--line);background:var(--panel);color:var(--smoke);border-radius:7px;padding:8px;font-size:11px;letter-spacing:.08em;cursor:pointer;transition:all .2s}
.as-chiptoggle.on{border-color:var(--gold);color:var(--gold);background:var(--soft);font-weight:600}
@media (max-width:860px){.as-shell{grid-template-columns:1fr}.as-canvas{display:none}}
`;
