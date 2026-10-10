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
      cta: 'Datos bancarios',
      url: '#bank-details',
      highlight: false
    },
  ];

  bankCopied = false;

  bankDetails = {
    titular: 'Pablo Agudo Brun',
    // TODO: pon aquí el IBAN real (formato «ES00 0000 0000 0000 0000 0000»).
    // Mientras esté vacío, la web muestra un aviso en lugar de los datos.
    iban: '',
    concepto: 'Regalo boda Daniela & Pablo'
  };

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
