import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { safeUrl } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'adm-web-summary',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid g2">
      <section class="card">
        <h3><adm-icon name="globe" /> Estado</h3>
        <div class="list-row"><div class="t"><div class="tt">Dirección pública</div><div class="sb">@if (url()) {<a [href]="url()" target="_blank" rel="noopener noreferrer">{{ url() }}</a>} @else {—}</div></div></div>
        <div class="list-row"><div class="t"><div class="tt">Estado (lo marcas tú)</div></div>
          <select [value]="meta().webStatus" (change)="setStatus($any($event.target).value)" aria-label="Estado de la web">
            @for (s of statuses; track s) { <option [value]="s" [selected]="s === meta().webStatus">{{ s }}</option> }
          </select></div>
        <div class="list-row"><div class="t"><div class="tt">Publicación del código</div><div class="sb">Al hacer push a main, GitHub Actions compila y publica la web y esta app.</div></div></div>
        <input class="note-in" [value]="meta().webStatusNote" (change)="setNote($any($event.target).value)" aria-label="Nota de estado">
      </section>
      <section class="card">
        <h3><adm-icon name="info" /> Qué se hace aquí</h3>
        <p class="small">En <a routerLink="/web/contenido">Contenido</a> se cambian los textos, el orden de las secciones y los datos de la web sin tocar código; los colores, en <a routerLink="/tematica">Temática</a>. Todo queda en un borrador compartido hasta que pulsáis <b>Publicar</b>.</p>
        <p class="small">El <a routerLink="/web/registro">Registro</a> guarda cada publicación, y en el <a routerLink="/web/contenido">historial de Contenido</a> se puede recuperar cualquier versión anterior.</p>
      </section>
    </div>
    <section class="sec">
      <div class="sec-h"><h2>Cómo llega un cambio a la web</h2></div>
      <ol class="flow">
        <li><b>App de gestión</b>Editáis textos, secciones y colores en el borrador.</li>
        <li><b>Publicar</b>Copia el borrador al contenido público y guarda una versión.</li>
        <li><b>Firestore</b>Base de datos en Madrid. Las reglas solo os dejan escribir a vosotros.</li>
        <li><b>Web pública</b>Lee lo publicado al cargar; si Firebase no responde, usa sus textos de respaldo.</li>
        <li><b>Confirmaciones</b>El formulario escribe en Firestore y las respuestas aparecen en Invitados.</li>
      </ol>
      <div class="note sage small"><adm-icon name="shield" /><span>Solo el contenido publicado es legible por cualquiera. Invitados, contactos, alergias, mesas, presupuesto y notas solo los podéis leer vosotros.</span></div>
    </section>`,
  styles: `
    .card h3 { margin-bottom: 6px; display: flex; gap: 8px; align-items: center; }
    .card h3 adm-icon { color: var(--primary); }
    .card p + p { margin-top: 8px; }
    .note-in { width: 100%; margin-top: 10px; }
    .flow { list-style: none; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; counter-reset: s; }
    .flow li { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; font-size: .86rem; counter-increment: s; position: relative; }
    .flow li b { display: block; color: var(--dark); margin-bottom: 2px; }
    .flow li b::before { content: counter(s) '. '; color: var(--primary); }
    @media (max-width: 1024px) { .flow { grid-template-columns: minmax(0, 1fr); } }`
})
export class WebSummaryComponent {
  private store = inject(StoreService);
  protected meta = this.store.meta;
  protected url = computed(() => safeUrl(this.store.config().publicUrl));
  protected statuses = ['pendiente', 'en revisión', 'publicada'];
  protected setStatus(v: string): void { this.store.update(s => { s.meta.webStatus = v; }); }
  protected setNote(v: string): void { this.store.update(s => { s.meta.webStatusNote = v; }); }
}
