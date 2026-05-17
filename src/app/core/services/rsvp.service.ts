import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RsvpPayload {
  name: string;
  attending: string;
  hasPartner: boolean;
  partnerName: string;
  dietary: string;
  message: string;
  submittedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RsvpService {
  // TODO: Reemplaza esta URL con la URL de tu Google Apps Script Web App
  // Instrucciones en: src/app/sections/rsvp/INSTRUCCIONES_GOOGLE_SHEETS.md
  private readonly APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfXYd6v50aSVRxO6EIFRmwXQtHsBDUkBZgheJia084QnkqjJ_sFIHDpB-IpkZQs0De/exec';

  constructor(private http: HttpClient) {}

  submit(payload: RsvpPayload): Observable<any> {
    const data = {
      ...payload,
      submittedAt: new Date().toLocaleString('es-ES')
    };

    // Apps Script no soporta JSON body directamente con CORS,
    // usamos URLSearchParams para enviar como form-data
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    return this.http.post(this.APPS_SCRIPT_URL, formData.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      responseType: 'text'
    }).pipe(
      catchError(err => {
        console.error('Error enviando RSVP:', err);
        return throwError(() => err);
      })
    );
  }
}
