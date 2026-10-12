import { Injectable, computed, effect, signal, untracked } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_CONTENT, SectionConfig, SectionKind, WeddingContent, mergeContent } from '../content/wedding-content';
import { FirebaseConfigService } from './firebase-config.service';
import { GuestAuthService } from './guest-auth.service';
import { applyFontLink, changedFontVars, changedThemeVars, fontVars, googleFontsHref, themeVars } from '../content/theme';

interface FirestoreDoc {
  fields?: { json?: { stringValue?: string } };
}

/**
 * Textos de la web. Empieza con el contenido de respaldo y, en cuanto el invitado ha entrado
 * con la contraseña, pide lo publicado desde la app de gestión (documento content/published),
 * que solo se puede leer con la sesión de invitado.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly _data = signal<WeddingContent>(DEFAULT_CONTENT);
  readonly data = this._data.asReadonly();

  /** Secciones visibles, en el orden elegido desde la app de gestión. */
  readonly visibleSections = computed(() => this._data().sections.filter(s => s.visible));

  /** Configuración (títulos) de una sección propia. */
  section(kind: SectionKind): SectionConfig {
    return this._data().sections.find(s => s.kind === kind)
      ?? DEFAULT_CONTENT.sections.find(s => s.kind === kind)!;
  }

  isVisible(kind: SectionKind): boolean {
    return this.visibleSections().some(s => s.kind === kind);
  }

  constructor(private http: HttpClient, private cfg: FirebaseConfigService, private guest: GuestAuthService) {
    // Colores publicados desde la app de gestión (Temática). Con los de por defecto no se toca nada.
    effect(() => this.applyTheme());
    // Tipografía elegida en Temática: solo se descarga si no es la original (Butler)
    effect(() => this.applyFonts());
    // Título de la pestaña con los nombres y la fecha publicados
    effect(() => {
      const h = this._data().hero;
      if (typeof document !== 'undefined') document.title = `${h.name1} & ${h.name2} — ${h.dateText}`;
    });
    // Lo publicado se pide al entrar (o al volver con la sesión guardada)
    effect(() => {
      if (this.guest.signedIn()) untracked(() => void this.load());
    });
  }

  private loading = false;
  private loaded = false;

  private async load(): Promise<void> {
    if (this.loading || this.loaded) return;
    this.loading = true;
    try {
      const [c, token] = await Promise.all([firstValueFrom(this.cfg.config$), this.guest.token()]);
      if (!c || !token) return;
      const doc = await firstValueFrom(this.http.get<FirestoreDoc>(FirebaseConfigService.docUrl(c, 'content/published'), {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
      }));
      const json = doc?.fields?.json?.stringValue;
      if (!json) return;
      this._data.set(mergeContent(DEFAULT_CONTENT, JSON.parse(json)));
      this.loaded = true;
    } catch {
      /* sin conexión o contenido ilegible: se mantiene el de respaldo */
    } finally {
      this.loading = false;
    }
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;
    const theme = this._data().theme;
    const root = document.documentElement.style;
    for (const name of Object.keys(themeVars(theme))) root.removeProperty(name);
    const vars = changedThemeVars(theme);
    for (const [name, value] of Object.entries(vars)) root.setProperty(name, value);
    // Color de la barra del navegador en móvil y fondo antes de que carguen los estilos
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.primary);
    if (vars['--color-bg']) document.documentElement.style.backgroundColor = vars['--color-bg'];
    else document.documentElement.style.removeProperty('background-color');
  }

  private applyFonts(): void {
    if (typeof document === 'undefined') return;
    const ty = this._data().typography;
    const root = document.documentElement.style;
    for (const name of Object.keys(fontVars(ty))) root.removeProperty(name);
    for (const [name, value] of Object.entries(changedFontVars(ty))) root.setProperty(name, value);
    applyFontLink(document, googleFontsHref(ty));
  }
}
