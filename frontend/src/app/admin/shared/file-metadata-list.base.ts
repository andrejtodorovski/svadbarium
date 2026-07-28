import { signal } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ReorderItem } from '../../core/models/reorder-item.model';

export interface SortableItem {
  id: number;
}

export abstract class FileMetadataListBase<T extends SortableItem> {
  protected abstract readonly snackBar: MatSnackBar;
  protected abstract readonly uploadedMessage: string;
  protected abstract readonly editFailedMessage: string;
  protected abstract readonly deleteConfirmMessage: string;

  readonly items = signal<T[]>([]);
  readonly uploading = signal(false);
  readonly editingId = signal<number | null>(null);
  selectedFile: File | null = null;

  protected abstract fetchList(): Observable<T[]>;
  protected abstract uploadFile(file: File, value: string | null): Observable<T>;
  protected abstract updateField(id: number, value: string | null): Observable<T>;
  protected abstract reorderItems(items: ReorderItem[]): Observable<void>;
  protected abstract deleteItem(id: number): Observable<void>;

  protected refresh(): void {
    this.fetchList().subscribe((items) => this.items.set(items));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  protected performUpload(value: string | null, onUploaded: () => void): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploading.set(true);
    this.uploadFile(this.selectedFile, value).subscribe({
      next: () => {
        this.uploading.set(false);
        this.selectedFile = null;
        onUploaded();
        this.refresh();
        this.snackBar.open(this.uploadedMessage, 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open(err?.error?.message || 'Upload failed', 'Dismiss', { duration: 4000 });
      },
    });
  }

  startEdit(item: T): void {
    this.editingId.set(item.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  protected performSave(id: number, value: string | null): void {
    this.updateField(id, value).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((item) => (item.id === id ? updated : item)));
        this.editingId.set(null);
      },
      error: () => this.snackBar.open(this.editFailedMessage, 'Dismiss', { duration: 4000 }),
    });
  }

  drop(event: CdkDragDrop<T[]>): void {
    const current = [...this.items()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.items.set(current);
    const reorderItems = current.map((item, index) => ({ id: item.id, sortOrder: index }));
    this.reorderItems(reorderItems).subscribe();
  }

  delete(id: number): void {
    if (!confirm(this.deleteConfirmMessage)) {
      return;
    }
    this.deleteItem(id).subscribe(() => this.refresh());
  }
}
