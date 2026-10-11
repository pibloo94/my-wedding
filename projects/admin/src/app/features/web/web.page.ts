import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { StoreService } from '../../core/store.service';
import { ContentEditorService } from '../../core/content-editor.service';
import { safeUrl } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { IconComponent } from '../../shared/icon.component';
import { WebSummaryComponent } from './web-summary.component';
import { ContentEditorComponent } from './content-editor.component';
import { WebLogComponent } from './web-log.component';
import { WebResourcesComponent } from './web-resources.component';

export const WEB_TABS = [
  { id: 'resumen', label: 'Cómo funciona' },
  { id: 'contenido', label: 'Contenido' },
  { id: 'registro', label: 'Registro' },
  { id: 'recursos', label: 'Recursos' }
];

/** Web de la boda. Cada pestaña tiene su dirección (#/web/contenido…) y se ven todas siempre. */
@Component({
  selector: 'adm-web-page',
  imports: [RouterLink, PageHeaderComponent, IconComponent, WebSummaryComponent, ContentEditorComponent, WebLogComponent, WebResourcesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-header title="Web de la boda" sub="La web es para los invitados; aquí se edita, se publica y se comprueba">
      @if (publicUrl()) { <a class="btn pri" [href]="publicUrl()" target="_blank" rel="noopener noreferrer"><adm-icon name="ext" /> Abrir web</a> }
    </adm-page-header>
    <nav class="tabs" aria-label="Apartados de la web">
      @for (t of tabs; track t.id) {
        <a [routerLink]="['/web', t.id]" [class.on]="tab() === t.id" [attr.aria-current]="tab() === t.id ? 'page' : null">
          {{ t.label }}@if (badge()[t.id]) { <span class="badge" [class.b-warn]="t.id === 'registro' || t.id === 'contenido'">{{ badge()[t.id] }}</span> }
        </a>
      }
    </nav>
    @switch (tab()) {
      @case ('contenido') { <adm-content-editor /> }
      @case ('registro') { <adm-web-log /> }
      @case ('recursos') { <adm-web-resources /> }
      @default { <adm-web-summary /> }
    }`
})
export class WebPage {
  private store = inject(StoreService);
  private ct = inject(ContentEditorService);
  protected tabs = WEB_TABS;
  protected tab = toSignal(inject(ActivatedRoute).paramMap.pipe(map(p => { const t = p.get('tab'); return WEB_TABS.some(x => x.id === t) ? t! : 'resumen'; })), { initialValue: 'resumen' });
  protected publicUrl = computed(() => safeUrl(this.store.config().publicUrl));
  protected badge = computed<Record<string, number>>(() => {
    const s = this.store.state();
    return {
      contenido: this.ct.diff().length,
      registro: s.webLog.filter(l => l.status === 'Previsto').length
    };
  });
}
