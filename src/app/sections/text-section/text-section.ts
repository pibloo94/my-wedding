import { Component, input } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';
import { SectionConfig } from '../../core/content/wedding-content';

/** Sección libre de texto (alojamiento, transporte…), creada desde la app de gestión. */
@Component({
  selector: 'app-text-section',
  standalone: true,
  imports: [ScrollAnimateDirective, IconComponent],
  templateUrl: './text-section.html',
  styleUrl: './text-section.scss'
})
export class TextSectionComponent {
  section = input.required<SectionConfig>();

  /** Párrafos: el texto se separa por líneas en blanco. */
  get paragraphs(): string[] {
    return this.section().body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  }
}
