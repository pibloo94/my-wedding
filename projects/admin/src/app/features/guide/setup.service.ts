import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { ContentEditorService } from '../../core/content-editor.service';
import { SETUP_STEPS, SetupStep } from './setup-steps';

interface Saved { done: string[]; dismissed: boolean; }

/**
 * Progreso de la configuración de este entorno (pasos de docs/ENTORNOS.md). Los pasos que no se
 * pueden comprobar desde aquí se marcan a mano; se recuerdan en este navegador, por proyecto,
 * porque la primera vez aún no hay acceso a Firestore para guardarlos allí.
 */
@Injectable({ providedIn: 'root' })
export class SetupService {
  private fb = inject(FirebaseService);
  private ct = inject(ContentEditorService);
  private key = () => 'adm-setup-' + (this.fb.config?.projectId || 'local');
  private saved = signal<Saved>(this.load());

  readonly isDev = this.fb.isDev;
  readonly projectId = () => this.fb.config?.projectId || '';

  /** Pasos que aplican a este entorno */
  readonly steps = computed<SetupStep[]>(() => SETUP_STEPS.filter(s => !(s.prodOnly && this.isDev())));

  /** Comprobaciones automáticas */
  readonly autoOk = computed<Record<string, boolean>>(() => {
    const st = this.fb.state();
    return {
      config: st !== 'local' && st !== 'loading',
      access: st === 'ready',
      content: this.ct.pubVersion() > 0 || !!this.ct.published()
    };
  });

  readonly done = computed(() => {
    const auto = this.autoOk(), d = new Set(this.saved().done);
    return new Set(this.steps().filter(s => (s.auto ? auto[s.auto] : false) || d.has(s.id)).map(s => s.id));
  });
  readonly progress = computed(() => ({ done: this.done().size, total: this.steps().length }));
  readonly complete = computed(() => this.progress().done >= this.progress().total);
  /** Aviso en Inicio: mientras falte algo y no se haya ocultado */
  readonly showBanner = computed(() => !this.complete() && !this.saved().dismissed);

  toggle(id: string, on: boolean): void {
    const d = new Set(this.saved().done);
    if (on) d.add(id); else d.delete(id);
    this.save({ ...this.saved(), done: [...d] });
  }

  dismiss(): void { this.save({ ...this.saved(), dismissed: true }); }

  /** «Ya está todo configurado»: marca los pasos manuales */
  markAll(): void { this.save({ done: this.steps().map(s => s.id), dismissed: true }); }

  /** La configuración de Firebase ya está leída al crear el servicio (app.config.ts espera a init()). */
  private load(): Saved {
    try {
      const v = JSON.parse(localStorage.getItem(this.key()) || 'null') as Saved | null;
      return { done: Array.isArray(v?.done) ? v!.done : [], dismissed: !!v?.dismissed };
    } catch {
      return { done: [], dismissed: false };
    }
  }

  private save(v: Saved): void {
    this.saved.set(v);
    try { localStorage.setItem(this.key(), JSON.stringify(v)); } catch { /* sin almacenamiento: solo en memoria */ }
  }
}
