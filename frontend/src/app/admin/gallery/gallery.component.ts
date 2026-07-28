import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { GalleryService } from '../../core/services/gallery.service';
import { GalleryImageMeta } from '../../core/models/gallery-image.model';
import { ReorderItem } from '../../core/models/reorder-item.model';
import { FileMetadataListBase } from '../shared/file-metadata-list.base';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag, MatButtonModule, MatIconModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent extends FileMetadataListBase<GalleryImageMeta> {
  private readonly galleryService = inject(GalleryService);
  protected readonly snackBar = inject(MatSnackBar);
  protected readonly uploadedMessage = 'Photo uploaded';
  protected readonly editFailedMessage = 'Failed to update caption';
  protected readonly deleteConfirmMessage = 'Delete this photo?';

  readonly images = this.items;
  caption = '';
  editCaption = '';

  constructor() {
    super();
    this.refresh();
  }

  protected fetchList(): Observable<GalleryImageMeta[]> {
    return this.galleryService.list();
  }

  protected uploadFile(file: File, value: string | null): Observable<GalleryImageMeta> {
    return this.galleryService.upload(file, value);
  }

  protected updateField(id: number, value: string | null): Observable<GalleryImageMeta> {
    return this.galleryService.updateCaption(id, value);
  }

  protected reorderItems(items: ReorderItem[]): Observable<void> {
    return this.galleryService.reorder(items);
  }

  protected deleteItem(id: number): Observable<void> {
    return this.galleryService.delete(id);
  }

  fileUrl(id: number): string {
    return this.galleryService.fileUrl(id);
  }

  upload(): void {
    this.performUpload(this.caption || null, () => (this.caption = ''));
  }

  override startEdit(image: GalleryImageMeta): void {
    super.startEdit(image);
    this.editCaption = image.caption ?? '';
  }

  saveCaption(id: number): void {
    this.performSave(id, this.editCaption || null);
  }
}
