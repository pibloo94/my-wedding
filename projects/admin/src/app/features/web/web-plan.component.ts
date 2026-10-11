import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { PLAN_STATUSES } from '../../core/forms';
import { IconComponent } from '../../shared/icon.component';

const NAMES: Record<string, [string, string]> = {
  '0': ['Ajustes rápidos en la web', 'Cambios pequeños e independientes en el repositorio.'],
  '1': ['Proyecto de Firebase', 'Lo creas tú con tu cuenta de Google; la guía está en FIREBASE-SETUP.md.'],
  '2': ['App de gestión en Firebase', 'Login con Google y datos compartidos entre los dos.'],
  '3': ['Confirmaciones en Firebase', 'El formulario escribe en Firestore y las respuestas llegan solas a Invitados.'],
  '4': ['Contenido de la web en Firestore', 'Editar, publicar y volver atrás desde esta app.']
};

@Component({
  selector: 'adm-web-plan',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="note sage small"><adm-icon name="info" /><span>Los cambios en el repositorio quedan en tu carpeta hasta que hagas push. Cambia el estado de cada paso a medida que avancéis.</span></div>
    @for (ph of phases(); track ph.id) {
      <section class="pstep" [class.done]="ph.done">
        <div class="num" aria-hidden="true">{{ ph.done ? '✓' : ph.id }}</div>
        <div class="body">
          <h3>{{ ph.name }}</h3><p class="small muted">{{ ph.desc }}</p>
          <div class="card list">
            @for (p of ph.steps; track p.id) {
              <div class="pi">
                <div class="t">
                  <div class="tt" [class.strike]="p.status === 'Hecho' || p.status === 'Descartado'">{{ p.title }}</div>
                  @if (p.detail) { <div class="small muted">{{ p.detail }}</div> }
                  <div class="meta"><span class="badge">{{ p.where }}</span>@if (p.file) { <code>{{ p.file }}</code> }</div>
                </div>
                <div class="ops">
                  <select [value]="p.status" (change)="setStatus(p.id, $any($event.target).value)" aria-label="Estado">
                    @for (s of statuses; track s) { <option [value]="s" [selected]="s === p.status">{{ s }}</option> }
                  </select>
                  <button class="icb" (click)="lists.edit('webPlan', p.id)" aria-label="Editar"><adm-icon name="edit" /></button>
                </div>
              </div>
            } @empty { <p class="muted small">Sin pasos.</p> }
          </div>
        </div>
      </section>
    }
    <button class="btn out addb" (click)="lists.add('webPlan')"><adm-icon name="plus" /> Añadir paso</button>`,
  styles: `
    .pstep { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 14px; margin-top: 16px; }
    .num { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--sage-deep); color: #fff; font-family: var(--serif); font-size: 1.25rem; }
    .done .num { background: var(--sage-light); color: var(--sage-deep); }
    .list { margin-top: 10px; padding: 4px 18px; }
    .pi { display: flex; gap: 12px; align-items: flex-start; padding: 11px 0; border-top: 1px solid var(--line); }
    .pi:first-child { border-top: 0; }
    .t { flex: 1; min-width: 0; }
    .tt { font-weight: 500; color: var(--dark); }
    .strike { text-decoration: line-through; color: var(--faint); }
    .meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; align-items: center; }
    code { font-size: .75rem; background: var(--bg-alt); padding: 1px 6px; border-radius: 6px; color: var(--sage-deep); word-break: break-all; }
    .ops { display: flex; gap: 2px; align-items: center; }
    .ops select { min-height: 36px; padding: 4px 8px; font-size: .82rem; }
    .addb { margin-top: 16px; }
    @media (max-width: 760px) {
      .pstep { grid-template-columns: minmax(0, 1fr); }
      .num { width: 34px; height: 34px; font-size: 1rem; }
      .list { padding: 4px 12px; }
      .pi { flex-direction: column; }
      .ops { width: 100%; }
      .ops select { flex: 1; }
    }`
})
export class WebPlanComponent {
  private store = inject(StoreService);
  protected lists = inject(ListsService);
  protected statuses = PLAN_STATUSES;
  protected phases = computed(() => ['0', '1', '2', '3', '4'].map(id => {
    const steps = this.store.state().webPlan.filter(p => p.phase === id);
    return { id, name: NAMES[id]![0], desc: NAMES[id]![1], steps, done: steps.length > 0 && steps.every(p => p.status === 'Hecho' || p.status === 'Descartado') };
  }).filter(p => p.steps.length));
  protected setStatus(id: string, v: string): void {
    this.store.update(s => { const p = s.webPlan.find(x => x.id === id); if (p) p.status = v; });
  }
}
