-- The src of Google's own "Share > Embed a map" iframe snippet, pasted in directly by the
-- admin — gives exact pin/zoom/view control that a keyless address-only query can't.
ALTER TABLE venue_settings
    ADD COLUMN map_embed_url VARCHAR(2000);
