import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/services/content.service';
import { GuestAuthService } from '../../core/services/guest-auth.service';

@Component({
  selector: 'app-password-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-gate.html',
  styleUrl: './password-gate.scss'
})
export class PasswordGateComponent {
  authenticated = output<void>();
  /** La contraseña es correcta: la web empieza a cargarse mientras se abre el sobre. */
  unlocked = output<void>();
  protected content = inject(ContentService);
  private guest = inject(GuestAuthService);

  password = signal('');
  error = signal(false);
  /** Mensaje bajo el campo; se borra al volver a escribir */
  errorMsg = signal('');
  checking = signal(false);
  opening = signal(false);
  hiding = signal(false);

  onInput(value: string) {
    this.password.set(value);
    if (this.error()) this.error.set(false);
    this.errorMsg.set('');
  }

  /** La contraseña se comprueba en Firebase (cuenta de invitados); no está en el código. */
  async submit() {
    if (this.opening() || this.checking() || !this.password()) return;
    this.checking.set(true);
    const r = await this.guest.signIn(this.password());
    this.checking.set(false);

    if (r === 'ok') {
      this.error.set(false);
      this.errorMsg.set('');
      this.opening.set(true);
      this.unlocked.emit();

      // Let the card slowly draw out and be read (~3.8s), then fade the gate (0.8s)
      setTimeout(() => {
        this.hiding.set(true);
        setTimeout(() => {
          this.authenticated.emit();
        }, 800);
      }, 3800);
    } else {
      this.errorMsg.set(r === 'wrong' ? 'Contraseña incorrecta. Inténtalo de nuevo.'
        : r === 'blocked' ? 'Demasiados intentos. Espera unos minutos y vuelve a probar.'
        : 'No se ha podido comprobar la contraseña. Revisa la conexión e inténtalo de nuevo.');
      this.error.set(true);
      // Shake
      setTimeout(() => this.error.set(false), 2000);
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.submit();
  }

}
