/**
 * Contenido de la web en la app: normalizar, comparar y validar.
 * La normalización es la misma que usa la web (normalizeContent en
 * src/app/core/content/wedding-content.ts), en modo borrador: se conserva lo que aún se está
 * escribiendo y contentErrors() impide publicarlo así.
 */
import {
  DEFAULT_CONTENT, EMPTY_EVENT_TEMPLATE, EMPTY_SECTION_TEMPLATE, SectionConfig, SectionKind, THEME_KEYS,
  ThemeColors, WeddingContent, WeddingEvent, normalizeContent
} from '@web/content';
import { stable } from './util';

export type Content = WeddingContent;
export { DEFAULT_CONTENT };

export const SEC_NAME: Record<SectionKind, string> = {
  events: 'Programa del día', needToKnow: 'Lo que debes saber', rsvp: 'Confirmación', registry: 'Lista de bodas', text: 'Sección de texto'
};
export const SEC_EMPTY: SectionConfig = EMPTY_SECTION_TEMPLATE;
export const EMPTY_EVENT: WeddingEvent = EMPTY_EVENT_TEMPLATE;

export const THEME_LABEL: Record<keyof ThemeColors, [string, string]> = {
  primary: ['Terracota', 'Botones, enlaces y monograma'],
  primaryDeep: ['Terracota profundo', 'Etiquetas pequeñas y botones al pasar el ratón'],
  sage: ['Verde salvia', 'Títulos y acentos'],
  sageDeep: ['Salvia profundo', 'Títulos principales'],
  sand: ['Arena', 'Cintas, escudo y bordes'],
  orange: ['Naranja pintado', 'Detalles'],
  background: ['Fondo', 'Fondo de página'],
  surface: ['Tarjetas', 'Tarjetas y superficies']
};

export const normContent = (c: unknown): Content => normalizeContent(c, { draft: true });

export const contentKey = (c: unknown): string => stable(normContent(c));

/** Lista plana [clave, etiqueta, valor] para comparar dos versiones del contenido. */
export function flatten(c: Content): [string, string, string][] {
  const out: [string, string, string][] = [];
  const add = (k: string, l: string, v: unknown) => out.push([k, l, String(v ?? '')]);
  for (const k of THEME_KEYS) add(`t.${k}`, `Colores · ${THEME_LABEL[k][0]}`, c.theme[k]);
  const SF: [keyof SectionConfig, string][] = [['visible', 'Visible'], ['navLabel', 'Texto en el menú'], ['label', 'Etiqueta'], ['title', 'Título'], ['subtitle', 'Subtítulo'], ['body', 'Texto'], ['items', 'Puntos'], ['linkText', 'Texto del botón'], ['linkUrl', 'Enlace del botón']];
  add('s.order', 'Secciones · Orden', c.sections.map(x => x.id).join(','));
  for (const x of c.sections) for (const [k, l] of SF) {
    if (x.kind !== 'text' && ['body', 'items', 'linkText', 'linkUrl'].includes(k)) continue;
    const v = k === 'visible' ? (x.visible ? 'Visible' : 'Oculta') : k === 'items' ? x.items.join(' / ') : x[k];
    add(`s:${x.id}.${k}`, `Sección ${x.title || SEC_NAME[x.kind]} · ${l}`, v);
  }
  add('h.n1', 'Portada · Nombre 1', c.hero.name1);
  add('h.n2', 'Portada · Nombre 2', c.hero.name2);
  add('h.d', 'Portada · Fecha visible', c.hero.dateText);
  add('h.l', 'Portada · Lugar', c.hero.location);
  add('h.c', 'Portada · Cuenta atrás', String(c.hero.countdownIso).slice(0, 16).replace('T', ' '));
  const EF: [keyof WeddingEvent, string][] = [['type', 'Etiqueta'], ['title', 'Título'], ['timeStart', 'Empieza'], ['timeEnd', 'Termina'], ['venue', 'Lugar'], ['address', 'Dirección'], ['mapsUrl', 'Google Maps'], ['dressCode', 'Vestimenta'], ['description', 'Descripción'], ['icon', 'Icono']];
  add('e.order', 'Programa · Orden', c.events.map((e, i) => e.id || i).join(','));
  c.events.forEach((e, i) => EF.forEach(([k, l]) => add(`e:${e.id || i}.${k}`, `Programa · ${e.title || 'sin título'} · ${l}`, e[k])));
  c.needToKnow.forEach((x, i) => {
    const n = `Lo que debes saber ${i + 1} (${x.title || 'sin título'})`;
    add(`n${i}.t`, `${n} · Título`, x.title);
    add(`n${i}.i`, `${n} · Puntos`, x.items.join(' / '));
    add(`n${i}.ic`, `${n} · Icono`, x.icon);
    add(`n${i}.a`, `${n} · Color`, x.accent);
  });
  add('r.d', 'Confirmación · Fecha límite', c.rsvp.deadlineText);
  add('r.e', 'Confirmación · Correo', c.rsvp.contactEmail);
  add('g.t', 'Lista de bodas · Titular', c.registry.titular);
  add('g.i', 'Lista de bodas · IBAN', c.registry.iban);
  add('g.c', 'Lista de bodas · Concepto', c.registry.concepto);
  return out;
}

