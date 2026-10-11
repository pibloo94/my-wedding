import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UiService } from '../core/ui.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'adm-confirm-dialog',
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ui.confirmReq(); as c) {
      <adm-modal [heading]="c.title" (closed)="done(false)">
        <p class="msg">{{ c.message }}</p>
        <ng-container footer>
          <button type="button" class="btn out" (click)="done(false)">Cancelar</button>
          <button type="button" class="btn pri" (click)="done(true)">{{ c.okLabel }}</button>
        </ng-container>
      </adm-modal>
    }`,
  styles: `.msg { margin: 14px 0 4px; line-height: 1.55; }`
})
export class ConfirmDialogComponent {
  protected ui = inject(UiService);

  protected done(ok: boolean): void {
    const c = this.ui.confirmReq();
    if (!c) return;
    this.ui.confirmReq.set(null);
    c.resolve(ok);
  }
}
