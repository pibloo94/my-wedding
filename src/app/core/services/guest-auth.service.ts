import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FirebaseConfigService, FirebaseWebConfig } from './firebase-config.service';

/**
 * Cuenta de invitados en Firebase Authentication (correo y contraseña). La contraseña de la web
 * es la de esta cuenta: se comprueba en Firebase, no en el código. Debe coincidir con
 * firestore.rules (isGuest) y crearse a mano en la consola (ver FIREBASE-SETUP.md).
 */
export const GUEST_EMAIL = 'invitados@boda-daniela-pablo.firebaseapp.com';

/** Sesión guardada en el navegador: el token de renovación y cuándo deja de valer. */
const LS_KEY = 'wedding_guest_v2';
const LS_OLD = 'wedding_auth_v1_exp';
/** Se vuelve a pedir la contraseña pasados 30 días */
const SESSION_DAYS = 30;

export type SignInResult = 'ok' | 'wrong' | 'blocked' | 'error';

interface Stored { refresh: string; exp: number; }

/**
 * Acceso de los invitados. Inicia sesión con la API REST de Firebase Authentication (sin SDK) y
 * da a los demás servicios un token válido para leer el contenido y enviar el formulario.
 */
@Injectable({ providedIn: 'root' })
export class GuestAuthService {
  private cfgSvc = inject(FirebaseConfigService);
  private browser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Hay una sesión de invitado (recién iniciada o guardada de otra visita). */
  readonly signedIn = signal(false);

  private refresh = '';
  private idToken = '';
  private idExp = 0;
  private pending?: Promise<string | null>;

  constructor() {
    if (!this.browser) return;
    localStorage.removeItem(LS_OLD);
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || 'null') as Stored | null;
      if (s?.refresh && Date.now() < s.exp) {
        this.refresh = s.refresh;
        this.signedIn.set(true);
      } else if (s) {
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }

  async signIn(password: string): Promise<SignInResult> {
    const cfg = await this.config();
    if (!cfg) return 'error';
    try {
      const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(cfg.apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: GUEST_EMAIL, password, returnSecureToken: true })
      });
      const j = await r.json() as { idToken?: string; refreshToken?: string; expiresIn?: string; error?: { message?: string } };
      if (!r.ok || !j.idToken || !j.refreshToken) {
        const code = String(j.error?.message || '');
        if (code.startsWith('TOO_MANY_ATTEMPTS')) return 'blocked';
        if (/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND|MISSING_PASSWORD/.test(code)) return 'wrong';
        return 'error';
      }
      this.setTokens(j.idToken, j.refreshToken, Number(j.expiresIn) || 3600);
      if (this.browser) {
        localStorage.setItem(LS_KEY, JSON.stringify({ refresh: j.refreshToken, exp: Date.now() + SESSION_DAYS * 864e5 } satisfies Stored));
      }
      this.signedIn.set(true);
      return 'ok';
    } catch {
      return 'error';
    }
  }

  /**
   * Token de invitado válido (lo renueva si caduca en menos de un minuto), o null si no hay
   * sesión. Si Firebase ya no la acepta (contraseña cambiada, cuenta desactivada), se cierra.
   */
  token(): Promise<string | null> {
    if (this.idToken && Date.now() < this.idExp - 60_000) return Promise.resolve(this.idToken);
    if (!this.refresh) return Promise.resolve(null);
    return (this.pending ??= this.renew().finally(() => (this.pending = undefined)));
  }

  signOut(): void {
    this.refresh = this.idToken = '';
    this.idExp = 0;
    if (this.browser) localStorage.removeItem(LS_KEY);
    this.signedIn.set(false);
  }

  private async renew(): Promise<string | null> {
    const cfg = await this.config();
    if (!cfg) return null;
    try {
      const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(cfg.apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: this.refresh }).toString()
      });
      const j = await r.json() as { id_token?: string; refresh_token?: string; expires_in?: string; error?: { message?: string } };
      if (!r.ok || !j.id_token) {
        // Sesión rechazada (no un fallo de red): hay que volver a poner la contraseña
        if (r.status === 400 || r.status === 403) this.signOut();
        return null;
      }
      const changed = !!j.refresh_token && j.refresh_token !== this.refresh;
      this.setTokens(j.id_token, j.refresh_token || this.refresh, Number(j.expires_in) || 3600);
      if (changed && this.browser) {
        try {
          const s = JSON.parse(localStorage.getItem(LS_KEY) || 'null') as Stored | null;
          if (s) localStorage.setItem(LS_KEY, JSON.stringify({ ...s, refresh: this.refresh }));
        } catch { /* se mantiene en memoria */ }
      }
      return this.idToken;
    } catch {
      return null;
    }
  }

  private setTokens(id: string, refresh: string, seconds: number): void {
    this.idToken = id;
    this.refresh = refresh;
    this.idExp = Date.now() + seconds * 1000;
  }

  private config(): Promise<FirebaseWebConfig | null> {
    return firstValueFrom(this.cfgSvc.config$);
  }
}
