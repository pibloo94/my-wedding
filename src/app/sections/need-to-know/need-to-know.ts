import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';

interface InfoCard {
  icon: string;
  title: string;
  items: string[];
  accent: string;
}

@Component({
  selector: 'app-need-to-know',
  standalone: true,
  imports: [ScrollAnimateDirective],
  templateUrl: './need-to-know.html',
  styleUrl: './need-to-know.scss'
})
export class NeedToKnowComponent {
  cards: InfoCard[] = [
    {
      icon: 'dress',
      title: 'Vestimenta',
      accent: '#6B705C',
      items: [
        'Formal para caballeros',
        'Cóctel o noche para señoras',
        'Rogamos evitar el color blanco y derivados',
        'Calzado cómodo para disfrutar del baile'
      ]
    },
    {
      icon: 'venue',
      title: 'El Recinto',
      accent: '#6B705C',
      items: [
        'Ceremonia al aire libre en jardines',
        'Aparcamiento gratuito disponible',
        'Espacio accesible para todos',
        'Clima previsto: Cálido mediterráneo'
      ]
    },
    {
      icon: 'food',
      title: 'Menú Especial',
      accent: '#6B705C',
      items: [
        'Opciones vegetarianas y celíacas',
        'Indicad vuestras alergias al confirmar',
        'Menú infantil disponible',
        'Barra libre durante la celebración'
      ]
    }
  ];
}
