#!/usr/bin/env node
/**
 * One-off seed: creates the six original GymBoxx membership tiers (formerly
 * hardcoded in frontend/lib/gymboxx-plans.ts) through the real /gym/plans
 * API — same principle as seed-menu.js, go through the app, not a direct
 * DB write. Skips any plan whose name already exists, so it's safe to re-run.
 *
 * Usage:
 *   GYM_SEED_API_BASE=http://localhost:4000/api/v1 \
 *   GYM_SEED_ADMIN_EMAIL=you@boxxcentral.com \
 *   GYM_SEED_ADMIN_PASSWORD=•••• \
 *   node backend/scripts/seed-gym-plans.js
 *
 * Add GYM_SEED_DRY_RUN=1 to log the plan without creating anything —
 * always run this first against a target you haven't used yet.
 */

const API_BASE = process.env.GYM_SEED_API_BASE;
const ADMIN_EMAIL = process.env.GYM_SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.GYM_SEED_ADMIN_PASSWORD;
const DRY_RUN = process.env.GYM_SEED_DRY_RUN === '1';

if (!API_BASE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Set GYM_SEED_API_BASE, GYM_SEED_ADMIN_EMAIL, GYM_SEED_ADMIN_PASSWORD (env vars).',
  );
  process.exit(1);
}

const PLANS = [
  {
    name: '1 Week',
    durationDays: 7,
    price: 15000,
    description: 'Try the studio before committing.',
    features: ['Unlimited gym access', 'Premium equipment', 'Locker access'],
    sortOrder: 0,
  },
  {
    name: '2 Weeks',
    durationDays: 14,
    price: 25000,
    description: 'A short block to build momentum.',
    features: ['Unlimited gym access', 'Premium equipment', 'Locker access'],
    sortOrder: 1,
  },
  {
    name: '1 Month',
    durationDays: 30,
    price: 45000,
    featured: true,
    subtitle: 'Most Popular',
    description: 'Full access, no long-term commitment.',
    features: [
      'Unlimited gym access',
      'Premium equipment',
      'Locker access',
      'Priority support',
    ],
    sortOrder: 2,
  },
  {
    name: '3 Months',
    durationDays: 90,
    price: 115000,
    description: 'Settle into a rhythm and save along the way.',
    features: [
      'Unlimited gym access',
      'Premium equipment',
      'Locker access',
      'Priority support',
    ],
    sortOrder: 3,
  },
  {
    name: '6 Months',
    durationDays: 180,
    price: 230000,
    description: 'Built for training that sticks.',
    features: [
      'Unlimited gym access',
      'Premium equipment',
      'Locker access',
      'Priority support',
    ],
    sortOrder: 4,
  },
  {
    name: '1 Year',
    durationDays: 365,
    price: 430000,
    description: 'The best rate for members training all year.',
    features: [
      'Unlimited gym access',
      'Premium equipment',
      'Locker access',
      'Priority support',
    ],
    sortOrder: 5,
  },
];

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
  const setCookie = res.headers.getSetCookie();
  cookieJar = setCookie.map((c) => c.split(';')[0]).join('; ');
  console.log('Logged in.');
}

function apiFetch(pathname, options = {}) {
  return fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      Cookie: cookieJar,
    },
  });
}

async function existingPlanNames() {
  const res = await apiFetch('/gym/plans/all');
  if (!res.ok) throw new Error(`GET /gym/plans/all failed: ${res.status}`);
  const { data } = await res.json();
  console.log(`Found ${data.length} existing gym plans.`);
  return new Set(data.map((p) => p.name));
}

async function createPlan(plan) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would create: ${plan.name} (₦${plan.price}, ${plan.durationDays} days)`);
    return;
  }

  const res = await apiFetch('/gym/plans', {
    method: 'POST',
    body: JSON.stringify(plan),
  });
  if (!res.ok) {
    console.error(`  FAILED to create "${plan.name}": ${res.status} ${await res.text()}`);
  } else {
    console.log(`  created: ${plan.name}`);
  }
}

async function main() {
  if (DRY_RUN) console.log('--- DRY RUN: no data will be changed ---');

  await login();
  const existing = await existingPlanNames();

  console.log(`\nSeeding ${PLANS.length} plans...`);
  for (const plan of PLANS) {
    if (existing.has(plan.name)) {
      console.log(`  skipped (already exists): ${plan.name}`);
      continue;
    }
    await createPlan(plan);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
