import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { InquiryRecord } from '../../core/models/inquiry-record.model';

function recordWith(overrides: Partial<InquiryRecord>): InquiryRecord {
  return {
    id: 1,
    name: 'Elena',
    email: 'elena@example.com',
    phone: null,
    eventDate: null,
    message: 'Hi',
    handled: false,
    createdAt: '2026-07-28T00:00:00Z',
    ...overrides,
  };
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    component = TestBed.createComponent(DashboardComponent).componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/api/gallery').flush([
      { id: 1, caption: 'Main hall', sortOrder: 0, contentType: 'image/jpeg' },
      { id: 2, caption: null, sortOrder: 1, contentType: 'image/jpeg' },
    ]);
    httpMock.expectOne('/api/menus').flush([{ id: 1, title: 'Dinner', sortOrder: 0, contentType: 'application/pdf' }]);
    httpMock.expectOne('/api/reviews').flush([]);
  });

  it('counts gallery photos, menu files, and reviews from their respective lists', () => {
    httpMock.expectOne('/api/admin/inquiries').flush([]);

    expect(component.galleryCount()).toBe(2);
    expect(component.menuCount()).toBe(1);
    expect(component.reviewCount()).toBe(0);
  });

  it('counts unhandled inquiries and limits recent inquiries to the newest five', () => {
    const records = Array.from({ length: 7 }, (_, i) =>
      recordWith({ id: i + 1, name: `Guest ${i + 1}`, handled: i % 2 === 0 }),
    );

    httpMock.expectOne('/api/admin/inquiries').flush(records);

    expect(component.recentInquiries().length).toBe(5);
    expect(component.recentInquiries()[0].name).toBe('Guest 1');
    expect(component.unhandledCount()).toBe(3);
  });
});
