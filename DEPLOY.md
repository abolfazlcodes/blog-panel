# Deploying Notiq (Docker Swarm)

Production deployment uses two images — `notiq-backend` (Express API; applies
Postgres migrations on boot) and `notiq-frontend` (the panel built to static
files, served by nginx) — orchestrated by [`docker-stack.yml`](docker-stack.yml)
with a Postgres service, named volumes, and Swarm secrets.

```
   FRONTEND_PORT(:80)        BACKEND_PORT(:8080)
        │                          │
        ▼                          ▼
   ┌──────────┐   API calls   ┌──────────┐        ┌──────────┐
   │ frontend │ ────────────▶ │ backend  │ ─────▶ │ postgres │
   │ nginx ×2 │               │   ×2     │        │   ×1     │
   └──────────┘               └──────────┘        └──────────┘
                            uploads_data vol     db_data vol
```

This stack was smoke-tested end-to-end (deploy → migrations → signup → login →
public API → SPA) before release.

> **TLS:** the stack publishes plain HTTP. In production put it behind a
> TLS-terminating reverse proxy (Caddy, Traefik, nginx, or a cloud LB) — see
> [§7](#7-tls--reverse-proxy). Never expose the auth API over plain HTTP.

---

## 0. Handoff checklist

If you're handing this to someone to deploy, they need:

- [ ] This repo (for `docker-stack.yml`, `stack.env.example`, the Dockerfiles).
- [ ] Either **pushed images** in a registry they can pull, **or** the repo to
      build the images themselves.
- [ ] Three secret values to create: a **JWT secret**, a **DB password**, and a
      **DB URL** embedding that password.
- [ ] The public **domains**: where the panel and the consuming site will live
      (for `CORS_ORIGINS` and the frontend build arg).
- [ ] A host with **Docker Engine + Swarm** and a **TLS reverse proxy**.

---

## 1. Prerequisites

- Docker Engine with Swarm mode enabled: `docker swarm init`
- A container registry to pull from (Docker Hub, GHCR, …). On a **single-node**
  Swarm you can build locally and skip the registry (deploy with
  `--resolve-image never`, see [Troubleshooting](#10-troubleshooting)).

---

## 2. Build & push the images

The frontend bakes its API URL at **build time**, so set `VITE_API_BASE_URL` to
the backend's public URL when building it.

```bash
export REGISTRY=ghcr.io/yourname    # or your Docker Hub user
export TAG=1.0.0

# Backend
docker build -t $REGISTRY/notiq-backend:$TAG ./backend
docker push $REGISTRY/notiq-backend:$TAG

# Frontend — point it at the public backend URL
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t $REGISTRY/notiq-frontend:$TAG ./frontend
docker push $REGISTRY/notiq-frontend:$TAG
```

---

## 3. Configure (stack.env)

Copy the template and fill it in:

```bash
cp stack.env.example stack.env
$EDITOR stack.env       # REGISTRY, TAG, CORS_ORIGINS, POSTGRES_USER/DB, ports
```

`CORS_ORIGINS` must list every browser origin that calls the API — the panel
**and** the public site consuming the public API, comma-separated.

---

## 4. Create the secrets

The stack reads three Swarm secrets. `db_url` is the full Prisma connection
string and **must** embed the same password as `db_password`, and the same
`POSTGRES_USER`/`POSTGRES_DB` you set in `stack.env`.

```bash
printf 'a-long-random-string'                              | docker secret create jwt_secret -
printf 'super-secret-db-password'                          | docker secret create db_password -
printf 'postgresql://blog_user:super-secret-db-password@db:5432/blog_panel' \
                                                           | docker secret create db_url -
```

> Use `printf` (not `echo`) so no trailing newline sneaks into the secret.

---

## 5. Deploy

Load `stack.env` into the environment, then deploy:

```bash
set -a && . ./stack.env && set +a
docker stack deploy -c docker-stack.yml notiq
```

On boot, each backend replica's entrypoint resolves the `*_FILE` secrets, runs
`prisma migrate deploy`, then starts the API. Prisma's migration advisory lock
serializes replicas, so only one applies migrations. **On first boot the backend
may restart a couple of times while Postgres initializes** — the `on-failure`
restart policy handles this; it settles within a minute.

---

## 6. Verify

```bash
docker stack services notiq            # db 1/1, backend 2/2, frontend 2/2
docker service logs notiq_backend -f   # watch migrations + startup

HOST=127.0.0.1                         # or the server's address
curl -fsS http://$HOST:8080/health     # {"status":"ok",...}

# functional check (matches the release smoke test)
curl -s -X POST http://$HOST:8080/sign-up -H 'Content-Type: application/json' \
  -d '{"first_name":"Demo","last_name":"User","email":"demo@example.com","password":"Demo123!"}'
curl -s -X POST http://$HOST:8080/login  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"Demo123!"}'      # → token + refreshToken
curl -s "http://$HOST:8080/public/demo-user/blog"              # → {"data":[],"meta":{...}}
```

---

## 7. TLS / reverse proxy

Terminate TLS in front of the published ports and forward `X-Forwarded-*` (the
backend builds absolute upload URLs from the request host/proto, and trusts the
first proxy hop). Example with **Caddy** (automatic HTTPS):

```caddy
panel.example.com {
    reverse_proxy 127.0.0.1:80      # FRONTEND_PORT
}
api.example.com {
    reverse_proxy 127.0.0.1:8080    # BACKEND_PORT
}
```

Then build the frontend with `VITE_API_BASE_URL=https://api.example.com` and set
`CORS_ORIGINS=https://panel.example.com,https://www.example.com`.

---

## 8. Update (rolling, zero-downtime)

Build & push a new `TAG`, then redeploy — `update_config: order: start-first`
brings up the new task before stopping the old one:

```bash
# bump TAG in stack.env, rebuild + push both images, then:
set -a && . ./stack.env && set +a
docker stack deploy -c docker-stack.yml notiq
```

---

## 9. Backups

```bash
# Database
docker exec $(docker ps -qf name=notiq_db) \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-$(date +%F).sql

# Uploaded media (named volume)
docker run --rm -v notiq_uploads_data:/data -v "$PWD":/backup busybox \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Schedule both on a cron and ship them off-host.

---

## 10. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `image ... not found` on deploy | Locally-built images aren't in a registry. On a single-node Swarm deploy with `docker stack deploy --resolve-image never -c docker-stack.yml notiq`, or push to a registry. |
| Backend tasks show `Failed` then `Running` early on | Expected: it raced Postgres on first boot and self-healed. Confirm it reaches `2/2`. |
| `curl http://localhost:8080/...` hangs locally | `localhost` may resolve to IPv6 `::1` while the published port binds IPv4 — use `127.0.0.1` or the host IP. |
| Browser blocked by CORS | Add the exact origin (scheme + host) to `CORS_ORIGINS` and redeploy. |
| Uploaded image URLs use the wrong host | Make the reverse proxy forward `Host` and `X-Forwarded-Proto`. |
| DB auth fails | `db_url`'s embedded password/user/db must match the `db_password` secret and `POSTGRES_USER`/`POSTGRES_DB`. |

---

## Local development

For a single-host dev run use the compose file instead of the Swarm stack:

```bash
cp backend/.env.example backend/.env     # fill in DATABASE_URL + JWT_SECRET_KEY
docker compose up --build
# panel → http://localhost:5173 , API → http://localhost:4000
```
