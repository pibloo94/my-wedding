import { Injectable, computed, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { DEFAULT_CONTENT, SectionConfig, SectionKind, WeddingContent, mergeContent } from '../content/wedding-content';
import { FirebaseConfigService } from './firebase-config.service';
import { changedThemeVars, themeVars } from '../content/theme';

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

  constructor(http: HttpClient, cfg: FirebaseConfigService) {
    // Colores publicados desde la app de gestión (Temática). Con los de por defecto no se toca nada.
    effect(() => this.applyTheme());
    // Título de la pestaña con los nombres y la fecha publicados
    effect(() => {
      const h = this._data().hero;
      if (typeof document !== 'undefined') document.title = `${h.name1} & ${h.name2} — ${h.dateText}`;
    });

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
}
