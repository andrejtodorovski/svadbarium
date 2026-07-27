import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuFileMeta } from '../models/menu-file.model';
import { ReorderItem } from '../models/reorder-item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  list(): Observable<MenuFileMeta[]> {
    return this.http.get<MenuFileMeta[]>('/api/menus');
  }

  fileUrl(id: number): string {
    return `/api/menus/${id}/file`;
  }

  upload(file: File, title: string | null): Observable<MenuFileMeta> {
    const formData = new FormData();
    formData.append('file', file);
    let params = new HttpParams();
    if (title) {
      params = params.set('title', title);
    }
    return this.http.post<MenuFileMeta>('/api/admin/menus', formData, { params });
  }

  reorder(items: ReorderItem[]): Observable<void> {
    return this.http.put<void>('/api/admin/menus/reorder', items);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/menus/${id}`);
  }
}
