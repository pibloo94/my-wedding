import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Task } from '../../core/models';
import { addMonths, dueOf, monthKey, monthStart } from '../../core/domain';
import { addDays, fmtDate, isoDate, today } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';
import { TaskRowComponent } from './task-row.component';

interface Cell {
  iso: string;
  day: number;
  inMonth: boolean;
  today: boolean;
  wedding: boolean;
  past: boolean;
  tasks: Task[];
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MAX_CHIPS = 3;

/**
 * Calendario mensual de tareas. Al pulsar un día se listan sus tareas debajo; sin día elegido se
 * listan las del mes. En escritorio, arrastrar una tarea a otro día la reprograma.
 */
@Component({
  selector: 'adm-task-calendar',
  imports: [IconComponent, TaskRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card cal">
      <div class="chd">
        <button class="icb" (click)="go(-1)" aria-label="Mes anterior"><adm-icon name="chev" class="flip" /></button>
        <h3 aria-live="polite">{{ title() }}</h3>
        <button class="icb" (click)="go(1)" aria-label="Mes siguiente"><adm-icon name="chev" /></button>
        <span class="spacer"></span>
        @if (month() !== thisMonth) { <button class="btn ghost sm" (click)="monthChange.emit(thisMonth); sel.set('')">Hoy</button> }
        @if (month() !== weddingMonth()) { <button class="btn ghost sm" (click)="monthChange.emit(weddingMonth()); sel.set('')"><adm-icon name="heart" [size]="14" /> La boda</button> }
      </div>
      <div class="cgrid" role="grid" [attr.aria-label]="'Tareas de ' + title()">
        <div class="wd" role="row">@for (w of weekdays; track $index) { <span role="columnheader">{{ w }}</span> }</div>
        @for (week of weeks(); track week[0]!.iso) {
          <div class="wk" role="row">
            @for (c of week; track c.iso) {
              <div class="cell" role="gridcell" tabindex="0" [attr.data-iso]="c.iso"
                [class.out]="!c.inMonth" [class.today]="c.today" [class.wed]="c.wedding" [class.past]="c.past"
                [class.sel]="sel() === c.iso" [class.drop]="dropOn() === c.iso"
                [attr.aria-label]="label(c)" [attr.aria-selected]="sel() === c.iso"
                (click)="pick(c.iso)" (keydown.enter)="pick(c.iso)" (keydown.space)="$event.preventDefault(); pick(c.iso)"
                (dragover)="over($event, c.iso)" (dragleave)="dropOn.set('')" (drop)="drop($event, c.iso)">
                <span class="dn">{{ c.day }}@if (c.wedding) { <adm-icon name="heart" [size]="12" /> }</span>
                <div class="tcs">
                  @for (t of c.tasks.slice(0, maxChips); track t.id) {
                    <span class="tc" draggable="true" [class.done]="t.done" [class.late]="!t.done && c.past" [title]="t.title"
                      (dragstart)="dragStart($event, t)" (dragend)="dropOn.set('')">{{ t.title }}</span>
                  }
                  @if (c.tasks.length > maxChips) { <span class="more">+{{ c.tasks.length - maxChips }}</span> }
                </div>
                @if (c.tasks.length) {
                  <span class="dots" aria-hidden="true">
                    @for (t of c.tasks.slice(0, 3); track t.id) { <i [class.done]="t.done" [class.late]="!t.done && c.past"></i> }
                    @if (c.tasks.length > 3) { <b>+</b> }
                  </span>
                }
              </div>
            }
          </div>
        }
      </div>
      <p class="xs muted chint">Pulsa un día para ver sus tareas. En el ordenador puedes arrastrar una tarea a otro día.</p>
    </div>

    <section class="cday">
      <div class="cdh">
        <h3>{{ panelTitle() }}</h3>
        <span class="spacer"></span>
        @if (sel()) {
          <button class="btn ghost sm" (click)="sel.set('')">Ver todo el mes</button>
          <button class="btn out sm" (click)="addOn.emit(sel())"><adm-icon name="plus" [size]="15" /> Tarea este día</button>
        }
      </div>
      @if (panel().length) {
        <div class="card pad0">@for (t of panel(); track t.id) { <adm-task-row [task]="t" /> }</div>
      } @else {
        <p class="small muted">{{ sel() ? 'Nada este día.' : 'Nada este mes con este filtro.' }}</p>
      }
    </section>`,
  styles: `
    :host { display: block; container-type: inline-size; }
    .cal { padding: 14px 14px 10px; }
    .chd { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .chd h3 { min-width: 150px; text-align: center; }
    .flip { transform: rotate(180deg); }
    .cgrid { display: flex; flex-direction: column; }
    .wd, .wk { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .wd span { font-size: .7rem; font-weight: 600; color: var(--muted); text-align: center; padding: 4px 0 6px; letter-spacing: .08em; }
    .cell { min-height: 104px; border-top: 1px solid var(--line); border-left: 1px solid var(--line); padding: 5px 5px 6px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; min-width: 0; outline: none; transition: background .15s; }
    .wk .cell:last-child { border-right: 1px solid var(--line); }
    .wk:last-child .cell { border-bottom: 1px solid var(--line); }
    .cell:hover { background: rgba(255, 255, 255, .55); }
    .cell:focus-visible { box-shadow: inset 0 0 0 2px var(--sage); }
    .cell.out { background: color-mix(in srgb, var(--bg-alt) 55%, transparent); }
    .cell.out .dn { color: var(--faint); }
    .cell.sel { background: #fff; box-shadow: inset 0 0 0 2px var(--sage-deep); }
    .cell.drop { background: var(--ok-bg); box-shadow: inset 0 0 0 2px var(--sage); }
    .cell.wed { background: color-mix(in srgb, var(--primary) 9%, transparent); }
    .dn { font-size: .78rem; color: var(--text); display: inline-flex; align-items: center; gap: 3px; width: max-content; padding: 1px 6px; border-radius: 10px; }
    .today .dn { background: var(--primary); color: #fff; font-weight: 600; }
    .wed .dn { color: var(--primary-deep); font-weight: 600; }
    .today.wed .dn { color: #fff; }
    .tcs { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .tc { font-size: .72rem; line-height: 1.25; padding: 2px 6px; border-radius: 6px; background: var(--bg-alt); color: var(--dark); border-left: 3px solid var(--sage); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: grab; }
    .tc:active { cursor: grabbing; }
    .tc.done { color: var(--faint); text-decoration: line-through; border-left-color: var(--sage-light); }
    .tc.late { border-left-color: var(--bad-fg); background: var(--bad-bg); }
    .more { font-size: .7rem; color: var(--muted); padding-left: 4px; }
    .dots { display: none; gap: 3px; align-items: center; justify-content: center; }
    .dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--sage-deep); }
    .dots i.done { background: var(--sage-light); }
    .dots i.late { background: var(--bad-fg); }
    .dots b { font-size: .62rem; color: var(--muted); line-height: 1; }
    .chint { margin: 8px 2px 0; }
    .cday { margin-top: 20px; }
    .cdh { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .cdh h3::first-letter { text-transform: uppercase; }
    @container (max-width: 640px) {
      .cal { padding: 10px 6px 8px; }
      .cell { min-height: 52px; padding: 4px 2px; align-items: center; gap: 5px; }
      .tcs { display: none; }
      .dots { display: flex; }
      .dn { padding: 1px 5px; }
      .chint { display: none; }
      .chd h3 { min-width: 0; flex: 1; font-size: 1.1rem; white-space: nowrap; }
    }`
})
export class TaskCalendarComponent {
  tasks = input.required<Task[]>();
  wedding = input.required<Date>();
  /** Mes mostrado, 'AAAA-MM' */
  month = input.required<string>();
  monthChange = output<string>();
  move = output<{ id: string; date: string }>();
  addOn = output<string>();

  protected readonly weekdays = WEEKDAYS;
  protected readonly maxChips = MAX_CHIPS;
  protected readonly thisMonth = monthKey(today());
  protected sel = signal('');
  protected dropOn = signal('');

  protected weddingMonth = computed(() => monthKey(this.wedding()));
  protected title = computed(() => {
    const s = fmtDate(monthStart(this.month()), { month: 'long', year: 'numeric' }).replace(' de ', ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  private byDay = computed(() => {
    const w = this.wedding(), m = new Map<string, Task[]>();
    for (const t of this.tasks()) {
      const k = isoDate(dueOf(t, w));
      m.set(k, [...(m.get(k) ?? []), t]);
    }
    for (const list of m.values()) list.sort((a, b) => Number(a.done) - Number(b.done) || a.title.localeCompare(b.title, 'es'));
    return m;
  });

  protected weeks = computed<Cell[][]>(() => {
    const first = monthStart(this.month()), now = today(), wIso = isoDate(this.wedding()), nowIso = isoDate(now);
    const start = addDays(first, -((first.getDay() + 6) % 7));
    const out: Cell[][] = [];
    for (let d = start, i = 0; i < 42; i++, d = addDays(d, 1)) {
      if (i % 7 === 0) {
        if (i && d.getMonth() !== first.getMonth()) break;
        out.push([]);
      }
      const iso = isoDate(d);
      out[out.length - 1]!.push({
        iso, day: d.getDate(), inMonth: d.getMonth() === first.getMonth(), today: iso === nowIso, wedding: iso === wIso,
        past: d < now, tasks: this.byDay().get(iso) ?? []
      });
    }
    return out;
  });

  protected panel = computed(() => {
    const s = this.sel();
    if (s) return this.byDay().get(s) ?? [];
    const pre = this.month() + '-';
    return [...this.byDay().entries()].filter(([k]) => k.startsWith(pre)).sort(([a], [b]) => a.localeCompare(b)).flatMap(([, v]) => v);
  });

  protected panelTitle = computed(() => {
    const s = this.sel();
    if (!s) return 'Tareas de ' + this.title().split(' ')[0]!.toLowerCase();
    const d = new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    return fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }) + (s === isoDate(this.wedding()) ? ' · la boda' : '');
  });

  protected label(c: Cell): string {
    const n = c.tasks.length;
    return `${c.day}${c.wedding ? ', día de la boda' : ''}${c.today ? ', hoy' : ''}: ${n ? n + (n > 1 ? ' tareas' : ' tarea') : 'sin tareas'}`;
  }

  protected go(n: number): void {
    this.sel.set('');
    this.monthChange.emit(addMonths(this.month(), n));
  }

  protected pick(iso: string): void {
    this.sel.set(this.sel() === iso ? '' : iso);
    if (iso.slice(0, 7) !== this.month()) this.monthChange.emit(iso.slice(0, 7));
  }

  // Arrastrar (ratón): el id viaja en dataTransfer; al soltar sobre un día se reprograma.
  protected dragStart(e: DragEvent, t: Task): void {
    e.stopPropagation();
    e.dataTransfer?.setData('text/plain', t.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }

  protected over(e: DragEvent, iso: string): void {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    this.dropOn.set(iso);
  }

  protected drop(e: DragEvent, iso: string): void {
    e.preventDefault();
    this.dropOn.set('');
    const id = e.dataTransfer?.getData('text/plain');
    if (id) this.move.emit({ id, date: iso });
  }
}
