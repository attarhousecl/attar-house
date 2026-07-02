'use client';
/**
 * Attar Studio · Fase 2 — lienzo editable.
 * Wrapper de elementos con pointer events: seleccionar, arrastrar, redimensionar
 * (handles de esquina o pellizco). El estado de layout vive fuera de este archivo,
 * en content[tpl].layout = { [id]: { dx, dy, scale, z, align, font } }.
 */
import { useRef } from 'react';

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Estilo aplicado al wrapper de un elemento editable a partir de su layout guardado.
export function elementStyle(layout, defaultAlign = 'center') {
  const dx = layout?.dx || 0;
  const dy = layout?.dy || 0;
  const sc = layout?.scale ?? 1;
  const z = layout?.z ?? 0;
  const style = {
    position: 'relative',
    transform: `translate(${dx}px, ${dy}px) scale(${sc})`,
    transformOrigin: 'center center',
    zIndex: z,
  };
  // el bloque hereda esta alineación por defecto salvo que el usuario elija otra en el panel
  style.textAlign = layout?.align || defaultAlign;
  if (layout?.font === 'serif') style['--as-font-override'] = 'var(--font-cormorant), Georgia, serif';
  if (layout?.font === 'sans') style['--as-font-override'] = 'var(--font-inter-studio), system-ui, sans-serif';
  return style;
}

export function EditableItem({
  id, kind = 'text', layout, onChange, onSelect, isSelected, editable, previewScale = 1,
  resizable = false, style, className = '', defaultAlign = 'center', children,
}) {
  const drag = useRef(null);
  const pts = useRef(new Map());

  if (!editable) {
    return <div style={{ ...elementStyle(layout, defaultAlign), ...style }}>{children}</div>;
  }

  const beginDrag = (e) => {
    e.stopPropagation();
    onSelect(id, kind);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* no-op */ }
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!drag.current) {
      drag.current = {
        mode: 'move', startX: e.clientX, startY: e.clientY,
        dx0: layout?.dx || 0, dy0: layout?.dy || 0, scale0: layout?.scale ?? 1, pinchStart: null,
      };
    } else if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      drag.current.pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      drag.current.scale0 = layout?.scale ?? 1;
    }
  };

  const onMove = (e) => {
    if (!drag.current) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (drag.current.mode === 'move' && pts.current.size >= 2 && drag.current.pinchStart) {
      const [a, b] = [...pts.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const ratio = dist / drag.current.pinchStart;
      onChange(id, { scale: clamp(drag.current.scale0 * ratio, 0.3, 3.2) });
      return;
    }
    if (drag.current.mode === 'move') {
      const ddx = (e.clientX - drag.current.startX) / previewScale;
      const ddy = (e.clientY - drag.current.startY) / previewScale;
      onChange(id, { dx: drag.current.dx0 + ddx, dy: drag.current.dy0 + ddy });
    } else if (drag.current.mode === 'resize') {
      const dist = Math.hypot(e.clientX - drag.current.cx, e.clientY - drag.current.cy) / previewScale;
      const ratio = dist / drag.current.startDist;
      onChange(id, { scale: clamp(drag.current.scale0 * ratio, 0.3, 3.2) });
    }
  };

  const endDrag = (e) => {
    pts.current.delete(e.pointerId);
    if (pts.current.size === 0) drag.current = null;
  };

  const beginResize = (e) => {
    e.stopPropagation(); e.preventDefault();
    onSelect(id, kind);
    const host = e.currentTarget.closest('[data-as-item]');
    const rect = host.getBoundingClientRect();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* no-op */ }
    drag.current = {
      mode: 'resize',
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      startDist: Math.max(1, Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2)) / previewScale),
      scale0: layout?.scale ?? 1,
    };
  };

  return (
    <div
      data-as-item
      data-as-id={id}
      className={`as-editable ${isSelected ? 'as-editable-on' : ''} ${className}`}
      style={{ ...elementStyle(layout, defaultAlign), ...style }}
      onPointerDown={beginDrag}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {children}
      {isSelected && resizable && (
        <div className="as-handles">
          {['nw', 'ne', 'sw', 'se'].map((corner) => (
            <span
              key={corner}
              className={`as-handle as-handle-${corner}`}
              onPointerDown={beginResize}
              onPointerMove={onMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const ELEMENT_LABELS = {
  img: 'Foto de producto', rImg: 'Foto (lado Otros)', foot: 'Logo / firma', extra: 'Texto extra',
  info: 'Bloque de texto', eyebrow: 'Etiqueta', name: 'Nombre', notes: 'Notas', title: 'Título',
  table: 'Tabla', quote: 'Cita', stars: 'Estrellas', who: 'Nombre / ciudad', badge: 'Urgencia',
  counter: 'Contador', infoL: 'Texto (Attar House)', infoR: 'Texto (Otros)',
};

export function ElementPanel({ id, kind, scale, layout, onChange, onReset, onFront, onBack, onClose }) {
  return (
    <div className="as-card as-elpanel">
      <div className="as-subh" style={{ marginTop: 0 }}>Elemento · {ELEMENT_LABELS[id] || id}</div>
      <p className="as-hint" style={{ marginTop: 0 }}>Arrastra el elemento en el lienzo para moverlo. Esc o clic fuera para deseleccionar.</p>
      <div className="as-field">
        <label>Tamaño · {Math.round((scale ?? 1) * 100)}%</label>
        <input
          type="range" min="0.3" max="2.4" step="0.05" value={scale ?? 1}
          onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
          className="as-range"
        />
      </div>
      {kind === 'text' && (
        <>
          <div className="as-field">
            <label>Alineación</label>
            <div className="as-seg">
              {[['left', 'Izq'], ['center', 'Centro'], ['right', 'Der']].map(([k, lb]) => (
                <button key={k} className={(layout?.align || 'center') === k ? 'on' : ''} onClick={() => onChange({ align: k })}>{lb}</button>
              ))}
            </div>
          </div>
          <div className="as-field">
            <label>Fuente</label>
            <div className="as-seg">
              <button className={!layout?.font ? 'on' : ''} onClick={() => onChange({ font: null })}>Original</button>
              <button className={layout?.font === 'serif' ? 'on' : ''} onClick={() => onChange({ font: 'serif' })}>Cormorant</button>
              <button className={layout?.font === 'sans' ? 'on' : ''} onClick={() => onChange({ font: 'sans' })}>Inter</button>
            </div>
          </div>
        </>
      )}
      <div className="as-field">
        <label>Capas</label>
        <div className="as-seg">
          <button onClick={onFront}>Traer al frente</button>
          <button onClick={onBack}>Enviar atrás</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="as-shuffle" style={{ flex: 1 }} onClick={onReset}>Restablecer diseño</button>
        <button className="as-shuffle" style={{ flex: 1 }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
