import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withInMemoryScrolling sets history.scrollRestoration = 'manual', which is required —
    // without it the browser's own "auto" scroll restoration fights any programmatic scroll
    // right after a navigation and resets it back to 0. Its own anchor-scroll attempt still
    // fires too early for LandingComponent's async-gated sections, so scrollToFragment there
    // provides the actual working scroll; this is what stops the browser from undoing it.
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
};
