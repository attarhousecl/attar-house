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
];

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

const defaultContent = () => ({
  versus: {
    lHead: 'Attar House', lSub: 'Aroma potente y duradero. Asesoría real, no algoritmo.',
    rHead: 'Otros', rSub: 'Aromas que se desvanecen rápido.', img: null,
  },
  tabla: {
    title: 'Por qué somos tu mejor opción',
    img: null,
    rows: [
      { feat: 'Fragancias originales', o: 'x' },
      { feat: 'Asesoría personal', o: 'x' },
      { feat: 'Pago contra entrega en Valdivia', o: 'dash' },
      { feat: 'Respuesta rápida', o: 'dash' },
      { feat: 'Envío gratis sobre el monto', o: 'dash' },
    ],
  },
  producto: { eyebrow: 'Casa', name: 'Elige un perfume', notes: '—', meta: 'Decant · Sellado', chip: 'Disponible en Valdivia', img: null },
  promo:    { eyebrow: 'Oferta', name: 'Nombre del perfume', notes: '—', from: '', price: '', chip: 'Solo esta semana', img: null },
  lanzamiento: { eyebrow: 'Nuevo en Attar House', name: 'Nombre del perfume', notes: '—', meta: 'Ya disponible', img: null },
  inspirado: { eyebrow: 'Inspirado en', target: 'Fragancia original', name: 'Nuestra versión', notes: '—', meta: 'Desde · decant', img: null },
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
  const [designs, setDesigns] = useState([]);
  const [designId, setDesignId] = useState(null);
  const [title, setTitle]   = useState('Sin título');
  const [busy, setBusy]     = useState('');
  const [scale, setScale]   = useState(0.4);

  const stageRef = useRef(null);
  const areaRef  = useRef(null);

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
  const cur = content[tpl];

  const applyPerfume = (p) => {
    setPerfumeId(p.id);
    const notes = perfumeNotes(p).slice(0, 3).join(' · ') || '—';
    const img = p.image_url || null;
    setContent((c) => ({
      ...c,
      producto:    { ...c.producto, eyebrow: p.brand, name: p.name, notes, meta: perfumeMeta(p), img },
      lanzamiento: { ...c.lanzamiento, name: p.name, notes, eyebrow: 'Nuevo en Attar House', img },
      promo:       { ...c.promo, name: p.name, notes, price: clp(lowestPrice(p)), img },
      versus:      { ...c.versus, lHead: p.name, lSub: p.description || c.versus.lSub, img },
      inspirado:   { ...c.inspirado, name: p.name, target: p.inspiration || c.inspirado.target, notes, meta: perfumeMeta(p), img },
    }));
    setTab('design');
  };

  const onUpload = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => patch({ img: ev.target.result });
    r.readAsDataURL(f);
  };

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

  const openDesign = (d) => {
    setDesignId(d.id); setTitle(d.title); setTpl(d.template);
    setFormat(d.format); setTheme(d.theme); setAccent(d.accent || '#c6a15b');
    setPerfumeId(d.perfume_id);
    setContent((c) => ({ ...c, [d.template]: { ...c[d.template], ...(d.content || {}) } }));
    setTab('design');
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
             opts={[['noir', 'Noir'], ['ivory', 'Marfil']]} />
        <label className="as-accent">Acento
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </label>
        <div className="as-spacer" />
        <input className="as-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="as-btn ghost" disabled={busy} onClick={download}>
          {busy === 'export' ? '…' : 'Descargar PNG'}</button>
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
              <div className="as-tplgrid">
                {TEMPLATES.map((t) => (
                  <button key={t.id} className={`as-tpl ${tpl === t.id ? 'on' : ''}`} onClick={() => setTpl(t.id)}>{t.label}</button>
                ))}
              </div>
              <Fields tpl={tpl} cur={cur} patch={patch} onUpload={onUpload}
                      setContent={setContent} />
            </>
          )}

          {tab === 'catalog' && (
            <>
              <input className="as-search" placeholder="Buscar perfume…" value={query}
                     onChange={(e) => setQuery(e.target.value)} />
              <div className="as-list">
                {filtered.map((p) => (
                  <button key={p.id} className="as-item" onClick={() => applyPerfume(p)}>
                    {p.image_url
                      ? <img src={p.image_url} alt="" crossOrigin="anonymous" />
                      : <span className="ph" />}
                    <span className="meta"><b>{p.name}</b><i>{p.brand} · {perfumeNotes(p).slice(0,2).join(', ')}</i></span>
                  </button>
                ))}
                {!filtered.length && <p className="as-empty">Sin resultados.</p>}
              </div>
            </>
          )}

          {tab === 'saved' && (
            <div className="as-saved">
              {designs.map((d) => (
                <button key={d.id} className="as-savedcard" onClick={() => openDesign(d)}>
                  {d.thumbnail_url && <img src={d.thumbnail_url} alt="" />}
                  <span><b>{d.title}</b><i>{d.template} · {d.format}</i></span>
                </button>
              ))}
              {!designs.length && <p className="as-empty">Aún no guardas diseños.</p>}
            </div>
          )}
        </aside>

        {/* PREVIEW */}
        <section className="as-canvas" ref={areaRef}>
          <div className="as-frame" style={{ width: w * scale, height: h * scale }}>
            <Stage stageRef={stageRef} tpl={tpl} cur={cur} w={w} h={h} tall={tall}
                   theme={theme} accent={accent} scale={scale} />
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

