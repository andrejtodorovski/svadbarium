import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VenueSettingsService } from '../../core/services/venue-settings.service';
import { ThemeService } from '../../core/services/theme.service';
import { VenueSettings } from '../../core/models/venue-settings.model';
import { contrastRatio } from '../../shared/color-contrast';

// WCAG AA's own minimum for large text/UI components — the most lenient tier, so this only
// flags combinations that would fail even that bar, not merely "not ideal for small print".
const MIN_CONTRAST_RATIO = 3;

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly venueSettingsService = inject(VenueSettingsService);
  private readonly themeService = inject(ThemeService);
  private readonly snackBar = inject(MatSnackBar);

  readonly settings = signal<VenueSettings | null>(null);
  readonly saving = signal(false);

  instagram = '';
  facebook = '';

  constructor() {
    this.venueSettingsService.getSettings().subscribe((settings) => {
      this.settings.set(settings);
      this.instagram = settings.socialLinks['instagram'] ?? '';
      this.facebook = settings.socialLinks['facebook'] ?? '';
    });
  }

  // Called directly from the template rather than a computed() signal — ngModel mutates `s` in
  // place without ever reassigning the settings() signal, so a computed() wouldn't re-run on
  // every color tweak; a plain method re-evaluates on each change-detection pass same as any
  // other template expression, which is what we actually want here.
  contrastWarnings(s: VenueSettings): string[] {
    const pairs: [string, string, string][] = [
      [s.themeDarkColor, s.themeLightColor, 'Dark background and Light background'],
      [s.themePrimaryColor, s.themeLightColor, 'Accent (gold) and Light background'],
      [s.themePrimaryColor, s.themeDarkColor, 'Accent (gold) and Dark background'],
    ];
    return pairs.filter(([a, b]) => contrastRatio(a, b) < MIN_CONTRAST_RATIO).map(([, , label]) => label);
  }

  save(): void {
    const current = this.settings();
    if (!current) {
      return;
    }
    this.saving.set(true);
    const socialLinks: Record<string, string> = {};
    if (this.instagram) socialLinks['instagram'] = this.instagram;
    if (this.facebook) socialLinks['facebook'] = this.facebook;

    this.venueSettingsService
      .updateSettings({
        name: current.name,
        description: current.description,
        address: current.address,
        latitude: current.latitude,
        longitude: current.longitude,
        guestCapacityMin: current.guestCapacityMin,
        guestCapacityMax: current.guestCapacityMax,
        parkingInfo: current.parkingInfo,
        contactEmail: current.contactEmail,
        contactPhone: current.contactPhone,
        socialLinks,
        themePrimaryColor: current.themePrimaryColor,
        themeDarkColor: current.themeDarkColor,
        themeLightColor: current.themeLightColor,
        googleReviewsUrl: current.googleReviewsUrl,
        mapEmbedUrl: current.mapEmbedUrl,
      })
      .subscribe({
        next: (updated) => {
          this.settings.set(updated);
          this.themeService.apply(updated);
          this.saving.set(false);
          this.snackBar.open('Venue settings saved', 'Dismiss', { duration: 3000 });
        },
        error: () => {
          this.saving.set(false);
          this.snackBar.open('Failed to save venue settings', 'Dismiss', { duration: 4000 });
        },
      });
  }
}
