#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.FILMBOXX_SEED_API_BASE;
const ADMIN_EMAIL = process.env.FILMBOXX_SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.FILMBOXX_SEED_ADMIN_PASSWORD;
const DRY_RUN = process.env.FILMBOXX_SEED_DRY_RUN === '1';

const SEED_DIR = path.resolve(__dirname, 'filmboxx');
const IMAGES_DIR = path.join(SEED_DIR, 'images');
const MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

if (!API_BASE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Set FILMBOXX_SEED_API_BASE, FILMBOXX_SEED_ADMIN_EMAIL, FILMBOXX_SEED_ADMIN_PASSWORD (env vars).',
  );
  process.exit(1);
}

const { movies, schedule } = JSON.parse(
  fs.readFileSync(path.join(SEED_DIR, 'movies.json'), 'utf8'),
);

let cookieJar = '';

async function login() {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  cookieJar = res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  console.log('Logged in.');
}

async function api(pathname, options = {}) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers: { ...(options.headers ?? {}), Cookie: cookieJar },
  });
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    data: body.data,
    message: body.message,
  };
}

const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

function findImage(slug, kind) {
  const wanted = normalize(`${slug}-${kind}`);
  return fs
    .readdirSync(IMAGES_DIR)
    .find(
      (file) =>
        /\.(jpe?g|png|webp)$/i.test(file) &&
        normalize(path.parse(file).name) === wanted,
    );
}

function appendImage(form, field, file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const buffer = fs.readFileSync(path.join(IMAGES_DIR, file));
  form.append(field, new Blob([buffer], { type: MIME[ext] }), file);
}

function datesBetween(from, to) {
  const dates = [];
  for (
    let d = new Date(`${from}T00:00:00Z`);
    d <= new Date(`${to}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function checkData() {
  const problems = [];
  const slugs = new Set(movies.map((m) => m.slug));
  if (!Number.isInteger(schedule.capacity) || schedule.capacity < 1) {
    problems.push('schedule.capacity must be a whole number of seats (≥ 1)');
  }
  for (const slot of schedule.daily) {
    if (!slugs.has(slot.movie)) {
      problems.push(
        `schedule slot ${slot.screen} ${slot.time}: unknown movie "${slot.movie}"`,
      );
    }
  }
  return problems;
}

async function ensureMovies() {
  const { ok, status, data } = await api('/cinema/movies/all');
  if (!ok) throw new Error(`GET /cinema/movies/all failed: ${status}`);
  const byTitle = new Map(data.map((m) => [m.title, m]));
  const ids = {};

  for (const movie of movies) {
    const existing = byTitle.get(movie.title);
    if (existing) {
      ids[movie.slug] = existing._id;
      console.log(`  exists: ${movie.title}`);
      continue;
    }

    const poster = findImage(movie.slug, 'poster');
    const banner = findImage(movie.slug, 'banner');
    if (DRY_RUN) {
      ids[movie.slug] = `dry-run-${movie.slug}`;
      console.log(
        `  [dry-run] would create: ${movie.title} (poster: ${poster ?? 'none'}, banner: ${banner ?? 'none'})`,
      );
      continue;
    }

    const form = new FormData();
    form.append('title', movie.title);
    form.append('synopsis', movie.synopsis);
    form.append('genre', movie.genre);
    if (movie.durationMins) {
      form.append('durationMins', String(movie.durationMins));
    }
    if (movie.rating) form.append('rating', movie.rating);
    if (movie.trailerUrl) form.append('trailerUrl', movie.trailerUrl);
    if (poster) appendImage(form, 'poster', poster);
    if (banner) appendImage(form, 'banner', banner);

    const res = await api('/cinema/movies', { method: 'POST', body: form });
    if (!res.ok) {
      throw new Error(
        `Creating "${movie.title}" failed: ${res.status} ${res.message}`,
      );
    }
    ids[movie.slug] = res.data._id;
    console.log(`  created: ${movie.title}${banner ? ' (with banner)' : ''}`);
  }
  return ids;
}

async function createScreenings(movieIds) {
  const { ok, status, data } = await api(
    `/screenings/all?from=${schedule.from}`,
  );
  if (!ok) throw new Error(`GET /screenings/all failed: ${status}`);
  const taken = new Set(data.map((s) => `${s.screen}|${s.date}|${s.time}`));
  const counts = { created: 0, exists: 0, past: 0, failed: 0 };

  for (const date of datesBetween(schedule.from, schedule.to)) {
    for (const slot of schedule.daily) {
      const label = `${date} ${slot.time} ${slot.screen} — ${slot.movie}`;
      if (new Date(`${date}T${slot.time}:00+01:00`) <= new Date()) {
        counts.past += 1;
        continue;
      }
      if (taken.has(`${slot.screen}|${date}|${slot.time}`)) {
        counts.exists += 1;
        continue;
      }
      if (DRY_RUN) {
        counts.created += 1;
        console.log(`  [dry-run] would create: ${label}`);
        continue;
      }

      const res = await api('/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movieIds[slot.movie],
          date,
          time: slot.time,
          screen: slot.screen,
          capacity: schedule.capacity,
          ...(schedule.ticketPrice
            ? { ticketPrice: schedule.ticketPrice }
            : {}),
        }),
      });
      if (res.ok) {
        counts.created += 1;
        console.log(`  created: ${label}`);
      } else {
        counts.failed += 1;
        console.error(`  FAILED: ${label} — ${res.status} ${res.message}`);
      }
    }
  }

  console.log(
    `\nScreenings: ${counts.created} ${DRY_RUN ? 'to create' : 'created'}, ${counts.exists} already there, ${counts.past} in the past (skipped), ${counts.failed} failed.`,
  );
}

function warnMissing() {
  for (const movie of movies) {
    const missing = [
      !findImage(movie.slug, 'poster') && 'poster',
      !findImage(movie.slug, 'banner') && 'banner',
      !movie.durationMins && 'duration',
    ].filter(Boolean);
    if (missing.length > 0) {
      console.warn(`  note: ${movie.title} has no ${missing.join(', ')}`);
    }
  }
}

async function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  warnMissing();
  const problems = checkData();
  if (problems.length > 0) {
    console.error('Fix scripts/filmboxx/movies.json or add images first:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  if (DRY_RUN) console.log('DRY RUN — nothing will be created.\n');
  await login();
  console.log('\nMovies:');
  const movieIds = await ensureMovies();
  console.log('\nScreenings:');
  await createScreenings(movieIds);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
