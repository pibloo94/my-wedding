import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { FirebaseService } from './core/firebase.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // Rutas con # (…/admin/#/mesas): GitHub Pages no sabe servir rutas internas de una app
    provideRouter(routes, withHashLocation(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideAppInitializer(() => inject(FirebaseService).init())
  ]
};
