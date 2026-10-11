import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { ListsService } from '../../core/lists.service';
import { Guest, Table } from '../../core/models';
import { SHAPE_NAMES, SeatInfo, attending, hasDiet, members, seatList, seats, unseated, usedSeats } from '../../core/domain';
import { colorOf, initials } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';
import { TableFigureComponent } from '../../shared/table-figure.component';
import { FloorPlanComponent } from './floor-plan.component';
import { SeatingService } from './seating.service';

@Component({
  selector: 'adm-tables-page',
  imports: [PageHeaderComponent, EmptyStateComponent, IconComponent, TableFigureComponent, FloorPlanComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tables.page.html',
  styleUrl: './tables.page.scss'
})
export class TablesPage {
  private store = inject(StoreService);
  protected ui = inject(UiService);
  protected lists = inject(ListsService);
  private seating = inject(SeatingService);
  private router = inject(Router);

  /** Vista: reparto (quién se sienta dónde) o plano del salón. Va en la URL: #/mesas?vista=plano */
  protected view = toSignal(inject(ActivatedRoute).queryParamMap.pipe(map(q => (q.get('vista') === 'plano' ? 'plano' : 'reparto'))), { initialValue: 'reparto' });

  protected tables = this.store.tables;
  protected free = computed(() => attending(this.store.guests()).filter(g => unseated(g).length).sort((a, b) => a.name.localeCompare(b.name, 'es')));
  protected freePeople = computed(() => this.free().reduce((a, g) => a + unseated(g).length, 0));
  protected need = computed(() => attending(this.store.guests()).reduce((a, g) => a + seats(g), 0));
  protected capT = computed(() => this.tables().reduce((a, t) => a + (+t.cap || 0), 0));
  protected seated = computed(() => attending(this.store.guests()).reduce((a, g) => a + members(g).filter(m => m.table).length, 0));
  protected seatsMap = computed(() => {
    const gs = this.store.guests();
    return new Map<string, SeatInfo[]>(this.tables().map(t => [t.id, seatList(t, gs, colorOf, initials)]));
  });
  protected dropTarget = signal('');

  protected readonly SHAPE_NAMES = SHAPE_NAMES;
  protected readonly colorOf = colorOf;
  protected readonly initials = initials;

  protected setView(v: 'reparto' | 'plano'): void {
    void this.router.navigate([], { queryParams: { vista: v === 'plano' ? 'plano' : null }, replaceUrl: true });
  }

  protected used(t: Table): number { return usedSeats(this.store.guests(), t.id); }
  protected seatsOf(t: Table): SeatInfo[] { return this.seatsMap().get(t.id) ?? []; }
  protected unseatedOf(g: Guest) { return unseated(g); }
  protected dietOf(g: Guest): boolean { return unseated(g).some(hasDiet); }
  protected chipExtra(g: Guest): string {
    const u = unseated(g);
    if (u.length > 1) return String(u.length);
    return u[0] && u[0].name !== g.name ? u[0].name.split(' ')[0]! : '';
  }

  protected openTable(id: string): void { this.ui.open({ kind: 'table', id }); }
  protected pick(g: Guest): void { this.ui.open({ kind: 'pickTable', guestId: g.id }); }

  // Arrastrar invitaciones a las mesas (escritorio). En pantallas táctiles se pulsa y se elige mesa.
  protected dragStart(e: DragEvent, g: Guest): void {
    e.dataTransfer?.setData('text/plain', g.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }
  protected dragOver(e: DragEvent, t: Table): void {
    e.preventDefault();
    this.dropTarget.set(t.id);
  }
  protected drop(e: DragEvent, t: Table): void {
    e.preventDefault();
    this.dropTarget.set('');
    const g = this.store.guests().find(x => x.id === e.dataTransfer?.getData('text/plain'));
    if (g) void this.seating.assign(g, t.id);
  }
}
