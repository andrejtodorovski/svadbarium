import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Review, ReviewRequest } from '../models/review.model';
import { ReorderableCrudService } from './reorderable-crud.service';

@Injectable({ providedIn: 'root' })
export class ReviewService extends ReorderableCrudService<Review> {
  constructor() {
    super('/api/reviews', '/api/admin/reviews');
  }

  create(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.adminBaseUrl, request);
  }

  update(id: number, request: ReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.adminBaseUrl}/${id}`, request);
  }
}