export interface DiffLine { label: string; from: string; to: string; key: string; }

export function diffContent(a: Content, b: Content): DiffLine[] {
  const A = new Map(flatten(a).map(([k, l, v]) => [k, [l, v] as const]));
  const B = new Map(flatten(b).map(([k, l, v]) => [k, [l, v] as const]));
  const titles = (c: Content) => c.events.map(e => e.title || 'sin título').join(' → ');
  const stitles = (c: Content) => c.sections.map(x => (x.title || SEC_NAME[x.kind]) + (x.visible ? '' : ' (oculta)')).join(' → ');
  const out: DiffLine[] = [];
  new Set([...A.keys(), ...B.keys()]).forEach(k => {
    const x = A.get(k), y = B.get(k);
    const xv = x ? x[1] : '', yv = y ? y[1] : '';
    if (xv === yv) return;
    const label = (y ?? x)![0];
    if (k === 'e.order') out.push({ key: k, label, from: titles(a), to: titles(b) });
    else if (k === 's.order') out.push({ key: k, label, from: stitles(a), to: stitles(b) });
    else out.push({ key: k, label, from: xv, to: yv });
  });
  return out;
}

export function ibanOk(v: string): boolean {
  const s = String(v || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const r = s.slice(4) + s.slice(0, 4);
  let m = 0;
  for (const ch of r) {
    const n = ch >= 'A' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of n) m = (m * 10 + Number(d)) % 97;
  }
  return m === 1;
}

const TIME = /^\d{1,2}:\d{2}( h)?$/;

