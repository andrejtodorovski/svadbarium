-- Admin-authored testimonials shown on the public site — text entered directly by the admin,
-- not fetched from Google (that would need a paid Places API key).
CREATE TABLE review (
    id                 BIGSERIAL PRIMARY KEY,
    reviewer_name      VARCHAR(200) NOT NULL,
    review_text        TEXT         NOT NULL,
    review_date        DATE,
    google_review_url  VARCHAR(500),
    sort_order         INT          NOT NULL DEFAULT 0,
    created_at         TIMESTAMP    NOT NULL DEFAULT now()
);
