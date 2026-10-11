import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FirebaseConfigService, FirebaseWebConfig } from './firebase-config.service';

/** Persona incluida en una respuesta. Mismo modelo que la app de gestión (docs/MODELO-DATOS.md). */
export interface RsvpPerson {
  role: 'adulto' | 'acompañante' | 'niño';
  name: string;
  /** Solo niños */
  age?: number;
  /** Solo adultos y acompañantes */
  menu?: 'estandar' | 'vegetariano';
  glutenFree?: boolean;
  lactoseFree?: boolean;
  allergies: string;
}

export interface RsvpSubmission {
  name: string;
  /** Correo o teléfono: identifica la respuesta si la misma persona vuelve a enviar el formulario */
  contact: string;
  attending: 'si' | 'no';
  message: string;
  people: RsvpPerson[];
}

@Injectable({ providedIn: 'root' })
export class RsvpService {
  constructor(private http: HttpClient, private cfg: FirebaseConfigService) {}

  submit(rsvp: RsvpSubmission): Observable<unknown> {
    return this.cfg.config$.pipe(
      switchMap(cfg => cfg
        ? this.toFirestore(cfg, rsvp)
        : throwError(() => new Error('Falta la configuración de Firebase (public/firebase-config.json)'))),
      catchError(err => {
        console.error('Error enviando RSVP:', err);
        return throwError(() => err);
      })
    );
  }

  /** Crea un documento en la colección `rsvps` mediante la API REST de Firestore. */
  private toFirestore(cfg: FirebaseWebConfig, rsvp: RsvpSubmission): Observable<unknown> {
    const url = FirebaseConfigService.docUrl(cfg, 'rsvps');
    const doc = {
      ...rsvp,
      submittedAt: new Date().toISOString(),
      source: 'web',
      v: 1
    };
    return this.http.post(url, { fields: toFirestoreFields(doc) }).pipe(map(() => true));
  }
}

/** Convierte un objeto JS al formato de campos de la API REST de Firestore. */
function toFirestoreValue(v: unknown): Record<string, unknown> {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === 'object') return { mapValue: { fields: toFirestoreFields(v as Record<string, unknown>) } };
  return { stringValue: String(v) };
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(obj)) {
    if (val !== undefined) out[k] = toFirestoreValue(val);
  }
  return out;
}
