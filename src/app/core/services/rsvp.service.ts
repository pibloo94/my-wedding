import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

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

/** Configuración pública de Firebase (public/firebase-config.json). Vacía = Firebase aún no está activo. */
interface FirebaseWebConfig {
  apiKey?: string;
  projectId?: string;
}

@Injectable({ providedIn: 'root' })
export class RsvpService {
  /**
   * Respaldo mientras Firebase no esté configurado: el Apps Script que guarda en Google Sheets.
   * Instrucciones en INSTRUCTIONS_GOOGLE_SHEETS.md. Se puede borrar cuando Firebase esté activo.
   */
  private readonly APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfXYd6v50aSVRxO6EIFRmwXQtHsBDUkBZgheJia084QnkqjJ_sFIHDpB-IpkZQs0De/exec';

  private readonly config$: Observable<FirebaseWebConfig | null>;

  constructor(private http: HttpClient) {
    this.config$ = this.http.get<FirebaseWebConfig>('firebase-config.json').pipe(
      catchError(() => of(null)),
      shareReplay(1)
    );
  }

  submit(rsvp: RsvpSubmission): Observable<unknown> {
    return this.config$.pipe(
      switchMap(cfg => cfg?.apiKey && cfg?.projectId
        ? this.toFirestore(cfg.projectId, cfg.apiKey, rsvp)
        : this.toAppsScript(rsvp)),
      catchError(err => {
        console.error('Error enviando RSVP:', err);
        return throwError(() => err);
      })
    );
  }

  /** Crea un documento en la colección `rsvps` mediante la API REST de Firestore. */
  private toFirestore(projectId: string, apiKey: string, rsvp: RsvpSubmission): Observable<unknown> {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`
      + `/databases/(default)/documents/rsvps?key=${encodeURIComponent(apiKey)}`;
    const doc = {
      ...rsvp,
      submittedAt: new Date().toISOString(),
      source: 'web',
      v: 1
    };
    return this.http.post(url, { fields: toFirestoreFields(doc) }).pipe(map(() => true));
  }

  /** Formato antiguo de la hoja (Fecha, Nombre, Asistencia, ¿Acompañante?, Nombre Acompañante, Alergias, Mensaje). */
  private toAppsScript(rsvp: RsvpSubmission): Observable<unknown> {
    const partner = rsvp.people.find(p => p.role === 'acompañante');
    const describe = (p: RsvpPerson) => {
      const bits: string[] = [];
      if (p.role === 'niño') bits.push(`${p.age} años`);
      if (p.menu === 'vegetariano') bits.push('vegetariano');
      if (p.glutenFree) bits.push('sin gluten');
      if (p.lactoseFree) bits.push('sin lactosa');
      if (p.allergies) bits.push(`alergias: ${p.allergies}`);
      return bits.length ? `${p.name} (${bits.join(', ')})` : '';
    };
    const kids = rsvp.people.filter(p => p.role === 'niño');
    const dietary = [
      ...rsvp.people.filter(p => p.role !== 'niño').map(describe).filter(Boolean),
      ...(kids.length ? [`Niños: ${kids.map(k => describe(k) || k.name).join('; ')}`] : [])
    ].join(' | ');

    const data: Record<string, string> = {
      name: rsvp.name,
      attending: rsvp.attending,
      hasPartner: String(!!partner),
      partnerName: partner?.name ?? '',
      dietary,
      message: [rsvp.message, `[Contacto: ${rsvp.contact}]`].filter(Boolean).join(' '),
      website: '',
      submittedAt: new Date().toLocaleString('es-ES')
    };

    // Apps Script no admite JSON con CORS: se envía como formulario
    const body = new URLSearchParams(data).toString();
    return this.http.post(this.APPS_SCRIPT_URL, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      responseType: 'text'
    });
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
