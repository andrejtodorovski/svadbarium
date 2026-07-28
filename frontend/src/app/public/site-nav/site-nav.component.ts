import { Component, HostListener, inject, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VenueSettingsService } from '../../core/services/venue-settings.service';

// Matches the breakpoint the mobile-menu CSS switches at — kept in sync so the resize
// listener below knows exactly when to auto-close a menu left open from a narrower width.
const MOBILE_BREAKPOINT_PX = 720;

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './site-nav.component.html',
  styleUrl: './site-nav.component.scss',
})
export class SiteNavComponent {
  // Landing's hero is dark, so the nav can start transparent and pick up a solid background
  // only once scrolled. Calendar/menu have no dark hero under the nav, so they pass false and
  // the nav is solid from the start (avoids light-text-on-light-background at the very top).
  @Input() transparentAtTop = false;

  private readonly venueSettingsService = inject(VenueSettingsService);
  readonly venueName = signal('Венчална сала');
  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);

  constructor() {
    this.fetchVenueName();
    this.scrolled.set(window.scrollY > 40);
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

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > MOBILE_BREAKPOINT_PX) {
      this.mobileMenuOpen.set(false);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
