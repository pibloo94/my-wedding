import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { UiService } from '../../core/ui.service';
import { Task } from '../../core/models';
import { dueOf, followsWedding, monthKey, monthStart, taskDateFields } from '../../core/domain';
import { fmtDate, isoDate, norm, parseDate, today } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';
import { TaskRowComponent } from './task-row.component';
import { TaskCalendarComponent } from './task-calendar.component';

type State = 'pend' | 'done' | '';

interface MonthGroup {
  key: string;
  name: string;
  now: boolean;
  wedding: boolean;
  done: number;
  total: number;
  tasks: Task[];
}

/** «octubre de 2026» → «Octubre 2026» */
export const monthName = (key: string): string => {
  const s = fmtDate(monthStart(key), { month: 'long', year: 'numeric' }).replace(' de ', ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Tareas agrupadas por meses (agenda) o en un calendario mensual. La fecha de cada tarea es fija
 * o relativa a la boda (se mueve si cambia). Vista y mes van en la URL: #/tareas?vista=calendario&mes=2026-11
 */
@Component({
  selector: 'adm-tasks-page',
  imports: [PageHeaderComponent, EmptyStateComponent, IconComponent, TaskRowComponent, TaskCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-header title="Tareas" [sub]="sub()">
      <button class="btn pri" (click)="add()"><adm-icon name="plus" /> Tarea</button>
    </adm-page-header>
    <nav class="tabs" aria-label="Vista">
      <button [class.on]="view() === 'meses'" [attr.aria-pressed]="view() === 'meses'" (click)="setView('meses')"><adm-icon name="list" /> Por meses</button>
      <button [class.on]="view() === 'calendario'" [attr.aria-pressed]="view() === 'calendario'" (click)="setView('calendario')"><adm-icon name="cal" /> Calendario</button>
    </nav>
    <div class="bar">
      <div class="chips" role="group" aria-label="Mostrar">
        @for (o of states; track o[0]) { <button class="chip" [class.on]="st() === o[0]" [attr.aria-pressed]="st() === o[0]" (click)="st.set(o[0])">{{ o[1] }}</button> }
      </div>
      <span class="spacer"></span>
      <select [value]="who()" (change)="who.set($any($event.target).value)" aria-label="Responsable">
        <option value="">Cualquier responsable</option>
        @for (w of whos(); track w) { <option [value]="w" [selected]="w === who()">{{ w }}</option> }
      </select>
    </div>

    @if (view() === 'calendario') {
      <adm-task-calendar [tasks]="filtered()" [wedding]="wedding()" [month]="month()" (monthChange)="setMonth($event)"
        (move)="move($event.id, $event.date)" (addOn)="add($event)" />
    } @else {
      @if (late().length) {
        <section class="month late" aria-labelledby="m-late">
          <div class="mh">
            <h3 id="m-late"><adm-icon name="alert" /> Atrasadas</h3>
            <span class="badge b-bad">{{ late().length }}</span>
          </div>
          <div class="card pad0">@for (t of late(); track t.id) { <adm-task-row [task]="t" /> }</div>
        </section>
      }
      @for (g of months(); track g.key) {
        <section class="month" [class.now]="g.now" [attr.aria-labelledby]="'m-' + g.key">
          <div class="mh">
            <h3 [id]="'m-' + g.key">{{ g.name }}</h3>
            @if (g.now) { <span class="badge b-warn">Este mes</span> }
            @if (g.wedding) { <span class="badge b-ok"><adm-icon name="heart" [size]="12" /> La boda · {{ weddingDay() }}</span> }
            <span class="mr">
              @if (g.total) {
                <span class="prog" aria-hidden="true"><i [style.width.%]="g.done / g.total * 100"></i></span>
                <span class="xs muted cnt" [attr.aria-label]="g.done + ' de ' + g.total + ' hechas'">{{ g.done }}/{{ g.total }}</span>
              }
              <button class="icb" (click)="addIn(g.key)" [attr.aria-label]="'Añadir tarea en ' + g.name"><adm-icon name="plus" /></button>
            </span>
          </div>
          @if (g.tasks.length) {
            <div class="card pad0">@for (t of g.tasks; track t.id) { <adm-task-row [task]="t" /> }</div>
          } @else {
            <p class="small muted none">Nada {{ st() === 'done' ? 'hecho' : 'pendiente' }} este mes.</p>
          }
        </section>
      } @empty {
        @if (!late().length) { <adm-empty text="No hay tareas con este filtro." /> }
      }
    }`,
  styles: `
    .bar select { min-width: 0; flex: 0 1 220px; }
    .month { margin-top: 22px; }
    .mh { display: flex; align-items: center; gap: 8px 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .mh h3 { display: flex; gap: 8px; align-items: center; }
    .mh .badge { font-family: var(--sans); display: inline-flex; gap: 4px; align-items: center; }
    .mr { margin-left: auto; display: flex; align-items: center; gap: 8px; flex: none; }
    .mr .prog { width: 90px; }
    .cnt { min-width: 30px; text-align: right; }
    .month.now .mh h3 { color: var(--primary-deep); }
    .month.late .mh h3 { color: var(--bad-fg); }
    .none { padding: 4px 2px 0; }
    @media (max-width: 760px) { .bar select { flex: 1 1 45%; } .mr .prog { display: none; } }`
})
export class TasksPage {
  private store = inject(StoreService);
  private ui = inject(UiService);
  private router = inject(Router);
  protected lists = inject(ListsService);

  private query = toSignal(inject(ActivatedRoute).queryParamMap.pipe(map(q => ({ vista: q.get('vista'), mes: q.get('mes') }))), { initialValue: { vista: null, mes: null } });
  protected view = computed(() => (this.query().vista === 'calendario' ? 'calendario' : 'meses'));
  protected month = computed(() => { const m = this.query().mes; return m && /^\d{4}-\d{2}$/.test(m) ? m : monthKey(today()); });

  protected states: [State, string][] = [['pend', 'Pendientes'], ['done', 'Hechas'], ['', 'Todas']];
  protected st = signal<State>('pend');
  protected who = signal('');
  protected wedding = this.store.wedding;
  protected weddingDay = computed(() => fmtDate(this.wedding(), { day: 'numeric', month: 'short' }));
  protected whos = computed(() => [...new Set(this.store.state().tasks.map(t => t.who).filter(Boolean))]);

  private dated = computed(() => {
    const w = this.wedding();
    return this.store.state().tasks.map(t => ({ t, d: dueOf(t, w) })).sort((a, b) => a.d.getTime() - b.d.getTime());
  });

  protected filtered = computed(() => {
    let rows = this.store.state().tasks;
    if (this.st() === 'pend') rows = rows.filter(t => !t.done);
    else if (this.st() === 'done') rows = rows.filter(t => t.done);
    if (this.who()) rows = rows.filter(t => norm(t.who) === norm(this.who()));
    return rows;
  });

  protected sub = computed(() => {
    const ts = this.store.state().tasks, open = ts.filter(t => !t.done).length, late = this.lateAll();
    return `${open} pendientes${late ? ` · ${late} ${late === 1 ? 'atrasada' : 'atrasadas'}` : ''} · ${ts.length - open} hechas`;
  });
  private lateAll = computed(() => this.dated().filter(x => !x.t.done && x.d < today()).length);

  /** Pendientes con fecha pasada: arriba, aparte de su mes. */
  protected late = computed(() => {
    if (this.st() === 'done') return [];
    const ids = new Set(this.filtered().map(t => t.id)), now = today();
    return this.dated().filter(x => ids.has(x.t.id) && !x.t.done && x.d < now).map(x => x.t);
  });

  protected months = computed<MonthGroup[]>(() => {
    const ids = new Set(this.filtered().map(t => t.id)), lateIds = new Set(this.late().map(t => t.id));
    const cur = monthKey(today()), wk = monthKey(this.wedding());
    const by = new Map<string, { all: Task[]; shown: Task[] }>();
    const slot = (k: string) => by.get(k) ?? (by.set(k, { all: [], shown: [] }), by.get(k)!);
    for (const { t, d } of this.dated()) {
      const g = slot(monthKey(d));
      g.all.push(t);
      if (ids.has(t.id) && !lateIds.has(t.id)) g.shown.push(t);
    }
    if (cur <= wk) slot(cur);
    return [...by.entries()]
      .filter(([k, g]) => g.shown.length || k === cur)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, g]) => ({
        key, name: monthName(key), now: key === cur, wedding: key === wk,
        done: g.all.filter(t => t.done).length, total: g.all.length, tasks: g.shown
      }));
  });

  protected setView(v: 'meses' | 'calendario'): void {
    void this.router.navigate([], { queryParams: { vista: v === 'calendario' ? 'calendario' : null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected setMonth(m: string): void {
    void this.router.navigate([], { queryParams: { mes: m === monthKey(today()) ? null : m }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected add(date?: string): void {
    void this.lists.add('tasks', { date: date || isoDate(today()), follow: true });
  }

  /** En la agenda: el mes actual empieza hoy; los demás, el día 1. */
  protected addIn(key: string): void {
    this.add(key === monthKey(today()) ? isoDate(today()) : isoDate(monthStart(key)));
  }

  /** Cambia la fecha de una tarea (arrastrándola en el calendario) sin cambiar si sigue a la boda. */
  protected move(id: string, iso: string): void {
    const d = parseDate(iso), t = this.store.state().tasks.find(x => x.id === id);
    if (!d || !t || isoDate(dueOf(t, this.wedding())) === iso) return;
    const fields = taskDateFields(d, followsWedding(t), this.wedding());
    this.store.update(s => { const x = s.tasks.find(y => y.id === id); if (x) Object.assign(x, fields); });
    this.ui.toast(`«${t.title.slice(0, 40)}» → ${fmtDate(d, { day: 'numeric', month: 'short' })}`);
  }
}
