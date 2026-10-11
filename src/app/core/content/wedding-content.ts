/**
 * Contenido editable de la web.
 *
 * La web muestra DEFAULT_CONTENT y, al cargar, lo sustituye por lo publicado desde la app
 * de gestión (Firestore → content/published). Si Firebase no responde, se queda con esto.
 * Mantener alineado con la app de gestión: ver docs/MODELO-DATOS.md.
 */

export interface WeddingEvent {
  id: string;
  icon: string;
  type: string;
  title: string;
  timeStart: string;
  timeEnd: string;
  venue: string;
  address: string;
  mapsUrl: string;
  dressCode: string;
  description: string;
}

export interface InfoCard {
  icon: string;
  title: string;
  accent: string;
  items: string[];
}

/** Tipos de sección. Las cuatro primeras son fijas (solo se muestran u ocultan); `text` son secciones libres. */
export type SectionKind = 'events' | 'needToKnow' | 'rsvp' | 'registry' | 'text';

export interface SectionConfig {
  /** Ancla en la página (#eventos, #detalles…). Fija en las secciones propias. */
  id: string;
  kind: SectionKind;
  visible: boolean;
  /** Texto del enlace en el menú */
  navLabel: string;
  /** Etiqueta pequeña sobre el título */
  label: string;
  title: string;
  subtitle: string;
  /** Solo secciones de texto: párrafos separados por una línea en blanco */
  body: string;
  items: string[];
  linkText: string;
  linkUrl: string;
}

/**
 * Colores de la web, editables desde la app de gestión (Temática). Cada uno es un HEX #RRGGBB.
 * Los tonos derivados (suave, borde, fondo alternativo…) los calcula la web a partir de estos.
 */
export interface ThemeColors {
  /** Terracota: monograma, botones y enlaces */
  primary: string;
  /** Terracota profundo: botones al pasar el ratón, énfasis */
  primaryDeep: string;
  /** Verde salvia: títulos y acentos */
  sage: string;
  /** Salvia profundo: títulos principales */
  sageDeep: string;
  /** Arena: cintas, escudo y bordes */
  sand: string;
  /** Naranja pintado: detalles */
  orange: string;
  /** Fondo de página */
  background: string;
  /** Tarjetas y superficies */
  surface: string;
}

export const THEME_KEYS: (keyof ThemeColors)[] = ['primary', 'primaryDeep', 'sage', 'sageDeep', 'sand', 'orange', 'background', 'surface'];

/** Tipografía de la web, editable desde la app de gestión (Temática). Valores: id de FONTS. */
export interface Typography {
  /** Títulos, nombres y textos en cursiva */
  headings: string;
  /** Texto, botones y etiquetas */
  text: string;
}

export interface FontOption {
  id: string;
  name: string;
  /** Pila CSS (font-family) */
  stack: string;
  /** Familia y pesos para Google Fonts; sin él, la fuente va con la web (Butler) */
  google?: string;
  /** Para qué se ofrece */
  roles: (keyof Typography)[];
  /** Descripción corta para elegir */
  note: string;
}

