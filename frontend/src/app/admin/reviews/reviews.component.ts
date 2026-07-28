import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReviewService } from '../../core/services/review.service';
import { Review, ReviewRequest } from '../../core/models/review.model';

const EMPTY_FORM: ReviewRequest = {
  reviewerName: '',
  reviewText: '',
  reviewDate: null,
  googleReviewUrl: null,
};

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
})
export class ReviewsComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly snackBar = inject(MatSnackBar);

  readonly reviews = signal<Review[]>([]);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);

  form: ReviewRequest = { ...EMPTY_FORM };

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.reviewService.list().subscribe((reviews) => this.reviews.set(reviews));
  }

  edit(review: Review): void {
    this.editingId.set(review.id);
    this.form = {
      reviewerName: review.reviewerName,
      reviewText: review.reviewText,
      reviewDate: review.reviewDate,
      googleReviewUrl: review.googleReviewUrl,
    };
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  save(): void {
    if (!this.form.reviewerName || !this.form.reviewText) {
      return;
    }
    this.saving.set(true);
    const editingId = this.editingId();
    const request$ = editingId ? this.reviewService.update(editingId, this.form) : this.reviewService.create(this.form);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.refresh();
        this.snackBar.open(editingId ? 'Review updated' : 'Review added', 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.message || 'Save failed', 'Dismiss', { duration: 4000 });
      },
    });
  }

  drop(event: CdkDragDrop<Review[]>): void {
    const current = [...this.reviews()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.reviews.set(current);
    const reorderItems = current.map((review, index) => ({ id: review.id, sortOrder: index }));
    this.reviewService.reorder(reorderItems).subscribe();
  }

  delete(id: number): void {
    if (!confirm('Delete this review?')) {
      return;
    }
    this.reviewService.delete(id).subscribe(() => {
      if (this.editingId() === id) {
        this.cancelEdit();
      }
      this.refresh();
    });
  }
}
