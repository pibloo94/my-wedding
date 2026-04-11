import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';

interface WeddingEvent {
  id: string;
  icon: string;
  type: string;
  title: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  dressCode: string;
  dressColor: string;
  description: string;
}

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [ScrollAnimateDirective],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetailsComponent {
  events: WeddingEvent[] = [
    {
      id: 'ceremonia',
      icon: '💍',
      type: 'Ceremonia',
      title: 'Ceremonia Civil',
      time: '12:00 h',
      venue: 'Salón Palacio de la Flamenca',
      address: 'Ctra. de Extremadura, Km 23, Navalcarnero, Madrid',
      mapsUrl: 'https://maps.google.com',
      dressCode: 'Traje Formal',
      dressColor: '#800020',
      description: 'Os esperamos para dar comienzo a esta historia juntos. La ceremonia tendrá lugar en el precioso jardín del palacio.'
    },
    {
      id: 'coctel',
      icon: '🥂',
      type: 'Cóctel',
      title: 'Cóctel de Bienvenida',
      time: '13:30 h',
      venue: 'Jardines del Palacio de la Flamenca',
      address: 'Ctra. de Extremadura, Km 23, Navalcarnero, Madrid',
      mapsUrl: 'https://maps.google.com',
      dressCode: 'Traje Formal',
      dressColor: '#006080',
      description: 'Disfruta de aperitivos y bebidas en los jardines mientras celebramos juntos el inicio de nuestra nueva vida.'
    },
    {
      id: 'banquete',
      icon: '🌹',
      type: 'Banquete',
      title: 'Cena y Baile',
      time: '15:00 h',
      venue: 'Gran Salón del Palacio de la Flamenca',
      address: 'Ctra. de Extremadura, Km 23, Navalcarnero, Madrid',
      mapsUrl: 'https://maps.google.com',
      dressCode: 'Traje Formal · Evitar blanco',
      dressColor: '#6f0000',
      description: 'La celebración continúa con una cena de gala seguida de baile hasta la madrugada. ¡Que empiece la fiesta!'
    }
  ];
}
