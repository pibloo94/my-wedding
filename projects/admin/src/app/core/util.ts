/** Utilidades sin estado: ids, fechas, formato y texto. */

export const uid = (): string => Math.random().toString(36).slice(2, 9);

export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

/** JSON con las claves ordenadas: sirve para comparar objetos sin importar el orden. */
export function stable(v: unknown): string {
  if (Array.isArray(v)) return '[' + v.map(x => stable(x === undefined ? null : x)).join(',') + ']';
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return '{' + Object.keys(o).sort().filter(k => o[k] !== undefined)
      .map(k => JSON.stringify(k) + ':' + stable(o[k])).join(',') + '}';
  }
  return JSON.stringify(v === undefined ? null : v);
}

/** Hash FNV-1a corto (ids deterministas a partir de un texto). */
export function hashStr(t: string): string {
  let h = 2166136261 >>> 0;
  for (const ch of t) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
}

export const eur = (n: number | undefined | null): string =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

/** 'AAAA-MM-DD' → Date local (o null). */
export function parseDate(s: string | undefined | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

export const isoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const dayDiff = (a: Date, b: Date): number => Math.round((a.getTime() - b.getTime()) / 864e5);

export function fmtDate(s: string | Date | null | undefined, o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  const d = typeof s === 'string' ? parseDate(s) : s;
  return d ? d.toLocaleDateString('es-ES', o) : '—';
}

export const fmtLongDate = (s: string | Date | null | undefined): string =>
  fmtDate(s, { day: 'numeric', month: 'long', year: 'numeric' });

export const safeUrl = (u: string | undefined | null): string => (/^https?:\/\//i.test(u || '') ? u! : '');

/** Minúsculas, sin tildes ni signos de interrogación: para buscar y comparar nombres. */
export const norm = (s: unknown): string =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?]/g, '').trim();

export const initials = (s: string | undefined): string =>
  String(s || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';

/** Colores para avatares y grupos, tomados de la paleta de la web. */
export const PALETTE = ['#B15C38', '#7E8C6A', '#CD8A52', '#5E6A49', '#C98A69', '#97492A', '#9AA684', '#B9895E', '#86876F', '#D8A27C'];

export function colorOf(s: string | undefined): string {
  let h = 0;
  for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}

/** Correo en minúsculas o los últimos 9 dígitos del teléfono: une respuestas de la web con invitaciones. */
export function contactKey(c: string | undefined | null): string {
  const v = String(c || '').trim().toLowerCase();
  if (!v) return '';
  if (v.includes('@')) return 'e:' + v;
  const d = v.replace(/\D/g, '');
  return d.length >= 6 ? 'p:' + d.slice(-9) : '';
}

export const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;
