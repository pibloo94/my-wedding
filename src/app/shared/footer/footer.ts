import { Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(public content: ContentService) {}
}
