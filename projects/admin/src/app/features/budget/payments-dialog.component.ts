import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { paid } from '../../core/domain';
import { eur, fmtDate, isoDate, today, uid } from '../../core/util';
import { ModalComponent } from '../../shared/modal.component';
import { IconComponent } from '../../shared/icon.component';

/** Pagos de un gasto: pagados y programados. */
@Component({
  selector: 'adm-payments-dialog',
  imports: [ModalComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (expense(); as e) {
      <adm-modal [heading]="'Pagos · ' + e.concept" (closed)="done.emit()">
        <div class="grid g3 sums">
          <div><div class="xs muted">Contratado</div><b>{{ eur(e.act) }}</b></div>
          <div><div class="xs muted">Pagado</div><b>{{ eur(paidTotal()) }}</b></div>
          <div><div class="xs muted">Pendiente</div><b>{{ eur(pending()) }}</b></div>
        </div>
        @for (p of e.payments; track p.id; let i = $index) {
          <div class="list-row">
            <span class="badge" [class.b-ok]="p.status === 'Pagado'" [class.b-warn]="p.status !== 'Pagado'">{{ p.status }}</span>
            <div class="t"><div class="tt">{{ eur(p.amount) }}</div><div class="sb">{{ fmtDate(p.date) }}{{ p.note ? ' · ' + p.note : '' }}</div></div>
            <button class="icb d" (click)="removePay(i)" aria-label="Borrar pago"><adm-icon name="trash" /></button>
          </div>
        } @empty { <p class="muted small empty">Sin pagos registrados.</p> }
        <ng-container footer>
          <button class="btn out" (click)="done.emit()">Cerrar</button>
          <button class="btn pri" (click)="addPay()"><adm-icon name="plus" /> Añadir pago</button>
        </ng-container>
      </adm-modal>
    }`,
  styles: `.sums { margin: 12px 0 14px; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } .empty { padding: 14px 0; text-align: center; }`
})
export class PaymentsDialogComponent {
  private store = inject(StoreService);
  private ui = inject(UiService);
  expenseId = input.required<string>();
  done = output<void>();
  protected expense = computed(() => this.store.state().expenses.find(e => e.id === this.expenseId()));
  protected paidTotal = computed(() => { const e = this.expense(); return e ? paid(e) : 0; });
  protected pending = computed(() => { const e = this.expense(); return e ? Math.max(0, (+(e.act ?? 0) || +(e.est ?? 0) || 0) - paid(e)) : 0; });
  protected readonly eur = eur;
  protected readonly fmtDate = fmtDate;

  protected async addPay(): Promise<void> {
    const e = this.expense();
    if (!e) return;
    const v = await this.ui.form('Registrar pago · ' + e.concept, [
      { k: 'date', l: 'Fecha', type: 'date' }, { k: 'amount', l: 'Importe (€)', type: 'number', r: true },
      { k: 'status', l: 'Estado', type: 'select', o: ['Pagado', 'Programado'] }, { k: 'note', l: 'Nota', full: true }
    ], { date: isoDate(today()), status: 'Pagado' }, 'Añadir');
    if (!v) return;
    this.store.update(s => {
      const x = s.expenses.find(y => y.id === e.id);
      if (x) (x.payments ??= []).push({ id: uid(), date: String(v['date'] || ''), amount: Number(v['amount']) || 0, status: String(v['status']), note: String(v['note'] || '') });
    });
  }

  protected removePay(i: number): void {
    const id = this.expenseId();
    this.store.update(s => { s.expenses.find(y => y.id === id)?.payments.splice(i, 1); });
  }
}
