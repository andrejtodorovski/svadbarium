import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { ReviewRequest } from '../models/review.model';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;

  const request: ReviewRequest = {
    reviewerName: 'Elena',
    reviewText: 'Wonderful venue',
    reviewDate: '2026-06-14',
    googleReviewUrl: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches the public reviews list', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('/api/reviews');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a review via the admin endpoint', () => {
    service.create(request).subscribe();

    const req = httpMock.expectOne('/api/admin/reviews');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 1, sortOrder: 0, ...request });
  });

  it('updates a review by id', () => {
    service.update(5, request).subscribe();

    const req = httpMock.expectOne('/api/admin/reviews/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 5, sortOrder: 0, ...request });
  });

  it('sends a reorder request', () => {
    service.reorder([{ id: 1, sortOrder: 1 }]).subscribe();

    const req = httpMock.expectOne('/api/admin/reviews/reorder');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual([{ id: 1, sortOrder: 1 }]);
    req.flush(null);
  });

  it('deletes a review by id', () => {
    service.delete(3).subscribe();

    const req = httpMock.expectOne('/api/admin/reviews/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
