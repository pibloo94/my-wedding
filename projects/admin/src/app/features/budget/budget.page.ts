import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { ListsService } from '../../core/lists.service';
import { Expense } from '../../core/models';
import { paid } from '../../core/domain';
import { PALETTE, eur, fmtDate, parseDate, today } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';

interface Slice { l: string; v: number; c: string; dash: string; offset: number; pct: number; }

@Component({
  selector: 'adm-budget-page',
  imports: [RouterLink, PageHeaderComponent, EmptyStateComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './budget.page.html',
  styleUrl: './budget.page.scss'
})
export class BudgetPage {
  private store = inject(StoreService);
  protected ui = inject(UiService);
  protected lists = inject(ListsService);
  protected expenses = computed(() => this.store.state().expenses);

  protected sum = computed(() => {
    const ex = this.expenses();
    const est = ex.reduce((a, e) => a + (+(e.est ?? 0) || 0), 0);
    const act = ex.reduce((a, e) => a + (+(e.act ?? 0) || 0), 0);
    const pg = ex.reduce((a, e) => a + paid(e), 0);
    const B = +this.store.config().budget || 0;
    return { est, act, pg, B, ref: Math.max(B, act, est) || 1, contracted: ex.filter(e => +(e.act ?? 0)).length };
  });

  /** Gasto por categoría para el gráfico de anillo. */
  protected slices = computed<Slice[]>(() => {
    const cats: Record<string, number> = {};
    for (const e of this.expenses()) { const k = e.cat || 'Otros'; cats[k] = (cats[k] ?? 0) + (+(e.act ?? 0) || +(e.est ?? 0) || 0); }
    const parts = Object.entries(cats).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const tot = parts.reduce((a, p) => a + p[1], 0) || 1;
    const R = 74, C = 2 * Math.PI * R;
    let off = 0;
    return parts.map(([l, v], i) => {
      const len = v / tot * C;
      const s = { l, v, c: PALETTE[i % PALETTE.length]!, dash: `${Math.max(0, len - 2)} ${C}`, offset: -off, pct: Math.round(v / tot * 100) };
      off += len;
      return s;
    });
  });

  protected readonly eur = eur;
  protected readonly paid = paid;
  protected readonly fmtDate = fmtDate;
  protected pct(a: number): number { return Math.max(0, Math.min(100, a / this.sum().ref * 100)); }
  protected late(e: Expense): boolean { return !!e.due && (parseDate(e.due) ?? today()) < today() && (+(e.act ?? 0) || +(e.est ?? 0)) > paid(e); }
  protected paidPct(e: Expense): number { return +(e.act ?? 0) ? Math.min(100, paid(e) / +(e.act ?? 1) * 100) : 0; }
  protected meta(e: Expense): string { return [e.cat, e.vendor].filter(Boolean).join(' · '); }
}
