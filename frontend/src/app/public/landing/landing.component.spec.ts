import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LandingComponent } from './landing.component';
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

// Angular's SafeResourceUrl is an opaque wrapper — this pulls the real string back out the way
// Angular's own internals do, so the test can assert on the actual URL rather than trust the type.
function unwrapSafeUrl(value: unknown): string {
  return (value as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity;
}

describe('LandingComponent', () => {
  let component: LandingComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    component = TestBed.createComponent(LandingComponent).componentInstance;
  });

  describe('platformLabel', () => {
    it('capitalizes the platform key for display', () => {
      expect(component.platformLabel('instagram')).toBe('Instagram');
      expect(component.platformLabel('facebook')).toBe('Facebook');
    });
  });

  describe('socialUrl', () => {
    it('builds a real Instagram profile URL from a bare handle', () => {
      expect(component.socialUrl('instagram', 'grandhall')).toBe('https://instagram.com/grandhall');
    });

    it('strips a leading @ from the handle', () => {
      expect(component.socialUrl('instagram', '@grandhall')).toBe('https://instagram.com/grandhall');
    });

    it('builds a real Facebook profile URL from a bare handle', () => {
      expect(component.socialUrl('facebook', 'grandhall')).toBe('https://facebook.com/grandhall');
    });

    it('passes an already-full URL through unchanged', () => {
      const url = 'https://instagram.com/grandhall.official';
      expect(component.socialUrl('instagram', url)).toBe(url);
    });
  });

  describe('viberUrl', () => {
    it('builds a viber chat deep link from the phone number', () => {
      expect(component.viberUrl('+389 70 123 456')).toBe('viber://chat?number=%2B38970123456');
    });

    it('strips punctuation like dashes and parentheses, keeping only digits and +', () => {
      expect(component.viberUrl('555-1234')).toBe('viber://chat?number=5551234');
    });
  });

  describe('mapEmbedUrl', () => {
    it('uses the admin-pasted embed URL directly when set, ignoring address/lat-lng', () => {
      const embedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12';
      const settings = settingsWith({ mapEmbedUrl: embedUrl, address: '123 Main St' });

      const result = component.mapEmbedUrl(settings);

      expect(unwrapSafeUrl(result)).toBe(embedUrl);
    });

    it('falls back to a keyless lat/lng query when no embed URL is set', () => {
      const settings = settingsWith({ latitude: 42.1579, longitude: 21.8593 });

      const result = component.mapEmbedUrl(settings);

      expect(unwrapSafeUrl(result)).toContain('q=42.1579%2C21.8593');
    });

    it('falls back to the address text when neither embed URL nor lat/lng are set', () => {
      const settings = settingsWith({ address: '123 Main St' });

      const result = component.mapEmbedUrl(settings);

      expect(unwrapSafeUrl(result)).toContain('q=123%20Main%20St');
    });

    it('returns null when there is nothing at all to build a map from', () => {
      const settings = settingsWith({});

      expect(component.mapEmbedUrl(settings)).toBeNull();
    });
  });
});
