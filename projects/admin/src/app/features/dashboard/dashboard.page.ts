import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { PHASES, attending, currentPhase, dueOf, members, paid, seats } from '../../core/domain';
import { addDays, dayDiff, eur, fmtDate, fmtLongDate, parseDate, safeUrl, today } from '../../core/util';
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
    const pays = ex.filter(e => e.due && (+(e.act ?? 0) || +(e.est ?? 0)) > paid(e)).sort((a, b) => a.due!.localeCompare(b.due!)).slice(0, 4)
      .map(e => ({ id: e.id, concept: e.concept, due: fmtDate(e.due), left: eur((+(e.act ?? 0) || +(e.est ?? 0)) - paid(e)), late: (parseDate(e.due) ?? today()) < today() }));
    return { est, act, pg, B, ref: B || act || est, pays };
  });

  protected tasks = computed(() => {
    const ts = this.store.state().tasks, w = this.store.wedding();
    const open = ts.filter(t => !t.done);
    return {
      open: open.length, late: open.filter(t => dueOf(t, w) < today()).length,
      pct: ts.length ? Math.round((ts.length - open.length) / ts.length * 100) : 0,
      next: open.slice().sort((a, b) => dueOf(a, w).getTime() - dueOf(b, w).getTime()).slice(0, 5)
    };
  });

  protected phases = computed(() => {
    const w = this.store.wedding(), cur = currentPhase(w), ts = this.store.state().tasks;
    return PHASES.filter(p => p[0] !== 'post').map(p => {
      const its = ts.filter(t => t.phase === p[0]), dn = its.filter(t => t.done).length;
      const a = addDays(w, -p[2]), b = addDays(w, -p[3]);
      return {
        id: p[0], name: p[1], now: p[0] === cur, past: b < today() && p[0] !== cur,
        when: p[0] === 'day' ? fmtDate(a, { day: 'numeric', month: 'short' }) : fmtDate(a, { month: 'short', year: '2-digit' }) + (p[2] !== p[3] ? ' – ' + fmtDate(b, { month: 'short', year: '2-digit' }) : ''),
        pct: its.length ? dn / its.length * 100 : 0, done: dn, total: its.length
      };
    });
  });

  protected tableCount = computed(() => this.store.tables().length);
  protected chairs = computed(() => this.store.tables().reduce((a, t) => a + (+t.cap || 0), 0));
  protected web = computed(() => {
    const s = this.store.state();
    const plan = s.webPlan.filter(p => p.status !== 'Descartado');
    return { status: s.meta.webStatus, done: plan.filter(p => p.status === 'Hecho').length, total: plan.length, planned: s.webLog.filter(l => l.status === 'Previsto').length };
  });

  protected pct(a: number, b: number): number { return b ? Math.min(100, a / b * 100) : 0; }
  protected readonly eur = eur;
  protected readonly abs = Math.abs;
  protected readonly floor = Math.floor;
}
