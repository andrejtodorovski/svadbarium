import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Review, ReviewRequest } from '../models/review.model';
import { ReorderItem } from '../models/reorder-item.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);

  list(): Observable<Review[]> {
    return this.http.get<Review[]>('/api/reviews');
  }

  create(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>('/api/admin/reviews', request);
  }

  update(id: number, request: ReviewRequest): Observable<Review> {
    return this.http.put<Review>(`/api/admin/reviews/${id}`, request);
  }

  reorder(items: ReorderItem[]): Observable<void> {
    return this.http.put<void>('/api/admin/reviews/reorder', items);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/reviews/${id}`);
  }
}
