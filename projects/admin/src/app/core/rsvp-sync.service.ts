import { Injectable, effect, inject, untracked } from '@angular/core';
import { StoreService } from './store.service';
import { FirebaseService, fs } from './firebase.service';
import { UiService } from './ui.service';
import { Guest, MemberRole, RsvpDoc } from './models';
import { members, mkMember } from './domain';
import { contactKey, hashStr, norm, uid } from './util';

/**
 * Une las respuestas del formulario de la web (colección rsvps) con las invitaciones.
 * Reglas en docs/MODELO-DATOS.md: vale la última respuesta de cada contacto, se conservan
 * mesa, grupo y notas, y lo borrado en Firestore desaparece también aquí.
 */
@Injectable({ providedIn: 'root' })
export class RsvpSyncService {
  private store = inject(StoreService);
  private fb = inject(FirebaseService);
  private ui = inject(UiService);

  constructor() {
    effect(() => {
      const list = this.store.rsvps();
      if (!this.store.ready() || !this.store.cloud()) return;
      untracked(() => this.merge(list));
    });
  }

  /** Respuestas de la web asociadas a una invitación. */
  rsvpsOf(g: Guest | undefined): RsvpDoc[] {
    if (!this.store.cloud() || !g) return [];
    return this.store.rsvps().filter(r => (g.rsvpId && r.id === g.rsvpId) || (g.contactKey && contactKey(r.contact) === g.contactKey));
  }

  async deleteRsvps(list: RsvpDoc[]): Promise<void> {
    const db = this.fb.db;
    if (!db || !list.length) return;
    const gone = new Set(list.map(r => r.id));
    this.store.rsvps.update(rs => rs.filter(r => !gone.has(r.id)));
    try {
      const b = fs.writeBatch(db);
      list.forEach(r => b.delete(fs.doc(db, 'rsvps', r.id)));
      await b.commit();
    } catch (e) {
      console.error(e);
      this.ui.toast(`No se pudo borrar la respuesta en Firebase (${(e as { code?: string }).code ?? (e as Error).message})`);
    }
  }

  private merge(rsvps: RsvpDoc[]): void {
    const latest = new Map<string, RsvpDoc>();
    const ids = new Set(rsvps.map(r => r.id));
    for (const r of rsvps) {
      const k = contactKey(r.contact) || 'n:' + norm(r.name);
      const cur = latest.get(k);
      if (!cur || String(r.submittedAt) > String(cur.submittedAt)) latest.set(k, r);
    }

    const guests = this.store.guests();
    const changes: { gid: string; existing: boolean; upd: Partial<Guest> }[] = [];
    latest.forEach((r, k) => {
      const gid = 'w_' + hashStr(k);
      const g = guests.find(x => x.id === gid) ?? guests.find(x => x.contactKey === k) ?? guests.find(x => !x.contactKey && norm(x.name) === norm(r.name));
      if (g && (g.rsvpId === r.id || (g.rsvpAt && g.rsvpId && ids.has(g.rsvpId) && String(g.rsvpAt) >= String(r.submittedAt)))) return;
      const old = g ? members(g) : [];
      const ppl = (Array.isArray(r.people) && r.people.length ? r.people : [{ role: 'adulto', name: r.name }]).slice(0, 10);
      const ms = ppl.map((p, i) => {
        const prev = old.find(m => norm(m.name) === norm(p.name)) ?? (i === 0 ? old[0] : undefined);
        const role: MemberRole = (['adulto', 'acompañante', 'niño'] as const).find(x => x === p.role) ?? 'adulto';
        return mkMember({
          id: prev?.id ?? uid(), table: prev?.table ?? '', role, name: String(p.name || '').slice(0, 120),
          age: role === 'niño' && p.age != null ? Number(p.age) : null,
          menu: role === 'niño' ? '' : p.menu === 'vegetariano' ? 'vegetariano' : 'estandar',
          gf: !!p.glutenFree, lf: !!p.lactoseFree, allergies: String(p.allergies || '').slice(0, 300)
        });
      });
      changes.push({
        gid: g?.id ?? gid, existing: !!g,
        upd: {
          name: String(r.name || '').slice(0, 120), contact: String(r.contact || '').slice(0, 120), contactKey: k,
          status: r.attending === 'si' ? 'confirmado' : 'rechazado', message: String(r.message || '').slice(0, 1000),
          rsvpAt: String(r.submittedAt || ''), rsvpId: r.id, source: 'web', members: ms
        }
      });
    });

    // Respuestas borradas en Firestore
    const orphan = (g: Guest) => g.source === 'web' && !!g.rsvpId && !ids.has(g.rsvpId) && !latest.has(g.contactKey ?? '');
    const removed = guests.filter(orphan).length;
    if (!changes.length && !removed) return;

    this.store.update(s => {
      for (const c of changes) {
        const g = s.guests.find(x => x.id === c.gid);
        if (g) {
          if (!g.origin) g.origin = g.source === 'web' ? 'web' : (g.source || 'manual');
          Object.assign(g, c.upd);
        } else {
          s.guests.push({ id: c.gid, group: '', notes: '', origin: 'web', ...c.upd } as Guest);
        }
      }
      s.guests = s.guests.filter(g => {
        if (!orphan(g)) return true;
        // Si existía antes a mano, se conserva desvinculada; si vino solo de la web, desaparece
        if (g.origin && g.origin !== 'web') {
          g.source = g.origin;
          g.status = 'pendiente';
          delete g.rsvpId;
          delete g.rsvpAt;
          return true;
        }
        return false;
      });
    });
    if (changes.length) this.ui.toast(changes.length === 1 ? '1 respuesta nueva de la web' : `${changes.length} respuestas nuevas de la web`);
    else this.ui.toast(removed === 1 ? '1 respuesta borrada en Firebase' : `${removed} respuestas borradas en Firebase`);
  }
}