export function contentErrors(c: Content): string[] {
  const e: string[] = [];
  if (!c.sections.some(x => x.visible)) e.push('Secciones: deja al menos una visible.');
  c.sections.forEach((x, i) => {
    const n = `Sección ${i + 1}${x.title ? ` (${x.title})` : ''}`;
    if (!x.title.trim()) e.push(`${n}: falta el título.`);
    if (x.kind === 'text') {
      if (!x.body.trim() && !x.items.length) e.push(`${n}: escribe un texto o algún punto.`);
      if (x.linkUrl.trim() && !/^https:\/\//.test(x.linkUrl.trim())) e.push(`${n}: el enlace del botón debe empezar por https://.`);
    }
  });
  if (!c.hero.name1.trim() || !c.hero.name2.trim()) e.push('Portada: faltan los nombres.');
  if (!c.hero.dateText.trim()) e.push('Portada: falta la fecha visible.');
  if (isNaN(new Date(c.hero.countdownIso).getTime())) e.push('Portada: la fecha u hora de la cuenta atrás no es válida.');
  if (!c.events.length) e.push('Programa: añade al menos un momento.');
  c.events.forEach((x, i) => {
    const n = `Programa ${i + 1}`;
    if (!x.title.trim()) e.push(`${n}: falta el título.`);
    if (!TIME.test(x.timeStart.trim())) e.push(`${n}: la hora de inicio debe ser como «13:00 h».`);
    if (x.timeEnd.trim() && !TIME.test(x.timeEnd.trim())) e.push(`${n}: la hora de fin debe ser como «13:30 h».`);
    if (x.mapsUrl.trim() && !/^https:\/\//.test(x.mapsUrl.trim())) e.push(`${n}: el enlace de Maps debe empezar por https://.`);
  });
  c.needToKnow.forEach((x, i) => {
    if (!x.title.trim()) e.push(`Lo que debes saber ${i + 1}: falta el título.`);
    if (!x.items.length) e.push(`Lo que debes saber ${i + 1}: añade al menos un punto.`);
  });
  if (!c.rsvp.deadlineText.trim()) e.push('Confirmación: falta la fecha límite.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.rsvp.contactEmail.trim())) e.push('Confirmación: el correo de contacto no es válido.');
  if (c.registry.iban.trim() && !ibanOk(c.registry.iban)) e.push('Lista de bodas: el IBAN no es válido (los dígitos de control no cuadran).');
  for (const k of THEME_KEYS) if (!/^#[0-9A-F]{6}$/i.test(c.theme[k])) e.push(`Colores: «${THEME_LABEL[k][0]}» no es un color válido.`);
  return e;
}

export function contentWarnings(c: Content): string[] {
  const w: string[] = [];
  const v = (k: SectionKind) => c.sections.some(x => x.kind === k && x.visible);
  if (!v('rsvp')) w.push('La confirmación de asistencia está oculta: los invitados no podrán responder y la portada no mostrará el botón «Confirmar».');
  if (!v('events')) w.push('El programa del día está oculto: el botón «Ver detalles» de la portada llevará a la primera sección visible.');
  for (const x of c.sections) if (x.kind === 'text' && x.linkText.trim() && !x.linkUrl.trim()) w.push(`Sección ${x.title || 'de texto'}: el botón no se mostrará porque no tiene enlace.`);
  if (!dateTextMatches(c.hero.dateText, c.hero.countdownIso)) w.push('Portada: la fecha visible no coincide con el día de la cuenta atrás. La app usa la de la cuenta atrás para fases y vencimientos.');
  return w;
}

/** Fecha y hora de Madrid → ISO con su desfase (+01:00 o +02:00 según el horario de verano). */
export function madridIso(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return '';
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const [h, mi] = time.split(':').map(Number) as [number, number];
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).formatToParts(new Date(guess)).map(p => [p.type, p.value]));
  const local = Date.UTC(+parts['year']!, +parts['month']! - 1, +parts['day']!, +parts['hour']!, +parts['minute']!);
  const off = Math.round((local - guess) / 60000);
  const sg = off >= 0 ? '+' : '-', a = Math.abs(off);
  return `${date}T${time}:00${sg}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/**
 * ¿La fecha escrita («11 de Septiembre de 2027», «11/09/2027»…) es el mismo día que la cuenta
 * atrás? Si no se reconoce día, mes y año en el texto, no se avisa.
 */
export function dateTextMatches(text: string, iso: string): boolean {
  const mp = madridParts(iso);
  if (!mp) return true;
  const [y, mo, d] = mp.date.split('-').map(Number) as [number, number, number];
  const t = (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let r = /(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4})/.exec(t);
  if (r) return +r[1]! === d && +r[2]! === mo && +r[3]! === y;
  r = /(\d{1,2})\s+(?:de\s+)?([a-z]+)\s+(?:de\s+|del\s+)?(\d{4})/.exec(t);
  if (!r) return true;
  const mi = MONTHS.findIndex(x => x.startsWith(r![2]!.slice(0, 3)));
  if (mi < 0) return true;
  return +r[1]! === d && mi + 1 === mo && +r[3]! === y;
}

/** Fecha (AAAA-MM-DD) y hora (HH:MM) en Madrid de un instante ISO; null si no es válido. */
export function madridParts(iso: string): { date: string; time: string } | null {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) return null;
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).formatToParts(d).map(x => [x.type, x.value]));
  return { date: `${p['year']}-${p['month']}-${p['day']}`, time: `${p['hour']}:${p['minute']}` };
}
