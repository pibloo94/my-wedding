import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { THEME_KEYS, ThemeColors } from '@web/content';
import { contrastRatio } from '@web/theme';
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

/** Colores de la web (se publican con el contenido), ilustraciones, notas e inspiración. */
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
  protected themeChanges = computed(() => this.ct.diff().filter(d => d.key.startsWith('t.')).length);
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

  protected illustrations = [
    ['crest-cats.webp', 'Escudo con gatos'], ['crest.webp', 'Monograma'], ['botanical-corner.webp', 'Esquina botánica'],
    ['cat-grey-sleeping.webp', 'Gato gris'], ['cat-orange-playing.webp', 'Gato naranja'], ['cat-black-playing.webp', 'Gato negro']
  ];

  protected setColor(k: keyof ThemeColors, raw: string): void {
    let v = raw.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (!/^#[0-9a-f]{6}$/i.test(v)) return;
    this.ct.edit(d => { d.theme[k] = v.toUpperCase(); });
  }

  protected resetColors(): void {
    this.ct.edit(d => { d.theme = { ...DEFAULT_CONTENT.theme }; });
  }

  /** Deshace los cambios de color sin publicar (los demás cambios del borrador se mantienen). */
  protected async discardColors(): Promise<void> {
    const n = this.themeChanges();
    if (!n) return;
    if (!await this.ui.confirm(`Los colores volverán a ser los que se ven ahora en la web (${n} cambio${n === 1 ? '' : 's'}).`, 'Descartar cambios', { danger: true })) return;
    this.ct.edit(d => { d.theme = { ...this.pubTheme() }; });
    this.ui.toast('Colores restablecidos a los publicados');
  }

  protected setNotes(v: string): void {
    this.store.update(s => { s.meta.theme.notes = v; });
  }

  protected readonly safeUrl = safeUrl;
}
