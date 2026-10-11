import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { FieldDef, FormValues, Option, UiService } from '../core/ui.service';
import { ModalComponent } from './modal.component';

/** Formulario genérico de alta y edición (ver core/forms.ts). */
@Component({
  selector: 'adm-form-dialog',
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (req(); as r) {
      <adm-modal [heading]="r.title" (closed)="finish(null)">
        <form id="adm-form" class="fgrid" novalidate (submit)="$event.preventDefault(); submit()">
          @for (f of r.fields; track f.k) {
            @switch (f.type) {
              @case ('check') {
                <label class="f ck" [class.full]="f.full">
                  <input type="checkbox" [checked]="!!values()[f.k]" (change)="set(f.k, $any($event.target).checked)"> <span>{{ f.l }}</span>
                </label>
              }
              @case ('ro') {
                <div class="f" [class.full]="f.full"><span>{{ f.l }}</span><div class="ro">{{ values()[f.k] || '—' }}</div></div>
              }
              @default {
                <label class="f" [class.full]="f.full">{{ f.l }}{{ f.r ? ' *' : '' }}
                  @if (f.type === 'select') {
                    <select [value]="str(f.k)" (change)="set(f.k, $any($event.target).value)">
                      @for (o of opts(f); track o[0]) { <option [value]="o[0]" [selected]="o[0] === str(f.k)">{{ o[1] }}</option> }
                    </select>
                  } @else if (f.type === 'textarea') {
                    <textarea [value]="str(f.k)" (input)="set(f.k, $any($event.target).value)"></textarea>
                  } @else {
                    <input [type]="f.type || 'text'" [value]="str(f.k)" (input)="set(f.k, $any($event.target).value)"
                      [attr.list]="f.list ? 'dl-' + f.k : null" [attr.min]="f.min ?? null" [attr.max]="f.max ?? null"
                      [attr.inputmode]="f.type === 'number' ? 'decimal' : null" [attr.step]="f.type === 'number' ? 'any' : null"
                      [attr.placeholder]="f.placeholder || null" [attr.aria-invalid]="missing() === f.k">
                    @if (f.list) {
                      <datalist [id]="'dl-' + f.k">@for (x of f.list(); track x) { <option [value]="x"></option> }</datalist>
                    }
                  }
                  @if (missing() === f.k) { <span class="hint err">Este campo es obligatorio.</span> }
                  @else if (f.h) { <span class="hint">{{ f.h }}</span> }
                </label>
              }
            }
          }
        </form>
        <ng-container footer>
          <button type="button" class="btn out" (click)="finish(null)">Cancelar</button>
          <button type="submit" form="adm-form" class="btn pri">{{ r.submitLabel }}</button>
        </ng-container>
      </adm-modal>
    }`,
  styles: `.err { color: var(--bad-fg); } input[aria-invalid=true] { border-color: var(--bad-fg); }`
})
export class FormDialogComponent {
  private ui = inject(UiService);
  protected req = this.ui.formReq;
  protected values = signal<FormValues>({});
  protected missing = signal('');

  constructor() {
    // Copia de los valores cada vez que se abre un formulario nuevo
    effect(() => {
      const r = this.req();
      untracked(() => {
        this.values.set(r ? { ...r.values } : {});
        this.missing.set('');
      });
    });
  }

  protected str(k: string): string {
    const v = this.values()[k];
    return v === undefined || v === null ? '' : String(v);
  }

  protected opts(f: FieldDef): [string, string][] {
    const o = (typeof f.o === 'function' ? f.o() : f.o) ?? [];
    return o.map((x: Option) => (Array.isArray(x) ? x : [x, x]));
  }

  protected set(k: string, v: unknown): void {
    this.values.update(o => ({ ...o, [k]: v }));
    if (this.missing() === k) this.missing.set('');
  }

  protected submit(): void {
    const r = this.req();
    if (!r) return;
    const out: FormValues = {};
    for (const f of r.fields) {
      if (f.type === 'ro') continue;
      const v = this.values()[f.k];
      if (f.type === 'check') { out[f.k] = !!v; continue; }
      const s = v === undefined || v === null ? '' : String(v).trim();
      if (f.r && !s) {
        this.missing.set(f.k);
        (document.querySelector(`#adm-form [aria-invalid=true]`) as HTMLElement | null)?.focus();
        return;
      }
      out[f.k] = f.type === 'number' ? (s === '' ? 0 : parseFloat(s.replace(',', '.')) || 0) : s;
    }
    this.finish(out);
  }

  protected finish(v: FormValues | null): void {
    const r = this.req();
    if (!r) return;
    this.ui.formReq.set(null);
    r.resolve(v);
  }
}
