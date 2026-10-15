# BoxxCentral API — Frontend Reference

The handoff doc for anyone building against this backend: what the system does, how
auth works, and every endpoint that exists today. It is written from the controllers in
`backend/src/` — if the two ever disagree, the code wins and this file needs fixing.

## 1. What this is

BoxxCentral is one umbrella brand over four experiences:

| Sub-brand | What it is | Backend |
|---|---|---|
| **FilmBoxx** | Cinema | Movie catalog, public screenings with per-seat tickets (Flutterwave), cinema settings |
| **GymBoxx** | Gym | Membership plans + paid one-off subscriptions (Flutterwave) |
| **BowlBoxx** | Bowling | Leaderboard for the in-venue TV display |
| **Lounge** | Bar/lounge | Menu (content only — no ordering or payment) |

Two flows move money, both through Flutterwave: FilmBoxx tickets and GymBoxx
subscriptions. Payment is only ever confirmed by Flutterwave's webhook — never by the
frontend.

## 2. Environments

| Environment | Frontend | API base URL |
|---|---|---|
| Production | `https://boxxcentral.com` | `https://api.boxxcentral.com/api/v1` |
| Staging | `https://staging.boxxcentral.com` | `https://staging-api.boxxcentral.com/api/v1` |
| Local | `http://localhost:3000` | `http://localhost:4000/api/v1` |

Every route below is relative to the base URL (`/api/v1`). The only exceptions are the
two unversioned service routes:

| Route | Returns |
|---|---|
| `GET /api` | `{ name: "BoxxCentral API", version: "v1" }` |
| `GET /api/health` | `{ status: "ok", database: "connected", uptime }` — or **503** when the database is disconnected |

## 3. Response format

**Every** response — success and error — is wrapped in the same envelope.

Success:
```ts
{
  success: true,
  message: string,      // human-readable, e.g. "Screenings fetched"
  data: T | null,       // the payload documented per endpoint below
  error: null,
  timestamp: string,    // ISO 8601
}
```

Error:
```ts
{
  success: false,
  message: string,      // always a single string — for validation errors it is
                        // the FIRST failing rule only, not the whole list
  data: unknown | null,
  error: {
    statusCode: number,
    type: string,       // exception class, e.g. "BadRequestException"
    details: string,    // the exception's message
    path: string,       // the request URL
  },
  timestamp: string,
}
```

Show `message` to the user. In the payload shapes below, "returns" always means the
contents of `data`.

## 4. Authentication

**Cookie-based, not token-in-body.** `POST /admin/login` and `POST /admin/refresh` set
two `httpOnly` cookies — `bxx_access` (15 minutes, path `/`) and `bxx_refresh` (7 days,
path `/api/v1/admin`). The tokens never appear in a response body.

- Every request that needs auth must send credentials, or the cookie never travels:
  - `fetch`: `{ credentials: 'include' }`
  - `axios`: `{ withCredentials: true }` (set on the instance)
- On a `401`, call `POST /admin/refresh` once, then retry the original request. If the
  refresh also fails, the session is dead — redirect to login. Don't do this for
  `/admin/login`, `/admin/refresh`, or `/admin/logout` themselves: a 401 there is a real
  answer, not an expired access token.
- **Only one refresh at a time.** The refresh token rotates on every use, and presenting
  an already-used one is treated as theft — the session is killed. If several requests
  401 together, they must share a single refresh call (the frontend's
  `lib/api/client/session.ts` does this).
- `Authorization: Bearer <token>` is also accepted, as a fallback for Postman/API testing.
- **Cross-site local dev**: running the frontend on `localhost` against a *deployed* API
  needs `SameSite=None` cookies. Staging is configured for that; production deliberately
  is not. Test locally against staging's API, not production's.

### Roles

No self-serve signup. The very first account comes from a one-time `POST /admin/setup`;
every account after that is created by the super admin.

| Role | Can do |
|---|---|
| `super_admin` | Everything below, plus staff accounts, payments ledger, revenue analytics, cinema settings, and contact messages |
| `cinema_admin` | Movie catalog (CRUD + poster and banner upload), screenings (CRUD) |
| `lounge_admin` | Lounge menu items (CRUD + image upload) |
| `gym_admin` | Gym plans (CRUD), gym subscriptions (list / search / activate) |

### Auth endpoints

