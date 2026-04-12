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
      attending: ['si', Validators.required],
      hasPartner: [false],
      partnerName: [''],
      needsBus: [false],
      dietary: [''],
      message: ['']
    });

    // Reset partner/bus if not attending
    this.form.get('attending')!.valueChanges.subscribe(val => {
      if (val === 'no') {
        this.form.patchValue({
          hasPartner: false,
          partnerName: '',
          needsBus: false
        });
      }
    });

    // Clear partnerName if hasPartner is unchecked
    this.form.get('hasPartner')!.valueChanges.subscribe(val => {
      if (!val) {
        this.form.get('partnerName')?.setValue('');
      } else {
        // Optionially add validator here if needed, but keeping it flexible as per "no obligatorio"
      }
    });
  }

  get nameInvalid(): boolean {
    const c = this.form.get('name')!;
    return c.invalid && c.touched;
  }

  get isAttending(): boolean {
    return this.form.get('attending')?.value === 'si';
  }

  get hasPartner(): boolean {
    return this.form.get('hasPartner')?.value === true;
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
    this.form.reset({ attending: 'si', hasPartner: false, needsBus: false });
    this.formState.set('idle');
  }
}
