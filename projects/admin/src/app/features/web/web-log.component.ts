import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { LOG_STATUSES } from '../../core/forms';
import { fmtDate } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'adm-web-log',
  imports: [IconComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="note small"><adm-icon name="info" /><span>Cada publicación desde Contenido o Temática se anota aquí sola. También puedes apuntar cambios previstos a mano.</span></div>
    <div class="bar"><button class="btn out" (click)="lists.add('webLog')"><adm-icon name="plus" /> Cambio</button></div>
    @if (rows().length) {
      <div class="card list">
        @for (l of rows(); track l.id) {
          <div class="li">
            <span class="xs muted date">{{ fmtDate(l.date, { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
            <div class="t">
              <div class="tt">{{ l.section || '—' }}{{ l.field ? ' · ' + l.field : '' }}</div>
              @if (l.from || l.to) { <div class="diff">@if (l.from) {<del>{{ l.from }}</del> }<adm-icon name="arrow" [size]="13" /> <ins>{{ l.to }}</ins></div> }
              @if (l.change) { <div class="small muted">{{ l.change }}</div> }
            </div>
            <div class="ops">
              <select [value]="l.status" (change)="setStatus(l.id, $any($event.target).value)" aria-label="Estado">
                @for (s of statuses; track s) { <option [value]="s" [selected]="s === l.status">{{ s }}</option> }
              </select>
              <button class="icb d" (click)="lists.remove('webLog', l.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
            </div>
          </div>
        }
      </div>
    } @else { <adm-empty text="Sin cambios anotados. Las publicaciones aparecerán aquí." /> }`,
  styles: `
    .list { padding: 4px 18px; }
    .li { display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; gap: 4px 12px; padding: 11px 0; border-top: 1px solid var(--line); align-items: start; }
    .li:first-child { border-top: 0; }
    .tt { font-weight: 500; color: var(--dark); }
    .diff { font-size: .84rem; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; overflow-wrap: anywhere; }
    del { color: #8a4524; background: #F7E1D3; padding: 0 4px; border-radius: 4px; }
    ins { color: #3f5130; background: #E2EAD5; text-decoration: none; padding: 0 4px; border-radius: 4px; }
    .ops { display: flex; gap: 2px; align-items: center; }
    .ops select { min-height: 36px; padding: 4px 8px; font-size: .8rem; max-width: 190px; }
    @media (max-width: 760px) {
      .list { padding: 4px 12px; }
      .li { grid-template-columns: minmax(0, 1fr); }
      .ops select { flex: 1; max-width: none; }
    }`
})
export class WebLogComponent {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected statuses = LOG_STATUSES;
  protected rows = computed(() => this.store.state().webLog.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')));
  protected readonly fmtDate = fmtDate;
  protected setStatus(id: string, v: string): void {
    this.store.update(s => { const l = s.webLog.find(x => x.id === id); if (l) l.status = v; });
  }
}