| Method & path | Auth | Body | Returns |
|---|---|---|---|
| `POST /admin/setup` | none | `{ name, email, password }` | The new `super_admin`. Works once; **403** forever after |
| `POST /admin/login` | none · 5/min | `{ email, password }` | `{ admin: { id, name, email, role } }` + sets cookies |
| `POST /admin/refresh` | refresh cookie · 10/min | — | Same as login; rotates both tokens |
| `POST /admin/logout` | signed in | — | `null`; ends the session server-side, clears cookies |
| `GET /admin/profile` | signed in | — | `{ userId, email, role }` — use it to ask "am I signed in?" |
| `PATCH /admin/change-password` | signed in | `{ currentPassword, newPassword }` | `null` |
| `POST /admin/admins` | `super_admin` | `{ name, email, password, role }` | The new account. `role` must be `cinema_admin`, `lounge_admin`, or `gym_admin` |
| `GET /admin/admins` | `super_admin` | — | `[{ id, name, email, role }]` |
| `DELETE /admin/admins/:id` | `super_admin` | — | `null`. Can't delete yourself or the super admin |

Passwords must be at least 8 characters.

## 5. Conventions

- **Validation is strict.** Unknown body fields are rejected with a 400 — send only the
  documented fields.
- **Rate limits** apply only where listed in the tables below (per IP). Routes without a
  listed limit are not rate-limited.
- **Pagination** — payments, contact messages, and gym subscriptions take
  `page` (default 1) and `limit` (default 10) and return:
  ```ts
  { <items>: [...], meta: { total, page, limit, totalPages } }
  ```
  where `<items>` is `payments`, `messages`, or `subscriptions`.
- **File uploads** (movie posters, menu images) are `multipart/form-data` — text fields
  plus one file field (`poster` or `image`). JPEG, PNG, or WebP, max 5 MB, optional.
  Don't set `Content-Type` yourself; let the browser add the multipart boundary.
  Multipart booleans are sent as the strings `"true"` / `"false"`.
- **Prices are plain numbers in naira** — `6500`, not `"₦6,500"`. Format on the frontend
  (`n.toLocaleString('en-NG')`).
- **Money is never trusted from the client.** Ticket and subscription amounts are
  computed server-side; the client sends quantities, never prices.
- **Dates** are `"YYYY-MM-DD"` strings and times are 24-hour `"HH:mm"` strings.

## 6. Cinema (FilmBoxx)

| Method & path | Auth | Notes |
|---|---|---|
| `GET /cinema/settings` | none | VAT, rooms, default ticket price, and cleaning gap — shape below |
| `PATCH /cinema/settings` | `super_admin` | JSON body: any subset of the settings fields |
| `GET /cinema/movies` | none | Visible movies only, newest first |
| `GET /cinema/movies/all` | `super_admin`, `cinema_admin` | Includes hidden movies |
| `POST /cinema/movies` | `super_admin`, `cinema_admin` | Multipart: `title`, `synopsis?`, `genre?`, `durationMins?`, `trailerUrl?`, `rating?` + files `poster?` (portrait, 2:3) and `banner?` (wide, for the hero) |
| `PATCH /cinema/movies/:id` | `super_admin`, `cinema_admin` | Same fields, all optional, plus `visible`. A new `poster` or `banner` replaces the old one |
| `DELETE /cinema/movies/:id` | `super_admin`, `cinema_admin` | Also deletes the poster and banner from Cloudinary |

**Settings:**
```ts
{
  vatRate: number,              // percent, e.g. 7.5
  rooms: string[],              // e.g. ["Cinema 1", "Cinema 2"]
  defaultTicketPrice: number,   // used when a screening is created without a price
  screeningBufferMins: number,  // cleaning gap kept free after each screening
}
```

**Movie:**
```ts
{ _id, title, synopsis?, genre?, durationMins?, posterUrl?, bannerUrl?, trailerUrl?, rating?,
  visible, createdAt, updatedAt }
```

## 7. Screenings and tickets (FilmBoxx public)

A screening is one showing of a movie in one room at one date and time. Guests buy
seats (quantity only — no seat map). Ticket prices have VAT added on top.

| Method & path | Auth | Notes |
|---|---|---|
| `GET /screenings` | none | Visible screenings for today plus the next 6 days (Lagos time), grouped under their movies — shape below. Movies with no screenings in that window are left out |
| `GET /screenings/all?from=YYYY-MM-DD` | `super_admin`, `cinema_admin` | Every screening from `from` (default today), with `movieId` populated as `{ _id, title, durationMins }` |
| `POST /screenings` | `super_admin`, `cinema_admin` | JSON body below |
| `PATCH /screenings/:id` | `super_admin`, `cinema_admin` | Any subset of the create fields. Once any seat is held or sold, only `capacity` (not below seats taken), `ticketPrice`, and `visible` can change |
| `DELETE /screenings/:id` | `super_admin`, `cinema_admin` | Refused once any seat is held or sold — hide it instead |
| `POST /screenings/:id/tickets` | none · 5/min | Holds the seats and returns a Flutterwave payment link |

