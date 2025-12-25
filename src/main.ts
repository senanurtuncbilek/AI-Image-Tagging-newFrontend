import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // 'App' değil 'AppComponent' olmalı

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));