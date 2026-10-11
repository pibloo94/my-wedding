import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { fmtDate, isoDate, today } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'adm-web-checks',
  imports: [IconComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card head">
      <span class="ring" [style.--p]="pct()" [attr.data-v]="ok() + '/' + checks().length"></span>
      <div class="t"><b>Comprobación de la información importante</b><div class="small muted">Marca cada punto tras verificarlo en la web publicada. Se guarda la fecha.</div></div>
      <button class="btn out" (click)="lists.add('webChecks')"><adm-icon name="plus" /> Comprobación</button>
    </div>
    <div class="card pad0 checks">
      @for (x of checks(); track x.id) {
        <div class="ck" [class.done]="x.ok">
          <input type="checkbox" [checked]="x.ok" (change)="toggle(x.id, $any($event.target).checked)" [attr.aria-label]="'Comprobado: ' + x.text">
          <div class="tt">{{ x.text }}</div>
          <div class="xs muted when">{{ x.last ? 'Comprobado ' + fmtDate(x.last) : '' }}</div>
          <div class="ops">
            <button class="icb" (click)="lists.edit('webChecks', x.id)" aria-label="Editar"><adm-icon name="edit" /></button>
            <button class="icb d" (click)="lists.remove('webChecks', x.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
          </div>
        </div>
      }
    </div>
    <section class="sec">
      <div class="sec-h"><h2>Información para invitados</h2><button class="btn out" (click)="lists.add('webInfo')"><adm-icon name="plus" /> Añadir</button></div>
      @if (info().length) {
        <div class="card">
          @for (i of info(); track i.id) {
            <div class="list-row">
              <div class="t"><div class="tt">{{ i.text }}</div>@if (i.note) {<div class="sb">{{ i.note }}</div>}</div>
              <span class="badge" [class.b-ok]="i.status === 'En la web'" [class.b-warn]="i.status !== 'En la web'">{{ i.status }}</span>
              <button class="icb" (click)="lists.edit('webInfo', i.id)" aria-label="Editar"><adm-icon name="edit" /></button>
              <button class="icb d" (click)="lists.remove('webInfo', i.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
            </div>
          }
        </div>
      } @else { <adm-empty text="Ideas de información que aún no está en la web: alojamiento, transporte…" /> }
    </section>
    <section class="sec">
      <div class="sec-h"><h2>Textos a revisar</h2><button class="btn out" (click)="lists.add('webTexts')"><adm-icon name="plus" /> Añadir</button></div>
      @if (texts().length) {
        <div class="card">
          @for (t of texts(); track t.id) {
            <div class="list-row">
              <div class="t"><div class="tt">{{ t.text }}</div>@if (t.section) {<div class="sb">{{ t.section }}</div>}</div>
              <span class="badge" [class.b-ok]="t.status === 'Revisado'" [class.b-mute]="t.status === 'Descartado'" [class.b-warn]="t.status === 'Pendiente'">{{ t.status }}</span>
              <button class="icb" (click)="lists.edit('webTexts', t.id)" aria-label="Editar"><adm-icon name="edit" /></button>
              <button class="icb d" (click)="lists.remove('webTexts', t.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
            </div>
          }
        </div>
      } @else { <adm-empty text="Ningún texto pendiente de revisar." /> }
    </section>`,
  styles: `
    .head { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
    .head .t { flex: 1; min-width: 200px; }
    .head b { color: var(--dark); }
    .ring { --p: 0; width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(var(--sage) calc(var(--p) * 1%), var(--bg-alt) 0); display: grid; place-items: center; flex: none; }
    .ring::before { content: attr(data-v); width: 46px; height: 46px; border-radius: 50%; background: var(--surface); display: grid; place-items: center; font: 600 .8rem var(--sans); color: var(--sage-deep); }
    .checks { margin-top: 14px; }
    .ck { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; gap: 4px 14px; align-items: center; padding: 10px 18px; border-top: 1px solid var(--line); }
    .ck:first-child { border-top: 0; }
    .ck .tt { color: var(--dark); }
    .ck.done .tt { text-decoration: line-through; color: var(--faint); }
    .ops { display: flex; }
    @media (max-width: 760px) {
      .ck { grid-template-columns: auto minmax(0, 1fr) auto; padding: 10px 14px; }
      .when { grid-column: 2; }
      .ops { grid-column: 3; grid-row: 1; }
    }`
})
export class WebChecksComponent {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected checks = computed(() => this.store.state().webChecks);
  protected info = computed(() => this.store.state().webInfo);
  protected texts = computed(() => this.store.state().webTexts);
  protected ok = computed(() => this.checks().filter(x => x.ok).length);
  protected pct = computed(() => (this.checks().length ? this.ok() / this.checks().length * 100 : 0));
  protected readonly fmtDate = fmtDate;
  protected toggle(id: string, ok: boolean): void {
    this.store.update(s => { const c = s.webChecks.find(x => x.id === id); if (c) { c.ok = ok; c.last = ok ? isoDate(today()) : ''; } });
  }
}
