# Wedding Venue Platform — Build Spec for Coding Agent

## 1. Concept

A **single codebase** (one Spring Boot + Kotlin backend, one Angular frontend) that gets deployed
**once per wedding venue**. Each deployment points at its own Postgres database — which also holds
that venue's photos and menu files, no separate storage service involved. There is no cross-venue
logic, no tenant IDs, no shared database — "multi-venue" just means "run the same Docker image N
times with a different `DATABASE_URL`."

Per-venue content (name, address, guest capacity, parking info, contact details, etc.) is **not**
hardcoded and is **not** an env var either — it lives in a single-row `venue_settings` table that
the venue owner edits through the admin panel. This is what makes the same build usable for every
venue without touching code or config at deploy time (only `DATABASE_URL` differs between
deployments).

Images and menu files (photos, PDFs) are stored **as bytes directly in Postgres** (`bytea`), not in
separate object storage. At this scale — a single venue's gallery and a handful of menu files —
this is simpler to deploy and operate: one datastore per venue, one connection string, one backup
target. See section 6 for the tradeoffs this accepts.

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Spring Boot 3.x + Kotlin | Matches current experience |
| Frontend | Angular (latest LTS) | Matches current experience |
| DB | PostgreSQL | Best default with JPA/Hibernate; also holds file bytes (`bytea`) |
| Migrations | Flyway | Simple, integrates natively with Spring Boot |
| Auth | Spring Security + JWT | Admin panel only; public pages are open |
| File storage | PostgreSQL `bytea` columns, streamed via dedicated endpoints | No separate storage service to provision, configure, or back up |
| Calendar UI | FullCalendar (Angular wrapper, read-only mode) | Handles month/date-grid rendering out of the box |
| Styling | Tailwind CSS (or Angular Material, pick one) | Fast to make it look non-generic |
| Deployment | Single multi-stage Dockerfile → Railway or Render | One artifact, managed Postgres, auto HTTPS |

Serve Angular's built output as static files from Spring Boot (`src/main/resources/static`), so the
whole app is **one deployable jar/container**. This avoids CORS entirely since frontend and API are
same-origin in production.

## 3. Data Model

```
venue_settings (single row, id fixed to 1)
  id                  BIGINT PK
  name                VARCHAR
  description          TEXT
  address             VARCHAR
  latitude            DOUBLE NULL
  longitude           DOUBLE NULL
  guest_capacity_min  INT NULL
  guest_capacity_max  INT NULL
  parking_info        TEXT
  contact_email       VARCHAR
  contact_phone       VARCHAR
  social_links        JSONB              -- {"instagram": "...", "facebook": "..."}
  updated_at          TIMESTAMP

gallery_image
  id            BIGINT PK
  file_data     BYTEA
  content_type  VARCHAR         -- 'image/jpeg', 'image/png'
  file_size     INT             -- bytes, for validation/display
  caption       VARCHAR NULL
  sort_order    INT
  created_at    TIMESTAMP

menu_file
  id            BIGINT PK
  file_data     BYTEA
  content_type  VARCHAR         -- 'image/jpeg' | 'image/png' | 'application/pdf'
  file_size     INT
  title         VARCHAR NULL
  sort_order    INT
  created_at    TIMESTAMP

availability_override
  id            BIGINT PK
  date          DATE UNIQUE
  status        ENUM('AVAILABLE','UNAVAILABLE')
  note          VARCHAR NULL     -- internal admin note, never exposed publicly
  updated_at    TIMESTAMP

admin_user
  id             BIGINT PK
  username       VARCHAR UNIQUE
  password_hash  VARCHAR
  created_at     TIMESTAMP
```

**Availability logic:** default assumption is "available." Only store rows for dates that deviate
from default (i.e. `UNAVAILABLE`). The calendar endpoint returns unavailable dates for a given
month range; the frontend treats everything else in range as available. This keeps the table tiny
and admin actions simple ("block this date" / "unblock this date").

## 4. Backend — API Surface

