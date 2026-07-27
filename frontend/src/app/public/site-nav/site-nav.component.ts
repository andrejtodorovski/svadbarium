import { Component, HostListener, inject, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { VenueSettingsService } from '../../core/services/venue-settings.service';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './site-nav.component.html',
  styleUrl: './site-nav.component.scss',
})
export class SiteNavComponent {
  // Landing's hero is dark, so the nav can start transparent and pick up a solid background
  // only once scrolled. Calendar/menu have no dark hero under the nav, so they pass false and
  // the nav is solid from the start (avoids light-text-on-light-background at the very top).
  @Input() transparentAtTop = false;

  private readonly venueSettingsService = inject(VenueSettingsService);
  readonly venueName = signal('Wedding Venue');
  readonly scrolled = signal(false);

  constructor() {
    this.venueSettingsService.getSettings().subscribe((settings) => this.venueName.set(settings.name));
    this.scrolled.set(window.scrollY > 40);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }
}
