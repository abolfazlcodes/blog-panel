# Notiq — self-hosted blog & project panel

A self-hostable content panel: write blogs and projects in a rich editor, then
serve them to any front-end (e.g. a portfolio) through a read-only **public
API**. Multi-user — anyone can sign up and gets their own content namespaced by
username.

- **Backend** — Express 5 + Prisma 6 + PostgreSQL (`backend/`)
- **Frontend** — React 19 + Vite + TanStack Query + Tiptap editor (`frontend/`)

---

## Features

- **Rich content** — Tiptap editor with headings, links, images, and
  syntax-highlighted code blocks (per-language). Content is stored as
  sanitized HTML with stable heading IDs (for table-of-contents anchors).
- **Color-coded cover & inline images** uploaded and de-duplicated by hash.
- **Blog series** — group posts into an ordered series; the public API exposes
  a "Part N of M" context with prev/next navigation.
- **Tags** — shared across blogs and projects, with public tag listing and
  per-tag filtering.
- **Search & pagination** on every list (panel and public).
- **Auth** — signup, JWT access tokens, and rotating, revocable refresh tokens.
- **Production hardening** — Helmet, configurable CORS allowlist + rate limit,
  upload/body size caps, request logging, `/health` readiness probe, and
  graceful shutdown.

---

## Local development

### Prerequisites
- Node.js 22+
- A PostgreSQL database

### Backend
```bash
cd backend
cp .env.example .env          # then fill in DATABASE_URL + JWT_SECRET_KEY
npm install
npx prisma migrate deploy     # apply migrations (use `migrate dev` while developing)
npm run dev                   # starts on http://localhost:8080
```

### Frontend
```bash
cd frontend
cp .env.example .env          # point VITE_API_BASE_URL at the backend
npm install
npm run dev
```

---

## Environment variables

See [`backend/.env.example`](backend/.env.example) for the full list. The
important ones:

| Variable          | Required | Description                                            |
| ----------------- | -------- | ------------------------------------------------------ |
| `JWT_SECRET_KEY`  | ✅       | Secret for signing access tokens.                      |
| `DATABASE_URL`    | ✅       | PostgreSQL connection string.                          |
| `PORT`            |          | API port (default `8080`).                             |
| `NODE_ENV`        |          | `production` enables combined logs + CORS warning.     |
| `CORS_ORIGINS`    |          | Comma-separated allowed origins (panel + portfolio).   |
| `RATE_LIMIT_*`    |          | Global limiter window/max.                             |
| `MAX_UPLOAD_MB`   |          | Max image upload size (default `10`).                  |
| `JSON_BODY_LIMIT` |          | Max JSON body (default `2mb`).                          |

---

## Public API (for consuming sites)

All public endpoints are unauthenticated, read-only, and scoped to a user's
`:username`. List endpoints return `{ message, data, meta }` where `meta` is
`{ total, page, pageSize, totalPages }`. List query params: `?q=` (search),
`?tag=` (filter by tag slug), `?page=`, `?pageSize=` (max 50).

| Method  | Path                                  | Description                                            |
| ------- | ------------------------------------- | ------------------------------------------------------ |
| `GET`   | `/public/:username/blog`              | Published blogs (search/tag/pagination).               |
| `GET`   | `/public/:username/blog/:id`          | One published blog (+`series` context, `tags`); +1 view. |
| `PATCH` | `/public/:username/blog/:id`          | Anonymous like (+1).                                   |
| `GET`   | `/public/:username/project`           | Published projects (search/tag/pagination).            |
| `GET`   | `/public/:username/project/:id`       | One published project (+`tags`).                       |
| `GET`   | `/public/:username/series/:slug`      | A series with its ordered published parts.             |
| `GET`   | `/public/:username/tags`              | Tags in use, with published-only counts.               |

A single published blog includes a `series` object when it belongs to one:

```jsonc
"series": {
  "id": 3, "title": "Learning Rust", "slug": "learning-rust",
  "part": 2, "total": 4,
  "parts": [ { "id": 10, "title": "...", "slug": "...", "order": 1, "is_current": false }, ... ],
  "prev": { "id": 10, "title": "...", "slug": "..." },
  "next": { "id": 12, "title": "...", "slug": "..." }
}
```

---

## Authenticated API (the panel)

- **Auth** — `POST /sign-up`, `POST /login`, `POST /refresh`, `POST /logout`
- **Blogs** — `GET|POST /blog`, `GET|PUT|PATCH|DELETE /blog/:id`
- **Projects** — `GET|POST /project`, `GET|PUT|PATCH|DELETE /project/:id`
- **Series** — `GET|POST /series`, `GET|PUT|DELETE /series/:id`
- **Tags** — `GET|POST /tag`, `PUT|DELETE /tag/:id`
- **Media** — `POST /upload` (multipart `image`)
- **Profile** — `GET /profile`

`GET /health` returns `200 {status:"ok"}` when the DB is reachable, else `503`.

---

## Deployment

Production multi-stage Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`)
and a Docker Swarm stack (`docker-stack.yml`) are provided — non-root backend,
healthchecks, graceful shutdown, secrets, persistent volumes, and an
nginx-served SPA. See **[DEPLOY.md](DEPLOY.md)** for the full guide.

For local development, `docker compose up --build` runs the whole stack
(panel on `:5173`, API on `:4000`).