function Upload({ has, onUpload }) {
  return (
    <label className={`as-upload ${has ? 'has' : ''}`}>
      {has ? 'Imagen cargada · cambiar' : 'Subir foto (PNG sin fondo)'}
      <input type="file" accept="image/*" onChange={onUpload} hidden />
    </label>
  );
}

function Fields({ tpl, cur, patch, onUpload, setContent }) {
  const f = (k) => (v) => patch({ [k]: v });
  if (tpl === 'versus') return (
    <>
      <div className="as-subh">Lado Attar House</div>
      <Field label="Título" value={cur.lHead} onChange={f('lHead')} />
      <Field label="Descripción" value={cur.lSub} onChange={f('lSub')} multi />
      <Upload has={!!cur.img} onUpload={onUpload} />
      <div className="as-subh">Lado Otros</div>
      <Field label="Título" value={cur.rHead} onChange={f('rHead')} />
      <Field label="Descripción" value={cur.rSub} onChange={f('rSub')} multi />
    </>
  );
  if (tpl === 'tabla') return (
    <>
      <Field label="Título" value={cur.title} onChange={f('title')} multi />
      <Upload has={!!cur.img} onUpload={onUpload} />
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
    </>
  );
  if (tpl === 'producto') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      <Field label="Casa / Marca" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Formatos / precios" value={cur.meta} onChange={f('meta')} />
      <Field label="Etiqueta" value={cur.chip} onChange={f('chip')} />
    </>
  );
  if (tpl === 'promo') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      <Field label="Etiqueta superior" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Precio antes (opcional)" value={cur.from} onChange={f('from')} />
      <Field label="Precio ahora" value={cur.price} onChange={f('price')} />
      <Field label="Etiqueta inferior" value={cur.chip} onChange={f('chip')} />
    </>
  );
  if (tpl === 'lanzamiento') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      <Field label="Etiqueta superior" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Nombre" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Pie" value={cur.meta} onChange={f('meta')} />
    </>
  );
  if (tpl === 'inspirado') return (
    <>
      <Upload has={!!cur.img} onUpload={onUpload} />
      <Field label="Etiqueta (Inspirado en)" value={cur.eyebrow} onChange={f('eyebrow')} />
      <Field label="Fragancia original" value={cur.target} onChange={f('target')} />
      <Field label="Nuestra versión" value={cur.name} onChange={f('name')} />
      <Field label="Notas" value={cur.notes} onChange={f('notes')} />
      <Field label="Pie / desde" value={cur.meta} onChange={f('meta')} />
    </>
  );
  return null;
}

/* ---------------- Lienzo / plantillas ---------------- */

