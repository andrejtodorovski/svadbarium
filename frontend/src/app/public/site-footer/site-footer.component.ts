import { Component, inject, signal } from '@angular/core';
import { VenueSettingsService } from '../../core/services/venue-settings.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
})
export class SiteFooterComponent {
  private readonly venueSettingsService = inject(VenueSettingsService);

  readonly venueName = signal('Венчална сала');
  readonly currentYear = new Date().getFullYear();

  constructor() {
    this.fetchVenueName();
  }

  // A failed fetch here would otherwise leave the placeholder name showing indefinitely for
  // as long as the visitor stays on this page (no user-facing retry control makes sense for a
  // passive brand label) — quietly retry every few seconds until it succeeds.
  private fetchVenueName(): void {
    this.venueSettingsService.getSettings().subscribe({
      next: (settings) => this.venueName.set(settings.name),
      error: () => setTimeout(() => this.fetchVenueName(), 5000),
    });
  }
}
