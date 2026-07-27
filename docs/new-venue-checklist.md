# Spinning up a new venue

The whole platform is one Docker image (built from the root `Dockerfile`). A new venue is a new
deployment of that same image pointed at its own Postgres — no code changes, ever.

## 1. Create the project

**Railway**
1. New Project → Deploy from GitHub repo → select this repo.
2. Add a plugin → Database → PostgreSQL. Railway sets `DATABASE_URL` on the Postgres service
   automatically; reference it on the app service as `${{Postgres.DATABASE_URL}}` (or copy the
   value directly) — no manual JDBC conversion needed, the app rewrites Railway's
   `postgres://user:pass@host:port/db` form at startup.

**Render**
1. New → Web Service → connect this repo → Environment: Docker (it will pick up the root
   `Dockerfile`).
2. New → PostgreSQL → create a database. Copy its "External Database URL" (or "Internal Database
   URL" if the app and DB are in the same Render region) into the web service's `DATABASE_URL` env
   var.

## 2. Generate an admin password hash

The admin account is seeded by a Flyway migration (`V2__seed_admin.sql`) the first time it runs
against a fresh database, from `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`. It needs a **bcrypt hash**,
not the plaintext password:

```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'yourpassword', bcrypt.gensalt()).decode())"
```

(No Python/bcrypt available? Any bcrypt generator works — `htpasswd -nbBC 10 admin yourpassword`,
a `BCryptPasswordEncoder` one-liner, etc. The cost factor doesn't matter, only the `$2a$`/`$2b$`
format.)

## 3. Set environment variables

Copy every variable from `.env.example` into the platform's environment variable settings:

| Variable | Value |
|---|---|
| `DATABASE_URL` | From the attached Postgres (either `jdbc:postgresql://...` or the platform's native `postgres://...` form — both work) |
| `DATABASE_USERNAME` | Only needed if your `DATABASE_URL` doesn't already embed credentials |
| `DATABASE_PASSWORD` | Same as above |
| `JWT_SECRET` | Generate a fresh one per venue: `openssl rand -base64 48` |
| `ADMIN_USERNAME` | Whatever username you want for this venue's admin |
| `ADMIN_PASSWORD_HASH` | The bcrypt hash from step 2 |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD` | Needed for the landing page's contact form to send enquiry emails — any SMTP provider works (Gmail app password, SES, Mailgun, etc.) |
| `MAIL_FROM_ADDRESS` | Optional — some providers require a verified sender identity here; defaults to the venue's own Contact Email if unset |

**Set these before the first deploy.** The seed migration only runs once per database — changing
`ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH` after the fact and redeploying has no effect, since Flyway
never re-runs a migration it already applied.

## 4. Deploy

Trigger the deploy. Flyway runs both migrations automatically on first boot — schema creation and
the admin seed — no manual database setup step.

## 5. Fill in the venue

Log into `/admin` with the credentials from step 2/3, then:
- **Venue Settings** — name, address, description, capacity, parking, contact info, socials.
- **Gallery** — upload photos.
- **Menus** — upload menu images/PDFs.
- **Availability** — block any dates already known to be booked.

That's it — the public site at `/`, `/calendar`, and `/menu` is live and fully populated.

## Rotating the admin password later

Since the seed migration doesn't re-run, changing the password afterwards means updating the row
directly. Connect to the venue's Postgres and run:

```sql
UPDATE admin_user SET password_hash = '<new bcrypt hash from step 2>' WHERE username = '<username>';
```
