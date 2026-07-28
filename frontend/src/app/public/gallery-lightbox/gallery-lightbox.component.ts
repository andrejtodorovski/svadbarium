import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface GalleryLightboxImage {
  src: string;
  caption: string | null;
}

export interface GalleryLightboxData {
  images: GalleryLightboxImage[];
  startIndex: number;
}

@Component({
  selector: 'app-gallery-lightbox',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './gallery-lightbox.component.html',
  styleUrl: './gallery-lightbox.component.scss',
})
export class GalleryLightboxComponent {
  private readonly data = inject<GalleryLightboxData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<GalleryLightboxComponent>);

  readonly hasMultiple = this.data.images.length > 1;
  private readonly currentIndex = signal(this.data.startIndex);
  readonly current = computed(() => this.data.images[this.currentIndex()]);

  close(): void {
    this.dialogRef.close();
  }

  next(): void {
    this.currentIndex.update((i) => (i + 1) % this.data.images.length);
  }

  previous(): void {
    this.currentIndex.update((i) => (i - 1 + this.data.images.length) % this.data.images.length);
  }

  // MatDialog already closes on Escape by default, so only arrow keys need handling here.
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.hasMultiple) {
      return;
    }
    if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.previous();
    }
  }
}
