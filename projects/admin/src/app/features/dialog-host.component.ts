import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UiService } from '../core/ui.service';
import { GuestDialogComponent } from './guests/guest-dialog.component';
import { TableDialogComponent } from './tables/table-dialog.component';
import { PickTableDialogComponent } from './tables/pick-table-dialog.component';
import { PaymentsDialogComponent } from './budget/payments-dialog.component';
import { MoreDialogComponent } from './more-dialog.component';

/** Pinta el diálogo abierto con UiService.open(). */
@Component({
  selector: 'adm-dialog-host',
  imports: [GuestDialogComponent, TableDialogComponent, PickTableDialogComponent, PaymentsDialogComponent, MoreDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ui.dialog(); as d) {
      @switch (d.kind) {
        @case ('guest') { <adm-guest-dialog [guestId]="$any(d).id" (done)="ui.closeDialog()" /> }
        @case ('table') { <adm-table-dialog [tableId]="$any(d).id" (done)="ui.closeDialog()" /> }
        @case ('pickTable') { <adm-pick-table-dialog [guestId]="$any(d).guestId" (done)="ui.closeDialog()" /> }
        @case ('payments') { <adm-payments-dialog [expenseId]="$any(d).id" (done)="ui.closeDialog()" /> }
        @case ('more') { <adm-more-dialog (done)="ui.closeDialog()" /> }
      }
    }`
})
export class DialogHostComponent {
  protected ui = inject(UiService);
}
