import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide-icon"
    >
      @switch (name()) {
        @case ('heart') {
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        }
        @case ('glass') {
          <path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z"/>
          <path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/>
        }
        @case ('utensils') {
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
          <path d="M7 2v20"/>
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
        }
        @case ('landmark') {
          <line x1="3" x2="21" y1="22" y2="22"/>
          <line x1="6" x2="6" y1="18" y2="11"/>
          <line x1="10" x2="10" y1="18" y2="11"/>
          <line x1="14" x2="14" y1="18" y2="11"/>
          <line x1="18" x2="18" y1="18" y2="11"/>
          <polygon points="12 2 20 7 4 7"/>
        }
        @case ('shirt') {
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        }
        @case ('info') {
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        }
        @case ('map-pin') {
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        }
        @case ('map') {
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          <line x1="9" x2="9" y1="3" y2="18"/>
          <line x1="15" x2="15" y1="6" y2="21"/>
        }
        @case ('party-popper') {
          <path d="M4 22h14c1.1 0 2-.9 2-2V6l-7-4-7 4v14c0 1.1.9 2 2 2z"/>
          <path d="m11 15.5 2 2 4-4"/>
          <path d="M9 12l2 2 4-4"/>
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        }
        @case ('alert-circle') {
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" x2="12" y1="8" y2="12"/>
          <line x1="12" x2="12.01" y1="16" y2="16"/>
        }
        @case ('mail') {
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        }
        @case ('frown') {
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" x2="9.01" y1="9" y2="9"/>
          <line x1="15" x2="15.01" y1="9" y2="9"/>
        }
        @case ('chevron-down') {
          <polyline points="6 9 12 15 18 9"/>
        }
        @case ('chevron-up') {
          <polyline points="18 15 12 9 6 15"/>
        }
        @case ('gift') {
          <rect x="3" y="8" width="18" height="4" rx="1"/>
          <path d="M12 8v13"/>
          <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s-2-5-4.5-5a2.5 2.5 0 0 1 0 5Z"/>
          <path d="M16.5 8a2.5 2.5 0 0 0 0-5C14 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 0 0 5Z"/>
        }
        @case ('chevron-right') {
          <polyline points="9 18 15 12 9 6"/>
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    .lucide-icon {
      display: block;
    }
  `
})
export class IconComponent {
  name = input.required<string>();
  size = input<number | string>(24);
  strokeWidth = input<number | string>(1.2);
}
