import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Cabecera de cada pantalla: título, subtítulo y acciones principales. */
@Component({
  selector: 'adm-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="txt">
      <h1>{{ title() }}</h1>
      @if (sub()) { <p class="sub">{{ sub() }}</p> }
      <div class="sprig" aria-hidden="true"></div>
    </div>
    <div class="acts"><ng-content /></div>`,
  styles: `
    :host { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px 24px; flex-wrap: wrap; margin-bottom: 22px; }
    .txt { min-width: 0; }
    .sub { color: var(--muted); font-family: var(--serif); font-style: italic; font-size: 1.06rem; margin-top: 4px; }
    .sprig { height: 24px; width: 170px; background: url('assets/brand/divider-sprig.webp') no-repeat left center / contain; opacity: .85; margin-top: 8px; }
    .acts { display: flex; gap: 8px; flex-wrap: wrap; }
    .acts:empty { display: none; }
    @media (max-width: 760px) {
      :host { margin-bottom: 16px; }
      .acts { width: 100%; }
      .acts ::ng-deep > .btn { flex: 1 1 auto; }
      .sprig { width: 130px; height: 20px; }
    }`
})
export class PageHeaderComponent {
  title = input.required<string>();
  sub = input('');
}
