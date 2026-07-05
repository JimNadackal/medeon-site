#!/usr/bin/env node
/**
 * migrate-images.mjs
 * One command to migrate all images off the old WordPress server.
 *
 * What it does:
 *  1. Scans every file in content/ for image URLs pointing at medeon.ai/wp-content
 *  2. Downloads each image into public/images/
 *  3. Rewrites the content files to use the local path (/images/...)
 *
 * Run it (from the project root, BEFORE WordPress is switched off):
 *    node scripts/migrate-images.mjs
 *
 * Then commit the changes. Done.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const CONTENT_DIR = 'content';
const IMAGES_DIR = 'public/images';
const URL_PATTERN = /https:\/\/medeon\.ai\/wp-content\/[^\s"')]+/g;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const found = new Map(); // remote url -> local path

// Pass 1: collect all remote image URLs
const files = [];
for await (const file of walk(CONTENT_DIR)) {
  const text = await readFile(file, 'utf8');
  files.push([file, text]);
  for (const url of text.match(URL_PATTERN) || []) {
    if (!found.has(url)) {
      const name = decodeURIComponent(url.split('/').pop());
      found.set(url, name);
    }
  }
}

if (found.size === 0) {
  console.log('✔ No wp-content URLs found. Nothing to migrate.');
  process.exit(0);
}

console.log(`Found ${found.size} images to migrate:\n`);
await mkdir(IMAGES_DIR, { recursive: true });

// Pass 2: download
let failed = 0;
for (const [url, name] of found) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(join(IMAGES_DIR, name), buf);
    console.log(`  ✔ ${name} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.log(`  ✖ FAILED ${url} — ${err.message}`);
    failed++;
    found.delete(url); // don't rewrite paths for failed downloads
  }
}

// Pass 3: rewrite content files
for (const [file, text] of files) {
  let updated = text;
  for (const [url, name] of found) {
    updated = updated.split(url).join(`/images/${name}`);
  }
  if (updated !== text) {
    await writeFile(file, updated);
    console.log(`  ↻ rewrote ${file}`);
  }
}

console.log(
  failed
    ? `\n⚠ Done with ${failed} failure(s). Fix those manually, then re-run.`
    : '\n✔ All images migrated. Commit the changes and you are WordPress-free.'
);
