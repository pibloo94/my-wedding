import { Component, signal, Inject, PLATFORM_ID, OnInit, effect, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { HeroComponent } from './sections/hero/hero';
import { EventDetailsComponent } from './sections/event-details/event-details';
import { RsvpComponent } from './sections/rsvp/rsvp';
import { NeedToKnowComponent } from './sections/need-to-know/need-to-know';
import { RegistryComponent } from './sections/registry/registry';
import { PasswordGateComponent } from './shared/password-gate/password-gate';
import { TextSectionComponent } from './sections/text-section/text-section';
import { ContentService } from './core/services/content.service';
import { GuestAuthService } from './core/services/guest-auth.service';

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
    PasswordGateComponent,
    TextSectionComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  authenticated = signal(false);
  /** Se monta la web: al acertar la contraseña o si ya se había entrado antes. */
  siteReady = signal(false);

  private guest = inject(GuestAuthService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public content: ContentService) {
    // Si Firebase deja de aceptar la sesión (p. ej. se cambió la contraseña), se vuelve a pedir
    effect(() => {
      if (!this.guest.signedIn()) {
        this.authenticated.set(false);
        this.siteReady.set(false);
      }
    });
  }

  ngOnInit() {
    // Sesión de invitado guardada de otra visita (30 días)
    if (isPlatformBrowser(this.platformId) && this.guest.signedIn()) {
      this.authenticated.set(true);
      this.siteReady.set(true);
    }
  }

  onAuthenticated() {
    this.siteReady.set(true);
    this.authenticated.set(true);
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }
}
