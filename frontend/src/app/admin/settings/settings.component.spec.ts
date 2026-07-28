import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsComponent } from './settings.component';
import { VenueSettings } from '../../core/models/venue-settings.model';

function settingsWith(overrides: Partial<VenueSettings>): VenueSettings {
  return {
    id: 1,
    name: 'The Grand Hall',
    description: null,
    address: null,
    latitude: null,
    longitude: null,
    guestCapacityMin: null,
    guestCapacityMax: null,
    parkingInfo: null,
    contactEmail: null,
    contactPhone: null,
    socialLinks: {},
    themePrimaryColor: '#B8923F',
    themeDarkColor: '#14261F',
    themeLightColor: '#F7F2E7',
    googleReviewsUrl: null,
    mapEmbedUrl: null,
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('SettingsComponent#contrastWarnings', () => {
  let component: SettingsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    component = TestBed.createComponent(SettingsComponent).componentInstance;
  });

  it('flags no pairs for a well-contrasted dark/light combination', () => {
    const settings = settingsWith({ themeDarkColor: '#14261F', themeLightColor: '#F7F2E7' });

    expect(component.contrastWarnings(settings)).not.toContain('Dark background and Light background');
  });

  it('flags a dark/light pair that are nearly identical', () => {
    const settings = settingsWith({ themeDarkColor: '#f0f0f0', themeLightColor: '#f7f2e7' });

    expect(component.contrastWarnings(settings)).toContain('Dark background and Light background');
  });

  it('flags an accent color that is barely distinguishable from the light background', () => {
    const settings = settingsWith({ themePrimaryColor: '#f5f0e5', themeLightColor: '#F7F2E7' });

    expect(component.contrastWarnings(settings)).toContain('Accent (gold) and Light background');
  });

  it('flags an accent color that is barely distinguishable from the dark background', () => {
    const settings = settingsWith({ themePrimaryColor: '#16281f', themeDarkColor: '#14261F' });

    expect(component.contrastWarnings(settings)).toContain('Accent (gold) and Dark background');
  });

  it('returns an empty list when every pair clears the threshold', () => {
    const settings = settingsWith({
      themePrimaryColor: '#8a2be2',
      themeDarkColor: '#000000',
      themeLightColor: '#ffffff',
    });

    expect(component.contrastWarnings(settings)).toEqual([]);
  });
});