### Public (no auth)
```
GET  /api/venue-settings              → venue info for landing page
GET  /api/gallery                     → ordered list of image metadata (id, caption, sortOrder, contentType)
GET  /api/gallery/{id}/file           → streams the image bytes with correct Content-Type + Cache-Control
GET  /api/menus                       → ordered list of menu file metadata (id, title, sortOrder, contentType)
GET  /api/menus/{id}/file             → streams the menu file bytes (image or pdf)
GET  /api/availability?from=Y-M-D&to=Y-M-D  → list of unavailable dates in range
```

The list endpoints (`/api/gallery`, `/api/menus`) never return raw bytes — only metadata plus the
`id` needed to build the `<img src="/api/gallery/{id}/file">` or PDF viewer URL. This keeps list
responses small and lets the browser cache individual file responses independently.

### Admin (JWT required, `Authorization: Bearer <token>`)
```
POST /api/admin/login                 → { username, password } → { token }

PUT  /api/admin/venue-settings        → update the single settings row

POST   /api/admin/gallery             → multipart upload, bytes read into `bytea`, returns created image metadata
PUT    /api/admin/gallery/reorder     → [{id, sortOrder}, ...]
DELETE /api/admin/gallery/{id}

POST   /api/admin/menus               → multipart upload (image or pdf), bytes read into `bytea`
PUT    /api/admin/menus/reorder
DELETE /api/admin/menus/{id}

POST   /api/admin/availability/{date} → set status = UNAVAILABLE (+ optional note)
DELETE /api/admin/availability/{date} → reset to AVAILABLE (delete override row)
```

### Backend implementation notes
- Use Spring Security filter chain: `/api/admin/**` requires valid JWT except `/api/admin/login`;
  everything else under `/api/**` is permit-all.
- JWT: short-lived access token (e.g. 2h) is enough for a single-admin internal tool — no need to
  build refresh-token infrastructure for v1.
- Seed the first admin user via a Flyway migration reading `ADMIN_USERNAME` /
  `ADMIN_PASSWORD_HASH` env vars, or provide a one-time `/api/admin/setup` endpoint that only works
  if `admin_user` table is empty.
- File uploads: validate MIME type server-side (`image/jpeg`, `image/png`, `application/pdf`), cap
  size (e.g. 10MB per file — enforce this at the controller level since everything now lands in
  Postgres).
- On upload, read the multipart file into a `byte[]` and store it in the `bytea` column along with
  `content_type` and `file_size`. This is fine at gallery/menu scale (tens of files, single digit
  MB each).
- On read, **don't** load bytes into a `byte[]` and return them from a `@RestController` method
  directly for every request if you want to keep memory use predictable — write the column to the
  response `OutputStream` (e.g. via `StreamingResponseBody` or `ResponseEntity<byte[]>` for small
  files/images, `StreamingResponseBody` for PDFs) and set
  `Content-Type` from the stored `content_type` plus a `Cache-Control: public, max-age=...` header
  so the browser/CDN in front of Railway/Render can cache it instead of hitting Postgres on every
  request.
- Consider a Spring Boot `@Transactional(readOnly = true)` + JPA `@Lob` mapping (or plain
  `byte[]` field with `columnDefinition = "bytea"`) for the entity — either works with Hibernate on
  Postgres; `bytea` (not `oid`/large objects) is the right column type here.

## 5. Frontend — Structure

Single Angular app, public and admin routes in the same build:

```
/                     Landing page
/calendar             Availability calendar (read-only)
/menu                 Menu page (renders images inline, PDFs via <embed> or pdf.js viewer)
/admin/login
/admin                Dashboard shell (route-guarded)
  /admin/settings     Edit venue_settings form
  /admin/gallery      Upload / reorder / delete images
  /admin/menus        Upload / reorder / delete menu files
  /admin/availability Calendar with click-to-toggle date status
```

- **Route guard**: `AdminGuard` checks for a valid JWT in memory/localStorage before allowing
  `/admin/**` routes; an `HttpInterceptor` attaches the bearer token to admin API calls and
  redirects to `/admin/login` on 401.
- **Landing page** pulls everything from `GET /api/venue-settings` + `GET /api/gallery` — no
  hardcoded venue copy anywhere in the templates. This is the key constraint that keeps the app
  reusable across venues. Images render as `<img src="/api/gallery/{id}/file">` directly — no URL
  field to manage, the id from the metadata list is enough.
