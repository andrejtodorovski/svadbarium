import { Component, ViewChild, inject } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import breezyThemePlugin from '@fullcalendar/angular/themes/breezy';
import type { CalendarOptions, DateClickInfo, DatesSetInfo, DayCellInfo } from '@fullcalendar/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvailabilityService } from '../../core/services/availability.service';

@Component({
  selector: 'app-admin-availability',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.scss',
})
export class AvailabilityComponent {
  private readonly availabilityService = inject(AvailabilityService);
  private readonly snackBar = inject(MatSnackBar);
  private unavailableDates = new Set<string>();
  private currentFrom = '';
  private currentTo = '';

  @ViewChild(FullCalendarComponent) private calendarComponent?: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, breezyThemePlugin],
    initialView: 'dayGridMonth',
    selectable: false,
    height: 'auto',
    datesSet: (info: DatesSetInfo) => this.onDatesSet(info),
    dayCellClass: (info: DayCellInfo) =>
      this.unavailableDates.has(this.toIsoDate(info.date)) ? 'day-unavailable' : 'day-available',
    dateClick: (info: DateClickInfo) => this.toggleDate(info.dateStr),
  };

  private onDatesSet(info: DatesSetInfo): void {
    const from = this.toIsoDate(info.start);
    const to = this.toIsoDate(info.end);
    this.loadRange(from, to);
  }

  private loadRange(from: string, to: string): void {
    this.currentFrom = from;
    this.currentTo = to;
    this.availabilityService.getUnavailable(from, to).subscribe((dates) => {
      this.unavailableDates = new Set(dates.map((d) => d.date));
      // Reassigning [options] alone doesn't make FullCalendar v7 re-invoke dayCellClass for
      // already-rendered cells — an explicit re-render via the Calendar API is required.
      this.calendarComponent?.getApi().render();
    });
  }

  private toggleDate(dateStr: string): void {
    if (this.unavailableDates.has(dateStr)) {
      this.availabilityService.reset(dateStr).subscribe(() => {
        this.snackBar.open(`${dateStr} marked available`, 'Dismiss', { duration: 2500 });
        this.loadRange(this.currentFrom, this.currentTo);
      });
    } else {
      this.availabilityService.setUnavailable(dateStr).subscribe(() => {
        this.snackBar.open(`${dateStr} marked unavailable`, 'Dismiss', { duration: 2500 });
        this.loadRange(this.currentFrom, this.currentTo);
      });
    }
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
