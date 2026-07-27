import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GalleryImageMeta } from '../models/gallery-image.model';
import { ReorderItem } from '../models/reorder-item.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly http = inject(HttpClient);

  list(): Observable<GalleryImageMeta[]> {
    return this.http.get<GalleryImageMeta[]>('/api/gallery');
  }

  fileUrl(id: number): string {
    return `/api/gallery/${id}/file`;
  }

  upload(file: File, caption: string | null): Observable<GalleryImageMeta> {
    const formData = new FormData();
    formData.append('file', file);
    let params = new HttpParams();
    if (caption) {
      params = params.set('caption', caption);
    }
    return this.http.post<GalleryImageMeta>('/api/admin/gallery', formData, { params });
  }

  reorder(items: ReorderItem[]): Observable<void> {
    return this.http.put<void>('/api/admin/gallery/reorder', items);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/gallery/${id}`);
  }
}
