import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InquiryRequest } from '../models/inquiry.model';
import { InquiryRecord } from '../models/inquiry-record.model';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);

  submit(request: InquiryRequest): Observable<void> {
    return this.http.post<void>('/api/inquiries', request);
  }

  list(): Observable<InquiryRecord[]> {
    return this.http.get<InquiryRecord[]>('/api/admin/inquiries');
  }

  setHandled(id: number, handled: boolean): Observable<InquiryRecord> {
    return this.http.put<InquiryRecord>(`/api/admin/inquiries/${id}/handled`, { handled });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/inquiries/${id}`);
  }
}
