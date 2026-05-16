import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';

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
      cta: 'Ver datos bancarios',
      url: '#bank-details',
      highlight: false
    },
  ];

  bankCopied = false;

  bankDetails = {
    titular: 'Pablo Agudo Brun',
    iban: 'ES12 3456 7891 0123 4567 8901',
    concepto: 'Regalo boda Daniela & Pablo'
  };

  showBank = false;

  toggleBank(): void {
    this.showBank = !this.showBank;
  }

  copyIban(): void {
    navigator.clipboard.writeText(this.bankDetails.iban).then(() => {
      this.bankCopied = true;
      setTimeout(() => (this.bankCopied = false), 2500);
    });
  }
}
