import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { RsvpService } from '../../core/services/rsvp.service';

type FormState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [ReactiveFormsModule, ScrollAnimateDirective],
  templateUrl: './rsvp.html',
  styleUrl: './rsvp.scss'
})
export class RsvpComponent {
  formState = signal<FormState>('idle');

  form: FormGroup;

  constructor(private fb: FormBuilder, private rsvpSvc: RsvpService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      attending: ['si', Validators.required],
      guests: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      dietary: [''],
      message: ['']
    });

    // When "No" is selected, disable guests
    this.form.get('attending')!.valueChanges.subscribe(val => {
      const guestsCtrl = this.form.get('guests')!;
      if (val === 'no') {
        guestsCtrl.setValue(0);
        guestsCtrl.disable();
      } else {
        guestsCtrl.enable();
        if (guestsCtrl.value === 0) guestsCtrl.setValue(1);
      }
    });
  }

  get nameInvalid(): boolean {
    const c = this.form.get('name')!;
    return c.invalid && c.touched;
  }

  get emailInvalid(): boolean {
    const c = this.form.get('email')!;
    return c.invalid && c.touched;
  }

  get isAttending(): boolean {
    return this.form.get('attending')?.value === 'si';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formState.set('loading');

    this.rsvpSvc.submit(this.form.getRawValue()).subscribe({
      next: () => this.formState.set('success'),
      error: () => this.formState.set('error')
    });
  }

  reset(): void {
    this.form.reset({ attending: 'si', guests: 1 });
    this.formState.set('idle');
  }
}
