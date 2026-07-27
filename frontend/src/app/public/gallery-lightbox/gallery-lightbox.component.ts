import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface GalleryLightboxData {
  src: string;
  caption: string | null;
}

@Component({
  selector: 'app-gallery-lightbox',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './gallery-lightbox.component.html',
  styleUrl: './gallery-lightbox.component.scss',
})
export class GalleryLightboxComponent {
  readonly data = inject<GalleryLightboxData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<GalleryLightboxComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
