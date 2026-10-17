import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../../core/firebase.service';
import { UiService } from '../../core/ui.service';
import { IconComponent } from '../../shared/icon.component';
import { markdownToHtml } from '../../shared/markdown';
import { SetupService } from './setup.service';
import { GUEST_EMAIL, SetupStep } from './setup-steps';
import ENTORNOS from '../../../../../../docs/ENTORNOS.md';
import RULES from '../../../../../../firestore.rules';

/**
 * Guía de configuración del entorno: estado de lo que se puede comprobar desde aquí, los pasos de
 * la consola de Firebase con enlaces y valores para copiar, y el documento completo
 * (docs/ENTORNOS.md). Solo se carga después de entrar (ruta /guia, en diferido). No la importes
 * desde la pantalla de entrada: antes del login va features/gate/access-help.component.ts.
 */
@Component({
  selector: 'adm-setup-guide',
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card env" [class.dev]="isDev()">
      <div class="eh">
        <span class="badge" [class.b-warn]="!isDev()" [class.b-dev]="isDev()">{{ fb.state() === 'local' ? 'Sin Firebase' : isDev() ? 'DEV · pruebas' : 'PROD · real' }}</span>
        <h3>{{ fb.state() === 'local' ? 'Esta app no tiene configuración de Firebase' : 'Proyecto ' + setup.projectId() }}</h3>
      </div>
      <p class="small muted">
        @if (fb.state() === 'local') {
          Falta <code>firebase-config.json</code>: los datos se guardan solo en este navegador. Sigue el paso 1.
        } @else if (isDev()) {
          Estás en el entorno de pruebas (<code>npm start</code> / <code>npm run start:admin</code>). Lo que hagas aquí no llega a la web real.
        } @else {
          Estás en el entorno real: es la web y la app que ven los invitados y que usáis a diario.
        }
      </p>
      <div class="prog-row">
        <span class="prog"><i [style.width.%]="setup.progress().done / setup.progress().total * 100"></i></span>
        <b>{{ setup.progress().done }}/{{ setup.progress().total }}</b><span class="xs muted">pasos listos</span>
      </div>
      <ul class="checks">
        <li [class.ok]="auto()['config']"><adm-icon [name]="auto()['config'] ? 'check' : 'x'" [size]="15" /> Configuración de Firebase</li>
        <li [class.ok]="!!fb.user()"><adm-icon [name]="fb.user() ? 'check' : 'x'" [size]="15" /> Sesión con Google {{ fb.user()?.email ? '(' + fb.user()?.email + ')' : '' }}</li>
        <li [class.ok]="auto()['access']"><adm-icon [name]="auto()['access'] ? 'check' : 'x'" [size]="15" /> Acceso a esta app (colección <code>admins</code>)</li>
        @if (auto()['access']) {
          <li [class.ok]="auto()['content']"><adm-icon [name]="auto()['content'] ? 'check' : 'x'" [size]="15" /> Contenido de la web publicado</li>
        }
      </ul>
      @if (fb.user() && !auto()['access']) {
        <div class="uidbox">
          <span class="xs muted">Tu ID en este proyecto (para el paso «Acceso a esta app»):</span>
          <code>{{ fb.user()?.uid }}</code>
          <button class="btn out sm" (click)="copy(fb.user()!.uid, 'ID')">Copiar ID</button>
        </div>
      }
      @if (auto()['config']) {
        <div class="guest">
          <span class="small"><b>Probar la contraseña de la web</b> <span class="xs muted">(cuenta de invitados de este proyecto)</span></span>
          <div class="gt">
            <input type="password" #pw placeholder="Contraseña de invitados" aria-label="Contraseña de invitados" (keydown.enter)="testGuest(pw.value)">
            <button class="btn out sm" (click)="testGuest(pw.value)" [disabled]="testing()">Probar</button>
          </div>
          @if (guestResult(); as r) { <span class="xs" [class.okt]="r.ok" [class.bad]="!r.ok">{{ r.text }}</span> }
        </div>
      }
    </section>

    <section class="steps">
      <div class="sh">
        <h3>Pasos en Firebase</h3>
        <span class="spacer"></span>
        @if (!setup.complete()) { <button class="btn ghost sm" (click)="setup.markAll()">Ya está todo configurado</button> }
      </div>
      @for (s of setup.steps(); track s.id; let i = $index) {
        @let ok = setup.done().has(s.id);
        <details class="card step" [class.ok]="ok" [open]="!ok && i === firstPending()">
          <summary>
            <span class="n" [class.ok]="ok">@if (ok) { <adm-icon name="check" [size]="14" /> } @else { {{ i + 1 }} }</span>
            <span class="st"><b>{{ s.title }}</b><span class="xs muted">{{ s.where }}</span></span>
            @if (s.prodOnly) { <span class="badge">solo prod</span> }
          </summary>
          <ol class="todo">@for (t of s.todo; track $index) { <li>{{ t }}</li> }</ol>
          @if (s.copy?.length || s.id === 'rules') {
            <div class="copies">
              @for (c of s.copy ?? []; track c.value) {
                <button class="cp" (click)="copy(c.value, c.label)" [title]="'Copiar ' + c.value"><span class="xs muted">{{ c.label }}</span><code>{{ c.value }}</code></button>
              }
              @if (s.id === 'rules') { <button class="btn out sm" (click)="copy(rules, 'Reglas')">Copiar reglas</button> }
            </div>
          }
          <div class="sa">
            @if (s.link && setup.projectId()) { <a class="btn ghost sm" [href]="s.link(setup.projectId())" target="_blank" rel="noopener noreferrer">Abrir en la consola <adm-icon name="ext" [size]="13" /></a> }
            @if (s.id === 'content' && auto()['access']) { <a class="btn ghost sm" routerLink="/web/contenido">Ir a Contenido</a> }
            <span class="spacer"></span>
            @if (s.auto && autoFor(s)) {
              <span class="xs okt"><adm-icon name="check" [size]="13" /> Comprobado</span>
            } @else {
              <label class="ck"><input type="checkbox" [checked]="ok" (change)="setup.toggle(s.id, $any($event.target).checked)"> Hecho</label>
            }
          </div>
        </details>
      }
    </section>

    <details class="card doc">
      <summary><h3>Documento completo: entornos dev y prod</h3><span class="xs muted">docs/ENTORNOS.md</span></summary>
      <div class="md-doc" [innerHTML]="doc"></div>
    </details>`,
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; text-align: left; }
    .env .eh { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }
    .b-dev { background: #DCE9F5; color: #1F5F99; border-color: #BCD5EC; }
    .prog-row { display: flex; align-items: center; gap: 8px; margin: 12px 0 8px; }
    .prog-row .prog { flex: 1; max-width: 260px; }
    .checks { list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: .88rem; }
    .checks li { display: flex; align-items: center; gap: 6px; color: var(--muted); }
    .checks li.ok { color: var(--ok-fg); }
    .uidbox, .guest { margin-top: 12px; padding: 10px 12px; background: var(--bg-alt); border-radius: 12px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
    .uidbox code { word-break: break-all; }
    .gt { display: flex; gap: 8px; width: 100%; flex-wrap: wrap; }
    .gt input { flex: 1; min-width: 160px; }
    .okt { color: var(--ok-fg); display: inline-flex; align-items: center; gap: 4px; }
    .bad { color: var(--bad-fg); }
    .steps { display: flex; flex-direction: column; gap: 10px; }
    .sh { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .step { padding: 0; }
    .step > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
    .step > summary::-webkit-details-marker { display: none; }
    .step .n { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--bg-alt); color: var(--sage-deep); font-weight: 600; font-size: .8rem; flex: none; }
    .step .n.ok { background: var(--ok-bg); color: var(--ok-fg); }
    .step .st { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .step.ok .st b { color: var(--muted); }
    .todo { margin: 0 16px 10px 54px; font-size: .9rem; display: flex; flex-direction: column; gap: 4px; }
    .copies { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 16px 10px 54px; align-items: center; }
    .cp { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line-strong); background: #fff; border-radius: 10px; padding: 6px 10px; cursor: pointer; max-width: 100%; color: var(--muted); }
    .cp code { color: var(--dark); overflow-wrap: anywhere; }
    .cp:hover { border-color: var(--sage); }
    .sa { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 16px 12px 54px; border-top: 1px solid var(--line); }
    .ck { display: inline-flex; align-items: center; gap: 6px; font-size: .86rem; cursor: pointer; }
    .doc { padding: 0; }
    .doc > summary { list-style: none; cursor: pointer; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 14px 16px; }
    .doc > summary::-webkit-details-marker { display: none; }
    @media (max-width: 600px) {
      .todo, .copies { margin-left: 16px; }
      .sa { padding-left: 16px; }
    }`
})
export class SetupGuideComponent {
  protected fb = inject(FirebaseService);
  protected setup = inject(SetupService);
  private ui = inject(UiService);

