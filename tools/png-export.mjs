#!/usr/bin/env node
// Renders every diagrams/*.svg to a 2x PNG for dropping into slides.
//
//   node tools/png-export.mjs
//
// Kept out of build.mjs on purpose: this is the only part of the repo that needs
// a dependency (Playwright's Chromium), and the site build must stay installable
// with nothing but Node. CI runs this after the build; locally it is optional.
//
// Chromium is used rather than a native SVG rasteriser because the diagrams are
// authored against a browser — same CSS cascade, same Thai text shaping as the
// live page, so the PNG cannot drift from what the site shows.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIAGRAMS = join(ROOT, 'diagrams');
const SCALE = Number(process.env.PNG_SCALE ?? 2);

const FONT_LINK =
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'PNG export needs Playwright:\n' +
    '  npm install\n' +
    '  npx playwright install --with-deps chromium\n' +
    'The site build (node build.mjs) does not need it.'
  );
  process.exit(1);
}

// Non-featured events export into diagrams/<slug>/, so walk one level down too.
const files = (await readdir(DIAGRAMS, { withFileTypes: true, recursive: true }))
  .filter((d) => d.isFile() && d.name.endsWith('.svg'))
  .map((d) => relative(DIAGRAMS, join(d.parentPath ?? d.path, d.name)))
  .sort();
if (!files.length) {
  console.error('no SVG files in diagrams/ — run `node build.mjs` first');
  process.exit(1);
}

const browser = await chromium.launch();
let failed = 0;

for (const file of files) {
  const svg = await readFile(join(DIAGRAMS, file), 'utf8');
  const size = /<svg[^>]*\swidth="(\d+)"\s+height="(\d+)"/.exec(svg);
  if (!size) {
    console.error(`  ${file}: no width/height on the root <svg> — skipped`);
    failed++;
    continue;
  }
  const width = Number(size[1]);
  const height = Number(size[2]);

  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: SCALE });
  await page.setContent(
    `<!doctype html><meta charset="utf-8">${FONT_LINK}` +
    `<style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style>` +
    svg.replace(/^<\?xml[^>]*\?>\s*/, ''),
    { waitUntil: 'load' }
  );

  // Webfonts are a nice-to-have: the SVG font stack falls back to installed Thai
  // faces. Never let a slow font server stall or fail the export.
  await page.evaluate(() =>
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 8000))])
  );

  const out = join(DIAGRAMS, `${file.slice(0, -4)}.png`);
  await writeFile(out, await page.screenshot({ type: 'png' }));
  await page.close();

  console.log(`  ${basename(out)}  ${width * SCALE}x${height * SCALE}`);
}

await browser.close();

if (failed) {
  console.error(`png export: ${failed} file(s) failed`);
  process.exit(1);
}
console.log(`exported ${files.length} PNG(s) at ${SCALE}x`);
