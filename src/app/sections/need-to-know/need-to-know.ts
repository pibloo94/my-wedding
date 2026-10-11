import { Component } from '@angular/core';
import { ScrollAnimateDirective } from '../../shared/scroll-animate.directive';
import { IconComponent } from '../../shared/icon/icon.component';
import { ContentService } from '../../core/services/content.service';
import { InfoCard, SectionConfig } from '../../core/content/wedding-content';

@Component({
  selector: 'app-need-to-know',
  standalone: true,
  imports: [ScrollAnimateDirective, IconComponent],
  templateUrl: './need-to-know.html',
  styleUrl: './need-to-know.scss'
})
export class NeedToKnowComponent {
  constructor(private content: ContentService) {}

  /** Tarjetas de información práctica: se editan desde la app de gestión. */
  get sec(): SectionConfig {
    return this.content.section('needToKnow');
  }

  get cards(): InfoCard[] {
    return this.content.data().needToKnow;
  }
}
