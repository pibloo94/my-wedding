/** Reglas de negocio puras: fases, invitados, mesas, gastos y tareas. */
import { Expense, Guest, Member, PhaseId, Table, Task } from './models';
import { addDays, dayDiff, parseDate, today, uid } from './util';

/** [id, nombre, desde (días antes), hasta (días antes)] */
export type Phase = [PhaseId, string, number, number];

export const PHASES: Phase[] = [
  ['ahora', '11 a 9 meses', 335, 270],
  ['m8', '8 a 6 meses', 269, 180],
  ['m5', '5 a 4 meses', 179, 120],
  ['m3', '3 a 2 meses', 119, 60],
  ['m1', 'Último mes', 59, 8],
  ['week', 'Semana de la boda', 7, 1],
  ['day', 'El gran día', 0, 0],
  ['post', 'Después', -1, -90]
];

export const TASK_CATS = ['General', 'Invitados', 'Presupuesto', 'Proveedores', 'Web', 'Logística', 'Temática'];
export const GUEST_STATUSES = ['pendiente', 'confirmado', 'rechazado'] as const;
export const SHAPE_NAMES: Record<string, string> = { redonda: 'Redonda', rectangular: 'Rectangular', presidencial: 'Presidencial' };

export const weddingDay = (iso: string): Date => parseDate(iso) || new Date(2027, 8, 11);
export const dueOf = (t: Task, wedding: Date): Date => (t.due ? parseDate(t.due) : null) ?? addDays(wedding, -Number(t.offset || 0));
export const phaseOf = (id: string): Phase => PHASES.find(p => p[0] === id) ?? [id as PhaseId, id, 0, 0];

export function currentPhase(wedding: Date): PhaseId {
  const d = dayDiff(wedding, today());
  if (d < 0) return 'post';
  for (const p of PHASES) if (d <= p[2] && d >= p[3]) return p[0];
  return 'ahora';
}

export function mkMember(o: Partial<Member> = {}): Member {
  return { id: uid(), role: 'adulto', name: '', age: null, menu: 'estandar', gf: false, lf: false, allergies: '', table: '', ...o };
}

export const members = (g: Guest): Member[] => (Array.isArray(g.members) ? g.members : []);
export const seats = (g: Guest): number => members(g).length || 1;
export const kidsOf = (g: Guest): Member[] => members(g).filter(m => m.role === 'niño');
export const adultsOf = (g: Guest): Member[] => members(g).filter(m => m.role !== 'niño');
export const unseated = (g: Guest): Member[] => members(g).filter(m => !m.table);
export const attending = (gs: Guest[]): Guest[] => gs.filter(g => g.status !== 'rechazado');
export const hasDiet = (m: Member): boolean => m.menu === 'vegetariano' || !!m.gf || !!m.lf || !!(m.allergies || '').trim();

export function dietText(m: Member): string {
  return [
    m.role === 'niño' && m.age != null ? `${m.age} años` : '',
    m.menu === 'vegetariano' ? 'vegetariano' : '',
    m.gf ? 'sin gluten' : '',
    m.lf ? 'sin lactosa' : '',
    (m.allergies || '').trim() ? 'alergia: ' + m.allergies.trim() : ''
  ].filter(Boolean).join(' · ');
}

export function peopleLabel(g: Guest): string {
  const a = adultsOf(g).length, k = kidsOf(g).length;
  return `${a} adulto${a === 1 ? '' : 's'}${k ? ` · ${k} niño${k === 1 ? '' : 's'}` : ''}`;
}

export const usedSeats = (guests: Guest[], tableId: string): number =>
  attending(guests).reduce((a, g) => a + members(g).filter(m => m.table === tableId).length, 0);

export const paid = (e: Expense): number =>
  (e.payments || []).filter(p => p.status === 'Pagado').reduce((a, p) => a + Number(p.amount || 0), 0);

export const statusClass = (s: string): string => ({ confirmado: 'b-ok', pendiente: 'b-warn', rechazado: 'b-mute' } as Record<string, string>)[s] ?? '';

export interface SeatInfo {
  label: string;
  initials: string;
  color: string;
  diet: boolean;
  guestId: string;
  memberId: string;
  companion: boolean;
}

/** Personas sentadas en una mesa, en orden de invitación. */
export function seatList(t: Table, guests: Guest[], colorOf: (s: string) => string, initials: (s: string) => string): SeatInfo[] {
  const out: SeatInfo[] = [];
  for (const g of attending(guests)) {
    const c = colorOf(g.group || g.name);
    for (const m of members(g)) {
      if (m.table !== t.id) continue;
      out.push({
        label: m.name + (m.role === 'niño' && m.age != null ? ` (${m.age})` : ''),
        initials: initials(m.name), color: c, diet: hasDiet(m), guestId: g.id, memberId: m.id,
        companion: m.role !== 'adulto'
      });
    }
  }
  return out;
}
