import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GalleryService } from './gallery.service';
import { GalleryImageMeta } from '../models/gallery-image.model';

describe('GalleryService', () => {
  let service: GalleryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GalleryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches the public gallery list', () => {
    const images: GalleryImageMeta[] = [{ id: 1, caption: 'Main hall', sortOrder: 0, contentType: 'image/jpeg' }];

    service.list().subscribe((result) => expect(result).toEqual(images));

    const req = httpMock.expectOne('/api/gallery');
    expect(req.request.method).toBe('GET');
    req.flush(images);
  });

  it('builds the direct file URL for a given image id without a network call', () => {
    expect(service.fileUrl(42)).toBe('/api/gallery/42/file');
  });

  it('uploads a file with an optional caption as multipart form data', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    service.upload(file, 'The Main Hall').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/admin/gallery' && r.params.get('caption') === 'The Main Hall',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({ id: 1, caption: 'The Main Hall', sortOrder: 0, contentType: 'image/jpeg' });
  });

  it('omits the caption param entirely when none is given', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    service.upload(file, null).subscribe();

    const req = httpMock.expectOne('/api/admin/gallery');
    expect(req.request.params.has('caption')).toBeFalse();
    req.flush({ id: 1, caption: null, sortOrder: 0, contentType: 'image/jpeg' });
  });

  it('sends a reorder request with the new sort order list', () => {
    service.reorder([{ id: 1, sortOrder: 1 }, { id: 2, sortOrder: 0 }]).subscribe();

    const req = httpMock.expectOne('/api/admin/gallery/reorder');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual([{ id: 1, sortOrder: 1 }, { id: 2, sortOrder: 0 }]);
    req.flush(null);
  });

  it('sends a caption update as a PUT to the item URL', () => {
    service.updateCaption(9, 'New caption').subscribe();

    const req = httpMock.expectOne('/api/admin/gallery/9');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ caption: 'New caption' });
    req.flush({ id: 9, caption: 'New caption', sortOrder: 0, contentType: 'image/jpeg' });
  });

  it('sends a delete request for the given image id', () => {
    service.delete(7).subscribe();

    const req = httpMock.expectOne('/api/admin/gallery/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
