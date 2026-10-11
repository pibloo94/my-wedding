import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SectionConfig, WeddingEvent } from '@web/content';
import { FirebaseService } from '../../core/firebase.service';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { ContentEditorService, HistoryItem } from '../../core/content-editor.service';
import { Content, EMPTY_EVENT, SEC_EMPTY, SEC_NAME, madridIso } from '../../core/content-model';
import { fmtDate, uid } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';

type ListKey = 'events' | 'needToKnow' | 'sections';

/**
 * Editor del contenido publicado de la web: secciones, portada, programa, información práctica,
 * confirmación y lista de bodas. Todo va al borrador compartido hasta pulsar «Publicar».
 */
@Component({
  selector: 'adm-content-editor',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-editor.component.html',
  styleUrl: './content-editor.component.scss'
})
export class ContentEditorComponent {
  protected fb = inject(FirebaseService);
  protected store = inject(StoreService);
  protected ct = inject(ContentEditorService);
  private ui = inject(UiService);

  protected d = this.ct.draft;
  protected secName = SEC_NAME;
  protected iconsEv: [string, string][] = [['heart', 'Corazón'], ['glass', 'Copa'], ['utensils', 'Cubiertos'], ['party-popper', 'Fiesta'], ['clock', 'Reloj'], ['map-pin', 'Ubicación'], ['info', 'Información'], ['gift', 'Regalo']];
  protected iconsCard: [string, string][] = [['shirt', 'Ropa'], ['info', 'Información'], ['utensils', 'Cubiertos'], ['map-pin', 'Ubicación'], ['clock', 'Reloj'], ['heart', 'Corazón'], ['gift', 'Regalo']];
  protected accents: [string, string][] = [['#B15C38', 'Terracota'], ['#5E6A49', 'Salvia'], ['#CD8A52', 'Naranja'], ['#7E8C6A', 'Salvia claro']];

  protected pubText = computed(() => this.ct.published()
    ? `Versión ${this.ct.pubVersion()} · ${fmtDate(this.ct.pubAt().slice(0, 10))}`
    : 'Aún no se ha publicado nada: la web muestra sus textos de respaldo.');
  protected statusText = computed(() => {
    const n = this.ct.diff().length;
    return n ? `${n} cambio${n > 1 ? 's' : ''} sin publicar en el borrador${this.ct.saving() ? ' · guardando…' : ''}` : 'El borrador coincide con lo publicado.';
  });
  protected countDate = computed(() => String(this.d()?.hero.countdownIso ?? '').slice(0, 10));
  protected countTime = computed(() => String(this.d()?.hero.countdownIso ?? '').slice(11, 16));
  protected history = computed(() => this.ct.history().slice(0, 10));

  /** Cambia un campo del borrador a partir de su ruta («events.0.title»). */
  protected set(path: string, e: Event | string | boolean): void {
    const v = typeof e === 'string' || typeof e === 'boolean' ? e : (e.target as HTMLInputElement).type === 'checkbox'
      ? (e.target as HTMLInputElement).checked : (e.target as HTMLInputElement).value;
    this.ct.edit(d => {
      const ks = path.split('.');
      let o = d as unknown as Record<string, unknown>;
      for (const k of ks.slice(0, -1)) o = o[k] as Record<string, unknown>;
      const last = ks[ks.length - 1]!;
      o[last] = last === 'items' && typeof v === 'string' ? v.split('\n').map(t => t.trim()).filter(Boolean) : v;
    });
  }

  protected setCountdown(date: string, time: string): void {
    const v = madridIso(date, time);
    if (!v) { this.ui.toast('Fecha u hora no válidas'); return; }
    this.ct.edit(d => { d.hero.countdownIso = v; });
  }

  protected val(e: Event): string { return (e.target as HTMLInputElement).value; }

  protected add(list: ListKey): void {
    this.ct.edit(d => {
      if (list === 'events') d.events.push({ ...EMPTY_EVENT, id: 'momento-' + uid(), icon: 'clock' });
      else if (list === 'needToKnow') d.needToKnow.push({ icon: 'info', title: '', accent: '#5E6A49', items: [] });
      else d.sections.push({ ...SEC_EMPTY, items: [], id: 'sec-' + uid().replace(/[^a-z0-9]/g, '') });
    });
    if (list === 'sections') setTimeout(() => {
      const all = document.querySelectorAll<HTMLInputElement>('[data-sec-title]');
      const el = all[all.length - 1];
      el?.scrollIntoView({ block: 'center' });
      el?.focus();
    }, 30);
  }

  protected async remove(list: ListKey, i: number): Promise<void> {
    const x = (this.d()![list] as { title: string }[])[i];
    if (!await this.ui.confirm(`¿Quitar «${x?.title || 'este bloque'}» del borrador? Se puede recuperar descartando los cambios mientras no publiques.`, 'Quitar', { danger: true })) return;
    this.ct.edit(d => { (d[list] as unknown[]).splice(i, 1); });
  }

  protected move(list: ListKey, i: number, dir: -1 | 1): void {
    this.ct.edit(d => {
      const a = d[list] as unknown[];
      const j = i + dir;
      if (j < 0 || j >= a.length) return;
      [a[i], a[j]] = [a[j], a[i]];
    });
  }

  protected restore(h: HistoryItem): void { void this.ct.restore(h); }

  protected scrollToChanges(): void {
    document.getElementById('cambios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected trackSec = (_: number, s: SectionConfig) => s.id;
  protected trackEv = (_: number, e: WeddingEvent) => e.id;
  protected items(x: { items: string[] }): string { return x.items.join('\n'); }
  protected rows(x: { items: string[] }, min: number): number { return Math.max(min, x.items.length + 1); }
  protected cut(s: string): string { return s.length > 120 ? s.slice(0, 119) + '…' : s; }
  protected draft(): Content { return this.d()!; }
}
