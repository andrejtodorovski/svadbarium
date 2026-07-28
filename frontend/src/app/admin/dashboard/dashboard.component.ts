import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { GalleryService } from '../../core/services/gallery.service';
import { MenuService } from '../../core/services/menu.service';
import { ReviewService } from '../../core/services/review.service';
import { InquiryService } from '../../core/services/inquiry.service';
import { InquiryRecord } from '../../core/models/inquiry-record.model';

const MAX_RECENT_INQUIRIES = 5;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly galleryService = inject(GalleryService);
  private readonly menuService = inject(MenuService);
  private readonly reviewService = inject(ReviewService);
  private readonly inquiryService = inject(InquiryService);

  readonly galleryCount = signal<number | null>(null);
  readonly menuCount = signal<number | null>(null);
  readonly reviewCount = signal<number | null>(null);
  readonly inquiries = signal<InquiryRecord[]>([]);

  // InquiryService.list() already returns most-recent-first (see backend
  // findAllByOrderByCreatedAtDesc), so slicing the front gives the newest N.
  readonly recentInquiries = computed(() => this.inquiries().slice(0, MAX_RECENT_INQUIRIES));
  readonly unhandledCount = computed(() => this.inquiries().filter((i) => !i.handled).length);

  constructor() {
    this.galleryService.list().subscribe((images) => this.galleryCount.set(images.length));
    this.menuService.list().subscribe((menus) => this.menuCount.set(menus.length));
    this.reviewService.list().subscribe((reviews) => this.reviewCount.set(reviews.length));
    this.inquiryService.list().subscribe((inquiries) => this.inquiries.set(inquiries));
  }
}