- **Calendar page**: FullCalendar in `dayGridMonth` view, `selectable: false`, fetch unavailable
  dates for the visible month range on `datesSet` event, render them as a distinct day-cell class
  (e.g. greyed out / "Booked"). No booking action anywhere — this is display-only per your spec.
- **Menu page**: fetch `/api/menus` for metadata, then for each item render `<img
  src="/api/menus/{id}/file">` if `contentType` starts with `image/`, or an embedded PDF viewer
  (`<embed>`/pdf.js) pointed at the same URL if `contentType === 'application/pdf'`. Support one or
  many menu files without a layout change.
- **Admin gallery/menu screens**: drag-to-reorder list (Angular CDK `DragDropModule` covers this
  cheaply) + file input + delete button per item.

## 6. Deployment / Configurability

1. Write **one Dockerfile**, multi-stage:
   - Stage 1 (Node): `ng build` the Angular app
   - Stage 2 (Maven/Gradle): copy Angular's `dist/` output into
     `src/main/resources/static`, build the Spring Boot jar
   - Stage 3 (slim JRE): copy the jar, `ENTRYPOINT ["java","-jar","app.jar"]`
2. Push the repo to GitHub. For each new venue:
   - Create a new Railway/Render project from the same repo
   - Attach a fresh managed Postgres instance → sets `DATABASE_URL` automatically (this is the
     **only** datastore to provision — no separate object storage bucket/credentials needed)
   - Set `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` (or use the one-time setup endpoint) for the
     first admin login
   - Deploy → Flyway runs migrations automatically on boot, creating empty tables
   - Log into `/admin`, fill in venue settings, upload photos/menus, set any known unavailable
     dates
3. Result: N independent live venue sites, same code, zero per-venue code changes, and only one
   thing to back up per venue (its Postgres instance — file bytes are backed up along with
   everything else automatically).

**Tradeoffs accepted by storing files in Postgres** (worth knowing, not worth solving for at this
scale):
   - DB backups grow with gallery/menu size — irrelevant until a venue has hundreds of MB of images
   - No CDN edge caching for files by default — mitigated with `Cache-Control` headers (see section
     4) so the browser/Railway/Render's own caching layer avoids repeat hits to the DB
   - All file reads go through the JVM instead of a dedicated static file server — fine at this
     traffic level (a venue's own visitors), would need revisiting if the platform ever fielded
     high-traffic marketing campaigns per venue

## 7. Build Order (suggested milestones for the agent)

1. Spring Boot project skeleton + Postgres + Flyway migration for all tables above
2. `venue_settings`, `gallery_image`, `menu_file`, `availability_override` entities/repositories
3. Public API endpoints (venue-settings, gallery, menus, availability) — no auth needed yet, get
   these working and returning real data first
4. Spring Security + JWT + admin login + admin CRUD endpoints
5. File upload/streaming: multipart → `bytea` on write, `StreamingResponseBody`/`byte[]` response
   with correct `Content-Type` + `Cache-Control` on read; test with real images and a real PDF
   early since this is the one part of the stack you haven't done exactly this way before
6. Angular app: public pages first (landing, calendar, menu) wired to the public API
7. Angular app: admin shell, guard, interceptor, and the three management screens
8. Dockerfile (multi-stage) + docker-compose for local dev (app + Postgres only — no MinIO or
   other storage service needed)
9. Deploy first instance to Railway/Render, smoke-test end to end (including a PDF menu upload and
   render, since that's the most likely rough edge)
10. Document the "spin up a new venue" steps (env vars needed) so repeating step 2 of section 6 is
    a 10-minute checklist, not a rediscovery exercise

## 8. Explicit non-goals for v1 (call out if the agent tries to add them)

- No booking/reservation transactions — calendar is view-only, per spec
- No payments
- No multi-admin roles/permissions — single admin account is enough
- No true multi-tenant single-database architecture — one DB per venue is intentional and simpler
- No image resizing pipeline required initially — client-side compression before upload (or just a
  reasonable max file size) is enough for a single small gallery
