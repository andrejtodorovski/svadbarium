import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VenueSettingsService } from '../../core/services/venue-settings.service';
import { GalleryService } from '../../core/services/gallery.service';
import { InquiryService } from '../../core/services/inquiry.service';
import { ReviewService } from '../../core/services/review.service';
import { VenueSettings } from '../../core/models/venue-settings.model';
import { GalleryImageMeta } from '../../core/models/gallery-image.model';
import { InquiryRequest } from '../../core/models/inquiry.model';
import { Review } from '../../core/models/review.model';
import { SiteNavComponent } from '../site-nav/site-nav.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { GalleryLightboxComponent } from '../gallery-lightbox/gallery-lightbox.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    SiteNavComponent,
    SiteFooterComponent,
    ScrollRevealDirective,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly venueSettingsService = inject(VenueSettingsService);
  private readonly galleryService = inject(GalleryService);
  private readonly inquiryService = inject(InquiryService);
  private readonly reviewService = inject(ReviewService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly snackBar = inject(MatSnackBar);

  readonly venueSettings = signal<VenueSettings | null>(null);
  readonly gallery = signal<GalleryImageMeta[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly sendingInquiry = signal(false);

  inquiryForm: InquiryRequest = { name: '', email: '', phone: null, eventDate: null, message: '' };

  private fragment: string | null = null;

  constructor() {
    this.route.fragment.subscribe((fragment) => {
      this.fragment = fragment;
      this.scrollToFragment();
    });
    this.venueSettingsService.getSettings().subscribe((settings) => {
      this.venueSettings.set(settings);
      this.scrollToFragment();
    });
    this.galleryService.list().subscribe((images) => {
      this.gallery.set(images);
      this.scrollToFragment();
    });
    this.reviewService.list().subscribe((reviews) => {
      this.reviews.set(reviews.slice(0, 3));
      this.scrollToFragment();
    });
  }

  // Sections are gated behind async data (@if venueSettings()/gallery()/reviews()), so the
  // target of a cross-page nav link (e.g. /menu -> /#gallery) may not exist in the DOM yet
  // when Angular Router's own anchor scrolling fires. Retry after each of the three loads
  // that could reveal the target — whichever one makes it appear does the actual scroll.
  private scrollToFragment(): void {
    if (!this.fragment) {
      return;
    }
    const fragment = this.fragment;
    setTimeout(() => {
      document.getElementById(fragment)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }

  fileUrl(id: number): string {
    return this.galleryService.fileUrl(id);
  }

  socialEntries(): [string, string][] {
    const links = this.venueSettings()?.socialLinks ?? {};
    return Object.entries(links);
  }

  platformLabel(platform: string): string {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  }

  // Admins type a bare handle (e.g. "grandhall"), not a full URL — build the real profile link
  // per platform so these actually go somewhere instead of just displaying as text.
  socialUrl(platform: string, value: string): string {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    const handle = value.replace(/^@/, '');
    switch (platform.toLowerCase()) {
      case 'instagram':
        return `https://instagram.com/${handle}`;
      case 'facebook':
        return `https://facebook.com/${handle}`;
      default:
        return `https://${handle}`;
    }
  }

  openLightbox(image: GalleryImageMeta): void {
    this.dialog.open(GalleryLightboxComponent, {
      data: { src: this.fileUrl(image.id), caption: image.caption },
      panelClass: 'lightbox-panel',
      maxWidth: '95vw',
    });
  }

  mapEmbedUrl(settings: VenueSettings): SafeResourceUrl | null {
    // Precise coordinates win when set; otherwise fall back to the address text — same
    // keyless maps.google.com/maps?q=...&output=embed pattern the reference site uses,
    // so a venue doesn't need lat/lng (no admin field for that) to get a map.
    const query =
      settings.latitude != null && settings.longitude != null
        ? `${settings.latitude},${settings.longitude}`
        : settings.address;
    if (!query) {
      return null;
    }
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed&hl=mk`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  viberUrl(phone: string): string {
    return `viber://chat?number=${encodeURIComponent(phone.replace(/[^\d+]/g, ''))}`;
  }

  submitInquiry(form: NgForm): void {
    this.sendingInquiry.set(true);
    this.inquiryService.submit(this.inquiryForm).subscribe({
      next: () => {
        this.sendingInquiry.set(false);
        this.inquiryForm = { name: '', email: '', phone: null, eventDate: null, message: '' };
        // Reassigning the model alone leaves the form's touched/dirty state as-is, which would
        // show the now-empty required fields as invalid — resetForm() clears that too.
        form.resetForm(this.inquiryForm);
        this.snackBar.open('Ви благодариме — наскоро ќе стапиме во контакт.', 'Затвори', { duration: 4000 });
      },
      error: () => {
        this.sendingInquiry.set(false);
        this.snackBar.open('Настана грешка при испраќање на барањето. Обидете се повторно или јавете се директно.', 'Затвори', {
          duration: 5000,
        });
      },
    });
  }
}
