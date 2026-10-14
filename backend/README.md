# BoxxCentral API

NestJS 11 + MongoDB (Mongoose) backend for BoxxCentral — FilmBoxx, GymBoxx, BowlBoxx, and
the Lounge. Payments go through Flutterwave, images through Cloudinary, and email through
ZeptoMail.

- **Endpoint reference:** [`../API.md`](../API.md)
- **Open issues and plan:** [`../todo.md`](../todo.md)

## Requirements

- Node.js 22
- pnpm 11 (`corepack enable` picks up the version pinned in `package.json`)
- A MongoDB instance you can reach — see [MongoDB](#mongodb)

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in the values — see below
pnpm start:dev         # http://localhost:4000/api/v1, recompiles on save
```

Check it's up: `curl http://localhost:4000/api/health` should report
`"database": "connected"`.

**If startup hangs before "Nest application successfully started"**, the app almost
certainly can't reach MongoDB — it keeps retrying the connection instead of failing
straight away. Make sure MongoDB is running and that `MONGODB_URI` points at it.

### First admin account

There's no signup. Create the first `super_admin` once, against an empty `admins`
collection:

```bash
curl -X POST http://localhost:4000/api/v1/admin/setup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Your Name","email":"you@boxxcentral.com","password":"at-least-8-chars"}'
```

After that, the endpoint returns 403 and all other accounts are created by the super
admin (Admin → Account).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no | Defaults to `4000` |
| `NODE_ENV` | no | `production` makes cookies `Secure` and logs raw JSON; anything else pretty-prints logs |
| `FRONTEND_URL` | yes | Allowed CORS origin(s), comma-separated. The **first** one is where Flutterwave sends customers back after paying |
| `LOG_LEVEL` | no | pino level, defaults to `info` |
| `MONGODB_URI` | **yes** | The app won't start without it |
| `JWT_SECRET` | **yes** | Signs access tokens. Long random string |
| `JWT_REFRESH_SECRET` | **yes** | Signs refresh tokens. Must differ from `JWT_SECRET` |
| `COOKIE_SAME_SITE` | no | Leave unset (`lax`). Set to `none` only when the frontend runs cross-site from the API, e.g. a local frontend against staging |
| `FLW_SECRET_KEY` | for payments | Flutterwave secret key. Bookings and gym subscriptions fail without it |
| `FLW_SECRET_HASH` | for payments | Must match the webhook "secret hash" set in the Flutterwave dashboard |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | for uploads | Movie posters and menu images |
| `ZEPTOMAIL_URL` | no | Defaults to `https://api.zeptomail.com/` |
| `ZEPTOMAIL_TOKEN` | for email | Booking and membership emails fail without it |
| `MAIL_FROM`, `MAIL_FROM_NAME`, `MAIL_NOREPLY` | no | Sender addresses and display name |

Generate secrets with `openssl rand -base64 48`.

## MongoDB

Any MongoDB 7+ instance works. The quickest local option is Docker:

```bash
docker run -d --name boxx-mongo -p 27017:27017 mongo:7
# MONGODB_URI=mongodb://127.0.0.1:27017/boxxcentral_dev
```

On first boot the app creates the cinema-settings and leaderboard records with defaults.
Everything else starts empty.

Staging and production share one standalone Mongo container on the VPS, in separate
databases (`boxxcentral_dev` for staging). It isn't part of the app's Docker Compose
stack.

## Seed scripts

Both scripts go through the **real API** with an admin login, rather than writing to the
database directly, so validation and Cloudinary uploads happen exactly as they do from the
dashboard. Run them from the repo root against a running API.

**Always do a dry run first** — it prints what would happen without changing anything.

### `scripts/seed-gym-plans.js`

Creates the standard GymBoxx membership plans. Skips any plan whose name already exists,
so it's safe to re-run.

```bash
GYM_SEED_API_BASE=http://localhost:4000/api/v1 \
GYM_SEED_ADMIN_EMAIL=you@boxxcentral.com \
GYM_SEED_ADMIN_PASSWORD=•••• \
GYM_SEED_DRY_RUN=1 \
node backend/scripts/seed-gym-plans.js
```

### `scripts/seed-menu.js`

⚠️ **Deletes every existing menu item**, then re-creates the menu from
`frontend/lib/menudata.json`, uploading images from
`frontend/public/boxxcentral-images/`.

```bash
MENU_SEED_API_BASE=http://localhost:4000/api/v1 \
MENU_SEED_ADMIN_EMAIL=you@boxxcentral.com \
MENU_SEED_ADMIN_PASSWORD=•••• \
MENU_SEED_DRY_RUN=1 \
node backend/scripts/seed-menu.js
```

Remove the `*_DRY_RUN=1` line to run for real.

## Scripts

| Command | Does |
|---|---|
| `pnpm start:dev` | Run with watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start:prod` | Run the compiled build |
| `pnpm lint` | ESLint, with auto-fix |
| `pnpm test` | Unit tests (`*.spec.ts`) |
| `pnpm test:e2e` | End-to-end tests (`test/`) |

CI runs `pnpm lint` and `pnpm build` on every push to `main` and `development`.

## Deployment

Handled by GitHub Actions (`../.github/workflows/`):

- Push to **`development`** → builds images tagged `staging` → deploys to staging.
- Push to **`main`** → builds images tagged `latest` → deploys to **production**.

Images are pushed to GHCR, and the workflow SSHes into the VPS and runs
`docker compose up`. Secrets live in GitHub Actions secrets and are passed into that
session as environment variables — never written to a file on the server.

## Other files

- `admstest.js` — a standalone test server for the ZKTeco ADMS push protocol (face-scan
  access device). Not part of the Nest app. Run with `node admstest.js`; it listens on
  port 8088.
