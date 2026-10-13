import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

/** Configuración pública de Firebase (public/firebase-config.json). */
export interface FirebaseWebConfig {
  apiKey: string;
  projectId: string;
  /** 'dev' en el proyecto de pruebas (env/dev/firebase-config.json); sin él, prod */
  env: 'dev' | 'prod';
}

@Injectable({ providedIn: 'root' })
export class FirebaseConfigService {
  /** Emite la configuración, o null si falta o no se puede leer. Se pide una sola vez. */
  readonly config$: Observable<FirebaseWebConfig | null>;

  constructor(http: HttpClient) {
    this.config$ = http.get<Partial<FirebaseWebConfig>>('firebase-config.json').pipe(
      map(c => (c?.apiKey && c?.projectId ? { apiKey: c.apiKey, projectId: c.projectId, env: c.env === 'dev' ? 'dev' as const : 'prod' as const } : null)),
      catchError(() => of(null)),
      shareReplay(1)
    );
  }

  /** URL REST de un documento de Firestore. */
  static docUrl(cfg: FirebaseWebConfig, path: string): string {
    return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(cfg.projectId)}`
      + `/databases/(default)/documents/${path}?key=${encodeURIComponent(cfg.apiKey)}`;
  }
}
