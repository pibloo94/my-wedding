import { Component, signal, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class App implements OnInit {
  authenticated = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const isAuth = localStorage.getItem('wedding_auth_v1') === 'true';
      if (isAuth) {
        this.authenticated.set(true);
      }
    }
  }

  onAuthenticated() {
    this.authenticated.set(true);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('wedding_auth_v1', 'true');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }
}
