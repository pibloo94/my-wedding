import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const CATS: Record<string, string> = {
  grey: 'assets/brand/cat-grey-sleeping.webp',
  orange: 'assets/brand/cat-orange-playing.webp',
  black: 'assets/brand/cat-black-playing.webp'
};

/** Estado vacío con uno de los gatos de la web y la acción para empezar. */
@Component({
  selector: 'adm-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card flat' },
  template: `
    <img [src]="src()" alt="">
    <p>{{ text() }}</p>
    <div class="acts"><ng-content /></div>`,
  styles: `
    :host { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 26px 16px; text-align: center; }
    img { width: 150px; }
    p { color: var(--muted); font-family: var(--serif); font-style: italic; max-width: 46ch; }
    .acts { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .acts:empty { display: none; }`
})
export class EmptyStateComponent {
  text = input.required<string>();
  cat = input<'grey' | 'orange' | 'black'>('grey');
  protected src = () => CATS[this.cat()];
}
