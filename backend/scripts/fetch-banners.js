#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.resolve(__dirname, 'filmboxx');
const IMAGES_DIR = path.join(SEED_DIR, 'images');
const { movies } = JSON.parse(
  fs.readFileSync(path.join(SEED_DIR, 'movies.json'), 'utf8'),
);

function youtubeId(url) {
  const match = url?.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

function existingImage(slug, kind) {
  const wanted = normalize(`${slug}-${kind}`);
  return fs
    .readdirSync(IMAGES_DIR)
    .find(
      (file) =>
        /\.(jpe?g|png|webp)$/i.test(file) &&
        normalize(path.parse(file).name) === wanted,
    );
}

async function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  for (const movie of movies) {
    const current = existingImage(movie.slug, 'banner');
    if (current) {
      console.log(`  keep: ${movie.title} already has ${current}`);
      continue;
    }

    const id = youtubeId(movie.trailerUrl);
    if (!id) {
      console.warn(`  skip: ${movie.title} has no YouTube trailer link`);
      continue;
    }

    const res = await fetch(
      `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    );
    if (!res.ok) {
      console.warn(
        `  skip: ${movie.title} has no full-HD thumbnail (HTTP ${res.status}) — add a banner by hand`,
      );
      continue;
    }

    const file = `${movie.slug}-banner.jpg`;
    fs.writeFileSync(
      path.join(IMAGES_DIR, file),
      Buffer.from(await res.arrayBuffer()),
    );
    console.log(`  saved: ${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
