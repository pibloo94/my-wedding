/**
 * Variables CSS de la web a partir de los colores publicados (content.theme).
 *
 * Lo usan la web, para aplicarlos al cargar, y la app de gestión, para la vista previa.
 * Los tonos derivados se calculan mezclando con blanco, negro o arena; con los colores por
 * defecto salen prácticamente los mismos valores que hay escritos en src/styles.scss.
 */
import { DEFAULT_CONTENT, ThemeColors } from './wedding-content';

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c: Rgb): string =>
  '#' + c.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** Mezcla `a` con `b`: t = 0 → a, t = 1 → b. */
export function mixHex(a: string, b: string, t: number): string {
  const x = toRgb(a), y = toRgb(b);
  return toHex([0, 1, 2].map(i => x[i] + (y[i] - x[i]) * t) as Rgb);
}

/** Luminancia relativa (WCAG 2.1). */
function luminance(hex: string): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = toRgb(hex).map(lin) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste WCAG entre dos colores (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/** Todas las variables de color de la web para un tema. */
export function themeVars(t: ThemeColors): Record<string, string> {
  const soft = mixHex(t.primary, '#FFFFFF', 0.28);
  return {
    '--color-primary': t.primary,
    '--color-primary-soft': soft,
    '--color-primary-deep': t.primaryDeep,
    '--color-secondary': soft,
    '--color-teal': t.sage,
    '--color-teal-deep': t.sageDeep,
    '--color-light': mixHex(t.sage, '#FFFFFF', 0.45),
    '--color-sand': t.sand,
    '--color-sand-deep': mixHex(t.sand, '#6B5A3A', 0.12),
    '--color-orange': t.orange,
    '--color-bg': t.background,
    '--color-bg-alt': mixHex(t.background, t.sand, 0.3),
    '--color-surface': t.surface
  };
}

/**
 * Solo las variables que cambian respecto a los colores por defecto. Así, mientras no se
 * publique otra paleta, la web se ve exactamente como la definen sus hojas de estilo.
 */
export function changedThemeVars(t: ThemeColors): Record<string, string> {
  const base = DEFAULT_CONTENT.theme;
  const now = themeVars(t), def = themeVars(base);
  const out: Record<string, string> = {};
  for (const k of Object.keys(now)) {
    if (now[k] !== def[k]) out[k] = now[k]!;
  }
  return out;
}
