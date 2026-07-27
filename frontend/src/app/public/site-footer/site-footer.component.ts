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

  readonly venueName = signal('Wedding Venue');
  readonly currentYear = new Date().getFullYear();

  constructor() {
    this.venueSettingsService.getSettings().subscribe((settings) => this.venueName.set(settings.name));
  }
}
