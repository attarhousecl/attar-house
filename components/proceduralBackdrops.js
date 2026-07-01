/**
 * Fondos de estudio generados por capas de CSS/SVG (sin API externa).
 * Compartido entre AttarPhotoStudio (recorte de producto) y AttarStudio
 * (estudio publicitario), para que ambos puedan ofrecer las mismas escenas.
 */
export const BACKDROP_SIZE = 1024;

export const SCENES = [
  { id: "marmol", label: "Mármol Oscuro", desc: "Lujo, fondo casi negro" },
  { id: "blanco", label: "E-commerce Blanco", desc: "Limpio y clásico" },
  { id: "gris", label: "E-commerce Gris", desc: "Elegante y uniforme" },
  { id: "bokeh", label: "Bokeh Dorado", desc: "Luces difusas doradas" },
  { id: "arena", label: "Arena Cálida", desc: "Tonos cálidos suaves" },
  { id: "tropical", label: "Hojas Tropicales", desc: "Verde oscuro, hojas" },
];

const rand = (a, b) => a + Math.random() * (b - a);

export function makeSeed(sceneId) {
  const dots = Array.from({ length: Math.round(rand(5, 9)) }, () => ({
    x: rand(5, 95),
    y: rand(5, 95),
    r: rand(40, 140),
    o: rand(0.06, 0.22),
  }));
  const leaves = Array.from({ length: Math.round(rand(3, 5)) }, () => ({
    x: rand(-10, 90),
    y: rand(-10, 70),
    rot: rand(-40, 40),
    scale: rand(0.7, 1.4),
    o: rand(0.5, 0.85),
  }));
  return {
    sceneId,
    angle: Math.round(rand(0, 360)),
    lightX: rand(20, 80),
    lightY: rand(10, 45),
    tint: rand(-6, 6),
    shadowScale: rand(0.85, 1.15),
    dots,
    leaves,
  };
}

export function Backdrop({ seed, uid = "", width = BACKDROP_SIZE, height = BACKDROP_SIZE }) {
  const { sceneId, angle, lightX, lightY, tint, dots, leaves } = seed;
  const base = { position: "absolute", inset: 0, overflow: "hidden" };

  if (sceneId === "blanco" || sceneId === "gris") {
    const flat = sceneId === "blanco" ? "#f7f5f1" : "#e2dfd8";
    const edge = sceneId === "blanco" ? "#e8e4dc" : "#cfcbc0";
    return (
      <div style={{ ...base, background: `radial-gradient(circle at ${lightX}% ${lightY}%, ${flat}, ${edge})` }} />
    );
  }

  if (sceneId === "marmol") {
    return (
      <div style={{ ...base, background: `linear-gradient(${angle}deg, #15120c, #050402 60%)` }}>
        <div
          style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(212,175,55,0.16), transparent 55%)`,
          }}
        />
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
          <defs>
            <linearGradient id={`vein${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#vein${uid})`} />
        </svg>
      </div>
    );
  }

  if (sceneId === "bokeh") {
    return (
      <div style={{ ...base, background: `linear-gradient(${angle}deg, #0c0a06, #1a140a)` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id={`dot${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
          </defs>
          {dots.map((d, i) => (
            <circle key={i} cx={(d.x / 100) * width} cy={(d.y / 100) * height} r={d.r} fill={`url(#dot${uid})`} opacity={d.o} />
          ))}
        </svg>
      </div>
    );
  }

  if (sceneId === "arena") {
    return (
      <div
        style={{
          ...base,
          background: `linear-gradient(${angle}deg, hsl(${32 + tint} 38% 78%), hsl(${20 + tint} 30% 58%))`,
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.35), transparent 60%)`,
          }}
        />
      </div>
    );
  }

  if (sceneId === "tropical") {
    return (
      <div style={{ ...base, background: `linear-gradient(${angle}deg, #0a1209, #060805)` }}>
        <div
          style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(212,175,55,0.10), transparent 55%)`,
          }}
        />
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          {leaves.map((l, i) => (
            <g key={i} transform={`translate(${(l.x / 100) * width},${(l.y / 100) * height}) rotate(${l.rot}) scale(${l.scale})`} opacity={l.o}>
              <path d="M0 0 C 60 -30, 140 -10, 170 60 C 130 50, 90 40, 60 70 C 40 40, 20 20, 0 0 Z" fill="#0d1f10" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  return <div style={base} />;
}

export function GroundShadow({ shadowScale = 1, uid = "", width = BACKDROP_SIZE, height = BACKDROP_SIZE }) {
  const cx = width / 2, cy = height * 0.88;
  const rx = width * 0.16 * shadowScale, ry = height * 0.034 * shadowScale;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id={`gshadow${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="black" stopOpacity="0.5" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#gshadow${uid})`} />
    </svg>
  );
}
