import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { MenuFileMeta } from '../../core/models/menu-file.model';
import { ReorderItem } from '../../core/models/reorder-item.model';
import { FileMetadataListBase } from '../shared/file-metadata-list.base';

@Component({
  selector: 'app-admin-menus',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag, MatButtonModule, MatIconModule],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.scss',
})
export class MenusComponent extends FileMetadataListBase<MenuFileMeta> {
  private readonly menuService = inject(MenuService);
  protected readonly snackBar = inject(MatSnackBar);
  protected readonly uploadedMessage = 'Menu file uploaded';
  protected readonly editFailedMessage = 'Failed to update title';
  protected readonly deleteConfirmMessage = 'Delete this menu file?';

  readonly menus = this.items;
  title = '';
  editTitle = '';

  constructor() {
    super();
    this.refresh();
  }

  protected fetchList(): Observable<MenuFileMeta[]> {
    return this.menuService.list();
  }

  protected uploadFile(file: File, value: string | null): Observable<MenuFileMeta> {
    return this.menuService.upload(file, value);
  }

  protected updateField(id: number, value: string | null): Observable<MenuFileMeta> {
    return this.menuService.updateTitle(id, value);
  }

  protected reorderItems(items: ReorderItem[]): Observable<void> {
    return this.menuService.reorder(items);
  }

  protected deleteItem(id: number): Observable<void> {
    return this.menuService.delete(id);
  }

  fileUrl(id: number): string {
    return this.menuService.fileUrl(id);
  }

  isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  upload(): void {
    this.performUpload(this.title || null, () => (this.title = ''));
  }

  override startEdit(menu: MenuFileMeta): void {
    super.startEdit(menu);
    this.editTitle = menu.title ?? '';
  }

  saveTitle(id: number): void {
    this.performSave(id, this.editTitle || null);
  }
}
