import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';
import { ContentService } from '../../core/services/content.service';
import { WeddingEvent } from '../../core/content/wedding-content';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [ScrollAnimateDirective, IconComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetailsComponent {
  constructor(private content: ContentService) {}

  /** Programa del día: se edita desde la app de gestión (ver ContentService). */
  get events(): WeddingEvent[] {
    return this.content.data().events;
  }
}
