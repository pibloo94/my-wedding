import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { Vendor } from '../../core/models';
import { colorOf, eur, safeUrl } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'adm-vendors-page',
  imports: [PageHeaderComponent, EmptyStateComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-header title="Proveedores" sub="Los contratos se enlazan; la app no guarda archivos">
      <button class="btn pri" (click)="lists.add('vendors')"><adm-icon name="plus" /> Proveedor</button>
    </adm-page-header>
    @if (vendors().length) {
      <div class="tw">
        <table>
          <thead><tr><th>Proveedor</th><th>Estado</th><th>Contrato</th><th class="num">Precio</th><th>Contacto</th><th><span class="sr-only">Acciones</span></th></tr></thead>
          <tbody>
            @for (v of vendors(); track v.id) {
              <tr>
                <td data-label="Proveedor"><div class="who"><span class="avatar" [style.background]="colorOf(v.cat)"><adm-icon name="brief" [size]="16" /></span><div><b>{{ v.name }}</b><div class="xs muted">{{ v.cat }}</div></div></div></td>
                <td data-label="Estado"><span class="badge" [class.b-ok]="v.status === 'Contratado'" [class.b-mute]="v.status === 'Descartado'" [class.b-warn]="v.status !== 'Contratado' && v.status !== 'Descartado'">{{ v.status }}</span></td>
                <td data-label="Contrato">{{ v.contract || '—' }}@if (safeUrl(v.link)) { · <a [href]="safeUrl(v.link)" target="_blank" rel="noopener noreferrer">Ver</a> }</td>
                <td class="num" data-label="Precio">{{ v.price ? eur(v.price) : '—' }}</td>
                <td data-label="Contacto">{{ contact(v) }}</td>
                <td class="acts">
                  <button class="icb" (click)="lists.edit('vendors', v.id)" aria-label="Editar"><adm-icon name="edit" /></button>
                  <button class="icb d" (click)="lists.remove('vendors', v.id)" aria-label="Borrar"><adm-icon name="trash" /></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (withNotes().length) {
        <section class="sec">
          <div class="sec-h"><h2>Notas</h2></div>
          <div class="card">
            @for (v of withNotes(); track v.id) { <div class="list-row"><div class="t"><div class="tt">{{ v.name }}</div><div class="sb">{{ v.notes }}</div></div></div> }
          </div>
        </section>
      }
    } @else {
      <adm-empty text="Aún no hay proveedores." cat="orange"><button class="btn pri" (click)="lists.add('vendors')"><adm-icon name="plus" /> Proveedor</button></adm-empty>
    }`
})
export class VendorsPage {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected vendors = computed(() => this.store.state().vendors);
  protected withNotes = computed(() => this.vendors().filter(v => v.notes));
  protected readonly colorOf = colorOf;
  protected readonly eur = eur;
  protected readonly safeUrl = safeUrl;
  protected contact(v: Vendor): string { return [v.contact, v.phone, v.email].filter(Boolean).join(' · ') || '—'; }
}
