import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VenueSettingsService } from '../../core/services/venue-settings.service';
import { GalleryService } from '../../core/services/gallery.service';
import { VenueSettings } from '../../core/models/venue-settings.model';
import { GalleryImageMeta } from '../../core/models/gallery-image.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly venueSettingsService = inject(VenueSettingsService);
  private readonly galleryService = inject(GalleryService);

  readonly venueSettings = signal<VenueSettings | null>(null);
  readonly gallery = signal<GalleryImageMeta[]>([]);

  constructor() {
    this.venueSettingsService.getSettings().subscribe((settings) => this.venueSettings.set(settings));
    this.galleryService.list().subscribe((images) => this.gallery.set(images));
  }

  fileUrl(id: number): string {
    return this.galleryService.fileUrl(id);
  }

  socialEntries(): [string, string][] {
    const links = this.venueSettings()?.socialLinks ?? {};
    return Object.entries(links);
  }
}
