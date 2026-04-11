import { Component } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { HeroComponent } from './sections/hero/hero';
import { EventDetailsComponent } from './sections/event-details/event-details';
import { RsvpComponent } from './sections/rsvp/rsvp';
import { NeedToKnowComponent } from './sections/need-to-know/need-to-know';
import { RegistryComponent } from './sections/registry/registry';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    HeroComponent,
    EventDetailsComponent,
    RsvpComponent,
    NeedToKnowComponent,
    RegistryComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
