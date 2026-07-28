import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CalendarComponent } from './calendar.component';

// Regression test for a real bug that shipped once already: FullCalendar's day-cell Date
// objects are local-midnight, not UTC-anchored, so reading them with toISOString() shifts the
// day by one whenever the browser's UTC offset isn't exactly 0. toIsoDate() must read the local
// date components instead.
describe('CalendarComponent#toIsoDate', () => {
  let component: CalendarComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    component = TestBed.createComponent(CalendarComponent).componentInstance;
  });

  function toIsoDate(date: Date): string {
    return (component as unknown as { toIsoDate(date: Date): string }).toIsoDate(date);
  }

  it('formats a local-midnight date using its own local components, not a UTC shift', () => {
    // A date built from local y/m/d components — exactly what FullCalendar hands dayCellClass.
    const localMidnight = new Date(2026, 8, 12); // September 12, 2026 (month is 0-indexed)

    expect(toIsoDate(localMidnight)).toBe('2026-09-12');
  });

  it('pads single-digit months and days to two digits', () => {
    const date = new Date(2026, 0, 5); // January 5, 2026

    expect(toIsoDate(date)).toBe('2026-01-05');
  });
});
