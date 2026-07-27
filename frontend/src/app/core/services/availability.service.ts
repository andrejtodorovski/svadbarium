import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UnavailableDate } from '../models/unavailable-date.model';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly http = inject(HttpClient);

  getUnavailable(from: string, to: string): Observable<UnavailableDate[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<UnavailableDate[]>('/api/availability', { params });
  }

  setUnavailable(date: string, note?: string): Observable<void> {
    return this.http.post<void>(`/api/admin/availability/${date}`, note ? { note } : {});
  }

  reset(date: string): Observable<void> {
    return this.http.delete<void>(`/api/admin/availability/${date}`);
  }
}