const GhostBottle = ({ s = 1, theme }) => {
  const bw = 230 * s, bh = 320 * s, cap = 96 * s;
  const fill = theme === 'noir'
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

function Stage({ stageRef, tpl, cur, w, h, tall, theme, accent, scale }) {
  const ink = theme === 'noir' ? '#f3ede1' : '#1c1814';
  const bg  = theme === 'noir' ? '#0c0b09' : '#f3ede1';
  const muted = theme === 'noir' ? '#8c857a' : '#9a9286';
  const line  = theme === 'noir' ? 'rgba(243,237,225,.12)' : 'rgba(28,24,20,.14)';
  const serif = 'var(--font-cormorant), Georgia, serif';
  const sans  = 'var(--font-inter-studio), system-ui, sans-serif';
  const m = 46;

  const base = {
    width: w, height: h, background: bg, color: ink, position: 'absolute', top: 0, left: 0,
    transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden', fontFamily: serif,
  };
  const frame = (
    <svg style={{ position: 'absolute', inset: m, pointerEvents: 'none' }} width={w - m * 2} height={h - m * 2}>
      <rect x="0.5" y="0.5" width={w - m * 2 - 1} height={h - m * 2 - 1} fill="none"
            stroke={theme === 'noir' ? 'rgba(198,161,91,.28)' : 'rgba(28,24,20,.18)'} strokeWidth="1" />
    </svg>
  );
  const foot = (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: tall ? 70 : 48, textAlign: 'center',
      fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.5em', fontSize: 24, color: accent, opacity: .85 }}>
      ATTAR HOUSE
    </div>
  );
  const Img = ({ src, style }) => <img src={src} crossOrigin="anonymous" alt="" style={{ objectFit: 'contain', ...style }} />;

  let body = null;

  if (tpl === 'versus') {
    const hs = tall ? 112 : 88, ss = tall ? 34 : 30, top = tall ? 170 : 120, ph = tall ? 720 : 430;
    const Col = ({ head, sub, color, img, ghost }) => (
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ color, fontSize: hs, fontWeight: 600, marginTop: top, textAlign: 'center', maxWidth: '84%', lineHeight: .98 }}>{head}</div>
        <div style={{ color, fontFamily: sans, fontWeight: 300, fontSize: ss, marginTop: tall ? 34 : 24, textAlign: 'center', maxWidth: '78%', lineHeight: 1.35 }}>{sub}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: ph, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: tall ? 80 : 46, opacity: ghost ? .55 : 1 }}>
          {img ? <Img src={img} style={{ width: '100%', height: '100%', objectPosition: 'bottom' }} /> : <GhostBottle s={ghost ? 0.9 : 1} theme={theme} />}
        </div>
      </div>
    );
    body = (
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <Col head={cur.lHead} sub={cur.lSub} color={accent} img={cur.img} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: `linear-gradient(180deg,transparent,${line},transparent)` }} />
        <Col head={cur.rHead} sub={cur.rSub} color={muted} ghost />
      </div>
    );
  }

  if (tpl === 'tabla') {
    const hasImg = !!cur.img, sideX = 100;
    const titleTop = tall ? (hasImg ? 520 : 150) : 90;
    const tableTop = titleTop + (tall ? 150 : 120);
    const colW = 150, featW = w - sideX * 2 - colW * 2, rowH = tall ? 150 : 104;
    body = (
      <>
        {hasImg && tall && (
          <div style={{ position: 'absolute', top: 120, left: 0, right: 0, height: 420, display: 'flex', justifyContent: 'center' }}>
            <Img src={cur.img} style={{ height: '100%' }} />
          </div>
        )}
        <div style={{ position: 'absolute', top: titleTop, left: 0, right: 0, padding: `0 ${sideX}px`, textAlign: 'center', color: accent, fontWeight: 600, fontSize: tall ? 72 : 58 }}>{cur.title}</div>
        <div style={{ position: 'absolute', top: tableTop, left: sideX, right: sideX }}>
          <div style={{ display: 'grid', gridTemplateColumns: `${featW}px ${colW}px ${colW}px`, fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.14em', color: muted, fontSize: 22, paddingBottom: 18 }}>
            <span /><span style={{ textAlign: 'center' }}>Nosotros</span><span style={{ textAlign: 'center' }}>Otros</span>
          </div>
          {cur.rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: `${featW}px ${colW}px ${colW}px`, alignItems: 'center', height: rowH, borderTop: `1px solid ${line}` }}>
              <div style={{ fontFamily: sans, fontSize: tall ? 34 : 28 }}>{r.feat}</div>
              <div style={{ display: 'flex', justifyContent: 'center', color: accent }}><Mark type="check" color={accent} /></div>
              <div style={{ display: 'flex', justifyContent: 'center', color: muted }}><Mark type={r.o} color={muted} /></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (tpl === 'producto' || tpl === 'lanzamiento') {
    const imgTop = tall ? 180 : 90, imgH = tall ? 820 : 540, infoTop = imgTop + imgH + (tall ? 40 : 24);
    body = (
      <>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
          {cur.img ? <Img src={cur.img} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.5 : 1.1} theme={theme} />}
        </div>
        <div style={{ position: 'absolute', top: infoTop, left: 0, right: 0, textAlign: 'center', padding: '0 90px' }}>
          <div style={{ fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.32em', fontSize: 24, color: muted }}>{cur.eyebrow}</div>
          <div style={{ fontWeight: 600, fontSize: tall ? 96 : 78, marginTop: 18, lineHeight: 1 }}>{cur.name}</div>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 30, marginTop: 22, color: muted, letterSpacing: '.04em' }}>{cur.notes}</div>
          <div style={{ fontFamily: sans, fontSize: 28, marginTop: 28, color: accent, letterSpacing: '.04em' }}>{cur.meta}</div>
          {tpl === 'producto' && (
            <div style={{ display: 'inline-block', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '.2em', fontSize: 21, marginTop: 32, padding: '14px 30px', border: `1px solid ${accent}`, borderRadius: 999, color: accent }}>{cur.chip}</div>
          )}
        </div>
      </>
    );
  }

  if (tpl === 'promo') {
    const imgTop = tall ? 170 : 80, imgH = tall ? 760 : 500, infoTop = imgTop + imgH + (tall ? 30 : 18);
    body = (
      <>
        <div style={{ position: 'absolute', top: imgTop, left: 0, right: 0, height: imgH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
          {cur.img ? <Img src={cur.img} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.4 : 1.05} theme={theme} />}
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
          {cur.img ? <Img src={cur.img} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <GhostBottle s={tall ? 1.4 : 1.05} theme={theme} />}
        </div>
        <div style={{ position: 'absolute', top: infoTop, left: 0, right: 0, textAlign: 'center', padding: '0 90px' }}>
          <div style={{ fontWeight: 600, fontSize: tall ? 92 : 76 }}>{cur.name}</div>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 30, marginTop: 20, color: muted }}>{cur.notes}</div>
          <div style={{ fontFamily: sans, fontSize: 28, marginTop: 26, color: accent }}>{cur.meta}</div>
        </div>
      </>
    );
  }

  return (
    <div ref={stageRef} style={base}>
      {frame}
      {body}
      {foot}
    </div>
  );
}

