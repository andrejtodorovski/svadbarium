import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InquiryService } from './inquiry.service';
import { InquiryRequest } from '../models/inquiry.model';

describe('InquiryService', () => {
  let service: InquiryService;
  let httpMock: HttpTestingController;

  const request: InquiryRequest = {
    name: 'Elena',
    email: 'elena@example.com',
    phone: '555-1234',
    eventDate: '2026-09-12',
    message: 'Is the 12th available?',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InquiryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('submits a public enquiry', () => {
    service.submit(request).subscribe();

    const req = httpMock.expectOne('/api/inquiries');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(null);
  });

  it('fetches the admin enquiries list', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('/api/admin/inquiries');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('sends the new handled value as the request body', () => {
    service.setHandled(3, true).subscribe();

    const req = httpMock.expectOne('/api/admin/inquiries/3/handled');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ handled: true });
    req.flush({});
  });

  it('deletes an enquiry by id', () => {
    service.delete(3).subscribe();

    const req = httpMock.expectOne('/api/admin/inquiries/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
