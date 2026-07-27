import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService } from '../../core/services/menu.service';
import { MenuFileMeta } from '../../core/models/menu-file.model';

@Component({
  selector: 'app-admin-menus',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag, MatButtonModule, MatIconModule],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.scss',
})
export class MenusComponent {
  private readonly menuService = inject(MenuService);
  private readonly snackBar = inject(MatSnackBar);

  readonly menus = signal<MenuFileMeta[]>([]);
  readonly uploading = signal(false);
  title = '';
  selectedFile: File | null = null;

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.menuService.list().subscribe((menus) => this.menus.set(menus));
  }

  fileUrl(id: number): string {
    return this.menuService.fileUrl(id);
  }

  isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
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
    this.menuService.upload(this.selectedFile, this.title || null).subscribe({
      next: () => {
        this.uploading.set(false);
        this.title = '';
        this.selectedFile = null;
        this.refresh();
        this.snackBar.open('Menu file uploaded', 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open(err?.error?.message || 'Upload failed', 'Dismiss', { duration: 4000 });
      },
    });
  }

  drop(event: CdkDragDrop<MenuFileMeta[]>): void {
    const current = [...this.menus()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.menus.set(current);
    const reorderItems = current.map((menu, index) => ({ id: menu.id, sortOrder: index }));
    this.menuService.reorder(reorderItems).subscribe();
  }

  delete(id: number): void {
    if (!confirm('Delete this menu file?')) {
      return;
    }
    this.menuService.delete(id).subscribe(() => this.refresh());
  }
}
