import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { ListsService } from '../../core/lists.service';
import { Guest, Member } from '../../core/models';
import { attending, dietText, hasDiet, kidsOf, members, mkMember, peopleLabel, statusClass, unseated } from '../../core/domain';
import { colorOf, dayDiff, initials, isoDate, norm, today, uid } from '../../core/util';
import { downloadText, parseCsv, pickTextFile, toCsv } from '../../core/files';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';

type Filter = '' | 'confirmado' | 'pendiente' | 'rechazado' | 'dieta' | 'ninos' | 'sinmesa';

@Component({
  selector: 'adm-guests-page',
  imports: [PageHeaderComponent, EmptyStateComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guests.page.html',
  styleUrl: './guests.page.scss'
})
export class GuestsPage {
  protected store = inject(StoreService);
  private ui = inject(UiService);
  protected lists = inject(ListsService);

  protected q = signal('');
  protected filter = signal<Filter>('');
  protected guests = this.store.guests;

  protected people = computed(() => this.guests().reduce((a, g) => a + (members(g).length || 1), 0));
  protected fresh = computed(() => this.store.cloud()
    ? this.guests().filter(g => g.source === 'web' && g.rsvpAt && dayDiff(today(), new Date(g.rsvpAt)) <= 7).length : 0);
  protected sub = computed(() => `${this.guests().length} invitaciones · ${this.people()} personas${this.fresh() ? ` · ${this.fresh()} respuesta${this.fresh() === 1 ? '' : 's'} esta semana` : ''}`);

  protected chips = computed(() => {
    const gs = this.guests();
    const c = (s: string) => gs.filter(g => g.status === s).length;
    return [
      { k: '' as Filter, l: 'Todas', n: gs.length, dot: '' },
      { k: 'confirmado' as Filter, l: 'Confirmadas', n: c('confirmado'), dot: '#7E8C6A' },
      { k: 'pendiente' as Filter, l: 'Pendientes', n: c('pendiente'), dot: '#CD8A52' },
      { k: 'rechazado' as Filter, l: 'No vienen', n: c('rechazado'), dot: '#D8C6A4' },
      { k: 'dieta' as Filter, l: 'Menú especial o alergias', n: gs.filter(g => members(g).some(hasDiet)).length, dot: '' },
      { k: 'ninos' as Filter, l: 'Con niños', n: gs.filter(g => kidsOf(g).length).length, dot: '' },
      { k: 'sinmesa' as Filter, l: 'Sin mesa', n: attending(gs).filter(g => unseated(g).length).length, dot: '' }
    ];
  });

  protected rows = computed(() => {
    const f = this.filter(), q = norm(this.q());
    let rows = this.guests().slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (f === 'dieta') rows = rows.filter(g => members(g).some(hasDiet));
    else if (f === 'ninos') rows = rows.filter(g => kidsOf(g).length);
    else if (f === 'sinmesa') rows = rows.filter(g => g.status !== 'rechazado' && unseated(g).length);
    else if (f) rows = rows.filter(g => g.status === f);
    if (q) rows = rows.filter(g => norm([g.name, g.group, g.contact, ...members(g).map(m => m.name)].join(' ')).includes(q));
    return rows;
  });

  /** Resumen para el catering: solo invitaciones confirmadas. */
  protected catering = computed(() => {
    const conf = this.guests().filter(g => g.status === 'confirmado').flatMap(members);
    const ad = conf.filter(m => m.role !== 'niño'), kd = conf.filter(m => m.role === 'niño');
    const allergic = conf.filter(m => (m.allergies || '').trim());
    return {
      total: conf.length, adults: ad.length, veg: ad.filter(m => m.menu === 'vegetariano').length,
      kids: kd.length, ages: kd.map(m => m.age ?? '?').sort((a, b) => Number(a) - Number(b)).join(', '),
      gf: conf.filter(m => m.gf).length, lf: conf.filter(m => m.lf).length,
      allergic: allergic.length,
      allergicText: allergic.slice(0, 3).map(m => `${m.name.split(' ')[0]}: ${m.allergies}`).join(' · ') + (allergic.length > 3 ? ' …' : '')
    };
  });

  protected tableNames = computed(() => new Map(this.store.tables().map(t => [t.id, t.name])));

  protected readonly members = members;
  protected readonly statusClass = statusClass;
  protected readonly peopleLabel = peopleLabel;
  protected readonly colorOf = colorOf;
  protected readonly initials = initials;
  protected readonly dietText = dietText;

  protected diets(g: Guest): Member[] { return members(g).filter(hasDiet); }
  protected tablesOf(g: Guest): { id: string; name: string }[] {
    return [...new Set(members(g).map(m => m.table).filter(Boolean))].map(id => ({ id, name: this.tableNames().get(id) ?? '?' }));
  }
  protected unseatedCount(g: Guest): number { return g.status === 'rechazado' ? 0 : unseated(g).length; }
  protected companions(g: Guest): string {
    return members(g).slice(1).map(m => m.name + (m.role === 'niño' ? ` (${m.age ?? '?'})` : '')).join(', ');
  }

  protected openTable(id: string): void { this.ui.open({ kind: 'table', id }); }

  /** Etiquetas de menú y alergias de una persona (las alergias se resaltan). */
  protected tags(m: Member): { t: string; warn: boolean }[] {
    const out: { t: string; warn: boolean }[] = [];
    if (m.menu === 'vegetariano') out.push({ t: 'Vegetariano', warn: false });
    if (m.gf) out.push({ t: 'Sin gluten', warn: false });
    if (m.lf) out.push({ t: 'Sin lactosa', warn: false });
    if ((m.allergies || '').trim()) out.push({ t: 'Alergia: ' + m.allergies.trim(), warn: true });
    return out;
  }

  /** Enlace para escribir o llamar desde el móvil. */
  protected contactHref(c: string | undefined): string {
    const v = (c || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'mailto:' + v;
    const d = v.replace(/[^\d+]/g, '');
    return d.replace(/\D/g, '').length >= 9 ? 'tel:' + d : '';
  }

  /** CSV por persona (para el catering y para revisar). */
  protected exportCsv(): void {
    const names = this.tableNames();
    const rows: unknown[][] = [['Invitación', 'Persona', 'Tipo', 'Edad', 'Estado', 'Menú', 'Sin gluten', 'Sin lactosa', 'Alergias', 'Mesa', 'Grupo', 'Contacto']];
    for (const g of this.guests()) for (const m of members(g)) rows.push([
      g.name, m.name, m.role, m.role === 'niño' ? (m.age ?? '') : '', g.status,
      m.menu === 'vegetariano' ? 'vegetariano' : m.menu === 'estandar' ? 'estándar' : 'infantil / sin indicar',
      m.gf ? 'SÍ' : '', m.lf ? 'SÍ' : '', m.allergies || '', names.get(m.table) ?? '', g.group || '', g.contact || ''
    ]);
    downloadText(`invitados-por-persona-${isoDate(today())}.csv`, toCsv(rows), 'text/csv');
  }

  /** Importa el CSV de la hoja de Google antigua (Nombre, Asistencia, Acompañante…). */
  protected async importCsv(): Promise<void> {
    const text = await pickTextFile('.csv,text/csv');
    if (text === null) return;
    const rows = parseCsv(text);
    if (rows.length < 2) { this.ui.toast('El CSV no tiene filas'); return; }
    const H = rows[0]!.map(norm);
    const ix = {
      name: H.findIndex(h => h === 'nombre'), att: H.findIndex(h => h.startsWith('asistencia')),
      hp: H.findIndex(h => h.includes('acompa') && !h.includes('nombre')), pn: H.findIndex(h => h.includes('nombre') && h.includes('acompa')),
      di: H.findIndex(h => h.includes('alergia') || h.includes('dietar')), msg: H.findIndex(h => h.includes('mensaje')), dt: H.findIndex(h => h.startsWith('fecha'))
    };
    if (ix.name < 0) { this.ui.toast('No encuentro la columna «Nombre»'); return; }
    let nw = 0, up = 0;
    this.store.update(s => {
      for (const r of rows.slice(1)) {
        const cell = (i: number) => (i >= 0 ? (r[i] || '').trim() : '');
        const name = cell(ix.name);
        if (!name) continue;
        const a = norm(cell(ix.att));
        const status = a.startsWith('si') ? 'confirmado' : a.startsWith('no') ? 'rechazado' : 'pendiente';
        const partner = norm(cell(ix.hp)).startsWith('si');
        const pName = cell(ix.pn) !== '-' ? cell(ix.pn) : '';
        const ex = s.guests.find(g => norm(g.name) === norm(name));
        const old = ex ? members(ex) : [];
        const keep = (nm: string, role: string) => (old.find(m => norm(m.name) === norm(nm)) ?? old.find(m => m.role === role))?.table ?? '';
        const ms = [mkMember({ role: 'adulto', name, allergies: cell(ix.di), table: keep(name, 'adulto') })];
        if (partner) ms.push(mkMember({ role: 'acompañante', name: pName || 'Acompañante de ' + name.split(' ')[0], table: keep(pName, 'acompañante') }));
        const data = { status, message: cell(ix.msg), rsvpDate: cell(ix.dt), members: ms } as Partial<Guest>;
        if (ex) { Object.assign(ex, data); up++; }
        else { s.guests.push({ id: uid(), name, group: 'RSVP web', contact: '', notes: '', source: 'hoja', ...data } as Guest); nw++; }
      }
    });
    this.ui.toast(`Importación: ${nw} nuevas, ${up} actualizadas`);
  }
}
