export interface VenueSettings {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  guestCapacityMin: number | null;
  guestCapacityMax: number | null;
  parkingInfo: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: Record<string, string>;
  themePrimaryColor: string;
  themeDarkColor: string;
  themeLightColor: string;
  updatedAt: string;
}

export type VenueSettingsUpdateRequest = Omit<VenueSettings, 'id' | 'updatedAt'>;
