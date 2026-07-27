import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InquiryRequest } from '../models/inquiry.model';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);

  submit(request: InquiryRequest): Observable<void> {
    return this.http.post<void>('/api/inquiries', request);
  }
}
