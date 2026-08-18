#!/usr/bin/env node
/**
 * One-off migration: wipes the lounge menu collection and re-seeds it from
 * frontend/lib/menudata.json, uploading each item's image from
 * frontend/public/boxxcentral-images/ through the real /menu API (so
 * Cloudinary assets get created the same way the admin dashboard creates
 * them — not a direct DB write).
 *
 * Usage:
 *   MENU_SEED_API_BASE=https://staging-api.boxxcentral.com/api/v1 \
 *   MENU_SEED_ADMIN_EMAIL=you@boxxcentral.com \
 *   MENU_SEED_ADMIN_PASSWORD=•••• \
 *   node backend/scripts/seed-menu.js
 *
 * Add MENU_SEED_DRY_RUN=1 to log the plan without deleting or creating
 * anything — always run this first against a target you haven't used yet.
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.MENU_SEED_API_BASE;
const ADMIN_EMAIL = process.env.MENU_SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.MENU_SEED_ADMIN_PASSWORD;
const DRY_RUN = process.env.MENU_SEED_DRY_RUN === '1';

const IMAGES_DIR = path.resolve(
  __dirname,
  '../../frontend/public/boxxcentral-images',
);
const DATA_FILE = path.resolve(__dirname, '../../frontend/lib/menudata.json');

if (!API_BASE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Set MENU_SEED_API_BASE, MENU_SEED_ADMIN_EMAIL, MENU_SEED_ADMIN_PASSWORD (env vars).',
  );
  process.exit(1);
}

// Short, hand-written copy per item — menudata.json has no descriptions,
// and the API requires one. "Popcorn" is deliberately listed once (Food);
// the Pastries duplicate in menudata.json is skipped as a data mistake.
const DESCRIPTIONS = {
  'Chicken Loaded Fries': 'Crispy fries piled high with seasoned chicken, sauce, and cheese.',
  'Beef Sliders': 'Mini beef patties stacked with cheese and all the classic fixings.',
  'Seafood Fried Rice': 'Smoky fried rice loaded with shrimp, calamari, and fresh vegetables.',
  'Asun Pasta': 'Creamy pasta tossed with spicy, char-grilled asun goat meat.',
  'Chicken Staccato Pasta': 'Pasta in a rich tomato sauce with tender staccato-style chicken.',
  'Peppered Chicken Wings': 'Fried chicken wings tossed in a fiery pepper sauce.',
  'Barbecue Chicken Wings': 'Grilled chicken wings glazed in smoky barbecue sauce.',
  'Classic Burger': 'A juicy beef patty, cheese, and fresh toppings in a soft bun.',
  'Chicken and Chips': 'Crispy fried chicken served with a generous side of chips.',
  'Classic Hot Dog & Fries': 'A grilled hot dog with all the classics, served with fries.',
  'Jollof Rice': "Nigeria's favorite smoky, spiced tomato rice.",
  'Coconut Jollof Rice': 'Classic jollof rice given a rich, creamy coconut twist.',
  'Chermoula Grilled Croaker': 'Whole croaker fish marinated in chermoula spices and grilled to order.',
  'Small Chops Platter': "An assorted platter of BoxxCentral's best bite-sized small chops.",
  'Ocean Harvest Pasta': 'Pasta tossed with a generous mix of fresh seafood.',
  'Chicken Laps': 'Well-seasoned, deep-fried chicken laps with a crisp finish.',
  'Beef Tacos': 'Soft tacos packed with seasoned beef and fresh toppings.',
  'Chicken Tacos': 'Soft tacos filled with spiced, tender chicken and fresh toppings.',
  'Chicken Wraps': 'Grilled chicken and fresh vegetables rolled in a soft wrap.',
  'Yam Wedges and Chicken': 'Golden fried yam wedges served alongside seasoned chicken.',
  'Chicken Wrap': 'A single grilled chicken wrap with fresh vegetables.',
  'French Fries': 'Classic golden fries, salted and served hot.',
  'Chicken Shawarma': 'Spiced chicken shawarma wrapped with fresh vegetables and sauce.',
  'Cocktail Takeout': 'Your favorite cocktail, packaged to go.',
  'Delivery': 'Delivery fee for orders sent outside BoxxCentral.',
  'Fried Plantain': 'Sweet, golden fried plantain slices.',
  'Popcorn': 'Freshly popped, buttery popcorn — a BoxxCentral snack-time classic.',
  'Turkey Wings': 'Well-seasoned, tender fried turkey wings.',
  'Extra Yam Wedges': 'An extra portion of golden fried yam wedges.',

  'Meat Pie': 'Flaky pastry filled with seasoned minced meat and vegetables.',
  'Chicken Pie': 'Flaky pastry filled with tender, seasoned chicken.',
  'Chocolate Doughnut': 'Soft doughnut glazed in rich chocolate.',
  'Creamy Doughnut': 'Soft doughnut filled with a smooth, sweet cream.',
  'Milky Doughnut': 'Soft doughnut with a light, milky glaze.',
  'Sausage Roll': 'Flaky pastry wrapped around a seasoned sausage filling.',
  'BoxxCentral Roll': "BoxxCentral's own take on the classic pastry roll.",
  'Dessert Cake': 'A slice of rich, indulgent dessert cake.',
  'Ice Cream 4.5oz': 'A small scoop of creamy ice cream.',
  'Ice Cream 7.0oz': 'A medium serving of creamy ice cream.',
  'Ice Cream 11oz': 'A generous serving of creamy ice cream.',

  'Suya Pizza': 'Wood-fired pizza topped with spicy suya-style beef.',
  'Vegetable Pizza': 'Wood-fired pizza loaded with fresh, colorful vegetables.',
  'Pepperoni Pizza': 'Wood-fired pizza topped with classic spiced pepperoni.',

  'King Slayer': 'A bold, spirit-forward signature cocktail with a fiery finish.',
  'Idi Agbon': 'A bold BoxxCentral original with local flavor and a smooth finish.',
  'Duff Town Mule': 'A whisky-forward twist on the classic mule, sharp and refreshing.',
  'Octopussy': 'A vibrant, layered signature cocktail built to turn heads.',
  'Bubble Gum Delight': 'A playful, fruity cocktail with a nostalgic bubble gum sweetness.',
  'Seven Deadly Sins': 'A bold multi-spirit cocktail not for the faint-hearted.',
  'Boxx Central Hibiscus Fling': 'A floral, hibiscus-infused signature cocktail with a citrus lift.',
  "Queen's Special": 'An elegant, house-crafted cocktail fit for royalty.',
  'La Fizz': 'A light, effervescent signature cocktail with a citrus edge.',
  'Take Me Home Cocktail': 'A smooth, easy-drinking signature cocktail to end the night right.',
  'Scarlet Oasis': 'A vivid red signature cocktail with a refreshing fruity finish.',
  'Green Energy': 'A vibrant green cocktail packed with fresh, zesty flavor.',

  'Long Island Iced Tea': 'The classic five-spirit mix, balanced with a splash of cola.',
  'Cosmopolitan': 'Vodka, triple sec, cranberry and lime — the timeless classic.',
  'Kentucky Maid': 'Bourbon shaken with muddled cucumber, mint, and lime.',
  'Mai Tai': 'A tropical rum classic layered with orgeat and citrus.',
  'Margarita': 'Tequila, triple sec, and fresh lime over a salted rim.',
  'Piña Colada': 'Rum blended with coconut cream and pineapple juice.',
  'Tequila Sunrise': 'Tequila and orange juice layered over a grenadine sunrise.',
  'Mojito': 'White rum, mint, lime, and soda — crisp and refreshing.',
  'Whiskey Sour': 'Whiskey shaken with fresh lemon and a touch of sweetness.',
  'Gin & Tonic': 'Gin and tonic water over ice with a citrus twist.',
  'Moscow Mule': 'Vodka, ginger beer, and lime served ice-cold.',
  'Strawberry Daiquiri': 'Rum blended with fresh strawberries and lime.',
  'White Russian': 'Vodka and coffee liqueur finished with cream.',
  'Pornstar Martini': 'Vanilla vodka and passionfruit, served with a side of bubbly.',

  'Lychee Shirley Temple': 'A sweet, non-alcoholic lychee and grenadine fizz.',
  'Chapman': "Nigeria's classic non-alcoholic mix of soda, grenadine, and citrus.",
  'Virgin Mojito': 'Mint, lime, and soda — all the mojito flavor, alcohol-free.',
  'Virgin Strawberry Daiquiri': 'A fruity, blended strawberry mocktail with no alcohol.',
  'Oreos Milkshake': 'A thick, creamy milkshake blended with Oreo cookies.',

  'Pineapple Coconut Smoothie': 'Fresh pineapple blended with creamy coconut.',
  'Mixed Fruit Smoothie': 'A refreshing blend of fresh seasonal fruits.',
  'Avocado Pawpaw Smoothie': 'A creamy, naturally sweet blend of avocado and pawpaw.',
  'Banana Nuts': 'A rich banana smoothie blended with nuts.',
  'Boxx Central Smoothie': "BoxxCentral's own house-blend smoothie.",
  'Banana Berry Blast': 'Banana blended with mixed berries for a fruity kick.',
  'Greenland': 'A refreshing green smoothie packed with fresh produce.',

  'Tropical Sunrise Juice': 'A vibrant blend of tropical fruits.',
  'Zobo Citrus Cooler': 'Chilled hibiscus zobo brightened with fresh citrus.',
  'Mango Passion Splash': 'Ripe mango blended with tangy passionfruit.',
  'Pineapple Juice': 'Freshly pressed pineapple juice.',
  'Orange Juice': 'Freshly squeezed orange juice.',
  'Watermelon Juice': 'Freshly blended, chilled watermelon juice.',
  'Green Vitality Juice': 'A nutrient-packed blend of fresh greens and fruit.',

  'Tequila Shot': 'A single shot of tequila.',
  'Vodka Shot': 'A single shot of vodka.',
  'Gin Shot': 'A single shot of gin.',
  'Rum Shot': 'A single shot of rum.',
  'Whiskey Shot': 'A single shot of whiskey.',

  'Bottled Water': 'Chilled bottled water.',
  'Sprite': 'Chilled bottle of Sprite.',
  'Fanta': 'Chilled bottle of Fanta.',
  'Coke': 'Chilled bottle of Coca-Cola.',
  'Lucozade Boost': 'Chilled bottle of Lucozade Boost.',
  'Hollandia Yoghurt 1L': 'A 1-litre bottle of Hollandia yoghurt.',
  'Chivita Active': 'A bottle of Chivita Active juice drink.',
  'Monster': 'A can of Monster energy drink.',
  'Smirnoff Ice': 'A chilled bottle of Smirnoff Ice.',
  'Belaire Rose': 'A bottle of Belaire Rose sparkling wine.',
  'Four Cousins': 'A bottle of Four Cousins wine.',
  'Martel VS': 'A bottle of Martel VS cognac.',
  'Hennessy VSOP': 'A bottle of Hennessy VSOP cognac.',
  'Andre': 'A bottle of Andre sparkling wine.',
  'Olmeca Tequila': 'A bottle of Olmeca tequila.',
  'Carlo Rossi': 'A bottle of Carlo Rossi wine.',
  'Agor': 'A bottle of Agor wine.',
  'Sweet Kiss': 'A bottle of Sweet Kiss wine.',
  'Hennessy VS': 'A bottle of Hennessy VS cognac.',
  'Martel Blue Swift': 'A bottle of Martel Blue Swift cognac.',
  'Freshyo Yoghurt': 'A bottle of Freshyo yoghurt drink.',
};

function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findImageFile(item, files) {
  const targetFromField = normalize(item.image.replace(/\.[a-zA-Z0-9]+$/, ''));
  const targetFromName = normalize(item.name);
  return files.find((f) => {
    const base = normalize(f.replace(/\.[a-zA-Z0-9]+$/, ''));
    return base === targetFromField || base === targetFromName;
  });
}

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
    headers: { ...(options.headers ?? {}), Cookie: cookieJar },
  });
}

async function deleteAllMenuItems() {
  const res = await apiFetch('/menu/all');
  if (!res.ok) throw new Error(`GET /menu/all failed: ${res.status}`);
  const { data } = await res.json();
  console.log(`Found ${data.length} existing menu items.`);

  for (const item of data) {
    if (DRY_RUN) {
      console.log(`  [dry-run] would delete: ${item.name}`);
      continue;
    }
    const del = await apiFetch(`/menu/${item._id}`, { method: 'DELETE' });
    if (!del.ok) {
      console.error(`  FAILED to delete "${item.name}": ${del.status}`);
    } else {
      console.log(`  deleted: ${item.name}`);
    }
  }
}

async function createMenuItem(item, files) {
  const filename = findImageFile(item, files);
  if (!filename) {
    console.warn(`  NO IMAGE MATCH for "${item.name}" (expected ~${item.image}) — skipped`);
    return;
  }
  const description = DESCRIPTIONS[item.name];
  if (!description) {
    console.warn(`  NO DESCRIPTION for "${item.name}" — skipped`);
    return;
  }

  if (DRY_RUN) {
    console.log(`  [dry-run] would create: ${item.name} (${item.category}, ₦${item.price}, image: ${filename})`);
    return;
  }

  const filePath = path.join(IMAGES_DIR, filename);
  const fileBuffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append('name', item.name);
  form.append('category', item.category);
  form.append('price', String(item.price));
  form.append('description', description);
  form.append('image', new Blob([fileBuffer]), filename);

  const res = await apiFetch('/menu', { method: 'POST', body: form });
  if (!res.ok) {
    console.error(`  FAILED to create "${item.name}": ${res.status} ${await res.text()}`);
  } else {
    console.log(`  created: ${item.name}`);
  }
}

async function main() {
  if (DRY_RUN) console.log('--- DRY RUN: no data will be changed ---');

  await login();
  await deleteAllMenuItems();

  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const files = fs.readdirSync(IMAGES_DIR);

  const seenNames = new Set();
  console.log(`\nSeeding ${raw.length} raw entries (dedup by name)...`);
  for (const item of raw) {
    if (seenNames.has(item.name)) {
      console.log(`  skipped duplicate: ${item.name} (${item.category})`);
      continue;
    }
    seenNames.add(item.name);
    await createMenuItem(item, files);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
