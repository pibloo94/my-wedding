import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { IconComponent } from '../../shared/icon.component';
import { AccessHelpComponent } from './access-help.component';

/** Pantalla de entrada: conexión, inicio de sesión con Google y alta pendiente. */
@Component({
  selector: 'adm-gate',
  imports: [IconComponent, AccessHelpComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (guide()) {
      <div class="gwide">
        <div class="gh"><h1>Cómo acceder</h1><button class="btn out sm" (click)="guide.set(false)"><adm-icon name="x" [size]="15" /> Cerrar</button></div>
        <adm-access-help />
      </div>
    } @else {
    <div class="gcard">
      <img src="assets/brand/crest.webp" alt="">
      <h1>Daniela &amp; Pablo</h1>
      <p class="kicker">Gestión de la boda</p>
      @switch (fb.state()) {
        @case ('login') {
          <p class="small muted">Entra con una cuenta de Google que tenga acceso.</p>
          <button class="btn pri" (click)="signIn()" [disabled]="busy()"><adm-icon name="shield" /> Entrar con Google</button>
        }
        @case ('noaccess') {
          <p>La cuenta <b>{{ fb.user()?.email }}</b> aún no tiene acceso.</p>
          <p class="small muted">Pásale este ID a quien administra la app para que te dé de alta:</p>
          <div class="uid">{{ fb.user()?.uid }}</div>
          <div class="acts">
            <button class="btn out sm" (click)="copyUid()">Copiar ID</button>
            <button class="btn ghost sm" (click)="fb.signOut()">Usar otra cuenta</button>
          </div>
          <p class="xs muted">Después recarga esta página.</p>
        }
        @case ('error') {
          <p>{{ fb.error() }}</p>
          <button class="btn out" (click)="reload()">Reintentar</button>
        }
        @default {
          <p class="muted loading">{{ fb.state() === 'ready' || fb.state() === 'local' ? 'Cargando los datos…' : 'Conectando…' }}</p>
        }
      }
      @if (fb.state() !== 'loading' && fb.state() !== 'ready') {
        <button class="btn ghost sm guide-btn" (click)="guide.set(true)"><adm-icon name="info" [size]="15" /> ¿Primera vez? Cómo acceder</button>
      }
    </div>
    }`,
  styles: `
    :host { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 24px 16px; background: linear-gradient(180deg, var(--bg), var(--bg-alt)); overflow: auto; }
    .gcard { max-width: 460px; width: 100%; text-align: center; background: var(--surface); border: 1px solid var(--line); border-radius: 22px; padding: 34px 26px; box-shadow: var(--shadow); display: flex; flex-direction: column; align-items: center; gap: 10px; }
    img { width: 84px; }
    .kicker { color: var(--primary); font-weight: 600; font-size: .8rem; letter-spacing: .08em; margin-bottom: 6px; }
    .uid { word-break: break-all; font-family: ui-monospace, Menlo, monospace; background: var(--bg-alt); border-radius: 10px; padding: 9px 12px; width: 100%; }
    .acts { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .loading { font-family: var(--serif); font-style: italic; }
    .guide-btn { margin-top: 8px; }
    .gwide { max-width: 860px; width: 100%; align-self: start; display: flex; flex-direction: column; gap: 14px; }
    .gh { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .gh h1 { font-size: 1.8rem; }`
})
export class GateComponent {
  protected fb = inject(FirebaseService);
  protected store = inject(StoreService);
  private ui = inject(UiService);
  protected busy = signal(false);
  /** Ayuda mínima para conseguir entrar (la guía completa solo después de entrar, en /guia) */
  protected guide = signal(false);

  protected async signIn(): Promise<void> {
    this.busy.set(true);
    try {
      await this.fb.signIn();
    } catch (e) {
      this.ui.toast((e as Error).message);
    }
    this.busy.set(false);
  }

  protected copyUid(): void {
    const u = this.fb.user()?.uid;
    if (!u) return;
    navigator.clipboard.writeText(u).then(() => this.ui.toast('ID copiado'), () => this.ui.toast('Selecciónalo y cópialo a mano'));
  }

  protected reload(): void {
    location.reload();
  }
}
