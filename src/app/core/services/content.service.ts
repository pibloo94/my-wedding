import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { DEFAULT_CONTENT, WeddingContent, mergeContent } from '../content/wedding-content';
import { FirebaseConfigService } from './firebase-config.service';

interface FirestoreDoc {
  fields?: { json?: { stringValue?: string } };
}

/**
 * Textos de la web. Empieza con el contenido de respaldo y, en cuanto responde Firestore,
 * muestra lo publicado desde la app de gestión (documento content/published).
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly _data = signal<WeddingContent>(DEFAULT_CONTENT);
  readonly data = this._data.asReadonly();

  constructor(http: HttpClient, cfg: FirebaseConfigService) {
    cfg.config$.pipe(
      switchMap(c => (c ? http.get<FirestoreDoc>(FirebaseConfigService.docUrl(c, 'content/published')) : EMPTY)),
      catchError(() => EMPTY)
    ).subscribe(doc => {
      const json = doc?.fields?.json?.stringValue;
      if (!json) return;
      try {
        this._data.set(mergeContent(DEFAULT_CONTENT, JSON.parse(json)));
      } catch {
        /* contenido publicado ilegible: se mantiene el de respaldo */
      }
    });
  }
}
