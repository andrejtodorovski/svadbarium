-- Persist enquiries alongside emailing them, so the venue has a record of leads even if the
-- email bounces, gets lost in spam, or SMTP isn't configured at all.
CREATE TABLE inquiry (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    phone       VARCHAR(50),
    event_date  DATE,
    message     TEXT         NOT NULL,
    handled     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_inquiry_created_at ON inquiry (created_at DESC);
