import { Component, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import {
  AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule,
  ValidationErrors, Validators
} from '@angular/forms';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';
import { RsvpPerson, RsvpService, RsvpSubmission } from '../../core/services/rsvp.service';
import { ContentService } from '../../core/services/content.service';

type FormState = 'idle' | 'loading' | 'success' | 'error';

/** Correo válido o teléfono con al menos 9 dígitos. */
function contactValidator(c: AbstractControl): ValidationErrors | null {
  const v = String(c.value ?? '').trim();
  if (!v) return null; // de "vacío" se encarga Validators.required
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const digits = v.replace(/\D/g, '');
  const isPhone = /^[+\d\s().-]+$/.test(v) && digits.length >= 9;
  return isEmail || isPhone ? null : { contact: true };
}

const MAX_KIDS = 8;

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [ReactiveFormsModule, ScrollAnimateDirective, IconComponent, LowerCasePipe],
  templateUrl: './rsvp.html',
  styleUrl: './rsvp.scss'
})
export class RsvpComponent {
  formState = signal<FormState>('idle');
  readonly maxKids = MAX_KIDS;

  form: FormGroup;

  constructor(private fb: FormBuilder, private rsvpSvc: RsvpService, public content: ContentService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      contact: ['', [Validators.required, Validators.maxLength(120), contactValidator]],
      attending: ['si', Validators.required],
      main: this.dietGroup(),
      hasPartner: [false],
      partner: this.fb.group({
        name: [''],
        menu: ['estandar'],
        glutenFree: [false],
        lactoseFree: [false],
        allergies: ['', Validators.maxLength(300)]
      }),
      hasKids: [false],
      kids: this.fb.array([]),
      message: ['', Validators.maxLength(1000)],
      // Honeypot anti-spam: campo oculto que solo rellenan los bots
      website: ['']
    });

    // Si no asiste, se limpian acompañante, niños y preferencias
    this.form.get('attending')!.valueChanges.subscribe(val => {
      if (val === 'no') {
        this.form.patchValue({ hasPartner: false, hasKids: false, message: '' });
        this.form.get('main')!.reset({ menu: 'estandar', glutenFree: false, lactoseFree: false, allergies: '' });
      }
    });

    // El nombre del acompañante es obligatorio solo si viene acompañado
    this.form.get('hasPartner')!.valueChanges.subscribe(val => {
      const partnerName = this.form.get('partner.name')!;
      if (val) {
        partnerName.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(120)]);
      } else {
        partnerName.clearValidators();
        this.form.get('partner')!.reset({ name: '', menu: 'estandar', glutenFree: false, lactoseFree: false, allergies: '' });
      }
      partnerName.updateValueAndValidity();
    });

    // Al marcar "vengo con niños" se abre la primera ficha; al desmarcar se vacían
    this.form.get('hasKids')!.valueChanges.subscribe(val => {
      if (val && this.kids.length === 0) this.addKid();
      if (!val) this.kids.clear();
    });
  }

  private dietGroup(): FormGroup {
    return this.fb.group({
      menu: ['estandar'],
      glutenFree: [false],
      lactoseFree: [false],
      allergies: ['', Validators.maxLength(300)]
    });
  }

  get kids(): FormArray {
    return this.form.get('kids') as FormArray;
  }

  get kidGroups(): FormGroup[] {
    return this.kids.controls as FormGroup[];
  }

  addKid(): void {
    if (this.kids.length >= MAX_KIDS) return;
    this.kids.push(this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      age: [null, [Validators.required, Validators.min(0), Validators.max(17)]],
      allergies: ['', Validators.maxLength(300)]
    }));
  }

  removeKid(i: number): void {
    this.kids.removeAt(i);
    if (this.kids.length === 0) this.form.get('hasKids')!.setValue(false);
  }

  invalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && c.touched;
  }

  kidInvalid(i: number, field: string): boolean {
    const c = this.kids.at(i)?.get(field);
    return !!c && c.invalid && c.touched;
  }

  get nameInvalid(): boolean {
    return this.invalid('name');
  }

  get isAttending(): boolean {
    return this.form.get('attending')?.value === 'si';
  }

  get hasPartner(): boolean {
    return this.form.get('hasPartner')?.value === true;
  }

  get hasKids(): boolean {
    return this.form.get('hasKids')?.value === true;
  }

  isMenu(path: string, value: string): boolean {
    return this.form.get(path)?.value === value;
  }

  /** Convierte el formulario en la respuesta que se guarda (ver docs/MODELO-DATOS.md). */
  private buildSubmission(): RsvpSubmission {
    const v = this.form.getRawValue();
    const clean = (s: unknown) => String(s ?? '').trim();
    const people: RsvpPerson[] = [];

    if (v.attending === 'si') {
      people.push({
        role: 'adulto', name: clean(v.name), menu: v.main.menu,
        glutenFree: !!v.main.glutenFree, lactoseFree: !!v.main.lactoseFree, allergies: clean(v.main.allergies)
      });
      if (v.hasPartner) {
        people.push({
          role: 'acompañante', name: clean(v.partner.name), menu: v.partner.menu,
          glutenFree: !!v.partner.glutenFree, lactoseFree: !!v.partner.lactoseFree, allergies: clean(v.partner.allergies)
        });
      }
      if (v.hasKids) {
        for (const k of v.kids as Array<{ name: string; age: number; allergies: string }>) {
          people.push({ role: 'niño', name: clean(k.name), age: Number(k.age), allergies: clean(k.allergies) });
        }
      }
    } else {
      people.push({ role: 'adulto', name: clean(v.name), allergies: '' });
    }

    return {
      name: clean(v.name),
      contact: clean(v.contact),
      attending: v.attending === 'si' ? 'si' : 'no',
      message: clean(v.message),
      people
    };
  }

  submit(): void {
    // Honeypot relleno → casi seguro un bot: se muestra éxito sin enviar nada
    if (this.form.get('website')?.value) {
      this.formState.set('success');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formState.set('loading');

    this.rsvpSvc.submit(this.buildSubmission()).subscribe({
      next: () => this.formState.set('success'),
      error: () => this.formState.set('error')
    });
  }

  reset(): void {
    this.kids.clear();
    this.form.reset({
      name: '', contact: '', attending: 'si',
      main: { menu: 'estandar', glutenFree: false, lactoseFree: false, allergies: '' },
      hasPartner: false,
      partner: { name: '', menu: 'estandar', glutenFree: false, lactoseFree: false, allergies: '' },
      hasKids: false, message: '', website: ''
    });
    this.formState.set('idle');
  }
}
