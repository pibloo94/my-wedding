import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ThemeColors } from '@web/content';
import { themeVars } from '@web/theme';

/**
 * Miniatura de la web con una paleta: menú, portada, botones, un título de sección y una
 * tarjeta. Usa las mismas variables CSS que calcula la web (src/app/core/content/theme.ts).
 */
@Component({
  selector: 'adm-theme-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style]': 'vars()', role: 'img', '[attr.aria-label]': '"Vista previa de la web con estos colores"' },
  template: `
    <div class="nav"><span class="mono">D&amp;P</span><span>El Gran Día</span><span>Lo Que Debes Saber</span><span class="cta">Confirmar</span></div>
    <div class="hero">
      <span class="kick">Nos casamos</span>
      <span class="names">{{ n1() }} &amp; {{ n2() }}</span>
      <span class="date">{{ date() }}</span>
      <div class="btns"><span class="b pri">Confirmar asistencia</span><span class="b out">Ver detalles</span></div>
    </div>
    <div class="sec">
      <span class="lab">Información práctica</span>
      <span class="h2">Lo Que Debes Saber</span>
      <span class="rule"></span>
      <div class="card">
        <span class="ic">✦</span>
        <div><b>Código de vestimenta</b><ul><li>Traje formal</li><li>Evitar el blanco</li></ul></div>
      </div>
    </div>`,
  styles: `
    :host {
      display: block; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); background: var(--color-bg);
      font-family: 'Butler', Georgia, serif; color: #4C4E40; box-shadow: var(--shadow-s);
    }
    .nav { display: flex; gap: 14px; align-items: center; padding: 10px 16px; font-size: .74rem; color: var(--color-teal-deep); border-bottom: 1px solid color-mix(in srgb, var(--color-teal) 20%, transparent); background: color-mix(in srgb, var(--color-bg) 92%, transparent); flex-wrap: wrap; }
    .mono { font-size: 1rem; color: var(--color-primary); margin-right: auto; }
    .cta { color: var(--color-primary); }
    .hero { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 26px 16px 24px; text-align: center;
      background: radial-gradient(ellipse at 50% 30%, var(--color-surface) 0%, var(--color-bg) 60%, var(--color-bg-alt) 100%); }
    .kick { font-family: var(--sans); font-size: .62rem; letter-spacing: .3em; text-transform: uppercase; color: var(--color-primary); }
    .names { font-size: clamp(1.6rem, 4vw, 2.3rem); font-weight: 300; color: var(--color-teal-deep); line-height: 1.1; }
    .date { font-style: italic; color: var(--color-teal); }
    .btns { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
    .b { font-family: var(--sans); font-size: .62rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; padding: 9px 14px; border-radius: 40px; }
    .b.pri { background: var(--color-primary); color: #fff; }
    .b.out { border: 1px solid var(--color-teal); color: var(--color-teal-deep); }
    .sec { background: var(--color-bg-alt); padding: 20px 16px 22px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .lab { font-family: var(--sans); font-size: .6rem; letter-spacing: .28em; text-transform: uppercase; color: var(--color-primary); }
    .h2 { font-size: 1.35rem; color: var(--color-teal-deep); }
    .rule { width: 70px; height: 1px; background: var(--color-sand-deep); margin: 6px 0 10px; }
    .card { display: flex; gap: 12px; align-items: flex-start; background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-teal) 20%, transparent); border-radius: 14px; padding: 14px 16px; width: min(320px, 100%); text-align: left; }
    .ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 8%, transparent); border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent); flex: none; }
    .card b { font-weight: 400; color: var(--color-orange); font-size: 1rem; }
    ul { margin: 4px 0 0 16px; font-size: .86rem; }`
})
export class ThemePreviewComponent {
  theme = input.required<ThemeColors>();
  n1 = input('Daniela');
  n2 = input('Pablo');
  date = input('11 de Septiembre de 2027');
  protected vars = computed(() => themeVars(this.theme()));
}
