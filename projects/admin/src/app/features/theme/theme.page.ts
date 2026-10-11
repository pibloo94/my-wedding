import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FONTS, THEME_KEYS, ThemeColors, Typography, fontById } from '@web/content';
import { applyFontLink, contrastRatio } from '@web/theme';
import { StoreService } from '../../core/store.service';
import { ListsService } from '../../core/lists.service';
import { UiService } from '../../core/ui.service';
import { ContentEditorService } from '../../core/content-editor.service';
import { DEFAULT_CONTENT, THEME_LABEL } from '../../core/content-model';
import { safeUrl } from '../../core/util';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { IconComponent } from '../../shared/icon.component';
import { ThemePreviewComponent } from './theme-preview.component';

/** Colores y tipografía de la web (se publican con el contenido) e inspiración. */
@Component({
  selector: 'adm-theme-page',
  imports: [RouterLink, PageHeaderComponent, EmptyStateComponent, IconComponent, ThemePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme.page.html',
  styleUrl: './theme.page.scss'
})
export class ThemePage {
  protected store = inject(StoreService);
  protected lists = inject(ListsService);
  protected ct = inject(ContentEditorService);
  private ui = inject(UiService);

  protected keys = THEME_KEYS;
  protected label = THEME_LABEL;
  protected draftTheme = computed(() => this.ct.draft()?.theme ?? DEFAULT_CONTENT.theme);
  protected pubTheme = computed(() => this.ct.base().theme);
  protected draftType = computed(() => this.ct.draft()?.typography ?? DEFAULT_CONTENT.typography);
  protected pubType = computed(() => this.ct.base().typography);
  /** Cambios de colores y tipografía sin publicar */
  protected themeChanges = computed(() => this.ct.diff().filter(d => d.key.startsWith('t.') || d.key.startsWith('f.')).length);
  protected typeIsDefault = computed(() => this.draftType().headings === DEFAULT_CONTENT.typography.headings && this.draftType().text === DEFAULT_CONTENT.typography.text);
  protected fontRoles: [keyof Typography, string, string][] = [
    ['headings', 'Títulos', 'Nombres, títulos de sección y textos en cursiva'],
    ['text', 'Texto', 'Párrafos, botones, menú y etiquetas']
  ];
  protected fontsFor = (role: keyof Typography) => FONTS.filter(f => f.roles.includes(role));
  protected readonly fontById = fontById;
  protected otherChanges = computed(() => this.ct.diff().length - this.themeChanges());
  protected isDefault = computed(() => THEME_KEYS.every(k => this.draftTheme()[k] === DEFAULT_CONTENT.theme[k]));
  protected names = computed(() => {
    const h = this.ct.draft()?.hero;
    const c = this.store.config();
    return { n1: h?.name1 || c.n1, n2: h?.name2 || c.n2 };
  });
  protected dateText = computed(() => this.ct.draft()?.hero.dateText ?? '');

  /** Avisos de legibilidad (WCAG): texto de botones, cuerpo y títulos sobre el fondo. */
  protected contrast = computed(() => {
    const t = this.draftTheme();
    const checks = [
      { what: 'Texto blanco de los botones sobre terracota', r: contrastRatio('#FFFFFF', t.primary), min: 4.5 },
      { what: 'Texto del cuerpo sobre el fondo', r: contrastRatio('#4C4E40', t.background), min: 4.5 },
      { what: 'Títulos (salvia profundo) sobre el fondo', r: contrastRatio(t.sageDeep, t.background), min: 3 },
      { what: 'Etiquetas pequeñas (terracota profundo) sobre el fondo', r: contrastRatio(t.primaryDeep, t.background), min: 4.5 },
      { what: 'Texto sobre las tarjetas', r: contrastRatio('#4C4E40', t.surface), min: 4.5 }
    ];
    return checks.map(c => ({ ...c, ok: c.r >= c.min, ratio: c.r.toFixed(1) }));
  });
  protected badContrast = computed(() => this.contrast().filter(c => !c.ok));

  constructor() {
    // Todas las fuentes del catálogo, para ver cada opción con su letra (solo en esta página)
    const href = 'https://fonts.googleapis.com/css2?' + FONTS.filter(f => f.google).map(f => 'family=' + f.google).join('&') + '&display=swap';
    applyFontLink(document, href, 'adm-fonts');
    inject(DestroyRef).onDestroy(() => applyFontLink(document, '', 'adm-fonts'));
  }

  protected setColor(k: keyof ThemeColors, raw: string): void {
    let v = raw.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (!/^#[0-9a-f]{6}$/i.test(v)) return;
    this.ct.edit(d => { d.theme[k] = v.toUpperCase(); });
  }

  protected setFont(role: keyof Typography, id: string): void {
    this.ct.edit(d => { d.typography = { ...d.typography, [role]: id }; });
  }

  protected resetFonts(): void {
    this.ct.edit(d => { d.typography = { ...DEFAULT_CONTENT.typography }; });
  }

  protected resetColors(): void {
    this.ct.edit(d => { d.theme = { ...DEFAULT_CONTENT.theme }; });
  }

  /** Deshace los cambios de colores y tipografía sin publicar (los demás cambios del borrador se mantienen). */
  protected async discardColors(): Promise<void> {
    const n = this.themeChanges();
    if (!n) return;
    if (!await this.ui.confirm(`Los colores y la tipografía volverán a ser los que se ven ahora en la web (${n} cambio${n === 1 ? '' : 's'}).`, 'Descartar cambios', { danger: true })) return;
    this.ct.edit(d => { d.theme = { ...this.pubTheme() }; d.typography = { ...this.pubType() }; });
    this.ui.toast('Colores y tipografía restablecidos a los publicados');
  }

  protected readonly safeUrl = safeUrl;
}