const SERIF = 'Georgia, serif';
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Tipografías que se pueden elegir. Solo se descargan las que se usan. */
export const FONTS: FontOption[] = [
  { id: 'butler', name: 'Butler', stack: `'Butler', ${SERIF}`, roles: ['headings', 'text'], note: 'La original de la web' },
  { id: 'cormorant', name: 'Cormorant Garamond', stack: `'Cormorant Garamond', ${SERIF}`, google: 'Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400', roles: ['headings', 'text'], note: 'Clásica y fina' },
  { id: 'playfair', name: 'Playfair Display', stack: `'Playfair Display', ${SERIF}`, google: 'Playfair+Display:ital,wght@0,400;0,500;0,600;1,400', roles: ['headings'], note: 'Editorial, alto contraste' },
  { id: 'bodoni', name: 'Bodoni Moda', stack: `'Bodoni Moda', ${SERIF}`, google: 'Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400', roles: ['headings'], note: 'Revista de moda' },
  { id: 'marcellus', name: 'Marcellus', stack: `'Marcellus', ${SERIF}`, google: 'Marcellus', roles: ['headings'], note: 'Romana, de inscripción' },
  { id: 'cinzel', name: 'Cinzel', stack: `'Cinzel', ${SERIF}`, google: 'Cinzel:wght@400;500;600', roles: ['headings'], note: 'Solo mayúsculas, solemne' },
  { id: 'ebgaramond', name: 'EB Garamond', stack: `'EB Garamond', ${SERIF}`, google: 'EB+Garamond:ital,wght@0,400;0,500;0,600;1,400', roles: ['text'], note: 'Libro clásico' },
  { id: 'lora', name: 'Lora', stack: `'Lora', ${SERIF}`, google: 'Lora:ital,wght@0,400;0,500;0,600;1,400', roles: ['text'], note: 'Serif cálida, muy legible' },
  { id: 'baskerville', name: 'Libre Baskerville', stack: `'Libre Baskerville', ${SERIF}`, google: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400', roles: ['text'], note: 'Serif sobria' },
  { id: 'jost', name: 'Jost', stack: `'Jost', ${SANS}`, google: 'Jost:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400', roles: ['text'], note: 'Sin serifa geométrica' },
  { id: 'montserrat', name: 'Montserrat', stack: `'Montserrat', ${SANS}`, google: 'Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400', roles: ['text'], note: 'Sin serifa moderna' }
];

export const fontById = (id: string): FontOption => FONTS.find(f => f.id === id) ?? FONTS[0]!;

export interface WeddingContent {
  v: number;
  theme: ThemeColors;
  typography: Typography;
  /** Orden y configuración de las secciones (la portada y el pie son fijos) */
  sections: SectionConfig[];
  /** Portada. name1/name2: los nombres de la pareja (portada, pie, pantalla de entrada y título). */
  hero: { name1: string; name2: string; dateText: string; location: string; countdownIso: string };
  events: WeddingEvent[];
  needToKnow: InfoCard[];
  rsvp: { deadlineText: string; contactEmail: string };
  registry: { titular: string; iban: string; concepto: string };
}

export const DEFAULT_CONTENT: WeddingContent = {
  "v": 1,
  "theme": {
    "primary": "#B15C38",
    "primaryDeep": "#97492A",
    "sage": "#7E8C6A",
    "sageDeep": "#5E6A49",
    "sand": "#E7DCC4",
    "orange": "#CD8A52",
    "background": "#F5EFE3",
    "surface": "#FBF7EF"
  },
  "typography": {
    "headings": "butler",
    "text": "butler"
  },
  "hero": {
    "name1": "Daniela",
    "name2": "Pablo",
    "dateText": "11 de Septiembre de 2027",
    "location": "Madrid, España",
    "countdownIso": "2027-09-11T13:00:00+02:00"
  },
  "events": [
    {
      "id": "ceremonia",
      "icon": "heart",
      "type": "Ceremonia",
      "title": "Ceremonia Civil",
      "timeStart": "13:00 h",
      "timeEnd": "13:30 h",
      "venue": "Jardines del Negralejo",
      "address": "Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid",
      "mapsUrl": "https://www.google.com/maps/place/Jardines+del+Negralejo/@40.4085192,-3.51632,17z/data=!4m6!3m5!1s0xd423b214854bab3:0x664516d941116999!8m2!3d40.4085706!4d-3.5162788!16s%2Fg%2F11thnjv_ym?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D",
      "dressCode": "Traje Formal · Evitar blanco",
      "description": "Os esperamos para dar comienzo a esta historia juntos. La ceremonia tendrá lugar en el precioso jardín del palacio."
    },
    {
      "id": "coctel",
      "icon": "glass",
      "type": "Cóctel",
      "title": "Cóctel de Bienvenida",
      "timeStart": "13:30 h",
      "timeEnd": "15:00 h",
      "venue": "Jardines del Negralejo",
      "address": "Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid",
      "mapsUrl": "",
      "dressCode": "Traje Formal · Evitar blanco",
      "description": "Disfruta de aperitivos y bebidas en los jardines mientras celebramos juntos el inicio de nuestra nueva vida."
    },
    {
      "id": "banquete",
      "icon": "utensils",
      "type": "Banquete",
      "title": "Comida",
      "timeStart": "15:00 h",
      "timeEnd": "18:30 h",
      "venue": "Gran Salón del Negralejo",
      "address": "Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid",
      "mapsUrl": "",
      "dressCode": "Traje Formal · Evitar blanco",
      "description": "La celebración continúa con una comida de gala en el Gran Salón. ¡Buen provecho!"
    },
    {
      "id": "baile",
      "icon": "party-popper",
      "type": "Fiesta",
      "title": "Baile",
      "timeStart": "18:30 h",
      "timeEnd": "02:00 h",
      "venue": "Gran Salón del Negralejo",
      "address": "Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid",
      "mapsUrl": "",
      "dressCode": "Traje Formal · Evitar blanco",
      "description": "Abrimos la pista y bailamos hasta la madrugada. ¡Que empiece la fiesta!"
    }
  ],
  "needToKnow": [
    {
      "icon": "shirt",
      "title": "Código de Vestimenta",
      "accent": "#B15C38",
      "items": [
        "Traje formal para caballeros (corbata o pajarita)",
        "Vestido de cóctel para señoras",
        "Por favor, evitar colores blanco, marfil y crudo",
        "Recomendamos llevar zapato de cambio para el baile"
      ]
    },
    {
      "icon": "info",
      "title": "Detalles del Lugar",
      "accent": "#5E6A49",
      "items": [
        "La ceremonia se realiza al aire libre, prever calzado cómodo para jardín",
        "No se permite confeti ni arroz dentro del recinto",
        "Zona de aparcamiento gratuita disponible dentro del recinto",
        "El recinto es accesible para personas con movilidad reducida"
      ]
    },
    {
      "icon": "utensils",
      "title": "Menú y Alergias",
      "accent": "#CD8A52",
      "items": [
        "Menú de cuatro tiempos con opciones vegetarianas",
        "Indicad vuestras alergias o intolerancias en el formulario de confirmación",
        "Menú infantil disponible para los más pequeños",
        "Barra libre durante la fiesta"
      ]
    }
  ],
  "rsvp": {
    "deadlineText": "1 de febrero de 2027",
    "contactEmail": "pablo.daniela2027@gmail.com"
  },
  "registry": {
    "titular": "Pablo Agudo Brun",
    "iban": "",
    "concepto": "Regalo boda Daniela & Pablo"
  },
  "sections": [
    {
      "id": "eventos",
      "kind": "events",
      "visible": true,
      "navLabel": "El Gran Día",
      "label": "El Gran Día",
      "title": "Detalles del Evento",
      "subtitle": "Todo lo que necesitas saber para acompañarnos en este día tan especial",
      "body": "",
      "items": [],
      "linkText": "",
      "linkUrl": ""
    },
    {
      "id": "detalles",
      "kind": "needToKnow",
      "visible": true,
      "navLabel": "Lo Que Debes Saber",
      "label": "Información Práctica",
      "title": "Lo Que Debes Saber",
      "subtitle": "Todo lo que necesitas para disfrutar al máximo de nuestra celebración",
      "body": "",
      "items": [],
      "linkText": "",
      "linkUrl": ""
    },
    {
      "id": "rsvp",
      "kind": "rsvp",
      "visible": true,
      "navLabel": "Confirmar Asistencia",
      "label": "Confirmación de Asistencia",
      "title": "¿Nos acompañas?",
      "subtitle": "Por favor confirma antes del",
      "body": "",
      "items": [],
      "linkText": "",
      "linkUrl": ""
    },
    {
      "id": "registro",
      "kind": "registry",
      "visible": true,
      "navLabel": "Lista de Bodas",
      "label": "Lista de Bodas",
      "title": "Vuestra Generosidad",
      "subtitle": "Vuestro regalo más importante es vuestra presencia. Si aun así queréis tener un detalle con nosotros, aquí encontraréis una cuenta bancaria para hacer una transferencia.",
      "body": "",
      "items": [],
      "linkText": "",
      "linkUrl": ""
    }
  ]
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

/** Copia sobre `base` solo los campos de texto que existan en `inc` (ignora tipos inesperados). */
function strings<T extends object>(base: T, inc: unknown): T {
  const out = { ...base } as Record<string, unknown>;
  if (isObj(inc)) {
    for (const k of Object.keys(base)) {
      if (typeof inc[k] === 'string') out[k] = inc[k];
    }
  }
  return out as T;
}

const EMPTY_EVENT: WeddingEvent = {
  id: '', icon: 'heart', type: '', title: '', timeStart: '', timeEnd: '',
  venue: '', address: '', mapsUrl: '', dressCode: '', description: ''
};

const KINDS: SectionKind[] = ['events', 'needToKnow', 'rsvp', 'registry', 'text'];
const EMPTY_SECTION: SectionConfig = {
  id: '', kind: 'text', visible: true, navLabel: '', label: '', title: '', subtitle: '',
  body: '', items: [], linkText: '', linkUrl: ''
};
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : [];

/**
 * Valida la lista de secciones: cada sección propia aparece una sola vez y con su ancla fija;
 * si falta alguna sección propia, se añade al final. En modo borrador (app de gestión) se
 * conservan las secciones de texto sin título mientras se escriben; en la web se descartan.
 */
function mergeSections(base: SectionConfig[], inc: unknown, draft: boolean): SectionConfig[] {
  const copy = (x: SectionConfig): SectionConfig => ({ ...x, items: [...x.items] });
  if (!Array.isArray(inc)) return base.map(copy);
  const out: SectionConfig[] = [];
  const seenKinds = new Set<SectionKind>();
  const ids = new Set<string>();
  (inc as unknown[]).filter(isObj).forEach((raw, i) => {
    const kind = raw['kind'] as SectionKind;
    if (!KINDS.includes(kind)) return;
    if (kind !== 'text' && seenKinds.has(kind)) return;
    const def = kind === 'text' ? EMPTY_SECTION : (base.find(b => b.kind === kind) ?? EMPTY_SECTION);
    const sec: SectionConfig = {
      ...strings(def, raw),
      kind,
      visible: typeof raw['visible'] === 'boolean' ? (raw['visible'] as boolean) : true,
      items: strList(raw['items'])
    };
    if (kind === 'text') {
      if (!draft && !sec.title.trim()) return;
      let id = /^[a-z0-9-]{1,40}$/.test(sec.id) ? sec.id : `seccion-${i + 1}`;
      while (ids.has(id) || base.some(b => b.id === id)) id += '-x';
      sec.id = id;
    } else {
      sec.id = def.id;
      seenKinds.add(kind);
    }
    if (!/^https:\/\//.test(sec.linkUrl)) sec.linkUrl = '';
    ids.add(sec.id);
    out.push(sec);
  });
  for (const d of base) {
    if (d.kind !== 'text' && !seenKinds.has(d.kind)) out.push(copy(d));
  }
  return out;
}

/** Colores: solo se aceptan HEX de 6 cifras; el resto se queda con el valor por defecto. */
function mergeTheme(base: ThemeColors, inc: unknown): ThemeColors {
  const out = { ...base };
  if (isObj(inc)) {
    for (const k of THEME_KEYS) {
      const v = inc[k];
      if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) out[k] = v.toUpperCase();
    }
  }
  return out;
}

/** Tipografía: solo ids del catálogo y válidos para su papel; el resto, el de respaldo. */
function mergeTypography(base: Typography, inc: unknown): Typography {
  const out = { ...base };
  if (isObj(inc)) {
    for (const k of ['headings', 'text'] as const) {
      const f = FONTS.find(x => x.id === inc[k]);
      if (f && f.roles.includes(k)) out[k] = f.id;
    }
  }
  return out;
}

export interface NormalizeOptions {
  /** Contenido de respaldo (por defecto, DEFAULT_CONTENT) */
  base?: WeddingContent;
  /**
   * Modo borrador, para la app de gestión: conserva lo que aún se está escribiendo (momentos,
   * tarjetas o secciones sin título, listas vacías). La app impide publicarlo así.
   * Sin él (la web), lo incompleto se descarta y las listas vacías vuelven al respaldo.
   */
  draft?: boolean;
}

/**
 * Única validación del contenido, compartida por la web y la app de gestión: comprueba tipos
 * campo a campo y completa con el respaldo lo que falte.
 */
export function normalizeContent(inc: unknown, opts: NormalizeOptions = {}): WeddingContent {
  const base = opts.base ?? DEFAULT_CONTENT;
  const draft = !!opts.draft;
  const src: Obj = isObj(inc) ? inc : {};
  const events = Array.isArray(src['events'])
    ? (src['events'] as unknown[]).filter(isObj).map((e, i) => {
        const ev = strings(EMPTY_EVENT, e);
        return { ...ev, id: ev.id || `momento-${i + 1}` };
      }).filter(e => draft || e.title)
    : null;
  const cards = Array.isArray(src['needToKnow'])
    ? (src['needToKnow'] as unknown[]).filter(isObj).map(c => ({
        ...strings({ icon: 'info', title: '', accent: '#5E6A49' }, c),
        items: strList(c['items'])
      })).filter(c => draft || c.title)
    : null;
  const keep = <T>(list: T[] | null, fallback: T[]): T[] =>
    list && (draft || list.length) ? list : fallback.map(x => ({ ...x }));
  return {
    v: typeof src['v'] === 'number' ? src['v'] : base.v,
    theme: mergeTheme(base.theme, src['theme']),
    typography: mergeTypography(base.typography, src['typography']),
    sections: mergeSections(base.sections, src['sections'], draft),
    hero: strings(base.hero, src['hero']),
    events: keep(events, base.events),
    needToKnow: keep(cards, base.needToKnow).map(c => ({ ...c, items: [...c.items] })),
    rsvp: strings(base.rsvp, src['rsvp']),
    registry: strings(base.registry, src['registry'])
  };
}

/** Lo que usa la web: combina el contenido publicado con el de respaldo. */
export function mergeContent(base: WeddingContent, inc: unknown): WeddingContent {
  return isObj(inc) ? normalizeContent(inc, { base }) : base;
}

export const EMPTY_EVENT_TEMPLATE: WeddingEvent = { ...EMPTY_EVENT };
export const EMPTY_SECTION_TEMPLATE: SectionConfig = { ...EMPTY_SECTION, items: [] };
