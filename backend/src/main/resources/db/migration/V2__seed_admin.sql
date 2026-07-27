-- Seeds the first (and only) admin user from ADMIN_USERNAME / ADMIN_PASSWORD_HASH env vars,
-- resolved via Spring Boot's Flyway placeholder support (see application.yml). Defaults to
-- admin / changeme123 for local dev so a fresh docker-compose stack is usable out of the box —
-- always set real env vars before deploying a venue.
INSERT INTO admin_user (username, password_hash, created_at)
VALUES ('${adminUsername}', '${adminPasswordHash}', now());
