import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { VenueSettingsService } from './core/services/venue-settings.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly venueSettingsService = inject(VenueSettingsService);
  private readonly themeService = inject(ThemeService);
  private readonly titleService = inject(Title);

  constructor() {
    this.venueSettingsService.getSettings().subscribe((settings) => {
      this.themeService.apply(settings);
      this.titleService.setTitle(settings.name);
    });
  }
}