**Create screening body:**
```ts
{
  movieId: string,
  date: string,          // "YYYY-MM-DD", Lagos time, must be in the future
  time: string,          // "HH:mm", Lagos time
  screen: string,        // one of settings.rooms
  capacity: number,      // seats on sale, ≥ 1
  ticketPrice?: number,  // before VAT; defaults to settings.defaultTicketPrice
  visible?: boolean,     // default true
}
```
A screening occupies its room from `time` until `time + durationMins + screeningBufferMins`
(a movie with no `durationMins` counts as 0). Creating or moving one into an occupied window
returns **409**. Existing screenings aren't re-checked when a movie's duration changes later.

**`GET /screenings` returns:**
```ts
[{
  _id, title, synopsis?, genre?, durationMins?, posterUrl?, bannerUrl?, trailerUrl?, rating?,
  visible, createdAt, updatedAt,
  showtimes: [{ _id, date, time, screen, ticketPrice, seatsLeft }],  // _id is the screening id
}]
```

**Buy tickets body:**
```ts
{ tickets: number, guestName: string, guestEmail: string, guestPhone: string }  // tickets 1–10
```

**Buy tickets returns:**
```ts
{
  order: { orderRef, movieTitle, date, time, screen, tickets, unitPrice, subtotal,
           vatAmount, totalPrice },
  paymentLink: string,   // redirect the guest here to pay
}
```

Pricing: `subtotal = ticketPrice × tickets`, `vatAmount = round(subtotal × vatRate / 100)`,
`totalPrice = subtotal + vatAmount`.

Errors: **404** unknown or hidden screening · **400** screening already started ·
**409** sold out, or not enough seats left (the message says how many remain).

**Order statuses:** `pending` (seats held for 30 minutes while the guest pays) → `paid`,
or `expired` (seats released). A payment that lands after expiry re-takes the seats if
any are left; otherwise the payment is flagged for review (`sold_out`).

## 8. Gym (GymBoxx)

A plan is a fixed-length pass, paid once (no recurring billing). Plan prices are
all-inclusive — no VAT is added.

| Method & path | Auth | Notes |
|---|---|---|
| `GET /gym/plans` | none | Visible plans, sorted by `sortOrder` |
| `GET /gym/plans/all` | `super_admin`, `gym_admin` | Includes hidden plans |
| `POST /gym/plans` | `super_admin`, `gym_admin` | JSON body — plan fields below |
| `PATCH /gym/plans/:id` | `super_admin`, `gym_admin` | Any subset of the plan fields, plus `visible` |
| `DELETE /gym/plans/:id` | `super_admin`, `gym_admin` | |
| `POST /gym/subscriptions` | none · 5/min | Body `{ memberName, memberEmail, memberPhone, planId }`. Returns a Flutterwave payment link |
| `GET /gym/subscriptions` | `super_admin`, `gym_admin` | Query: `page`, `limit`, `status` |
| `GET /gym/subscriptions/search?query=` | `super_admin`, `gym_admin` | Front-desk lookup by name, email, phone, or reference. Up to 25 results, not paginated |
| `PATCH /gym/subscriptions/:id/activate` | `super_admin`, `gym_admin` | Starts the pass. Only works on `paid` subscriptions |

**Plan:**
```ts
{ _id, name, durationDays, price, description, features: string[], featured: boolean,
  subtitle?, visible, sortOrder, createdAt, updatedAt }
```
Create requires `name`, `durationDays`, `price`, `description`; the rest are optional.

**Create subscription returns:**
```ts
{ subscription: { subscriptionRef, planName, durationDays, price }, paymentLink: string }
```

**Statuses:** `pending` (awaiting payment; expires after 30 minutes unpaid) → `paid`
(payment confirmed — the pass has **not** started) → `active` (front desk activated it;
runs from `startDate` to `endDate`) → `expired`.

**Subscription:**
```ts
{ _id, subscriptionRef, planId, planName, durationDays, price, memberName, memberEmail,
  memberPhone, status, startDate?, endDate?, createdAt, updatedAt }
```

## 9. Payments

