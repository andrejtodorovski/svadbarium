import { Injectable } from '@angular/core';
import { VenueSettings } from '../models/venue-settings.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  apply(settings: Pick<VenueSettings, 'themePrimaryColor' | 'themeDarkColor' | 'themeLightColor'>): void {
    const root = document.documentElement.style;
    root.setProperty('--venue-primary', settings.themePrimaryColor);
    root.setProperty('--venue-dark', settings.themeDarkColor);
    root.setProperty('--venue-light', settings.themeLightColor);
    root.setProperty('--venue-primary-contrast', this.contrastColor(settings.themePrimaryColor));
  }

  // Everything else (--venue-primary-light, --venue-sage, --mat-sys-primary-container, etc.)
  // is derived declaratively from these via color-mix() in styles.scss — only the raw brand
  // colors and this one contrast decision (which color-mix can't express) need JS.
  private contrastColor(hex: string): string {
    const value = hex.replace('#', '');
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
  }
}
