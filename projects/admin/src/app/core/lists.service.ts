import { Injectable, inject } from '@angular/core';
import { StoreService } from './store.service';
import { UiService } from './ui.service';
import { RsvpSyncService } from './rsvp-sync.service';
import { CollKey } from './models';
import { FORMS, FormContext } from './forms';
import { members } from './domain';
import { isoDate, today, uid } from './util';

type Item = { id: string } & Record<string, unknown>;

/** Alta, edición y borrado de elementos de cualquier lista con su formulario. */
@Injectable({ providedIn: 'root' })
export class ListsService {
  private store = inject(StoreService);
  private ui = inject(UiService);
  private rsvp = inject(RsvpSyncService);

  private ctx(): FormContext {
    const s = this.store.state();
    return {
      vendors: s.vendors.map(v => v.name),
      people: [this.store.config().n1, this.store.config().n2, 'Ambos'],
      wedding: this.store.wedding()
    };
  }

  async add(k: CollKey, preset: Record<string, unknown> = {}): Promise<void> {
    if (k === 'guests') {
      this.ui.open({ kind: 'guest', id: null });
      return;
    }
    const f = FORMS[k];
    if (!f) return;
    const ctx = this.ctx();
    const base = { ...f.def(), ...(k === 'webLog' ? { date: isoDate(today()) } : {}) };
    const def = { ...(f.toForm ? f.toForm(base, ctx) : base), ...preset };
    const v = await this.ui.form('Añadir ' + f.t, f.fields(ctx), def, 'Añadir');
    if (!v) return;
    const saved = f.fromForm ? f.fromForm({ ...def, ...v }, ctx) : { ...def, ...v };
    this.store.update(s => (s[k] as unknown as Item[]).push({ ...base, ...saved, id: uid() }));
    this.ui.toast('Guardado');
  }

  async edit(k: CollKey, id: string): Promise<void> {
    if (k === 'guests') {
      this.ui.open({ kind: 'guest', id });
      return;
    }
    const f = FORMS[k];
    const it = (this.store.list(k) as unknown as Item[]).find(x => x.id === id);
    if (!f || !it) return;
    const ctx = this.ctx();
    const v = await this.ui.form('Editar ' + f.t, f.fields(ctx), f.toForm ? f.toForm(it, ctx) : it);
    if (!v) return;
    const saved = f.fromForm ? f.fromForm(v, ctx) : v;
    this.store.update(s => {
      const x = (s[k] as unknown as Item[]).find(y => y.id === id);
      if (x) Object.assign(x, saved);
    });
    this.ui.toast('Guardado');
  }

  async remove(k: CollKey, id: string): Promise<boolean> {
    const it = (this.store.list(k) as unknown as Item[]).find(x => x.id === id);
    if (!it) return false;
    const name = String(it['name'] || it['title'] || it['concept'] || it['text'] || 'este elemento').slice(0, 60);
    const linked = k === 'guests' ? this.rsvp.rsvpsOf(this.store.guests().find(g => g.id === id)) : [];
    const extra = linked.length ? ` También se borrará${linked.length > 1 ? `n sus ${linked.length} respuestas` : ' su respuesta'} del formulario en Firebase.` : '';
    const tableExtra = k === 'tables' ? ' Las personas sentadas en ella volverán a «Sin mesa».' : '';
    if (!await this.ui.confirm(`¿Borrar «${name}»? No se puede deshacer.${extra}${tableExtra}`, 'Borrar', { danger: true })) return false;
    if (linked.length) void this.rsvp.deleteRsvps(linked);
    this.store.update(s => {
      (s as unknown as Record<string, Item[]>)[k] = (s[k] as unknown as Item[]).filter(x => x.id !== id);
      if (k === 'tables') for (const g of s.guests) for (const m of members(g)) if (m.table === id) m.table = '';
    });
    this.ui.toast('Borrado');
    return true;
  }
}
