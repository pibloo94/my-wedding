import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { Task } from '../../core/models';
import { dueOf } from '../../core/domain';
import { dayDiff, fmtDate, today } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';

/** Una tarea con su casilla, fecha (vencida, próxima, hecha) y acciones. */
@Component({
  selector: 'adm-task-row',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = task();
    <input type="checkbox" [checked]="t.done" (change)="toggle($any($event.target).checked)" [attr.aria-label]="'Hecha: ' + t.title">
    <div class="body">
      <div class="tt">{{ t.title }}</div>
      <div class="sb">{{ t.who ? t.who + ' · ' : '' }}{{ t.cat }}{{ t.notes ? ' · ' + t.notes : '' }}</div>
    </div>
    <div class="when">
      <span class="badge" [class.b-bad]="late()" [class.b-ok]="t.done" [class.b-warn]="soon()">{{ late() ? 'Vencida · ' : '' }}{{ dateText() }}</span>
      <span class="xs">{{ t.due ? 'fecha fija' : 'se mueve con la boda' }}</span>
    </div>
    @if (actions()) {
      <div class="ops">
        <button class="icb" (click)="lists.edit('tasks', t.id)" aria-label="Editar"><adm-icon name="edit" /></button>
        <button class="icb d" (click)="lists.remove('tasks', t.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
      </div>
    }`,
  host: { '[class.done]': 'task().done' },
  styles: `
    :host { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; gap: 4px 14px; align-items: start; padding: 12px 18px; border-top: 1px solid var(--line); }
    :host(:first-child) { border-top: 0; }
    input { margin-top: 3px; }
    .tt { color: var(--dark); font-weight: 500; overflow-wrap: anywhere; }
    :host(.done) .tt { text-decoration: line-through; color: var(--faint); font-weight: 400; }
    .sb { font-size: .8rem; color: var(--muted); margin-top: 2px; overflow-wrap: anywhere; }
    .when { text-align: right; white-space: nowrap; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
    .when .xs { color: var(--faint); }
    .ops { display: flex; }
    @media (max-width: 760px) {
      :host { grid-template-columns: auto minmax(0, 1fr) auto; padding: 12px 14px; }
      .when { grid-column: 2; flex-direction: row; align-items: center; gap: 8px; }
      .ops { grid-column: 3; grid-row: 1; }
    }`
})
export class TaskRowComponent {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  task = input.required<Task>();
  actions = input(true);
  private due = computed(() => dueOf(this.task(), this.store.wedding()));
  protected late = computed(() => !this.task().done && this.due() < today());
  protected soon = computed(() => !this.task().done && !this.late() && dayDiff(this.due(), today()) <= 14);
  protected dateText = computed(() => {
    const d = this.due();
    return fmtDate(d, { day: 'numeric', month: 'short', year: d.getFullYear() !== today().getFullYear() ? 'numeric' : undefined });
  });

  protected toggle(done: boolean): void {
    const id = this.task().id;
    this.store.update(s => { const t = s.tasks.find(x => x.id === id); if (t) t.done = done; });
  }
}
