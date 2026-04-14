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

  // SHA-256 de 'PabloAndDaniela2027'
  private readonly EXPECTED_HASH = 'd99f22a517e3d0be9599b727d7bd06e4ea238216e18cf1c4f719f2671ad2fb56';

  onInput(value: string) {
    this.password.set(value);
    if (this.error()) this.error.set(false);
  }

  async submit() {
    if (this.opening()) return; // Previene envío múltiple temporalmente

    const hashHex = await this.hashPassword(this.password());

    if (hashHex === this.EXPECTED_HASH) {
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

  private async hashPassword(password: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
