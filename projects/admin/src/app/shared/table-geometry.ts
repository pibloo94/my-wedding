/** Escala de las mesas en el plano del salón (para que se lean los nombres). */
export const PLAN_SCALE = 1.6;

/** Geometría del dibujo de una mesa: tablero, sillas y etiquetas. Sin DOM, para reutilizarla. */
import { Table } from '../core/models';
import { SeatInfo } from '../core/domain';

export interface Chair {
  x: number;
  y: number;
  /** Ángulo hacia fuera de la mesa (radianes): orienta la etiqueta */
  a: number;
  seat?: SeatInfo;
  /** Hay más personas que sillas: esta silla es «extra» */
  over: boolean;
  label?: { x: number; y: number; anchor: 'start' | 'middle' | 'end'; rotate: number; text: string };
}

export interface TableGeometry {
  shape: 'round' | 'rect';
  /** Radio del tablero (redonda) */
  r: number;
  /** Ancho y alto del tablero (rectangular) */
  w: number;
  h: number;
  chairR: number;
  chairs: Chair[];
  /** Rectángulo que contiene todo: [x, y, ancho, alto] */
  box: [number, number, number, number];
  cap: number;
  used: number;
}

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** big = vista de detalle con nombres junto a cada silla. */
export function tableGeometry(t: Table, seats: SeatInfo[], big: boolean): TableGeometry {
  const cap = Math.max(1, Math.min(30, Number(t.cap) || 1));
  const n = Math.max(cap, seats.length);
  const cr = big ? 13 : 9.5;
  const chairs: Chair[] = [];

  if (t.shape === 'rectangular' || t.shape === 'presidencial') {
    const one = t.shape === 'presidencial';
    const per = one ? n : Math.ceil(n / 2);
    const step = cr * 2 + (big ? 10 : 7);
    const w = Math.max(per * step + 12, big ? 150 : 110);
    const h = one ? (big ? 54 : 40) : (big ? 70 : 50);
    for (let i = 0; i < n; i++) {
      const side = one ? 0 : (i < per ? 0 : 1);
      const k = one ? i : (i < per ? i : i - per);
      const cnt = one ? n : (side === 0 ? per : n - per);
      const x = -((cnt - 1) * step) / 2 + k * step;
      const y = side === 0 ? -h / 2 - cr - 5 : h / 2 + cr + 5;
      const s = seats[i];
      const c: Chair = { x, y, a: side === 0 ? -Math.PI / 2 : Math.PI / 2, seat: s, over: i >= cap };
      if (big && s) {
        const ly = y + (side === 0 ? -(cr + 6) : cr + 6);
        c.label = { x, y: ly, anchor: 'start', rotate: side === 0 ? -50 : 50, text: cut(s.label, 20) };
      }
      chairs.push(c);
    }
    const W = w / 2 + cr + 10, H = h / 2 + cr * 2 + 12;
    const lx = big ? 80 : 0, ly = big ? 100 : 0;
    return { shape: 'rect', r: 0, w, h, chairR: cr, chairs, box: [-W, -H - ly, 2 * W + lx, 2 * H + 2 * ly], cap, used: seats.length };
  }

  const R = Math.max(big ? 46 : 30, n * (big ? 6.4 : 4.3));
  const D = R + cr + (big ? 7 : 5);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    const x = Math.cos(a) * D, y = Math.sin(a) * D;
    const s = seats[i];
    const c: Chair = { x, y, a, seat: s, over: i >= cap };
    if (big && s) {
      const lx = x + Math.cos(a) * (cr + 7), lyy = y + Math.sin(a) * (cr + 7);
      const vertical = Math.abs(Math.cos(a)) < 0.3;
      c.label = {
        x: lx, y: lyy + (vertical ? (Math.sin(a) > 0 ? 6 : -2) : 3.5),
        anchor: vertical ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end', rotate: 0, text: cut(s.label, 20)
      };
    }
    chairs.push(c);
  }
  const E = D + cr + 4;
  const lx = big ? 118 : 0, ly = big ? 24 : 0;
  return { shape: 'round', r: R, w: 0, h: 0, chairR: cr, chairs, box: [-E - lx, -E - ly, 2 * (E + lx), 2 * (E + ly)], cap, used: seats.length };
}
