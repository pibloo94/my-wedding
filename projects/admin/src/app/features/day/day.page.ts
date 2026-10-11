import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { dueOf } from '../../core/domain';
import { fmtLongDate } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';
import { TaskRowComponent } from '../tasks/task-row.component';

@Component({
  selector: 'adm-day-page',
  imports: [PageHeaderComponent, EmptyStateComponent, IconComponent, TaskRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-header title="Día de la boda" [sub]="date()">
      <button class="btn pri" (click)="lists.add('day')"><adm-icon name="plus" /> Hito</button>
    </adm-page-header>
    <div class="grid g21">
      <div>
        <ol class="card vt">
          @for (d of items(); track d.id) {
            <li class="it" [class.web]="d.origin === 'Web pública'">
              <div class="hr">{{ d.time }}@if (d.end) {<small>hasta {{ d.end }}</small>}</div>
              <div class="dt" aria-hidden="true"></div>
              <div class="bx">
                <b>{{ d.title }}</b>
                <div class="small muted">@if (d.place) {<adm-icon name="pin" [size]="14" /> {{ d.place }}}{{ d.who ? ' · ' + d.who : '' }}</div>
                @if (d.notes) { <div class="small nt">{{ d.notes }}</div> }
                <div class="foot">
                  <span class="badge" [class.b-warn]="d.origin === 'Web pública'">{{ d.origin === 'Web pública' ? 'En la web' : 'Interno' }}</span>
                  <span class="spacer"></span>
                  <button class="icb" (click)="lists.edit('day', d.id)" aria-label="Editar"><adm-icon name="edit" /></button>
                  <button class="icb d" (click)="lists.remove('day', d.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
                </div>
              </div>
            </li>
          } @empty { <li class="muted">Sin hitos.</li> }
        </ol>
        <p class="xs muted hint2">Los hitos «En la web» coinciden con el programa publicado. Si cambian, edítalos también en Web de la boda → Contenido.</p>
      </div>
      <section class="card">
        <h3><adm-icon name="check" /> Semana de la boda</h3>
        <div class="flush">@for (t of week(); track t.id) { <adm-task-row [task]="t" /> } @empty { <p class="muted small">Sin tareas.</p> }</div>
      </section>
    </div>
    <section class="sec">
      <div class="sec-h"><h2>Logística</h2><button class="btn out" (click)="lists.add('logistics')"><adm-icon name="plus" /> Elemento</button></div>
      @if (logistics().length) {
        <div class="tw"><table>
          <thead><tr><th>Elemento</th><th>Tipo</th><th>Responsable</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead>
          <tbody>
            @for (l of logistics(); track l.id) {
              <tr>
                <td data-label="Elemento"><b>{{ l.title }}</b>@if (l.notes) {<div class="xs muted">{{ l.notes }}</div>}</td>
                <td data-label="Tipo">{{ l.cat || '—' }}</td>
                <td data-label="Responsable">{{ l.who || '—' }}</td>
                <td data-label="Estado"><span class="badge" [class.b-ok]="l.status === 'Resuelto'" [class.b-warn]="l.status === 'En curso'">{{ l.status }}</span></td>
                <td class="acts">
                  <button class="icb" (click)="lists.edit('logistics', l.id)" aria-label="Editar"><adm-icon name="edit" /></button>
                  <button class="icb d" (click)="lists.remove('logistics', l.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
                </td>
              </tr>
            }
          </tbody>
        </table></div>
      } @else {
        <adm-empty text="Transporte, montaje, entregas, documentación…" cat="black" />
      }
    </section>`,
  styles: `
    .vt { list-style: none; padding-left: 14px; }
    .it { display: grid; grid-template-columns: 86px 22px minmax(0, 1fr); gap: 0 14px; align-items: start; padding: 4px 0 18px; position: relative; }
    .it::before { content: ''; position: absolute; left: calc(86px + 14px + 10px); top: 22px; bottom: -4px; width: 1px; background: var(--line-strong); }
    .it:last-child::before { display: none; }
    .hr { font-family: var(--serif); font-size: 1.25rem; color: var(--primary); text-align: right; line-height: 1.1; }
    .hr small { display: block; font-family: var(--sans); font-size: .74rem; color: var(--muted); }
    .dt { width: 22px; height: 22px; border-radius: 50%; background: var(--surface); border: 2px solid var(--sage); margin-top: 2px; position: relative; z-index: 1; }
    .web .dt { border-color: var(--primary); background: #F7E6D6; }
    .bx { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px 16px; min-width: 0; }
    .bx b { color: var(--dark); }
    .bx .small { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .nt { margin-top: 4px; }
    .foot { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
    .hint2 { margin-top: 8px; }
    .flush { margin: 8px -18px -8px; }
    @media (max-width: 760px) {
      .vt { padding-left: 4px; }
      .it { grid-template-columns: 58px 18px minmax(0, 1fr); gap: 0 10px; }
      .it::before { left: calc(58px + 10px + 8px); }
      .dt { width: 18px; height: 18px; }
      .hr { font-size: 1.05rem; }
      .flush { margin: 8px -16px -8px; }
    }`
})
export class DayPage {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected date = computed(() => fmtLongDate(this.store.wedding()));
  /** Orden del día: las horas de madrugada (antes de las 6) van al final */
  protected items = computed(() => {
    const key = (t: string) => (t < '06:00' ? '3' : '1') + t;
    return this.store.state().day.slice().sort((a, b) => key(a.time).localeCompare(key(b.time)));
  });
  protected week = computed(() => {
    const w = this.store.wedding();
    return this.store.state().tasks.filter(t => t.phase === 'week' || t.phase === 'day').sort((a, b) => dueOf(a, w).getTime() - dueOf(b, w).getTime());
  });
  protected logistics = computed(() => this.store.state().logistics);
}
