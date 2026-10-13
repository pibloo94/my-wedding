import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { ContentEditorService } from '../../core/content-editor.service';
import { attending, dueOf, members, monthKey, monthRange, monthStart, nextPayment, paid, seats } from '../../core/domain';
import { dayDiff, eur, fmtDate, fmtLongDate, parseDate, safeUrl, today } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';
import { TaskRowComponent } from '../tasks/task-row.component';

@Component({
  selector: 'adm-dashboard-page',
  imports: [RouterLink, IconComponent, TaskRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage {
  private store = inject(StoreService);
  private ct = inject(ContentEditorService);
  protected config = this.store.config;
  protected publicUrl = computed(() => safeUrl(this.config().publicUrl));
  protected days = computed(() => dayDiff(this.store.wedding(), today()));
  protected longDate = computed(() => fmtLongDate(this.store.wedding()));

  protected g = computed(() => {
    const gs = this.store.guests();
    const sum = (st: string) => gs.filter(g => g.status === st).reduce((a, g) => a + seats(g), 0);
    const conf = sum('confirmado'), pend = sum('pendiente'), dec = sum('rechazado');
    const need = attending(gs).reduce((a, g) => a + seats(g), 0);
    const seated = attending(gs).reduce((a, g) => a + members(g).filter(m => m.table).length, 0);
    return { conf, pend, dec, inv: conf + pend + dec, need, seated };
  });

  protected money = computed(() => {
    const ex = this.store.state().expenses;
    const est = ex.reduce((a, e) => a + (+(e.est ?? 0) || 0), 0), act = ex.reduce((a, e) => a + (+(e.act ?? 0) || 0), 0);
    const pg = ex.reduce((a, e) => a + paid(e), 0), B = +this.config().budget || 0;
    const pays = ex.map(e => ({ e, n: nextPayment(e) })).filter(x => x.n).sort((a, b) => a.n!.date.localeCompare(b.n!.date)).slice(0, 4)
      .map(({ e, n }) => ({ id: e.id, concept: e.concept, due: fmtDate(n!.date), left: eur(n!.amount), late: (parseDate(n!.date) ?? today()) < today() }));
    return { est, act, pg, B, ref: B || act || est, pays };
  });

  protected tasks = computed(() => {
    const ts = this.store.state().tasks, w = this.store.wedding(), now = today(), cur = monthKey(now);
    const open = ts.filter(t => !t.done).map(t => ({ t, d: dueOf(t, w) })).sort((a, b) => a.d.getTime() - b.d.getTime());
    const late = open.filter(x => x.d < now);
    const month = open.filter(x => x.d >= now && monthKey(x.d) === cur);
    return {
      open: open.length, late: late.length,
      pct: ts.length ? Math.round((ts.length - open.length) / ts.length * 100) : 0,
      /** Inicio: atrasadas y lo que queda de este mes; si no hay nada, lo siguiente */
      now: [...late, ...month].map(x => x.t),
      next: open.find(x => x.d >= now && monthKey(x.d) > cur)
    };
  });

  /** Camino al gran día: un hito por mes, desde este mes hasta el de la boda. */
  protected months = computed(() => {
    const w = this.store.wedding(), ts = this.store.state().tasks, cur = monthKey(today()), wk = monthKey(w);
    const keys = monthRange(cur <= wk ? cur : wk, wk);
    return keys.map(key => {
      const its = ts.filter(t => monthKey(dueOf(t, w)) === key), dn = its.filter(t => t.done).length;
      const name = fmtDate(monthStart(key), { month: 'short' }).replace('.', '');
      return {
        key, name: name.charAt(0).toUpperCase() + name.slice(1), year: key.slice(2, 4), now: key === cur, wedding: key === wk,
        pct: its.length ? dn / its.length * 100 : 0, done: dn, total: its.length
      };
    });
  });

  protected nextText(): string {
    const n = this.tasks().next;
    return n ? `${n.t.title} (${fmtDate(n.d, { day: 'numeric', month: 'short' })})` : '';
  }

  protected tableCount = computed(() => this.store.tables().length);
  protected chairs = computed(() => this.store.tables().reduce((a, t) => a + (+t.cap || 0), 0));
  protected web = computed(() => {
    return { version: this.ct.pubVersion(), pending: this.ct.diff().length };
  });

  protected pct(a: number, b: number): number { return b ? Math.min(100, a / b * 100) : 0; }
  protected readonly eur = eur;
  protected readonly abs = Math.abs;
  protected readonly floor = Math.floor;
}
