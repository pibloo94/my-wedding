/** Datos iniciales (primera vez) y migración de copias antiguas. */
import { AppState, Collections, FloorPlan, Guest, Meta, Task, WebPlanStep } from './models';
import { mkMember } from './domain';
import { uid } from './util';

const T = (title: string, phase: string, offset: number, cat = 'General', extra: Partial<Task> = {}): Task =>
  ({ id: uid(), title, phase, who: '', offset, due: '', cat, notes: '', done: false, ...extra });

const P = (phase: string, title: string, detail: string, file = '', where = 'Repositorio de la web'): WebPlanStep =>
  ({ id: uid(), phase, title, detail, file, where, status: 'Pendiente' });

export function defaultPlan(): FloorPlan {
  return {
    title: 'Gran Salón del Negralejo',
    width: 1600,
    height: 1000,
    zones: [
      { id: uid(), label: 'Pista de baile', x: 650, y: 380, w: 300, h: 240 },
      { id: uid(), label: 'Entrada', x: 720, y: 930, w: 160, h: 50 }
    ]
  };
}

export function seedMeta(): Meta {
  return {
    v: 4,
    config: {
      n1: 'Daniela', n2: 'Pablo', weddingDate: '2027-09-11', ceremonyTime: '13:00', venue: 'Jardines del Negralejo',
      publicUrl: 'https://pibloo94.github.io/my-wedding/', repoUrl: 'https://github.com/pibloo94/my-wedding',
      localPath: 'C:\\Users\\Pablo\\Desktop\\my-wedding', budget: 0
    },
    theme: {
      notes: 'Tipografía de la web: Butler (una sola familia; la jerarquía se construye con peso y tamaño). Estilo: acuarela pintada a mano, flores de azahar, naranjas, montaña y los tres gatos.'
    },
    plan: defaultPlan(),
    webStatus: 'publicada',
    webStatusNote: 'Despliegue: GitHub Actions al hacer push a main.'
  };
}

export function seedCollections(): Collections {
  return {
    guests: [],
    tables: [],
    expenses: [],
    vendors: [{
      id: uid(), name: 'Jardines del Negralejo', cat: 'Espacio', status: 'Por confirmar', contact: '', phone: '', email: '', price: 0,
      contract: 'Sin datos', link: '', notes: 'La web lo indica como lugar de ceremonia, cóctel, comida (Gran Salón) y baile. Confirmar aquí el estado real del contrato.'
    }],
    tasks: [
      T('Definir presupuesto total y reparto por categorías', 'ahora', 320, 'Presupuesto'),
      T('Cerrar lista preliminar de invitados', 'ahora', 310, 'Invitados'),
      T('Confirmar qué incluye el espacio (catering, mobiliario, barra libre, horarios)', 'ahora', 300, 'Proveedores'),
      T('Contratar fotografía y vídeo', 'ahora', 280, 'Proveedores'),
      T('Elegir música / DJ', 'ahora', 270, 'Proveedores'),
      T('Iniciar trámites civiles de la ceremonia', 'm8', 240),
      T('Enviar invitaciones con enlace a la web', 'm8', 245, 'Invitados'),
      T('Cierre de confirmaciones (fecha publicada en la web)', 'm8', 222, 'Invitados', { due: '2027-02-01' }),
      T('Diseñar papelería y detalles', 'm8', 200, 'Temática'),
      T('Reservar alojamiento recomendado para invitados', 'm8', 190, 'Logística'),
      T('Contratar flores y decoración', 'm5', 170, 'Proveedores'),
      T('Prueba de menú', 'm5', 130, 'Proveedores'),
      T('Distribución de mesas', 'm3', 60, 'Invitados'),
      T('Cerrar cronograma del día con proveedores', 'm1', 45, 'Logística'),
      T('Confirmar número definitivo de comensales y menús especiales', 'm1', 30, 'Invitados'),
      T('Pagos finales a proveedores', 'm1', 21, 'Presupuesto'),
      T('Entregar plan de mesas y decoración al espacio', 'week', 4, 'Logística'),
      T('Descansar la víspera', 'week', 1),
      T('Entregar alianzas y documentos a oficiante / testigos', 'day', 0),
      T('Enviar agradecimientos a los invitados', 'post', -14, 'Invitados')
    ],
    day: [
      { id: uid(), time: '13:00', end: '13:30', title: 'Ceremonia civil', place: 'Jardines del Negralejo', origin: 'Web pública' },
      { id: uid(), time: '13:30', end: '15:00', title: 'Cóctel de bienvenida', place: 'Jardines del Negralejo', origin: 'Web pública' },
      { id: uid(), time: '15:00', end: '18:30', title: 'Comida', place: 'Gran Salón del Negralejo', origin: 'Web pública' },
      { id: uid(), time: '18:30', end: '02:00', title: 'Baile', place: 'Gran Salón del Negralejo', origin: 'Web pública' }
    ],
    logistics: [],
    inspo: [],
    webPlan: [
      P('4', 'Contenido de la web en Firestore', 'Borrador, publicar e historial desde esta app.', 'content/published', 'App + web')
    ],
    webChecks: [
      'Fecha y hora de la ceremonia coinciden con lo contratado', 'Dirección y enlace de Google Maps correctos',
      'Código de vestimenta definitivo', 'Fecha límite de confirmación coherente con catering y mesas',
      'El correo de contacto de la web funciona', 'Datos de transferencia correctos', 'Revisión en móvil de todas las secciones'
    ].map(text => ({ id: uid(), text, ok: false, last: '' })),
    webResources: [
      { id: uid(), title: 'Web pública', url: 'https://pibloo94.github.io/my-wedding/', type: 'Enlace', note: 'Lo que ven los invitados.' },
      { id: uid(), title: 'Repositorio en GitHub', url: 'https://github.com/pibloo94/my-wedding', type: 'Código', note: 'Angular · despliegue automático al hacer push a main.' }
    ],
    webTexts: [],
    webInfo: [],
    webLog: []
  };
}

