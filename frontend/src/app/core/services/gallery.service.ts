import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GalleryImageMeta } from '../models/gallery-image.model';
import { ReorderableCrudService } from './reorderable-crud.service';

@Injectable({ providedIn: 'root' })
export class GalleryService extends ReorderableCrudService<GalleryImageMeta> {
  constructor() {
    super('/api/gallery', '/api/admin/gallery');
  }

  fileUrl(id: number): string {
    return `/api/gallery/${id}/file`;
  }

  upload(file: File, caption: string | null): Observable<GalleryImageMeta> {
    return this.uploadFile(file, 'caption', caption);
  }

  updateCaption(id: number, caption: string | null): Observable<GalleryImageMeta> {
    return this.updateField(id, 'caption', caption);
  }
}
