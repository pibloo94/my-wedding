import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { NAV, TABBAR } from './app.routes';
import { FirebaseService } from './core/firebase.service';
import { StoreService } from './core/store.service';
import { RsvpSyncService } from './core/rsvp-sync.service';
import { ContentEditorService } from './core/content-editor.service';
import { UiService } from './core/ui.service';
import { dueOf } from './core/domain';
import { fmtDate, safeUrl, today } from './core/util';
import { IconComponent } from './shared/icon.component';
import { FormDialogComponent } from './shared/form-dialog.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { GateComponent } from './features/gate/gate.component';
import { DialogHostComponent } from './features/dialog-host.component';

@Component({
  selector: 'adm-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, FormDialogComponent, ConfirmDialogComponent, GateComponent, DialogHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected fb = inject(FirebaseService);
  protected store = inject(StoreService);
  protected ui = inject(UiService);
  private content = inject(ContentEditorService);
  private router = inject(Router);

  protected nav = NAV;
  protected tabbar = NAV.filter(n => TABBAR.includes(n.path));
  protected config = this.store.config;
  protected publicUrl = computed(() => safeUrl(this.config().publicUrl));
  protected dateText = computed(() => fmtDate(this.store.wedding(), { day: 'numeric', month: 'short', year: 'numeric' }));
  protected open = computed(() => {
    const st = this.fb.state();
    return (st === 'ready' || st === 'local') && this.store.ready();
  });

  private url = toSignal(this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(e => (e as NavigationEnd).urlAfterRedirects)), { initialValue: '' });
  protected section = computed(() => this.url().replace(/^\//, '').split(/[/?#]/)[0] || 'inicio');
  protected sectionLabel = computed(() => NAV.find(n => n.path === this.section())?.label ?? '');
  protected inTabbar = computed(() => TABBAR.includes(this.section()));

  protected counts = computed<Record<string, number>>(() => {
    const s = this.store.state();
    const w = this.store.wedding();
    return {
      invitados: s.guests.length,
      tareas: s.tasks.filter(t => !t.done && dueOf(t, w) < today()).length
    };
  });

  constructor() {
    // Para que las respuestas de la web se unan a Invitados desde el arranque
    inject(RsvpSyncService);
    effect(() => {
      const st = this.fb.state();
      if (st === 'ready' || st === 'local') this.store.start();
      if (st === 'ready') this.content.start();
    });
  }

  protected signOut(): void {
    void this.fb.signOut();
  }
}
