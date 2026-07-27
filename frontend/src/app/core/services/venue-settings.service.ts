import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { VenueSettings, VenueSettingsUpdateRequest } from '../models/venue-settings.model';

@Injectable({ providedIn: 'root' })
export class VenueSettingsService {
  private readonly http = inject(HttpClient);

  getSettings(): Observable<VenueSettings> {
    return this.http.get<VenueSettings>('/api/venue-settings');
  }

  updateSettings(request: VenueSettingsUpdateRequest): Observable<VenueSettings> {
    return this.http.put<VenueSettings>('/api/admin/venue-settings', request);
  }
}
