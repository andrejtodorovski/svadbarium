import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GalleryService } from '../../core/services/gallery.service';
import { GalleryImageMeta } from '../../core/models/gallery-image.model';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag, MatButtonModule, MatIconModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  private readonly galleryService = inject(GalleryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly images = signal<GalleryImageMeta[]>([]);
  readonly uploading = signal(false);
  caption = '';
  selectedFile: File | null = null;

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.galleryService.list().subscribe((images) => this.images.set(images));
  }

  fileUrl(id: number): string {
    return this.galleryService.fileUrl(id);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploading.set(true);
    this.galleryService.upload(this.selectedFile, this.caption || null).subscribe({
      next: () => {
        this.uploading.set(false);
        this.caption = '';
        this.selectedFile = null;
        this.refresh();
        this.snackBar.open('Photo uploaded', 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open(err?.error?.message || 'Upload failed', 'Dismiss', { duration: 4000 });
      },
    });
  }

  drop(event: CdkDragDrop<GalleryImageMeta[]>): void {
    const current = [...this.images()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.images.set(current);
    const reorderItems = current.map((image, index) => ({ id: image.id, sortOrder: index }));
    this.galleryService.reorder(reorderItems).subscribe();
  }

  delete(id: number): void {
    if (!confirm('Delete this photo?')) {
      return;
    }
    this.galleryService.delete(id).subscribe(() => this.refresh());
  }
}
