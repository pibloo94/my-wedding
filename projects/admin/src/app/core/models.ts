/**
 * Modelo de datos de la app. Se guarda en Firestore en admin/state (configuración) y en una
 * subcolección por lista: admin/state/{colección}/{id}. Ver docs/MODELO-DATOS.md.
 */

export type GuestStatus = 'pendiente' | 'confirmado' | 'rechazado';
export type MemberRole = 'adulto' | 'acompañante' | 'niño';
export type MenuKind = 'estandar' | 'vegetariano' | '';

export interface Member {
  id: string;
  role: MemberRole;
  name: string;
  age: number | null;
  menu: MenuKind;
  /** Sin gluten */
  gf: boolean;
  /** Sin lactosa */
  lf: boolean;
  allergies: string;
  /** Id de la mesa ('' = sin mesa) */
  table: string;
}

export interface Guest {
  id: string;
  name: string;
  group: string;
  status: GuestStatus;
  contact: string;
  contactKey?: string | null;
  members: Member[];
  notes: string;
  message?: string;
  /** web: llegó por el formulario; manual: creada en la app; hoja: CSV antiguo */
  source?: 'web' | 'manual' | 'hoja' | string;
  /** Origen antes de unirse a una respuesta de la web (para deshacer si se borra la respuesta) */
  origin?: string;
  rsvpId?: string;
  rsvpAt?: string;
  rsvpDate?: string;
}

export type TableShape = 'redonda' | 'rectangular' | 'presidencial';

export interface Table {
  id: string;
  name: string;
  shape: TableShape;
  cap: number;
  notes?: string;
  /** Posición en el plano del salón (centro de la mesa, en unidades del plano). Sin valor = sin colocar. */
  x?: number | null;
  y?: number | null;
  /** Giro en grados (múltiplos de 15) */
  rot?: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'Pagado' | 'Programado' | string;
  note?: string;
}

export interface Expense {
  id: string;
  concept: string;
  cat: string;
  vendor?: string;
  est?: number;
  act?: number;
  due?: string;
  notes?: string;
  payments: Payment[];
}

export interface Vendor {
  id: string;
  name: string;
  cat?: string;
  status: string;
  contract: string;
  price?: number;
  contact?: string;
  phone?: string;
  email?: string;
  link?: string;
  notes?: string;
}


export interface Task {
  id: string;
  title: string;
  /** Antiguo agrupador por fases; ya no se usa (se agrupa por meses según la fecha) */
  phase?: string;
  who: string;
  /** Días antes de la boda (negativo = después). Sin fecha fija, la tarea se mueve con la boda */
  offset: number;
  /** Fecha fija (AAAA-MM-DD); si está, manda sobre offset y la tarea no se mueve con la boda */
  due: string;
  cat: string;
  notes: string;
  done: boolean;
}

export interface Inspo { id: string; title: string; url?: string; note?: string; }
export interface WebResource { id: string; title: string; url?: string; type: string; note?: string; }
export interface WebLogEntry {
  id: string; date: string; status: string; section?: string; field?: string;
  file?: string; from?: string; to?: string; change?: string;
}

export interface Config {
  n1: string;
  n2: string;
  weddingDate: string;
  ceremonyTime: string;
  venue: string;
  publicUrl: string;
  repoUrl: string;
  localPath: string;
  budget: number;
}

/** Plano del salón */
export interface FloorPlan {
  /** Nombre que sale en la descarga (p. ej. «Gran Salón del Negralejo») */
  title: string;
  /** Tamaño del salón en unidades del plano (1 unidad ≈ 1 cm de pantalla a escala 1) */
  width: number;
  height: number;
  /** Zonas fijas: pista de baile, entrada, barra… */
  zones: FloorZone[];
}

export interface FloorZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ThemeMeta {
  /** Notas de estilo (privadas). Los colores viven en el contenido publicado de la web. */
  notes: string;
}

export interface Meta {
  v: number;
  config: Config;
  theme: ThemeMeta;
  plan: FloorPlan;
  webStatus: string;
  webStatusNote: string;
}

export interface Collections {
  guests: Guest[];
  tables: Table[];
  expenses: Expense[];
  vendors: Vendor[];
  tasks: Task[];
  inspo: Inspo[];
  webResources: WebResource[];
  webLog: WebLogEntry[];
}

export type CollKey = keyof Collections;

/**
 * Colecciones que sincroniza la app. Las de versiones anteriores (day, logistics, webPlan,
 * webChecks, webTexts, webInfo) ya no se leen ni se escriben; sus datos siguen en Firestore.
 */
export const COLLECTIONS: CollKey[] = ['guests', 'tables', 'expenses', 'vendors', 'tasks', 'inspo', 'webResources', 'webLog'];

export interface AppState extends Collections {
  meta: Meta;
}

/** Respuesta del formulario de la web (colección rsvps). */
export interface RsvpPerson {
  role?: string;
  name?: string;
  age?: number;
  menu?: string;
  glutenFree?: boolean;
  lactoseFree?: boolean;
  allergies?: string;
}

export interface RsvpDoc {
  id: string;
  name?: string;
  contact?: string;
  attending?: 'si' | 'no' | string;
  message?: string;
  people?: RsvpPerson[];
  submittedAt?: string;
}
