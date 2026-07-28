import { Component, ViewChild, inject, signal } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import breezyThemePlugin from '@fullcalendar/angular/themes/breezy';
import type { CalendarOptions, DatesSetInfo, DayCellInfo } from '@fullcalendar/angular';

// FullCalendar v7 doesn't ship a bundled 'mk' locale, so the weekday header text is
// overridden directly rather than relying on the locale system.
const MK_WEEKDAY_ABBREVIATIONS = ['Нед', 'Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб'];
import { AvailabilityService } from '../../core/services/availability.service';
import { SiteNavComponent } from '../site-nav/site-nav.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { LoadErrorComponent } from '../../shared/load-error/load-error.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, SiteNavComponent, SiteFooterComponent, LoadErrorComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  private readonly availabilityService = inject(AvailabilityService);
  private unavailableDates = new Set<string>();
  private lastRange: { from: string; to: string } | null = null;

  readonly loadFailed = signal(false);

  @ViewChild(FullCalendarComponent) private calendarComponent?: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, breezyThemePlugin],
    initialView: 'dayGridMonth',
    selectable: false,
    height: 'auto',
    dayHeaderContent: (arg: { date: Date }) => MK_WEEKDAY_ABBREVIATIONS[arg.date.getDay()],
    datesSet: (info: DatesSetInfo) => this.onDatesSet(info),
    dayCellClass: (info: DayCellInfo) =>
      this.unavailableDates.has(this.toIsoDate(info.date)) ? 'day-unavailable' : 'day-available',
  };

  private onDatesSet(info: DatesSetInfo): void {
    this.lastRange = { from: this.toIsoDate(info.start), to: this.toIsoDate(info.end) };
    this.fetchAvailability();
  }

  private fetchAvailability(): void {
    if (!this.lastRange) {
      return;
    }
    this.loadFailed.set(false);
    this.availabilityService.getUnavailable(this.lastRange.from, this.lastRange.to).subscribe({
      next: (dates) => {
        this.unavailableDates = new Set(dates.map((d) => d.date));
        // Reassigning [options] alone doesn't make FullCalendar v7 re-invoke dayCellClass for
        // already-rendered cells — an explicit re-render via the Calendar API is required.
        this.calendarComponent?.getApi().render();
      },
      error: () => this.loadFailed.set(true),
    });
  }

  retry(): void {
    this.fetchAvailability();
  }

  // FullCalendar's day-cell dates are local-midnight Date objects, not UTC-anchored — reading them
  // with toISOString() (UTC) shifts the day by one whenever the browser's offset isn't exactly 0.
  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
