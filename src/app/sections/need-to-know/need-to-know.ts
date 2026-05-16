import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';

interface InfoCard {
  icon: string;
  title: string;
  items: string[];
  accent: string;
}

@Component({
  selector: 'app-need-to-know',
  standalone: true,
  imports: [ScrollAnimateDirective, IconComponent],
  templateUrl: './need-to-know.html',
  styleUrl: './need-to-know.scss'
})
export class NeedToKnowComponent {
  cards: InfoCard[] = [
    {
      icon: 'shirt',
      title: 'Código de Vestimenta',
      accent: '#CB997E',
      items: [
        'Traje formal para caballeros (corbata o pajarita)',
        'Vestido de cóctel o de noche para señoras',
        'Por favor, evitar colores blanco, marfil y crudo',
        '¡Tenemos una pista de baile! Zapatos cómodos son bienvenidos'
      ]
    },
    {
      icon: 'info',
      title: 'Detalles del Lugar',
      accent: '#444',
      items: [
        'La ceremonia se realiza al aire libre, prever calzado cómodo para jardín',
        'No se permite confeti ni arroz dentro del recinto',
        'Zona de aparcamiento gratuita disponible dentro del recinto',
        'El recinto es accesible para personas con movilidad reducida'
      ]
    },
    {
      icon: 'utensils',
      title: 'Menú y Alergias',
      accent: '#006080',
      items: [
        'Menú de cuatro tiempos con opciones vegetarianas',
        'Indicad vuestras alergias o intolerancias en el formulario de confirmación',
        'Menú infantil disponible para los más pequeños',
        'Barra libre durante la fiesta'
      ]
    }
  ];
}
