import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';

interface WeddingEvent {
  id: string;
  icon: string;
  type: string;
  title: string;
  timeStart: string;
  timeEnd: string;
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
  imports: [ScrollAnimateDirective, IconComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetailsComponent {
  events: WeddingEvent[] = [
    {
      id: 'ceremonia',
      icon: 'heart',
      type: 'Ceremonia',
      title: 'Ceremonia Civil',
      timeStart: '13:00 h',
      timeEnd: '13:30 h',
      venue: 'Jardines del Negralejo',
      address: 'Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid',
      mapsUrl: 'https://www.google.com/maps/place/Jardines+del+Negralejo/@40.4085192,-3.51632,17z/data=!4m6!3m5!1s0xd423b214854bab3:0x664516d941116999!8m2!3d40.4085706!4d-3.5162788!16s%2Fg%2F11thnjv_ym?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D',
      dressCode: 'Traje Formal · Evitar blanco',
      dressColor: '#B15C38',
      description: 'Os esperamos para dar comienzo a esta historia juntos. La ceremonia tendrá lugar en el precioso jardín del palacio.'
    },
    {
      id: 'coctel',
      icon: 'glass',
      type: 'Cóctel',
      title: 'Cóctel de Bienvenida',
      timeStart: '13:30 h',
      timeEnd: '15:00 h',
      venue: 'Jardines del Negralejo',
      address: 'Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid',
      dressCode: 'Traje Formal · Evitar blanco',
      dressColor: '#B15C38',
      description: 'Disfruta de aperitivos y bebidas en los jardines mientras celebramos juntos el inicio de nuestra nueva vida.'
    },
    {
      id: 'banquete',
      icon: 'utensils',
      type: 'Banquete',
      title: 'Comida',
      timeStart: '15:00 h',
      timeEnd: '18:30 h',
      venue: 'Gran Salón del Negralejo',
      address: 'Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid',
      dressCode: 'Traje Formal · Evitar blanco',
      dressColor: '#B15C38',
      description: 'La celebración continúa con una comida de gala en el Gran Salón. ¡Buen provecho!'
    },
    {
      id: 'baile',
      icon: 'party-popper',
      type: 'Fiesta',
      title: 'Baile',
      timeStart: '18:30 h',
      timeEnd: '02:00 h',
      venue: 'Gran Salón del Negralejo',
      address: 'Carr. de Mejorada, km 2,5, 28522 Rivas-Vaciamadrid, Madrid',
      dressCode: 'Traje Formal · Evitar blanco',
      dressColor: '#B15C38',
      description: 'Abrimos la pista y bailamos hasta la madrugada. ¡Que empiece la fiesta!'
    }
  ];
}
