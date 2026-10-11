import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { Config } from '../../core/models';
import { seedState } from '../../core/seed';
import { isoDate, parseDate, today } from '../../core/util';
import { downloadText, pickTextFile } from '../../core/files';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'adm-settings-page',
  imports: [PageHeaderComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-header title="Configuración" />
    @let c = store.config();
    <section class="card">
      <h3><adm-icon name="heart" /> La boda</h3>
      <div class="fgrid">
        <label class="f">Nombre 1<input [value]="c.n1" (change)="set('n1', $event)"></label>
        <label class="f">Nombre 2<input [value]="c.n2" (change)="set('n2', $event)"></label>
        <label class="f">Fecha de la boda<input type="date" [value]="c.weddingDate" (change)="set('weddingDate', $event)"><span class="hint">Mueve la cuenta atrás, las fases, los vencimientos automáticos y la semana de la boda. La fecha que ven los invitados se cambia en Web de la boda → Contenido.</span></label>
        <label class="f">Hora de la ceremonia<input type="time" [value]="c.ceremonyTime" (change)="set('ceremonyTime', $event)"></label>
        <label class="f">Lugar<input [value]="c.venue" (change)="set('venue', $event)"></label>
        <label class="f">Presupuesto máximo (€)<input type="number" min="0" step="any" inputmode="decimal" [value]="c.budget" (change)="set('budget', $event)"></label>
      </div>
    </section>
    <section class="card mt">
      <h3><adm-icon name="globe" /> Web</h3>
      <div class="fgrid">
        <label class="f">Dirección pública<input type="url" [value]="c.publicUrl" (change)="set('publicUrl', $event)"></label>
        <label class="f">Repositorio<input type="url" [value]="c.repoUrl" (change)="set('repoUrl', $event)"></label>
        <label class="f full">Carpeta local del proyecto<input [value]="c.localPath" (change)="set('localPath', $event)"><span class="hint">Solo como referencia; la app no accede a ella.</span></label>
      </div>
    </section>
    <section class="sec">
      <div class="sec-h"><h2>Copias de seguridad</h2></div>
      <div class="note sage small"><adm-icon name="shield" /><span>{{ store.cloud() ? 'Los datos se guardan en Firebase y los veis los dos en cualquier dispositivo. Si se corta la conexión, se guardan en este navegador y se suben al volver.' : 'Los datos se guardan solo en este navegador y este equipo.' }} Haz una copia de vez en cuando y guárdala en un lugar seguro: contiene datos personales.</span></div>
      <div class="bar">
        <button class="btn pri" (click)="backup()"><adm-icon name="down" /> Descargar copia</button>
        <button class="btn out" (click)="restore()"><adm-icon name="up" /> Restaurar copia</button>
        <span class="spacer"></span>
        <button class="btn ghost danger" (click)="reset()"><adm-icon name="trash" /> Borrar todo</button>
      </div>
    </section>`,
  styles: `.card h3 { display: flex; gap: 8px; align-items: center; } .card h3 adm-icon { color: var(--primary); } .mt { margin-top: 16px; }`
})
export class SettingsPage {
  protected store = inject(StoreService);
  private ui = inject(UiService);

  protected set(k: keyof Config, e: Event): void {
    const raw = (e.target as HTMLInputElement).value.trim();
    if (k === 'weddingDate' && !parseDate(raw)) { this.ui.toast('Fecha no válida'); return; }
    this.store.update(s => { (s.meta.config as unknown as Record<string, unknown>)[k] = k === 'budget' ? parseFloat(raw) || 0 : raw; });
    if (k === 'weddingDate') this.ui.toast('Fecha actualizada: cuenta atrás y vencimientos recalculados');
  }

  protected backup(): void {
    downloadText(`gestion-boda-${isoDate(today())}.json`, JSON.stringify(this.store.toPlain(), null, 2), 'application/json');
  }

  protected async restore(): Promise<void> {
    const t = await pickTextFile('.json,application/json');
    if (t === null) return;
    let o: Record<string, unknown>;
    try {
      o = JSON.parse(t.replace(/^﻿/, '')) as Record<string, unknown>;
      if (!o || typeof o !== 'object' || !(o['config'] || o['meta'])) throw new Error();
    } catch {
      this.ui.toast('El archivo no es una copia de esta app');
      return;
    }
    if (!await this.ui.confirm('Los datos actuales se sustituirán por los de la copia, también para la otra persona.', 'Restaurar copia', { danger: true })) return;
    this.store.replaceAll(this.store.fromPlain(o));
    this.ui.toast('Copia restaurada');
  }

  protected async reset(): Promise<void> {
    if (!await this.ui.confirm('Se borrarán invitados, mesas, presupuesto, proveedores y tareas, y la app volverá al estado inicial. Descarga antes una copia si la necesitas.', 'Borrar todo', { danger: true })) return;
    this.store.replaceAll(seedState());
    this.ui.toast('Datos restablecidos');
  }
}
