// Iconos SVG en linea para la navbar. Antes la barra usaba iconos de Phosphor
// cargados desde un CDN externo (unpkg/jsdelivr) por <Script> en el layout; si
// ese CDN iba lento o fallaba, TODOS los iconos de la navbar quedaban en blanco
// (cuadros vacios) y en movil se veia rota. Estos SVG viajan en el bundle del
// sitio y se pintan siempre, sin depender de red externa. Trazo geometrico, en
// linea con el monograma de marca. Heredan color via currentColor y tamano via
// font-size (width/height = 1em) del boton contenedor.
const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

export function IconHeart(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.3 4.6 12.9a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9a4.6 4.6 0 0 1 6.5 6.5z" />
    </svg>
  );
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconMoon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 13.5A7.5 7.5 0 1 1 10.5 4a6 6 0 0 0 9.5 9.5z" />
    </svg>
  );
}

export function IconSun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.4M12 19.6V22M4.2 4.2 5.9 5.9M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8 5.9 18.1M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

export function IconList(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconDrop(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3s6 6.4 6 10.5a6 6 0 0 1-12 0C6 9.4 12 3 12 3z" />
    </svg>
  );
}
