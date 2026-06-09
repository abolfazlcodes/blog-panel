# Deploying Notiq (Docker Swarm)

Production deployment uses two images — `notiq-backend` (Express API + Postgres
migrations) and `notiq-frontend` (the panel built to static files, served by
nginx) — orchestrated by [`docker-stack.yml`](docker-stack.yml) with a Postgres
service, named volumes, and Swarm secrets.

```
            ┌────────────┐         ┌────────────┐        ┌──────────┐
  :80  ───▶ │  frontend  │   :8080 │  backend   │ ─────▶ │ postgres │
  (nginx SPA)│  (×2)      │  ◀──────│  (×2)      │        │  (×1)    │
            └────────────┘  API    └────────────┘        └──────────┘
                                     uploads_data vol      db_data vol
```

> **TLS:** the stack publishes plain HTTP (`:80`, `:8080`). In production put it
> behind a TLS-terminating reverse proxy (Traefik, Caddy, nginx, or a cloud LB).

---

## 1. Prerequisites

- Docker Engine with Swarm mode: `docker swarm init`
- A container registry you can push to (Docker Hub, GHCR, a private registry).
  For a single-node Swarm you can skip the registry and build locally.

---

## 2. Build & push the images

The frontend bakes its API URL at **build time**, so set `VITE_API_BASE_URL` to
the backend's public URL when you build it.

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

## 3. Create the secrets

The stack reads three Swarm secrets. `db_url` is the full Prisma connection
string and **must** embed the same password as `db_password`.

```bash
printf 'a-long-random-string'                              | docker secret create jwt_secret -
printf 'super-secret-db-password'                          | docker secret create db_password -
printf 'postgresql://blog_user:super-secret-db-password@db:5432/blog_panel' \
                                                           | docker secret create db_url -
```

> Use `printf` (not `echo`) so no trailing newline sneaks into the secret.

---

## 4. Configure & deploy

`docker stack deploy` substitutes variables from your shell environment:

```bash
export REGISTRY=ghcr.io/yourname
export TAG=1.0.0
export CORS_ORIGINS=https://panel.example.com,https://www.example.com
export POSTGRES_USER=blog_user
export POSTGRES_DB=blog_panel

docker stack deploy -c docker-stack.yml notiq
```

On boot the backend entrypoint loads the secrets, runs `prisma migrate deploy`,
then starts the API. With multiple replicas, Prisma's migration advisory lock
serializes them — only one applies the migrations. If the DB isn't ready yet the
container exits and Swarm restarts it until it succeeds.

---

## 5. Verify

```bash
docker stack services notiq          # all replicas should reach n/n
docker service logs notiq_backend -f # watch migrations + startup
curl -fsS http://<host>:8080/health  # {"status":"ok",...}
```

---

## 6. Update (rolling, zero-downtime)

Build & push a new `TAG`, then redeploy — `update_config: order: start-first`
brings up the new task before stopping the old one:

```bash
export TAG=1.0.1
# rebuild + push both images...
docker stack deploy -c docker-stack.yml notiq
```

---

## 7. Backups

```bash
# Database
docker exec $(docker ps -qf name=notiq_db) \
  pg_dump -U blog_user blog_panel > backup-$(date +%F).sql

# Uploaded media (named volume)
docker run --rm -v notiq_uploads_data:/data -v "$PWD":/backup busybox \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

---

## Local development

For a single-host dev run use the compose file instead of the Swarm stack:

```bash
cp backend/.env.example backend/.env     # fill in DATABASE_URL + JWT_SECRET_KEY
docker compose up --build
# panel → http://localhost:5173 , API → http://localhost:4000
```