| Method & path | Auth | Notes |
|---|---|---|
| `POST /payments/webhook/flutterwave` | Flutterwave `verif-hash` header | Called by Flutterwave only — never by the frontend |
| `GET /payments/:idOrRef/verify` | none | The post-payment page polls this. Accepts the payment `_id` or the `BXX-…` reference |
| `GET /payments` | `super_admin` | Query: `page`, `limit`, `search` (matches reference or transaction ID) |
| `GET /payments/analytics/monthly` | `super_admin` | Successful revenue for the last 6 months |
| `GET /payments/:id` | `super_admin` | One ledger entry with its ticket order populated |

After payment, Flutterwave redirects the customer to `<frontend>/payment/confirm` with the
reference in the query string (`tx_ref`).

**Verify returns** (deliberately slim — no gateway internals):
```ts
{
  reference: string,
  localStatus: "pending" | "success" | "failed" | "refunded",  // our ledger
  gatewayStatus: string,                                      // Flutterwave's view
  amount: number,
  currency: string,
  category: "gym_subscription_payment" | "ticket_payment" | "refund",
}
```

**Monthly revenue returns:** `[{ month: "Jan", revenue: 450000 }, ...]` — months with no
revenue are omitted.

**Payment (ledger):**
```ts
{ _id, reference, transactionId?, amount, currency, type: "inflow" | "outflow", category,
  status, paymentMethod, subscriptionId?, ticketOrderId?, gatewayResponse?,
  needsReview, reviewReason?, createdAt, updatedAt }
```

`needsReview` is set when money arrived but couldn't be applied — `reviewReason` is
`amount_mismatch` or `sold_out` (tickets). These need a
refund or manual follow-up.

## 10. Menu (Lounge)

| Method & path | Auth | Notes |
|---|---|---|
| `GET /menu` | none | Visible items, newest first |
| `GET /menu/all` | `super_admin`, `lounge_admin` | Includes hidden items |
| `POST /menu` | `super_admin`, `lounge_admin` | Multipart: `name`, `category`, `price`, `description`, `imageAlt?`, `tags?`, `visible?` + file `image?` |
| `PATCH /menu/:id` | `super_admin`, `lounge_admin` | Same fields, all optional. A new `image` replaces the old one |
| `DELETE /menu/:id` | `super_admin`, `lounge_admin` | Also deletes the image from Cloudinary |

**`category`** is one of: `Food`, `Pastries`, `Pizza`, `Signature Cocktail`,
`Classic Cocktails`, `Mocktail`, `Smoothie`, `Juices`, `Shots`, `Drinks`.

**`tags`** is one comma-separated string field (e.g. `"Popular, Spicy"`); the backend
splits and trims it.

**Menu item:**
```ts
{ _id, name, category, price, description, imageUrl?, imageAlt?, tags: string[], visible,
  createdAt, updatedAt }
```

## 11. BowlBoxx leaderboard

Two boards — the 6-frame and 10-frame challenges — stored together.

| Method & path | Auth | Notes |
|---|---|---|
| `GET /bowlboxx/leaderboard` | none | Both boards. The TV display polls this |
| `PATCH /bowlboxx/leaderboard/:board` | **none** · 30/min | Replaces one board. `:board` is `six-frame` or `ten-frame`. ⚠️ Not authenticated yet — see `todo.md` |

**Update body:** `{ subtitle: string, entries: [{ player: string, score: number }] }` —
at most 10 entries, scores are whole numbers ≥ 0.

**Leaderboard:**
```ts
{
  sixFrame: { subtitle, entries: [{ player, score }] },
  tenFrame: { subtitle, entries: [{ player, score }] },
}
```

## 12. Contact

| Method & path | Auth | Notes |
|---|---|---|
| `POST /contact` | none · 3/min | The public contact form |
| `GET /contact` | `super_admin` | Query: `page`, `limit`, `unread=true` |
| `PATCH /contact/:id/read` | `super_admin` | Mark handled |
| `DELETE /contact/:id` | `super_admin` | |

**Create body:**
```ts
{ name: string, email: string, phone?: string, subject?: string, message: string }
```
Max lengths: name 100, phone 30, subject 150, message 3000.

**Message:**
```ts
{ _id, name, email, phone?, subject?, message, read: boolean, createdAt, updatedAt }
```

## 13. Not built yet (don't build against these)

- **Admin UI for screenings and ticket orders** — the API exists; the dashboard
  screens come with the admin redesign. Until then, use the endpoints directly.
- **Ticket check-in** — there is no endpoint yet to mark an order as used at the door.
- **Refunds** — there is no refund endpoint; flagged payments are refunded by hand in Flutterwave.
