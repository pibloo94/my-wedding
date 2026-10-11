import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { Guest, Member } from '../../core/models';
import { attending, dietText, hasDiet, members, seatList, unseated, usedSeats } from '../../core/domain';
import { colorOf, initials } from '../../core/util';
import { ModalComponent } from '../../shared/modal.component';
import { IconComponent } from '../../shared/icon.component';
import { TableFigureComponent } from '../../shared/table-figure.component';
import { SeatingService } from './seating.service';

/** Detalle de una mesa: dibujo con nombres, lista de personas y sentar a más. */
@Component({
  selector: 'adm-table-dialog',
  imports: [ModalComponent, IconComponent, TableFigureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (table(); as t) {
      <adm-modal [heading]="t.name" [wide]="true" (closed)="done.emit()">
        <span heading class="badge" [class.b-bad]="used() > t.cap" [class.b-ok]="used() === t.cap">{{ used() }}/{{ t.cap }}</span>
        <div class="tdetail">
          <div>
            <adm-table-figure [table]="t" [seats]="seats()" [big]="true" class="fig" />
            <div class="legend"><span><i class="free"></i>Silla libre</span><span><i class="diet"></i>Menú especial o alergias</span><span>Color = grupo</span></div>
          </div>
          <div>
            @if (used() > t.cap) { <div class="note"><adm-icon name="alert" /><span>Hay {{ used() - t.cap }} persona(s) más que sillas.</span></div> }
            <div>
              @for (x of seated(); track x.m.id) {
                <div class="list-row">
                  <span class="avatar" [style.background]="colorOf(x.g.group || x.g.name)">{{ initials(x.m.name) }}</span>
                  <div class="t">
                    <div class="tt">{{ x.m.name }} @if (x.m.role !== 'adulto') { <span class="muted small">{{ x.m.role === 'niño' ? 'niño/a' : 'acompañante' }}</span> }</div>
                    <div class="sb">{{ x.g.name !== x.m.name ? 'Invitación de ' + x.g.name : (x.g.group || 'Sin grupo') }}
                      @if (hasDiet(x.m)) { · <span class="diet">{{ dietText(x.m) }}</span> }</div>
                  </div>
                  <button class="icb d" (click)="seating.unassign(x.g.id, x.m.id)" [attr.aria-label]="'Quitar a ' + x.m.name + ' de la mesa'"><adm-icon name="x" /></button>
                </div>
              } @empty { <p class="muted small empty">Mesa vacía.</p> }
            </div>
            <label class="f">Sentar una invitación
              <select (change)="assign($any($event.target))">
                <option value="">{{ free().length ? 'Elige entre ' + free().length + ' con personas sin mesa…' : 'No queda nadie sin mesa' }}</option>
                @for (g of free(); track g.id) { <option [value]="g.id">{{ g.name }} ({{ unseatedCount(g) }})</option> }
              </select>
            </label>
            @if (t.notes) { <p class="small notes">{{ t.notes }}</p> }
          </div>
        </div>
        <ng-container footer>
          <button class="btn ghost danger" (click)="remove(t.id)"><adm-icon name="trash" /> Borrar</button>
          <span class="spacer"></span>
          <button class="btn out" (click)="lists.edit('tables', t.id)"><adm-icon name="edit" /> Editar mesa</button>
          <button class="btn pri" (click)="done.emit()">Hecho</button>
        </ng-container>
      </adm-modal>
    }`,
  styles: `
    .tdetail { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 18px; align-items: start; margin-top: 14px; }
    .fig { background: radial-gradient(circle at 50% 50%, #fff, var(--surface) 70%); border-radius: 14px; border: 1px solid var(--line); padding: 8px; }
    .legend i.free { background: #fff; border: 1px dashed var(--sand-deep); border-radius: 50%; }
    .legend i.diet { background: var(--orange); border-radius: 50%; }
    .diet { color: var(--primary-deep); }
    .empty { padding: 12px 0; }
    .notes { margin-top: 10px; }
    @media (max-width: 760px) { .tdetail { grid-template-columns: minmax(0, 1fr); } }`
})
export class TableDialogComponent {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected seating = inject(SeatingService);
  tableId = input.required<string>();
  done = output<void>();

  protected table = computed(() => this.store.tables().find(t => t.id === this.tableId()));
  protected seats = computed(() => { const t = this.table(); return t ? seatList(t, this.store.guests(), colorOf, initials) : []; });
  protected used = computed(() => usedSeats(this.store.guests(), this.tableId()));
  protected seated = computed(() => {
    const out: { g: Guest; m: Member }[] = [];
    for (const g of attending(this.store.guests())) for (const m of members(g)) if (m.table === this.tableId()) out.push({ g, m });
    return out;
  });
  protected free = computed(() => attending(this.store.guests()).filter(g => unseated(g).length).sort((a, b) => a.name.localeCompare(b.name, 'es')));

  protected readonly colorOf = colorOf;
  protected readonly initials = initials;
  protected readonly hasDiet = hasDiet;
  protected readonly dietText = dietText;
  protected unseatedCount(g: Guest): number { return unseated(g).length; }

  protected assign(sel: HTMLSelectElement): void {
    const g = this.store.guests().find(x => x.id === sel.value);
    sel.value = '';
    if (g) void this.seating.assign(g, this.tableId());
  }

  protected async remove(id: string): Promise<void> {
    if (await this.lists.remove('tables', id)) this.done.emit();
  }
}
