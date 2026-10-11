import { Component, HostListener, signal, effect } from '@angular/core';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  scrolled = signal(false);
  menuOpen = signal(false);


  constructor(private content: ContentService) {
    effect(() => {
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  /** Enlaces del menú: las secciones visibles, en su orden. */
  get navLinks(): { label: string; anchor: string }[] {
    return this.content.visibleSections().map(s => ({ label: s.navLabel || s.title, anchor: s.id }));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  scrollTo(anchor: string): void {
    this.menuOpen.set(false);
    const el = document.getElementById(anchor);
    if (el) {
      const offset = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}
