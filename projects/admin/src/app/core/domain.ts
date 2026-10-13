/** Reglas de negocio puras: invitados, mesas, gastos y tareas. */
import { Expense, Guest, Member, Table, Task } from './models';
import { addDays, dayDiff, isoDate, parseDate, today, uid } from './util';

export const TASK_CATS = ['General', 'Invitados', 'Presupuesto', 'Proveedores', 'Web', 'Logística', 'Temática'];
export const GUEST_STATUSES = ['pendiente', 'confirmado', 'rechazado'] as const;
export const SHAPE_NAMES: Record<string, string> = { redonda: 'Redonda', rectangular: 'Rectangular', presidencial: 'Presidencial' };

export const weddingDay = (iso: string): Date => parseDate(iso) || new Date(2027, 8, 11);
export const dueOf = (t: Task, wedding: Date): Date => (t.due ? parseDate(t.due) : null) ?? addDays(wedding, -Number(t.offset || 0));
/** ¿La tarea se mueve si cambia la fecha de la boda? (sin fecha fija: va a «offset» días de la boda) */
export const followsWedding = (t: Pick<Task, 'due'>): boolean => !t.due;

/** Campos de fecha de una tarea a partir del día elegido: relativa a la boda o fija. */
export function taskDateFields(date: Date, follow: boolean, wedding: Date): Pick<Task, 'offset' | 'due'> {
  return follow ? { offset: dayDiff(wedding, date), due: '' } : { offset: dayDiff(wedding, date), due: isoDate(date) };
}

/** 'AAAA-MM' del mes de una fecha */
export const monthKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const monthStart = (key: string): Date => { const [y, m] = key.split('-').map(Number) as [number, number]; return new Date(y, m - 1, 1); };
export const addMonths = (key: string, n: number): string => { const d = monthStart(key); return monthKey(new Date(d.getFullYear(), d.getMonth() + n, 1)); };

/** Meses entre dos claves 'AAAA-MM', ambos incluidos. */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let k = from; k <= to && out.length < 120; k = addMonths(k, 1)) out.push(k);
  return out;
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

/** Lo que falta por pagar de un gasto (sobre lo contratado o, si no hay, lo previsto). */
export const pendingOf = (e: Expense): number => Math.max(0, (+(e.act ?? 0) || +(e.est ?? 0) || 0) - paid(e));

/**
 * Próximo pago de un gasto: el pago «Programado» con fecha más cercana o, si no hay, la fecha de
 * vencimiento del propio gasto mientras quede algo por pagar. null si no hay ninguno.
 */
export function nextPayment(e: Expense): { date: string; amount: number } | null {
  const sched = (e.payments || []).filter(p => p.status !== 'Pagado' && parseDate(p.date)).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (sched) return { date: sched.date, amount: Number(sched.amount) || 0 };
  const left = pendingOf(e);
  return e.due && parseDate(e.due) && left > 0 ? { date: e.due, amount: left } : null;
}

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
