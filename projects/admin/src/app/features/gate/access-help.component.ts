import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { UiService } from '../../core/ui.service';
import { IconComponent } from '../../shared/icon.component';
import { markdownToHtml } from '../../shared/markdown';
import ACCESO from '../../../../../../docs/ACCESO.md';

/**
 * Ayuda de la pantalla de entrada: lo mínimo para conseguir entrar, sin datos concretos del proyecto.
 * La guía completa (pasos con valores, reglas, comprobar la contraseña de la web y docs/ENTORNOS.md)
 * solo se carga después de entrar, en la ruta /guia. No importes aquí nada de features/guide:
 * scripts/check-bundle.mjs falla si algo de eso llega a lo que se descarga antes del login.
 */
@Component({
  selector: 'adm-access-help',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h3>Para poder entrar</h3>
      <ul class="checks">
        <li [class.ok]="hasConfig()"><adm-icon [name]="hasConfig() ? 'check' : 'x'" [size]="15" /> Configuración de Firebase de este entorno</li>
        <li [class.ok]="!!fb.user()"><adm-icon [name]="fb.user() ? 'check' : 'x'" [size]="15" /> Sesión con Google</li>
        <li [class.ok]="fb.state() === 'ready'"><adm-icon [name]="fb.state() === 'ready' ? 'check' : 'x'" [size]="15" /> Alta en la lista de cuentas con acceso</li>
      </ul>
      @if (fb.state() === 'noaccess' && fb.user()) {
        <div class="uidbox">
          <span class="xs muted">Tu ID en este entorno, para que te den de alta:</span>
          <code>{{ fb.user()?.uid }}</code>
          <button class="btn out sm" (click)="copyUid()">Copiar ID</button>
        </div>
      }
    </section>

    <section class="card doc">
      <div class="md-doc" [innerHTML]="doc"></div>
    </section>

    <section class="card locked">
      <adm-icon name="shield" [size]="18" />
      <div>
        <b>Disponible después de entrar</b>
        <p class="small muted">Pasos completos en Firebase con enlaces y valores para copiar, reglas de seguridad, comprobar la contraseña de la web y el documento de entornos.</p>
      </div>
    </section>`,
  styles: `
    :host { display: flex; flex-direction: column; gap: 14px; text-align: left; }
    .card h3 { margin-bottom: 8px; }
    .checks { list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: .88rem; }
    .checks li { display: flex; align-items: center; gap: 6px; color: var(--muted); }
    .checks li.ok { color: var(--ok-fg); }
    .uidbox { margin-top: 12px; padding: 10px 12px; background: var(--bg-alt); border-radius: 12px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
    .uidbox code { word-break: break-all; }
    .locked { display: flex; gap: 12px; align-items: flex-start; background: var(--bg-alt); }
    .locked adm-icon { color: var(--sage-deep); flex: none; margin-top: 2px; }
    .locked p { margin-top: 2px; }`
})
export class AccessHelpComponent {
  protected fb = inject(FirebaseService);
  private ui = inject(UiService);
  protected readonly doc = markdownToHtml(ACCESO, 'docs/');
  protected hasConfig = computed(() => { const s = this.fb.state(); return s !== 'local' && s !== 'loading'; });

  protected copyUid(): void {
    const u = this.fb.user()?.uid;
    if (!u) return;
    navigator.clipboard.writeText(u).then(() => this.ui.toast('ID copiado'), () => this.ui.toast('Selecciónalo y cópialo a mano'));
  }
}
