import { Injectable, signal } from '@angular/core';

export type Option = string | [string, string];

/** Campo de un formulario genérico (alta y edición de elementos de las listas). */
export interface FieldDef {
  k: string;
  l: string;
  type?: 'text' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'check' | 'ro' | 'url' | 'email';
  /** Obligatorio */
  r?: boolean;
  /** Ocupa toda la fila */
  full?: boolean;
  /** Ayuda bajo el campo */
  h?: string;
  o?: Option[] | (() => Option[]);
  /** Sugerencias (datalist) */
  list?: () => string[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export type FormValues = Record<string, unknown>;

export interface FormRequest {
  title: string;
  fields: FieldDef[];
  values: FormValues;
  submitLabel: string;
  resolve: (v: FormValues | null) => void;
}

export interface ConfirmRequest {
  title: string;
  message: string;
  okLabel: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
}

/** Diálogos propios de cada pantalla (se pintan en el shell). */
export type DialogRequest =
  | { kind: 'guest'; id: string | null }
  | { kind: 'table'; id: string }
  | { kind: 'pickTable'; guestId: string }
  | { kind: 'payments'; id: string }
  | { kind: 'more' };

/** Avisos, confirmaciones y diálogos de toda la app. */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly toastText = signal('');
  readonly confirmReq = signal<ConfirmRequest | null>(null);
  readonly formReq = signal<FormRequest | null>(null);
  readonly dialog = signal<DialogRequest | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  toast(text: string): void {
    this.toastText.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastText.set(''), 3400);
  }

  confirm(message: string, okLabel: string, opts: { title?: string; danger?: boolean } = {}): Promise<boolean> {
    return new Promise(resolve => {
      this.confirmReq()?.resolve(false);
      this.confirmReq.set({ title: opts.title ?? '¿Seguro?', message, okLabel, danger: !!opts.danger, resolve });
    });
  }

  form(title: string, fields: FieldDef[], values: FormValues, submitLabel = 'Guardar'): Promise<FormValues | null> {
    return new Promise(resolve => {
      this.formReq()?.resolve(null);
      this.formReq.set({ title, fields, values, submitLabel, resolve });
    });
  }

  open(d: DialogRequest): void {
    this.dialog.set(d);
  }

  closeDialog(): void {
    this.dialog.set(null);
  }
}