  protected isDev = this.fb.isDev;
  protected auto = this.setup.autoOk;
  protected readonly rules = RULES;
  protected readonly doc = markdownToHtml(ENTORNOS, 'docs/');
  protected testing = signal(false);
  protected guestResult = signal<{ ok: boolean; text: string } | null>(null);
  protected firstPending = computed(() => this.setup.steps().findIndex(s => !this.setup.done().has(s.id)));

  protected autoFor(s: SetupStep): boolean { return !!s.auto && this.auto()[s.auto]; }

  protected copy(text: string, what: string): void {
    navigator.clipboard.writeText(text).then(() => this.ui.toast(`${what} copiado`), () => this.ui.toast('Selecciónalo y cópialo a mano'));
  }

  /** Comprueba la cuenta de invitados de este proyecto sin tocar la sesión de la app. */
  protected async testGuest(password: string): Promise<void> {
    const key = this.fb.config?.apiKey;
    if (!key || !password) return;
    this.testing.set(true);
    try {
      const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(key)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: GUEST_EMAIL, password, returnSecureToken: false })
      });
      const j = await r.json() as { error?: { message?: string } };
      const code = String(j.error?.message || '');
      this.guestResult.set(r.ok ? { ok: true, text: 'Correcto: la web entra con esta contraseña.' }
        : /OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED/.test(code) ? { ok: false, text: 'El acceso con correo/contraseña no está habilitado (paso «Inicio de sesión»).' }
        : /INVALID_LOGIN_CREDENTIALS|EMAIL_NOT_FOUND|INVALID_PASSWORD/.test(code) ? { ok: false, text: 'No entra: o la cuenta de invitados no existe en este proyecto o la contraseña no es esa.' }
        : code.startsWith('TOO_MANY') ? { ok: false, text: 'Demasiados intentos: espera unos minutos.' }
        : { ok: false, text: 'No se pudo comprobar (' + (code || r.status) + ').' });
    } catch {
      this.guestResult.set({ ok: false, text: 'No se pudo comprobar: revisa la conexión.' });
    }
    this.testing.set(false);
  }
}
