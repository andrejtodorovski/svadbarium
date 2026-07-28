import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InquiryService } from '../../core/services/inquiry.service';
import { InquiryRecord } from '../../core/models/inquiry-record.model';

@Component({
  selector: 'app-admin-inquiries',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './inquiries.component.html',
  styleUrl: './inquiries.component.scss',
})
export class InquiriesComponent {
  private readonly inquiryService = inject(InquiryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly inquiries = signal<InquiryRecord[]>([]);
  readonly hideHandled = signal(false);

  readonly visibleInquiries = computed(() =>
    this.hideHandled() ? this.inquiries().filter((i) => !i.handled) : this.inquiries(),
  );

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.inquiryService.list().subscribe((inquiries) => this.inquiries.set(inquiries));
  }

  toggleHandled(inquiry: InquiryRecord): void {
    this.inquiryService.setHandled(inquiry.id, !inquiry.handled).subscribe({
      next: (updated) => {
        this.inquiries.update((list) => list.map((i) => (i.id === updated.id ? updated : i)));
      },
      error: () => this.snackBar.open('Failed to update', 'Dismiss', { duration: 4000 }),
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this enquiry?')) {
      return;
    }
    this.inquiryService.delete(id).subscribe(() => this.refresh());
  }
}
