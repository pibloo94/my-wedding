import { Injectable, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { Guest } from '../../core/models';
import { members, unseated, usedSeats } from '../../core/domain';

/** Sentar y levantar personas de las mesas. */
@Injectable({ providedIn: 'root' })
export class SeatingService {
  private store = inject(StoreService);
  private ui = inject(UiService);

  /**
   * Sienta en la mesa a las personas sin mesa de una invitación (o a todas, si ya estaban
   * en otra mesa). Si no caben, pregunta antes.
   */
  async assign(g: Guest, tableId: string): Promise<void> {
    const t = this.store.tables().find(x => x.id === tableId);
    if (!t) return;
    let ms = unseated(g);
    if (!ms.length) ms = members(g).filter(m => m.table !== tableId);
    if (!ms.length) return;
    const after = usedSeats(this.store.guests(), tableId) + ms.length;
    if (after > t.cap && !await this.ui.confirm(`${t.name} tiene ${t.cap} sillas y quedaría con ${after} personas.`, 'Sentar igualmente')) return;
    const ids = new Set(ms.map(m => m.id));
    this.store.update(s => {
      const gg = s.guests.find(x => x.id === g.id);
      if (gg) for (const m of members(gg)) if (ids.has(m.id)) m.table = tableId;
    });
    this.ui.toast(`${g.name}${ms.length > 1 ? ` (${ms.length})` : ''} → ${t.name}`);
  }

  unassign(guestId: string, memberId: string): void {
    this.store.update(s => {
      const m = members(s.guests.find(x => x.id === guestId) ?? ({} as Guest)).find(x => x.id === memberId);
      if (m) m.table = '';
    });
  }
}
