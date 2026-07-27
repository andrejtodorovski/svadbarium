-- Configurable brand colors, editable from the admin panel. Defaults are a deep forest green /
-- warm cream / antique gold palette; any venue can pick its own without a code change.
ALTER TABLE venue_settings
    ADD COLUMN theme_primary_color VARCHAR(7) NOT NULL DEFAULT '#B8923F',
    ADD COLUMN theme_dark_color    VARCHAR(7) NOT NULL DEFAULT '#14261F',
    ADD COLUMN theme_light_color   VARCHAR(7) NOT NULL DEFAULT '#F7F2E7';
