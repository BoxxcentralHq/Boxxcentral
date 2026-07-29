# BoxxCentral API — Frontend Reference

This is the handoff doc for whoever builds against this backend. It covers what the
system actually does, how auth works, and every endpoint that exists today.

## 1. What this is

BoxxCentral is one umbrella brand over four experiences:

| Sub-brand | What it is | Transactional? |
|---|---|---|
| **FilmBoxx** | Private cinema — the whole room is booked for a slot, not per-seat | **Yes** — the only thing that takes payment |
| **GymBoxx** | Gym studio | No — showcase only |
| **BowlBoxx** | Bowling | No — showcase only |
| **Lounge** | Bar/lounge | No — has a real backend-managed menu, but no ordering/payment |

So the backend has exactly one money-moving flow (FilmBoxx bookings → Flutterwave), and
two content-management surfaces that aren't transactional (the movie catalog, the lounge
menu). Everything else is either auth/admin plumbing or read-only public content.

## 2. Environments

| Environment | Frontend | API base URL |
|---|---|---|
| Production | `https://boxxcentral.com` | `https://api.boxxcentral.com/api/v1` |
| Staging | `https://staging.boxxcentral.com` | `https://staging-api.boxxcentral.com/api/v1` |
| Local backend | `http://localhost:3000` | `http://localhost:4000/api/v1` |

All routes are versioned under `/api/v1` — this is a URI prefix set globally, not
something you add per-request.

## 3. Authentication

**Cookie-based, not token-in-body.** `POST /admin/login` and `POST /admin/refresh` set
two `httpOnly` cookies (`bxx_access`, 15 minutes; `bxx_refresh`, 7 days) — the access/
refresh tokens are never in the JSON response, so the frontend never touches them
directly. Every request that needs auth just needs the cookie attached; there's no
`Authorization: Bearer` header to manage in the app's own code.

**What this means practically:**

- Every fetch to the API must include credentials, or the cookie never gets sent:
  - `fetch`: `{ credentials: 'include' }`
  - `axios`: `{ withCredentials: true }` (or set globally on the instance)
- On a `401`, call `POST /admin/refresh` once, then retry the original request. If the
  refresh also fails, the session is genuinely dead — redirect to login. Don't do this
  for `/admin/login`, `/admin/refresh`, or `/admin/logout` themselves — a 401 there is a
  real answer (wrong password / dead refresh token), not an expired-access-token signal.
- **Cross-site local dev**: if you run the frontend on `localhost` against a *deployed*
  API (staging or prod), the cookie's `SameSite` policy matters. Staging is configured to
  allow this (`SameSite=None`); production is not, on purpose — production's frontend and
  API share a domain and don't need it. If you're testing locally, point at staging's API,
  not production's.

### Roles

Three admin roles exist. None of them are self-serve signup — accounts are created by a
super admin (or, for the very first account ever, a one-time `/admin/setup` call).

| Role | Can do |
|---|---|
| `super_admin` | Everything — admin account management, payments ledger, revenue analytics, cinema settings/pricing, movie catalog, bookings, lounge menu, contact messages |
| `cinema_admin` | Movie catalog (CRUD + poster upload), bookings (view/cancel/complete). Sees a booking's payment *status* but not the ledger. |
| `lounge_admin` | Lounge menu items only (CRUD + image upload) |

### Auth endpoints

| Method & Path | Auth | Body | Notes |
|---|---|---|---|
| `POST /admin/setup` | none | `{ name, email, password }` | One-time only — creates the first `super_admin`, then 403s forever after |
| `POST /admin/login` | none, rate-limited (5/min) | `{ email, password }` | Sets auth cookies. Returns `{ admin: { id, name, email, role } }` |
| `POST /admin/refresh` | refresh cookie, rate-limited (10/min) | — | Rotates both tokens. Same response shape as login |
| `POST /admin/logout` | access cookie | — | Kills the session server-side, clears cookies |
| `GET /admin/profile` | access cookie | — | Returns the JWT payload: `{ userId, email, role }` — use this to check "am I logged in" |
| `PATCH /admin/change-password` | access cookie | `{ currentPassword, newPassword }` | |
| `POST /admin/admins` | `super_admin` | `{ name, email, password, role }` — `role` must be `cinema_admin` or `lounge_admin` | Creates a staff account |
| `GET /admin/admins` | `super_admin` | — | List all admin accounts |
| `DELETE /admin/admins/:id` | `super_admin` | — | Can't delete yourself or the super admin |

## 4. Conventions

- **Errors** follow Nest's default shape: `{ statusCode, message, error }`. `message` is
  either a string or an array of strings (validation errors list every failing field).
- **Pagination** (bookings, payments, contact messages) all return the same shape:
  ```json
  { "bookings": [...], "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 } }
  ```
  (the array key changes per resource — `bookings`, `payments`, `messages`)
- **File uploads** (movie posters, menu item images) are `multipart/form-data`, not JSON
  — text fields alongside a file field (`poster` or `image`). Don't set `Content-Type`
  manually; let the browser set the multipart boundary.
- **Prices are raw numbers**, not formatted strings — e.g. `6500`, not `"₦6,500"`. Format
  for display on the frontend (`n.toLocaleString('en-NG')`), don't expect currency symbols
  or commas from the API.
- **Money is never trusted from the client.** Booking price (`subtotal`, `vatAmount`,
  `totalPrice`) is always computed server-side from `CinemaSettings` — you send `guests`,
  the API tells you what it costs.

## 5. Cinema (FilmBoxx)

