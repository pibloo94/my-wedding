import { Injectable, signal } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, GoogleAuthProvider, User, getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  Firestore, collection, doc, getDoc, initializeFirestore, onSnapshot, persistentLocalCache,
  persistentMultipleTabManager, setDoc, writeBatch
} from 'firebase/firestore';

/** Configuración pública (public/firebase-config.json, copiada junto a la app al compilar). */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  appId?: string;
}

/**
 * Estado de la sesión:
 * - local: no hay configuración de Firebase; los datos se guardan solo en este navegador.
 * - login: falta iniciar sesión con Google.
 * - noaccess: la cuenta no está en la colección admins.
 * - ready: sesión iniciada con acceso.
 */
export type SessionState = 'loading' | 'local' | 'login' | 'noaccess' | 'ready' | 'error';

/** Funciones de Firestore que usa la app (así los servicios no dependen del SDK directamente). */
export const fs = { collection, doc, getDoc, onSnapshot, setDoc, writeBatch };

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  readonly state = signal<SessionState>('loading');
  readonly user = signal<User | null>(null);
  readonly error = signal('');

  private app?: FirebaseApp;
  private auth?: Auth;
  db?: Firestore;
  config?: FirebaseWebConfig;

  /** Se llama una vez al arrancar (ver app.config.ts). */
  async init(): Promise<void> {
    let cfg: FirebaseWebConfig | null = null;
    try {
      const r = await fetch('firebase-config.json', { cache: 'no-store' });
      if (r.ok) cfg = await r.json() as FirebaseWebConfig;
    } catch { /* sin configuración: modo local */ }
    if (!cfg?.apiKey || !cfg.projectId) {
      this.state.set('local');
      return;
    }
    try {
      this.config = cfg;
      this.app = initializeApp(cfg);
      this.auth = getAuth(this.app);
      // Caché persistente: lo que guardas queda en el navegador aunque se corte la conexión
      // o cierres la pestaña, y se sube a Firebase en cuanto vuelve la conexión.
      this.db = initializeFirestore(this.app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
      onAuthStateChanged(this.auth, u => void this.onUser(u));
    } catch (e) {
      console.error(e);
      this.fail('No se pudo cargar Firebase. Comprueba la conexión y vuelve a intentarlo.');
    }
  }

  private async onUser(u: User | null): Promise<void> {
    this.user.set(u);
    if (!u) {
      this.state.set('login');
      return;
    }
    try {
      const adm = await getDoc(doc(this.db!, 'admins', u.uid));
      this.state.set(adm.exists() ? 'ready' : 'noaccess');
    } catch {
      this.state.set('noaccess');
    }
  }

  fail(msg: string): void {
    this.error.set(msg);
    this.state.set('error');
  }

  async signIn(): Promise<void> {
    if (!this.auth) return;
    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider());
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        throw new Error(`No se pudo iniciar sesión (${code || (e as Error).message})`);
      }
    }
  }

  async signOut(): Promise<void> {
    if (this.auth) await signOut(this.auth);
    location.reload();
  }

  /** URL pública de un documento, tal como lo lee la web (sin sesión). */
  publicDocUrl(path: string): string {
    const c = this.config!;
    return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(c.projectId)}/databases/(default)/documents/${path}?key=${encodeURIComponent(c.apiKey)}`;
  }
}
