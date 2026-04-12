import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-gate.html',
  styleUrl: './password-gate.scss'
})
export class PasswordGateComponent {
  authenticated = output<void>();

  password = signal('');
  error = signal(false);
  opening = signal(false);
  hiding = signal(false);

  private readonly CORRECT = 'PabloAndDaniela2027';

  onInput(value: string) {
    this.password.set(value);
    if (this.error()) this.error.set(false);
  }

  submit() {
    if (this.password() === this.CORRECT) {
      this.error.set(false);
      this.opening.set(true);

      // After envelope opens (1.2s), fade out the gate (0.8s)
      setTimeout(() => {
        this.hiding.set(true);
        setTimeout(() => {
          this.authenticated.emit();
        }, 800);
      }, 1400);
    } else {
      this.error.set(true);
      // Shake and clear
      setTimeout(() => this.error.set(false), 2000);
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.submit();
  }
}
