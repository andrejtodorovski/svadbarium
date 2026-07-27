-- venue_settings: single row, id fixed to 1
CREATE TABLE venue_settings (
    id                  BIGINT PRIMARY KEY,
    name                VARCHAR(255) NOT NULL DEFAULT '',
    description         TEXT,
    address             VARCHAR(500),
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    guest_capacity_min  INT,
    guest_capacity_max  INT,
    parking_info        TEXT,
    contact_email       VARCHAR(255),
    contact_phone       VARCHAR(50),
    social_links        JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT venue_settings_single_row CHECK (id = 1)
);

INSERT INTO venue_settings (id, name, updated_at)
VALUES (1, 'Your Venue Name', now());

-- gallery_image
CREATE TABLE gallery_image (
    id              BIGSERIAL PRIMARY KEY,
    file_data       BYTEA NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size       INT NOT NULL,
    caption         VARCHAR(500),
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_gallery_image_sort_order ON gallery_image (sort_order);

-- menu_file
CREATE TABLE menu_file (
    id              BIGSERIAL PRIMARY KEY,
    file_data       BYTEA NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size       INT NOT NULL,
    title           VARCHAR(255),
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_file_sort_order ON menu_file (sort_order);

-- availability_override
-- status is VARCHAR + CHECK rather than a native Postgres ENUM type: avoids ALTER TYPE ... ADD
-- VALUE friction for future statuses and maps directly to a Kotlin enum via EnumType.STRING.
CREATE TABLE availability_override (
    id          BIGSERIAL PRIMARY KEY,
    date        DATE NOT NULL UNIQUE,
    status      VARCHAR(20) NOT NULL CHECK (status IN ('AVAILABLE', 'UNAVAILABLE')),
    note        VARCHAR(1000),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_availability_override_date ON availability_override (date);

-- admin_user
CREATE TABLE admin_user (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);
