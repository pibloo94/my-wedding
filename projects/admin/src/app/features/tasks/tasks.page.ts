import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { PHASES, currentPhase, dueOf } from '../../core/domain';
import { addDays, fmtDate, norm } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';
import { TaskRowComponent } from './task-row.component';

@Component({
  selector: 'adm-tasks-page',
  imports: [PageHeaderComponent, EmptyStateComponent, IconComponent, TaskRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-header title="Tareas" sub="Las fechas automáticas se recalculan si cambia la fecha de la boda">
      <button class="btn pri" (click)="lists.add('tasks')"><adm-icon name="plus" /> Tarea</button>
    </adm-page-header>
    <div class="bar">
      <div class="chips" role="group" aria-label="Mostrar">
        @for (o of states; track o[0]) { <button class="chip" [class.on]="st() === o[0]" [attr.aria-pressed]="st() === o[0]" (click)="st.set(o[0])">{{ o[1] }}</button> }
      </div>
      <span class="spacer"></span>
      <select [value]="phase()" (change)="phase.set($any($event.target).value)" aria-label="Fase">
        <option value="">Todas las fases</option>
        @for (p of phases; track p[0]) { <option [value]="p[0]" [selected]="p[0] === phase()">{{ p[1] }}</option> }
      </select>
      <select [value]="who()" (change)="who.set($any($event.target).value)" aria-label="Responsable">
        <option value="">Cualquier responsable</option>
        @for (w of whos(); track w) { <option [value]="w" [selected]="w === who()">{{ w }}</option> }
      </select>
    </div>
    @for (g of groups(); track g.id) {
      <details class="phase" open>
        <summary>
          <adm-icon name="chev" class="chev" />
          <h3>{{ g.name }} @if (g.now) { <span class="badge b-warn">Ahora</span> }</h3>
          <span class="xs muted">{{ g.from }}</span><span class="badge">{{ g.done }}/{{ g.total }}</span>
        </summary>
        <div class="card pad0">@for (t of g.tasks; track t.id) { <adm-task-row [task]="t" /> }</div>
      </details>
    } @empty {
      <adm-empty text="No hay tareas con este filtro." />
    }`,
  styles: `
    .bar select { min-width: 0; flex: 0 1 220px; }
    .phase { margin-top: 22px; }
    .phase > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 10px 12px; margin-bottom: 10px; flex-wrap: wrap; }
    .phase > summary::-webkit-details-marker { display: none; }
    .phase > summary h3 { flex: 1; display: flex; gap: 8px; align-items: center; min-width: 0; }
    .phase > summary h3 .badge { font-family: var(--sans); }
    .chev { transition: transform .2s; color: var(--muted); }
    .phase[open] > summary .chev { transform: rotate(90deg); }
    @media (max-width: 760px) { .bar select { flex: 1 1 45%; } }`
})
export class TasksPage {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected states: ['pend' | 'done' | '', string][] = [['pend', 'Pendientes'], ['done', 'Hechas'], ['', 'Todas']];
  protected phases = PHASES;
  protected st = signal<'pend' | 'done' | ''>('pend');
  protected phase = signal('');
  protected who = signal('');
  protected whos = computed(() => [...new Set(this.store.state().tasks.map(t => t.who).filter(Boolean))]);

  protected groups = computed(() => {
    const all = this.store.state().tasks, w = this.store.wedding(), cur = currentPhase(w);
    let rows = all.slice();
    if (this.phase()) rows = rows.filter(t => t.phase === this.phase());
    if (this.st() === 'pend') rows = rows.filter(t => !t.done);
    else if (this.st() === 'done') rows = rows.filter(t => t.done);
    if (this.who()) rows = rows.filter(t => norm(t.who) === norm(this.who()));
    return PHASES.map(p => {
      const inPhase = all.filter(t => t.phase === p[0]);
      return {
        id: p[0], name: p[1], now: p[0] === cur, from: fmtDate(addDays(w, -p[2])),
        done: inPhase.filter(t => t.done).length, total: inPhase.length,
        tasks: rows.filter(t => t.phase === p[0]).sort((a, b) => dueOf(a, w).getTime() - dueOf(b, w).getTime())
      };
    }).filter(g => g.tasks.length);
  });
}