export function seedState(): AppState {
  return { meta: seedMeta(), ...seedCollections() };
}

/**
 * Normaliza el documento admin/state tal como venga (versiones anteriores de la app incluidas).
 * Los colores de la temática ya no se guardan aquí: ahora se publican con el contenido de la web.
 */
export function normalizeMeta(raw: unknown): Meta {
  const base = seedMeta();
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  const cfg = (o['config'] && typeof o['config'] === 'object') ? o['config'] as Partial<Meta['config']> : {};
  const theme = (o['theme'] && typeof o['theme'] === 'object') ? o['theme'] as Record<string, unknown> : {};
  const plan = (o['plan'] && typeof o['plan'] === 'object') ? o['plan'] as Partial<FloorPlan> : {};
  return {
    v: 4,
    config: { ...base.config, ...cfg, budget: Number(cfg.budget ?? 0) || 0 },
    theme: { notes: typeof theme['notes'] === 'string' ? theme['notes'] : base.theme.notes },
    plan: {
      ...base.plan,
      ...plan,
      zones: Array.isArray(plan.zones) ? plan.zones : base.plan.zones
    },
    webStatus: typeof o['webStatus'] === 'string' ? o['webStatus'] : base.webStatus,
    webStatusNote: typeof o['webStatusNote'] === 'string' ? o['webStatusNote'] : base.webStatusNote
  };
}

/** Invitaciones de copias muy antiguas (sin members[]). */
export function normalizeGuest(g: Guest): Guest {
  if (Array.isArray(g.members)) return g;
  const old = g as unknown as Record<string, unknown>;
  const first = String(g.name || '').split(' ')[0];
  const table = String(old['table'] || '');
  const ms = [mkMember({ role: 'adulto', name: g.name, allergies: String(old['dietary'] || ''), table })];
  if (old['partner']) ms.push(mkMember({ role: 'acompañante', name: String(old['partnerName'] || 'Acompañante de ' + first), table }));
  return { ...g, contact: g.contact || String(old['email'] || old['phone'] || ''), members: ms };
}

/** Completa campos que faltan en registros guardados por versiones anteriores. */
export function normalizeItem(c: string, x: Record<string, unknown>): Record<string, unknown> {
  if (c === 'guests') return normalizeGuest(x as unknown as Guest) as unknown as Record<string, unknown>;
  if (c === 'expenses' && !Array.isArray(x['payments'])) return { ...x, payments: [] };
  if (c === 'tables') return { ...x, shape: x['shape'] || 'redonda', cap: Number(x['cap']) || 10 };
  return x;
}
