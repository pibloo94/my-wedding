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

  protected get initial1(): string { return this.content.data().hero.name1.trim().charAt(0).toUpperCase(); }
  protected get initial2(): string { return this.content.data().hero.name2.trim().charAt(0).toUpperCase(); }

  /** Escape cierra el menú móvil. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
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
