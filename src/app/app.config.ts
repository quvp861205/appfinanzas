import { ApplicationConfig, provideZoneChangeDetection, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';

// Registrar los datos de la localización en español
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Configura la aplicación de Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // Configura la Realtime Database
    provideDatabase(() => getDatabase()),
    // Configura Firebase Authentication
    provideAuth(() => getAuth()),
    // Configura las animaciones de Angular Material de forma asíncrona
    provideAnimationsAsync(), 
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    // Establecer el LOCALE_ID a español
    { provide: LOCALE_ID, useValue: 'es' }
  ],
};
