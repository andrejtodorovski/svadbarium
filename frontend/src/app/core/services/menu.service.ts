import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuFileMeta } from '../models/menu-file.model';
import { ReorderableCrudService } from './reorderable-crud.service';

@Injectable({ providedIn: 'root' })
export class MenuService extends ReorderableCrudService<MenuFileMeta> {
  constructor() {
    super('/api/menus', '/api/admin/menus');
  }

  fileUrl(id: number): string {
    return `/api/menus/${id}/file`;
  }

  upload(file: File, title: string | null): Observable<MenuFileMeta> {
    return this.uploadFile(file, 'title', title);
  }

  updateTitle(id: number, title: string | null): Observable<MenuFileMeta> {
    return this.updateField(id, 'title', title);
  }
}
