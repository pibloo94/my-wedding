import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { Table } from '../../core/models';
import { seatList, unseated, usedSeats, seats } from '../../core/domain';
import { colorOf, initials } from '../../core/util';
import { ModalComponent } from '../../shared/modal.component';
import { IconComponent } from '../../shared/icon.component';
import { TableFigureComponent } from '../../shared/table-figure.component';
import { SeatingService } from './seating.service';

/** Elegir mesa para una invitación (la forma de sentar en móvil). */
@Component({
  selector: 'adm-pick-table-dialog',
  imports: [ModalComponent, IconComponent, TableFigureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (guest(); as g) {
      <adm-modal [heading]="'Sentar a ' + g.name + (count() > 1 ? ' (' + count() + ' personas)' : '')" (closed)="done.emit()">
        <div class="opts">
          @for (t of store.tables(); track t.id) {
            <button class="opt" (click)="choose(t)">
              <adm-table-figure [table]="t" [seats]="seatsOf(t)" class="mini" />
              <span class="t"><span class="tt">{{ t.name }}</span><span class="sb">{{ freeText(t) }}</span></span>
              <adm-icon name="chev" />
            </button>
          }
        </div>
      </adm-modal>
    }`,
  styles: `
    .opts { display: flex; flex-direction: column; }
    .opt { display: flex; align-items: center; gap: 12px; padding: 10px 2px; border: 0; border-top: 1px solid var(--line); background: none; cursor: pointer; text-align: left; font: inherit; color: inherit; }
    .opt:first-child { border-top: 0; }
    .opt:hover { background: var(--bg-alt); }
    .mini { width: 64px; flex: none; }
    .t { flex: 1; display: flex; flex-direction: column; }
    .tt { font-weight: 500; color: var(--dark); }
    .sb { font-size: .8rem; color: var(--muted); }`
})
export class PickTableDialogComponent {
  protected store = inject(StoreService);
  private seating = inject(SeatingService);
  guestId = input.required<string>();
  done = output<void>();
  protected guest = computed(() => this.store.guests().find(g => g.id === this.guestId()));
  protected count = computed(() => { const g = this.guest(); return g ? (unseated(g).length || seats(g)) : 0; });

  protected seatsOf(t: Table) { return seatList(t, this.store.guests(), colorOf, initials); }
  protected freeText(t: Table): string {
    const fr = t.cap - usedSeats(this.store.guests(), t.id);
    return fr >= this.count() ? `${fr} sillas libres` : fr > 0 ? `Solo ${fr} libre${fr > 1 ? 's' : ''}` : 'Completa';
  }
  protected choose(t: Table): void {
    const g = this.guest();
    this.done.emit();
    if (g) void this.seating.assign(g, t.id);
  }
}
