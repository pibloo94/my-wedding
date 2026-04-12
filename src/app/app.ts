import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { HeroComponent } from './sections/hero/hero';
import { EventDetailsComponent } from './sections/event-details/event-details';
import { RsvpComponent } from './sections/rsvp/rsvp';
import { NeedToKnowComponent } from './sections/need-to-know/need-to-know';
import { RegistryComponent } from './sections/registry/registry';
import { PasswordGateComponent } from './shared/password-gate/password-gate';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    HeroComponent,
    EventDetailsComponent,
    RsvpComponent,
    NeedToKnowComponent,
    RegistryComponent,
    PasswordGateComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  authenticated = signal(false);

  onAuthenticated() {
    this.authenticated.set(true);
  }
}
