import { Component, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import breezyThemePlugin from '@fullcalendar/angular/themes/breezy';
import type { CalendarOptions, DatesSetInfo, DayCellInfo } from '@fullcalendar/angular';
import { AvailabilityService } from '../../core/services/availability.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  private readonly availabilityService = inject(AvailabilityService);
  private unavailableDates = new Set<string>();

  @ViewChild(FullCalendarComponent) private calendarComponent?: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, breezyThemePlugin],
    initialView: 'dayGridMonth',
    selectable: false,
    height: 'auto',
    datesSet: (info: DatesSetInfo) => this.onDatesSet(info),
    dayCellClass: (info: DayCellInfo) => (this.unavailableDates.has(this.toIsoDate(info.date)) ? 'day-unavailable' : undefined),
  };

  private onDatesSet(info: DatesSetInfo): void {
    const from = this.toIsoDate(info.start);
    const to = this.toIsoDate(info.end);
    this.availabilityService.getUnavailable(from, to).subscribe((dates) => {
      this.unavailableDates = new Set(dates.map((d) => d.date));
      // Reassigning [options] alone doesn't make FullCalendar v7 re-invoke dayCellClass for
      // already-rendered cells — an explicit re-render via the Calendar API is required.
      this.calendarComponent?.getApi().render();
    });
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
