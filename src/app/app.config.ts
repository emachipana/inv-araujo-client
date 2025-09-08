import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from '../environments/environment';
import { registerLocaleData } from '@angular/common';
import localeEsPE from '@angular/common/locales/es-PE';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

registerLocaleData(localeEsPE);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([AuthInterceptor])),
    provideAnimationsAsync(),
    provideAnimations(),
    provideNgxStripe(environment.stripe_public_key),
    provideHotToastConfig({
      position: "top-center"
    }),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false
        }
      }
    }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
  ]
};
