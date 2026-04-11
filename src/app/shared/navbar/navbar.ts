import { Component, HostListener, signal } from '@angular/core';

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

  navLinks = [
    { label: 'El Gran Día', anchor: 'eventos' },
    { label: 'Confirmar Asistencia', anchor: 'rsvp' },
    { label: 'Lo Que Debes Saber', anchor: 'detalles' },
    { label: 'Lista de Bodas', anchor: 'registro' },
  ];

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
