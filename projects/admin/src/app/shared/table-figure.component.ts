import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Table } from '../core/models';
import { SeatInfo } from '../core/domain';
import { tableGeometry } from './table-geometry';

/**
 * Una mesa dibujada en SVG (grupo <g>): tablero, sillas con iniciales coloreadas por grupo,
 * punto naranja si hay menú especial o alergias, y nombre y ocupación en el centro.
 * Se usa dentro de <adm-table-figure> (tarjetas y detalle) y en el plano del salón.
 */
@Component({
  selector: 'g[admTableGlyph]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let g = geo();
    @if (g.shape === 'rect') {
      <svg:rect [attr.x]="-g.w / 2" [attr.y]="-g.h / 2" [attr.width]="g.w" [attr.height]="g.h" [attr.rx]="big() ? 14 : 10"
        fill="#EFE7D6" stroke="#D8C6A4" stroke-width="1.5" />
    } @else {
      <svg:circle [attr.r]="g.r" fill="#EFE7D6" stroke="#D8C6A4" stroke-width="1.5" />
      <svg:circle [attr.r]="g.r - 6" fill="none" stroke="#fff" stroke-opacity=".7" />
    }
    @for (c of g.chairs; track $index) {
      @if (c.seat; as s) {
        <svg:g>
          <svg:title>{{ s.label }}</svg:title>
          <svg:circle [attr.cx]="c.x" [attr.cy]="c.y" [attr.r]="g.chairR" [attr.fill]="s.color"
            [attr.stroke]="c.over ? '#7d3216' : '#fff'" [attr.stroke-width]="c.over ? 2.2 : 1.6" />
          <svg:text [attr.x]="c.x" [attr.y]="c.y" fill="#fff" [attr.font-size]="big() ? 9.5 : 7" font-weight="600" [attr.font-family]="sans"
            text-anchor="middle" dominant-baseline="central">{{ s.initials }}</svg:text>
          @if (s.diet) {
            <svg:circle [attr.cx]="c.x + g.chairR * .72" [attr.cy]="c.y - g.chairR * .72" [attr.r]="big() ? 4 : 3" fill="#CD8A52" stroke="#fff" stroke-width="1.2" />
          }
          @if (c.label; as l) {
            <svg:text [attr.x]="l.x" [attr.y]="l.y" fill="#43473A" font-size="10.5" [attr.font-family]="sans" [attr.text-anchor]="l.anchor"
              [attr.transform]="l.rotate ? 'rotate(' + l.rotate + ' ' + l.x + ' ' + l.y + ')' : null"
              [attr.font-style]="s.companion ? 'italic' : null">{{ l.text }}</svg:text>
          }
        </svg:g>
      } @else {
        <svg:circle [attr.cx]="c.x" [attr.cy]="c.y" [attr.r]="g.chairR" fill="#fff" stroke="#D8C6A4" stroke-width="1.4" stroke-dasharray="3 2.4" />
      }
    }
    <svg:text x="0" [attr.y]="big() ? -4 : -3" text-anchor="middle" font-family="Butler, Georgia, serif"
      [attr.font-size]="big() ? 17 : 12.5" fill="#5E6A49">{{ shortName() }}</svg:text>
    <svg:text x="0" [attr.y]="big() ? 15 : 11" text-anchor="middle" [attr.font-size]="big() ? 11 : 8.5"
      [attr.fill]="g.used > g.cap ? '#97492A' : '#6E6F59'" font-weight="600" [attr.font-family]="sans">{{ g.used }}/{{ g.cap }}</svg:text>
  `
})
export class TableGlyphComponent {
  table = input.required<Table>();
  seats = input.required<SeatInfo[]>();
  big = input(false);
  protected sans = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  protected geo = computed(() => tableGeometry(this.table(), this.seats(), this.big()));
  protected shortName = computed(() => {
    const n = this.table().name || '';
    const max = this.big() ? 22 : 13;
    return n.length > max ? n.slice(0, max - 1) + '…' : n;
  });
}

/** Mesa suelta en su propio <svg>, ajustada a su tamaño. */
@Component({
  selector: 'adm-table-figure',
  imports: [TableGlyphComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:block' },
  template: `
    <svg [attr.viewBox]="viewBox()" role="img" [attr.aria-label]="label()" class="tfig" [class.big]="big()">
      <g admTableGlyph [table]="table()" [seats]="seats()" [big]="big()" />
    </svg>`,
  styles: `
    .tfig { width: 100%; height: auto; display: block; margin: 0 auto; overflow: visible; }
    .tfig:not(.big) { max-height: 190px; }
    .tfig.big { max-height: 62vh; }`
})
export class TableFigureComponent {
  table = input.required<Table>();
  seats = input.required<SeatInfo[]>();
  big = input(false);
  protected viewBox = computed(() => tableGeometry(this.table(), this.seats(), this.big()).box.join(' '));
  protected label = computed(() => `${this.table().name}: ${this.seats().length} de ${this.table().cap} sillas ocupadas`);
}
