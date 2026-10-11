import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { Guest, GuestStatus, Member, MemberRole, MenuKind } from '../../core/models';
import { GUEST_STATUSES, members, mkMember } from '../../core/domain';
import { contactKey, uid } from '../../core/util';
import { ModalComponent } from '../../shared/modal.component';
import { IconComponent } from '../../shared/icon.component';

/** Alta y edición de una invitación con sus personas (menú y alergias de cada una). */
@Component({
  selector: 'adm-guest-dialog',
  imports: [ModalComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guest-dialog.component.html',
  styleUrl: './guest-dialog.component.scss'
})
export class GuestDialogComponent implements OnInit {
  private store = inject(StoreService);
  private ui = inject(UiService);
  guestId = input<string | null>(null);
  done = output<void>();

  protected statuses = GUEST_STATUSES;
  protected roles: [MemberRole, string][] = [['adulto', 'Adulto'], ['acompañante', 'Acompañante'], ['niño', 'Niño/a']];
  protected group = signal('');
  protected status = signal<GuestStatus>('pendiente');
  protected contact = signal('');
  protected notes = signal('');
  protected message = signal('');
  protected people = signal<Member[]>([]);
  protected groups = computed(() => [...new Set(this.store.guests().map(g => g.group).filter(Boolean))].sort());
  protected nameError = signal(false);

  ngOnInit(): void {
    const g = this.guestId() ? this.store.guests().find(x => x.id === this.guestId()) : undefined;
    this.group.set(g?.group ?? '');
    this.status.set(g?.status ?? 'pendiente');
    this.contact.set(g?.contact ?? '');
    this.notes.set(g?.notes ?? '');
    this.message.set(g?.message ?? '');
    const ms = g ? members(g) : [];
    this.people.set(ms.length ? ms.map(m => ({ ...m })) : [mkMember({ name: g?.name ?? '' })]);
  }

  protected setMember<K extends keyof Member>(i: number, k: K, v: Member[K]): void {
    this.people.update(ps => ps.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
    if (k === 'name') this.nameError.set(false);
  }

  protected setRole(i: number, role: string): void {
    this.people.update(ps => ps.map((p, j) => (j === i ? { ...p, role: role as MemberRole, menu: role === 'niño' ? '' : (p.menu || 'estandar') as MenuKind, age: role === 'niño' ? p.age : null } : p)));
  }

  protected setAge(i: number, v: string): void {
    this.setMember(i, 'age', v === '' ? null : Math.max(0, Math.min(17, parseInt(v, 10) || 0)));
  }

  protected add(role: MemberRole): void {
    this.people.update(ps => [...ps, mkMember({ role, menu: role === 'niño' ? '' : 'estandar' })]);
  }

  protected remove(i: number): void {
    if (this.people().length <= 1) {
      this.ui.toast('Una invitación necesita al menos una persona');
      return;
    }
    this.people.update(ps => ps.filter((_, j) => j !== i));
  }

  protected save(): void {
    const ms = this.people().map(m => ({ ...m, name: m.name.trim(), allergies: m.allergies.trim() })).filter(m => m.name);
    if (!ms.length) {
      this.nameError.set(true);
      this.ui.toast('Escribe al menos un nombre');
      return;
    }
    const contact = this.contact().trim();
    const data: Partial<Guest> = {
      group: this.group().trim(), status: this.status(), contact, contactKey: contactKey(contact) || null,
      notes: this.notes().trim(), members: ms, name: ms[0]!.name
    };
    const id = this.guestId();
    this.store.update(s => {
      const g = id ? s.guests.find(x => x.id === id) : undefined;
      if (g) Object.assign(g, data);
      else s.guests.push({ id: uid(), source: 'manual', message: '', ...data } as Guest);
    });
    this.ui.toast('Guardado');
    this.done.emit();
  }

  protected val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  protected checked(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }
}
