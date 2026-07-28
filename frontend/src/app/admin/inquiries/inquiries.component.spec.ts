import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InquiriesComponent } from './inquiries.component';
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

describe('InquiriesComponent', () => {
  let component: InquiriesComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InquiriesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    component = TestBed.createComponent(InquiriesComponent).componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/api/admin/inquiries').flush([
      recordWith({ id: 1, name: 'Elena', handled: false }),
      recordWith({ id: 2, name: 'Marko', handled: true }),
    ]);
  });

  it('shows every enquiry when hideHandled is off', () => {
    expect(component.visibleInquiries().length).toBe(2);
  });

  it('filters out handled enquiries when hideHandled is on', () => {
    component.hideHandled.set(true);

    const visible = component.visibleInquiries();

    expect(visible.length).toBe(1);
    expect(visible[0].name).toBe('Elena');
  });

  it('toggleHandled sends the flipped value and updates local state on success', () => {
    const elena = component.inquiries().find((i) => i.name === 'Elena')!;

    component.toggleHandled(elena);

    const req = httpMock.expectOne('/api/admin/inquiries/1/handled');
    expect(req.request.body).toEqual({ handled: true });
    req.flush(recordWith({ id: 1, name: 'Elena', handled: true }));

    expect(component.inquiries().find((i) => i.id === 1)?.handled).toBeTrue();
  });

  it('delete removes the record and refetches the list after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.delete(1);

    httpMock.expectOne('/api/admin/inquiries/1').flush(null);
    httpMock.expectOne('/api/admin/inquiries').flush([recordWith({ id: 2, name: 'Marko' })]);

    expect(component.inquiries().length).toBe(1);
  });

  it('delete does nothing when the confirmation is declined', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.delete(1);

    httpMock.expectNone('/api/admin/inquiries/1');
    expect(component.inquiries().length).toBe(2);
  });
});