| Method & Path | Auth | Notes |
|---|---|---|
| `GET /cinema/settings` | none | Pricing, VAT rate, time slots, booking on/off — drives the booking form's pricing display |
| `PATCH /cinema/settings` | `super_admin` | Body: any subset of `basePrice, includedGuests, maxGuests, extraSeatPrice, sessionDurationHours, vatRate, timeSlots[], bookingEnabled` |
| `GET /cinema/movies` | none | Visible movies only — the public catalog |
| `GET /cinema/movies/all` | `super_admin`, `cinema_admin` | Includes hidden movies |
| `POST /cinema/movies` | `super_admin`, `cinema_admin` | Multipart. Fields: `title, synopsis?, genre?, durationMins?` + file field `poster` |
| `PATCH /cinema/movies/:id` | `super_admin`, `cinema_admin` | Same fields, all optional, plus `visible` (boolean) |
| `DELETE /cinema/movies/:id` | `super_admin`, `cinema_admin` | |

**Movie response shape:**
```ts
{ _id, title, synopsis?, genre?, durationMins?, posterUrl?, visible, createdAt }
```

**Public settings response shape:**
```ts
{ basePrice, includedGuests, maxGuests, extraSeatPrice, sessionDurationHours, vatRate, timeSlots: string[], bookingEnabled }
```

## 6. Bookings

| Method & Path | Auth | Notes |
|---|---|---|
| `POST /bookings` | none, rate-limited (5/min) | Creates a booking + a Flutterwave payment link. Body below. |
| `GET /bookings/availability?date=YYYY-MM-DD` | none | Which time slots are free that day |
| `GET /bookings` | `super_admin`, `cinema_admin` | Query: `page, limit, date, status` |
| `PATCH /bookings/:id/cancel` | `super_admin`, `cinema_admin` | Frees the slot |
| `PATCH /bookings/:id/complete` | `super_admin`, `cinema_admin` | Marks the visit done |

**Create booking body:**
```ts
{
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;       // "YYYY-MM-DD"
  timeSlot: string;    // "HH:mm", must match one of GET /cinema/settings' timeSlots
  guests: number;
  notes?: string;
}
```

**Create booking response:**
```ts
{
  booking: { bookingRef, date, timeSlot, guests, subtotal, vatAmount, totalPrice },
  paymentLink: string  // redirect the guest here to pay
}
```

**Availability response:**
```ts
{ date, bookingEnabled, slots: [{ time: "19:00", available: true }, ...] }
```

**Booking status values:** `pending` (awaiting payment, auto-cancels after 30 min unpaid) →
`reserved` (paid) → `completed` or `cancelled`.

**Booking object shape (admin list):**
```ts
{ _id, bookingRef, experience, guestName, guestEmail, guestPhone, date, timeSlot, guests, subtotal, vatAmount, totalPrice, status, notes?, createdAt }
```

## 7. Payments

| Method & Path | Auth | Notes |
|---|---|---|
| `POST /payments/webhook/flutterwave` | Flutterwave signature header, not user auth | Not something the frontend calls |
| `GET /payments/:idOrRef/verify` | none | Post-payment redirect page polls this to show confirmed/failed |
| `GET /payments` | `super_admin` only | Query: `page, limit, search`. `cinema_admin` cannot see this — deliberate, financial data stays super-admin-only |
| `GET /payments/analytics/monthly` | `super_admin` only | Revenue for the last 6 months, for a dashboard chart |
| `GET /payments/:id` | `super_admin` only | Single ledger entry with its booking populated |

**Verify response (public, deliberately slim — no gateway internals exposed):**
```ts
{ reference, localStatus: "pending"|"success"|"failed"|"refunded", gatewayStatus, amount, currency }
```

**Monthly revenue response:**
```ts
[{ month: "Jan", revenue: 450000 }, ...]
```

## 8. Menu (Lounge)

| Method & Path | Auth | Notes |
|---|---|---|
| `GET /menu` | none | Visible items only — what the Lounge page renders |
| `GET /menu/all` | `super_admin`, `lounge_admin` | Includes hidden items |
| `POST /menu` | `super_admin`, `lounge_admin` | Multipart. Fields: `name, category, price, description, imageAlt?, tags?` + file field `image` |
| `PATCH /menu/:id` | `super_admin`, `lounge_admin` | Same fields, all optional, plus `visible` |
| `DELETE /menu/:id` | `super_admin`, `lounge_admin` | |

**`category` must be one of:** `Food, Pastries, Pizza, Signature Cocktail, Classic Cocktails, Mocktail, Smoothie, Juices, Shots, Drinks`

**`tags`** on the create/update multipart form is a single comma-separated string field
(e.g. `"Popular, Spicy"`) — the backend splits and trims it. Not a JSON array.

**Menu item response shape:**
```ts
{ _id, name, category, price, description, imageUrl?, imageAlt?, tags: string[], visible, createdAt }
```

## 9. Contact

| Method & Path | Auth | Notes |
|---|---|---|
| `POST /contact` | none, rate-limited (3/min) | The public contact form |
| `GET /contact` | `super_admin` only | Query: `page, limit, unread` |
| `PATCH /contact/:id/read` | `super_admin` only | Mark handled |
| `DELETE /contact/:id` | `super_admin` only | |

**Create message body:**
```ts
{ name: string; email: string; phone?: string; subject?: string; message: string }
```

**Message response shape:**
```ts
{ _id, name, email, phone?, subject?, message, read: boolean, createdAt }
```

## 10. Things that don't exist yet (don't build against these)

- No refund endpoint — cancelling a booking frees the slot but doesn't touch Flutterwave
- No public ticketing/per-seat booking for FilmBoxx — it's whole-room-only
- GymBoxx and BowlBoxx have no backend content at all — their copy lives in the
  frontend's own static config, not this API
- No Odoo integration — this backend is fully self-contained, doesn't call out to Odoo
  or depend on it for anything
