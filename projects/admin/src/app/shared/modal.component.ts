import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { IconComponent } from './icon.component';

let nextId = 0;

/**
 * Diálogo modal sobre <dialog> nativo: foco atrapado, Escape para cerrar y fondo inerte.
 * Se abre al crearse; el padre lo quita del DOM al recibir (closed).
 * En móvil se muestra como hoja inferior.
 */
@Component({
  selector: 'adm-modal',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg class="modal" [class.wide]="wide()" [attr.aria-labelledby]="hid" (close)="closed.emit()">
      <div class="dh">
        <h3 [id]="hid">{{ heading() }}<ng-content select="[heading]" /></h3>
        <button type="button" class="icb" (click)="close()" aria-label="Cerrar"><adm-icon name="x" /></button>
      </div>
      <div class="db"><ng-content /></div>
      <div class="df"><ng-content select="[footer]" /></div>
    </dialog>`,
  styles: `.df:empty { display: none; }`
})
export class ModalComponent {
  heading = input('');
  wide = input(false);
  closed = output<void>();
  protected hid = `dlg-title-${++nextId}`;
  private dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    afterNextRender(() => {
      const d = this.dlg().nativeElement;
      if (!d.open) d.showModal();
    });
  }

  close(): void {
    const d = this.dlg().nativeElement;
    if (d.open) d.close();
    else this.closed.emit();
  }
}
