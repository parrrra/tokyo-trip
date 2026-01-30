import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from './environments/environment';

import { App } from './app/app';

// 🔥 Firebase
const firebaseApp = initializeApp(environment.firebase);
export const db = getFirestore(firebaseApp);

bootstrapApplication(App, {
  providers: [
    provideRouter(routes)
  ]
});
