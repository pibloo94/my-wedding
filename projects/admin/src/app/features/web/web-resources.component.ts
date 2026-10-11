import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { safeUrl } from '../../core/util';
import { IconComponent } from '../../shared/icon.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'adm-web-resources',
  imports: [IconComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar"><button class="btn out" (click)="lists.add('webResources')"><adm-icon name="plus" /> Recurso</button></div>
    @if (rows().length) {
      <div class="card">
        @for (r of rows(); track r.id) {
          <div class="list-row">
            <div class="t"><div class="tt">{{ r.title }} <span class="badge">{{ r.type }}</span></div>@if (r.note) {<div class="sb">{{ r.note }}</div>}</div>
            @if (safeUrl(r.url)) { <a class="btn ghost sm" [href]="safeUrl(r.url)" target="_blank" rel="noopener noreferrer">Abrir <adm-icon name="ext" [size]="14" /></a> }
            <button class="icb" (click)="lists.edit('webResources', r.id)" aria-label="Editar"><adm-icon name="edit" /></button>
            <button class="icb d" (click)="lists.remove('webResources', r.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
          </div>
        }
      </div>
    } @else { <adm-empty text="Sin recursos." /> }`
})
export class WebResourcesComponent {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected rows = computed(() => this.store.state().webResources);
  protected readonly safeUrl = safeUrl;
}
