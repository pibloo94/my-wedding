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
  mapsUrl?: string;
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
      icon: '01',
      type: 'Ceremonia',
      title: 'Ceremonia Civil',
      time: '13:00 h',
      venue: 'Jardines del Negralejo',
      address: 'Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid',
      mapsUrl: 'https://www.google.com/maps/place/Jardines+del+Negralejo/@40.4085192,-3.51632,17z/data=!4m6!3m5!1s0xd423b214854bab3:0x664516d941116999!8m2!3d40.4085706!4d-3.5162788!16s%2Fg%2F11thnjv_ym?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D',
      dressCode: 'Formal',
      dressColor: '#6B705C',
      description: 'Os esperamos para dar comienzo a esta historia juntos. La ceremonia tendrá lugar en el precioso jardín.'
    },
    {
      id: 'coctel',
      icon: '02',
      type: 'Celebración',
      title: 'Cóctel de Bienvenida',
      time: '13:30 h',
      venue: 'Jardines del Negralejo',
      address: 'Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid',
      dressCode: 'Formal',
      dressColor: '#6B705C',
      description: 'Disfruta de aperitivos y bebidas en los jardines mientras celebramos juntos.'
    },
    {
      id: 'banquete',
      icon: '03',
      type: 'Fiesta',
      title: 'Cena y Baile',
      time: '15:00 h',
      venue: 'Gran Salón del Negralejo',
      address: 'Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid',
      dressCode: 'Formal · Evitar blanco',
      dressColor: '#6B705C',
      description: 'La celebración continúa con una cena de gala seguida de baile hasta la madrugada.'
    }
  ];
}
