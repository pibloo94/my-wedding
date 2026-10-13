import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV, TABBAR } from '../app.routes';
import { StoreService } from '../core/store.service';
import { safeUrl } from '../core/util';
import { ModalComponent } from '../shared/modal.component';
import { IconComponent } from '../shared/icon.component';

/** «Más» en la barra inferior del móvil: el resto de secciones. */
@Component({
  selector: 'adm-more-dialog',
  imports: [ModalComponent, IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-modal heading="Más secciones" (closed)="done.emit()">
      <div class="more">
        @for (n of items; track n.path) {
          <a [routerLink]="'/' + n.path" (click)="done.emit()"><span class="ic"><adm-icon [name]="n.icon" /></span>{{ n.label }}<adm-icon name="chev" class="chev" /></a>
        }
        <a routerLink="/guia" (click)="done.emit()"><span class="ic"><adm-icon name="info" /></span>Guía de configuración<adm-icon name="chev" class="chev" /></a>
        @if (publicUrl()) {
          <a [href]="publicUrl()" target="_blank" rel="noopener noreferrer"><span class="ic"><adm-icon name="ext" /></span>Abrir la web pública</a>
        }
      </div>
    </adm-modal>`,
  styles: `
    .more { display: flex; flex-direction: column; margin-top: 4px; }
    a { display: flex; align-items: center; gap: 14px; padding: 12px 2px; border-top: 1px solid var(--line); text-decoration: none; color: var(--dark); font-weight: 500; min-height: 52px; }
    a:first-child { border-top: 0; }
    .ic { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: var(--bg-alt); color: var(--primary); }
    .chev { margin-left: auto; color: var(--faint); }`
})
export class MoreDialogComponent {
  private store = inject(StoreService);
  done = output<void>();
  protected items = NAV.filter(n => !TABBAR.includes(n.path));
  protected publicUrl = computed(() => safeUrl(this.store.config().publicUrl));
}