/* ---------------- estilos del panel ---------------- */
const CSS = `
.attar-studio{--ink:#0c0b09;--noir:#15120c;--gold:#c6a15b;--gold-b:#e6c887;--cream:#f3ede1;--smoke:#8c857a;--line:rgba(198,161,91,.22);
  position:fixed;inset:0;display:flex;flex-direction:column;background:var(--ink);color:var(--cream);
  font-family:var(--font-inter-studio),system-ui,sans-serif;z-index:50}
.attar-studio *{box-sizing:border-box}
.as-top{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:14px 20px;border-bottom:1px solid var(--line);background:rgba(21,18,12,.7)}
.as-mark{font-family:var(--font-cormorant),serif;font-size:22px}
.as-mark span{display:block;font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:var(--smoke);margin-top:4px}
.as-group{display:flex;align-items:center}
.as-lbl{font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--smoke);margin-right:8px}
.as-seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}
.as-seg button{border:0;background:transparent;color:var(--smoke);font-size:12px;padding:8px 13px;cursor:pointer}
.as-seg button.on{background:var(--gold);color:#1a1404;font-weight:600}
.as-accent{display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--smoke)}
.as-accent input{width:26px;height:26px;border:1px solid var(--line);border-radius:6px;background:none;padding:0;cursor:pointer}
.as-spacer{flex:1}
.as-title{background:rgba(0,0,0,.3);border:1px solid var(--line);border-radius:8px;color:var(--cream);padding:8px 12px;font-size:13px;width:150px}
.as-btn{border:1px solid var(--gold);border-radius:999px;background:linear-gradient(180deg,var(--gold-b),var(--gold));color:#1a1404;font-weight:600;font-size:13px;padding:10px 18px;cursor:pointer}
.as-btn.ghost{background:transparent;color:var(--cream)}
.as-btn:disabled{opacity:.6}
.as-shell{flex:1;display:grid;grid-template-columns:330px 1fr;min-height:0}
.as-controls{border-right:1px solid var(--line);padding:18px;overflow:auto}
.as-tabs{display:flex;gap:6px;margin-bottom:16px}
.as-tabs button{flex:1;border:1px solid var(--line);background:transparent;color:var(--smoke);border-radius:8px;padding:8px;font-size:12px;cursor:pointer}
.as-tabs button.on{border-color:var(--gold);color:var(--cream);background:rgba(198,161,91,.1)}
.as-tplgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:18px}
.as-tpl{border:1px solid var(--line);background:transparent;color:var(--smoke);border-radius:9px;padding:9px 4px;font-size:11px;cursor:pointer}
.as-tpl.on{border-color:var(--gold);color:var(--cream);background:rgba(198,161,91,.1)}
.as-field{margin-bottom:13px}
.as-field label{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--smoke);margin-bottom:6px}
.as-field input,.as-field textarea,.as-search{width:100%;background:rgba(0,0,0,.28);border:1px solid rgba(243,237,225,.1);border-radius:8px;color:var(--cream);font-size:14px;padding:9px 11px;font-family:inherit}
.as-field textarea{min-height:54px;resize:vertical}
.as-field input:focus,.as-field textarea:focus,.as-search:focus{outline:none;border-color:var(--gold)}
.as-subh{font-family:var(--font-cormorant),serif;font-size:17px;color:var(--gold-b);margin:18px 0 11px;padding-bottom:7px;border-bottom:1px solid var(--line)}
.as-upload{display:block;border:1px dashed var(--line);border-radius:9px;padding:11px;text-align:center;color:var(--smoke);font-size:12px;cursor:pointer;margin-bottom:13px}
.as-upload.has{border-style:solid;border-color:var(--gold);color:var(--gold-b)}
.as-row{display:grid;grid-template-columns:1fr auto auto;gap:6px;margin-bottom:7px}
.as-row input{background:rgba(0,0,0,.28);border:1px solid rgba(243,237,225,.1);border-radius:7px;color:var(--cream);padding:8px;font-size:13px}
.as-mini{width:34px;height:34px;border:1px solid var(--line);background:rgba(0,0,0,.25);color:var(--cream);border-radius:7px;cursor:pointer}
.as-mini.del{color:var(--smoke)}
.as-addrow{width:100%;border:1px dashed var(--line);background:transparent;color:var(--smoke);border-radius:8px;padding:9px;font-size:12px;cursor:pointer;margin-top:4px}
.as-search{margin-bottom:12px}
.as-list,.as-saved{display:flex;flex-direction:column;gap:7px}
.as-item,.as-savedcard{display:flex;align-items:center;gap:11px;border:1px solid var(--line);background:transparent;border-radius:10px;padding:8px;cursor:pointer;text-align:left;color:var(--cream)}
.as-item:hover,.as-savedcard:hover{border-color:var(--gold);background:rgba(198,161,91,.07)}
.as-item img,.as-savedcard img,.as-item .ph{width:42px;height:52px;object-fit:contain;border-radius:6px;background:rgba(0,0,0,.3);flex:0 0 auto}
.as-savedcard img{width:48px;height:48px}
.as-item .meta,.as-savedcard span{display:flex;flex-direction:column;gap:2px;min-width:0}
.as-item b,.as-savedcard b{font-size:13px}
.as-item i,.as-savedcard i{font-size:11px;color:var(--smoke);font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.as-empty{color:var(--smoke);font-size:13px;text-align:center;padding:20px}
.as-canvas{display:flex;align-items:center;justify-content:center;padding:32px;overflow:hidden}
.as-frame{position:relative;overflow:hidden;border-radius:8px;box-shadow:0 30px 80px -30px rgba(0,0,0,.8)}
@media (max-width:860px){.as-shell{grid-template-columns:1fr}.as-canvas{display:none}}
`;
