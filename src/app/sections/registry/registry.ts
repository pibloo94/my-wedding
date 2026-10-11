import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';
import { ContentService } from '../../core/services/content.service';
import { SectionConfig } from '../../core/content/wedding-content';

interface RegistryItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  highlight: boolean;
}

@Component({
  selector: 'app-registry',
  standalone: true,
  imports: [ScrollAnimateDirective, IconComponent],
  templateUrl: './registry.html',
  styleUrl: './registry.scss'
})
export class RegistryComponent {
  items: RegistryItem[] = [
    {
      id: 'transfer',
      icon: 'landmark',
      title: 'Transferencia Bancaria',
      description: 'Si preferís contribuir directamente, podéis hacerlo mediante transferencia. Vuestro detalle, sea cual sea, significa muchísimo para nosotros.',
      cta: 'Datos bancarios',
      url: '#bank-details',
      highlight: false
    },
  ];

  bankCopied = false;

  constructor(private content: ContentService) {}

  /**
   * Titular, IBAN y concepto se editan desde la app de gestión (Web de la boda → Contenido).
   * Mientras el IBAN esté vacío, la web muestra un aviso en lugar de los datos.
   */
  get sec(): SectionConfig {
    return this.content.section('registry');
  }

  get bankDetails(): { titular: string; iban: string; concepto: string } {
    return this.content.data().registry;
  }

  showBank = false;

  toggleBank(): void {
    this.showBank = !this.showBank;
  }

  get hasIban(): boolean {
    return this.bankDetails.iban.trim().length > 0;
  }

  copyIban(): void {
    navigator.clipboard.writeText(this.bankDetails.iban).then(() => {
      this.bankCopied = true;
      setTimeout(() => (this.bankCopied = false), 2500);
    });
  }
}
