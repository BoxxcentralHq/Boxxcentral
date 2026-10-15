# BoxxCentral — Fix List

Issues found in the codebase review. Work through them in order; tick each one off when it's fixed and verified.

---

# Execution plan

Work happens on a feature branch, gets verified on staging (`development`), and only then merges to `main`, because pushing to `main` deploys production. Each step ends with `pnpm lint` and `pnpm build` passing in both apps, followed by a reviewed commit.

## Phase 1: Fix the drift (docs, comments, and copy that no longer match the code)
- [x] **D1** Merge [API.md](API.md) and [frontend/api.md](frontend/api.md) into one doc, rewritten from the actual controllers. Add gym, BowlBoxx, rooms, `gym_admin`, the response envelope `{ success, message, data, error, timestamp }`, `room` on availability, and `category` on verify. Delete the other copy.
- [x] **D2** Change "Paystack" to "Flutterwave" in the FilmBoxx page metadata ([frontend/app/filmboxx/page.tsx](frontend/app/filmboxx/page.tsx)).
- [x] **D3** Delete the unused `getAvailability(date)` from [frontend/lib/api/server.ts](frontend/lib/api/server.ts); it never sends `room`.
- [x] **D4** Fix stale comments: [frontend/lib/auth.ts:70](frontend/lib/auth.ts#L70) (add `gym_admin`) and [frontend/lib/api/core.ts](frontend/lib/api/core.ts) (error body shape).
- [x] **D5** Replace the starter-template [backend/README.md](backend/README.md) with real setup steps: env vars, running MongoDB locally, and the seed scripts.

- [x] Removed the misleading rate-limit comment in `backend/src/app.module.ts`. It claimed a global 20 req / 10 s limit, but only routes with `@UseGuards(ThrottlerGuard)` are limited.

**Found during Phase 1; needs a decision (not changed yet):**
- [ ] **D6** Both compose files' backend healthcheck requests `/api/v1`, which returns 404, and `fetch()` doesn't reject on a 404, so the container always reports healthy even with the database down. It should request `/api/health` and exit non-zero unless `res.ok`. This touches the production deploy config.
- [ ] **D7** Decide whether to make rate limiting global (register `ThrottlerGuard` as an `APP_GUARD`). Today, unlisted routes have no limit. If enabled, check the admin pages and the leaderboard's 2.5 s polling stay under the limit.
- [ ] **D8** Pre-existing lint error: `backend/src/bowlboxx/bowlboxx.service.ts` line 1 needs prettier formatting. CI passes only because `pnpm lint` runs with `--fix`.
- [ ] **D9** `frontend/README.md` is still the create-next-app template.

## Phase 2: Public booking (private booking removed)

**Decisions (agreed):**
- **Private (whole-room) booking was removed entirely** on 2026-10-15: the `/bookings` API, `BookingSection`, the admin Bookings page, the private cinema settings fields, and the old dev bookings and their payments. It can be recovered from git history if it ever comes back.
- Public screenings are **dated**: the admin creates each one with movie, room, date, and time.
- Screenings block other screenings in the same room (start time plus movie duration, or 0 if unknown, plus the cleaning gap).
- Customers pick a **ticket quantity only** (no seat map).
- Ticket price is set **per screening**, with the default taken from cinema settings.
- **VAT is added on top** of ticket prices using `CinemaSettings.vatRate` (currently 7.5%), as before. Price, VAT, and total are shown before payment.
- `Screening` uses the dummy data's field names: `movieId`, `date`, `time`, `screen`, `ticketPrice`, `capacity`, `seatsHeld`, `seatsSold`, `visible`. The public API returns movies with `showtimes[]` in the dummy shape, with `_id`, `date`, `ticketPrice`, and `seatsLeft` added.
- `Movie` gains `trailerUrl` and `rating`.

### 2A. Harden the payment pipeline (both flows depend on it; covers issues #3 and #4)
- [x] The webhook verifies the transaction with Flutterwave and checks that the amount and currency match the ledger before marking it successful.
- [x] Make the webhook idempotent: skip payments already in a final state, never let `failed` overwrite `success`, and never send a confirmation email twice.
- [x] A late payment for a slot that has since been taken is flagged for refund or manual follow-up instead of returning a 500.
- [x] Escape all user-supplied values in the email templates.
- [x] Unit tests for the above.

### 2C. Public booking (per-seat tickets)
- [x] Backend: `Screening` model (fields as above). Admin-only API endpoints to create, edit, and delete screenings (no admin UI yet), plus a public endpoint listing upcoming screenings grouped by movie.
- [ ] (Not started; seeding is on hold) `backend/scripts/seed-screenings.js`: creates screenings through the real API with an admin login, the same way `seed-gym-plans.js` does. This is how screenings get created until the admin redesign.
- [x] Backend: ticket purchase with an atomic seat hold (no overselling the last seat), a 30-minute hold for unpaid tickets, payment through the 2A pipeline, and a confirmation email.
- [x] Backend: reject a screening whose room and time range overlap another screening in the same room (start time plus movie duration plus a cleaning buffer).
- [x] Frontend: replace the mock [frontend/lib/publicScreenings.ts](frontend/lib/publicScreenings.ts) with the real endpoint, and drive showtimes from screenings instead of `Movie.showtimes`.
- [x] Screen labels now come from each screening's `screen`, which must be one of `CinemaSettings.rooms` (`Cinema 1` / `Cinema 2`). The hardcoded `Hall 1` / `Hall 2` labels went with the dummy data.
- [x] Remove the placeholder movies (`dummy-movies.ts`) from production; show an empty state instead.

### Deferred to the admin dashboard redesign (separate project, after public booking ships)
- Screenings manager page, including a "repeat daily for N days" option that skips days where the time would clash.
- Ticket orders shown in the admin, including in the payments view.
- Movie form fields for `trailerUrl` and `rating`.
- Payments flagged `needsReview` (`amount_mismatch`, `sold_out`) shown in the payments view with a filter, so staff can refund or rebook. Until then, find them in the database with `{ needsReview: true }`.

### 2D. End-to-end test on staging (Flutterwave test mode)
- [ ] Public tickets: buy and pay; failed payment; abandoned payment that expires and releases its seats; duplicate webhook; two people buying the last seat; admin creating overlapping screenings is rejected.
- [ ] Gym subscriptions still work end to end, since they share the 2A pipeline.

---

# Issue details

## 1. FilmBoxx's real checkout isn't on any page
- [ ] **Fix**

**Problem:** `/filmboxx` renders `CinemaLobby` → `MovieBookingDialog`, which books through [frontend/lib/publicScreenings.ts](frontend/lib/publicScreenings.ts). That is a **mock**: after an 800 ms delay it shows the customer a made-up `PUB-…` reference and a price, but no payment is taken and nothing is stored. The real Flutterwave flow ([frontend/components/BookingSection.tsx](frontend/components/BookingSection.tsx)) only renders through `ExperiencePage`, and the FilmBoxx page doesn't use `ExperiencePage`, so no page shows that form.

**Impact:** a customer can "book" a screening, receive a reference, and arrive to find no booking exists.

**Files:** [frontend/app/filmboxx/page.tsx](frontend/app/filmboxx/page.tsx), [frontend/app/filmboxx/_components/CinemaLobby.tsx](frontend/app/filmboxx/_components/CinemaLobby.tsx), [frontend/components/MovieBookingDialog.tsx](frontend/components/MovieBookingDialog.tsx), [frontend/lib/publicScreenings.ts](frontend/lib/publicScreenings.ts)

**Decision needed:** should FilmBoxx offer private-room booking only (show `BookingSection`), or also public per-seat tickets (needs a new backend endpoint)? Until one is built, the mock ticket flow must not reach real customers.

---

## 2. Anyone can edit the BowlBoxx leaderboard
- [ ] **Fix**

**Problem:** `PATCH /bowlboxx/leaderboard/:board` has no `JwtAuthGuard`/`RolesGuard`, and the staff page `/bowlboxx/leaderboard/edit` is public. Anyone who finds the URL can overwrite the scores shown on the TV display.

**Files:** [backend/src/bowlboxx/bowlboxx.controller.ts](backend/src/bowlboxx/bowlboxx.controller.ts), [frontend/app/bowlboxx/leaderboard/edit/page.tsx](frontend/app/bowlboxx/leaderboard/edit/page.tsx)

**Fix direction:** add auth guards on the backend and either move the editor under `/admin` or protect it the same way `AdminShell` does. Decide which role(s) may edit (e.g. `super_admin` plus a new or existing staff role).

---

## 3. Payment webhook trusts what it's sent and isn't idempotent
- [ ] **Fix**

**Problems** in `handleWebhook` ([backend/src/payments/payments.service.ts](backend/src/payments/payments.service.ts)):
- **Trusts the payload:** it marks a payment successful based on the `status` in the webhook body without calling Flutterwave's verify endpoint or checking that the amount and currency match the ledger.
- **Not idempotent:** a retried webhook sends the confirmation email again, and a later "failed" event can overwrite a payment that already succeeded.
- **Late payment after expiry:** if an unpaid booking expired after 30 minutes and someone else took the slot, a late successful payment tries to set the old booking back to `reserved`. That hits the unique index (E11000) and returns a 500. The customer has paid but has no booking, and Flutterwave keeps retrying.

**Fix direction:** verify with Flutterwave before marking success, check the amount, skip anything already in a final state, and handle the slot-conflict case explicitly (flag it for refund or manual follow-up).

---

## 4. Customer names go into emails unescaped
- [ ] **Fix**

**Problem:** guest and member names are inserted directly into the email HTML (e.g. [backend/src/email/email.service.ts:184](backend/src/email/email.service.ts#L184), also lines 338 and 420). Anyone booking can inject HTML into an email sent from the BoxxCentral bookings address.

**Fix direction:** add an `escapeHtml()` helper and apply it to every user-supplied value in the templates.

---

## 5. Unescaped user input in search regexes
- [ ] **Fix**

**Problem:**
- `GymService.search` does `new RegExp(query, 'i')` on raw input, so input like `(` throws and returns a 500. It can also be abused to make the database do excessive regex work (ReDoS).
- `PaymentsService.findAll` passes `search` straight into `$regex`, with the same issue.

**Files:** [backend/src/gym/gym.service.ts](backend/src/gym/gym.service.ts), [backend/src/payments/payments.service.ts](backend/src/payments/payments.service.ts)

**Fix direction:** escape regex special characters before building the query.

---

## 6. Smaller issues
- [ ] `getAvailability(date)` in [frontend/lib/api/server.ts](frontend/lib/api/server.ts) doesn't send `room`, so the backend would always return 400. Nothing calls it; fix it or delete it.
- [ ] The FilmBoxx page description says "Paystack", but the site uses Flutterwave ([frontend/app/filmboxx/page.tsx](frontend/app/filmboxx/page.tsx)).
- [ ] Placeholder movies from `dummy-movies.ts` appear in production whenever the API is down or the catalogue is empty. Show an empty or error state in production instead.
- [ ] Pagination `limit` has no upper bound on bookings, payments, contact messages, or gym subscriptions (e.g. `?limit=1000000`). Cap it, e.g. at 100.
- [ ] [API.md](API.md) is out of date: it's missing gym, BowlBoxx, rooms, and `gym_admin`, and describes the wrong error/response shape (the real one is `{ success, message, data, error, timestamp }`).
- [ ] [backend/README.md](backend/README.md) is still the NestJS starter template. Replace it with real setup instructions.
- [ ] No git repository at the `Boxxcentral-hq` root (check whether `Boxxcentral/` is its own repo).
