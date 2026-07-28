-- Link-out to the venue's real Google Maps listing for reviews — no Places API/key needed.
ALTER TABLE venue_settings
    ADD COLUMN google_reviews_url VARCHAR(500);
