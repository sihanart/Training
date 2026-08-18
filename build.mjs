#!/usr/bin/env node
// Builds the site from src/courses/*.json + src/events/*.json.
//
//   node build.mjs          write the site
//   node build.mjs --check  build into memory and fail if anything on disk is stale (CI)
//
// Output: index.html (nearest upcoming event), <slug>/index.html for every event,
// diagrams/*.svg exports, and events.html once more than one event exists.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { thaiDate } from './src/lib/util.mjs';
import { renderPage, renderIndex } from './src/lib/page.mjs';
import { overviewSvg } from './src/lib/svg-overview.mjs';
import { labSvg } from './src/lib/svg-lab.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const CHECK = process.argv.includes('--check');

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

/** Flat lookup used by every {{token}} in the data files. */
function buildVars(course, event, date) {
  return {
    ...course.infra,
    title: course.title,
    courseName: course.courseName,
    organizer: event.organizer,
    customer: event.customer,
    attendees: event.attendees,
    partnerLine: event.partnerLine,
    venue: event.venue,
    dateShort: date.short,
    dateLong: date.long,
    podSize: course.pod.size,
    pods: String(event.podsDrawn),
    nextPod: String(event.podsDrawn + 1),
    rootPath: '',
  };
}

function validate(event, course, file) {
  const missing = ['slug', 'course', 'date', 'organizer', 'customer', 'attendees', 'partnerLine', 'venue']
    .filter((k) => !event[k]);
  if (missing.length) throw new Error(`${file}: missing field(s): ${missing.join(', ')}`);
  if (!Number.isInteger(event.podsDrawn) || event.podsDrawn < 1 || event.podsDrawn > 8) {
    throw new Error(`${file}: podsDrawn must be an integer 1–8, got ${event.podsDrawn}`);
  }
  if (!course) throw new Error(`${file}: no such course "${event.course}"`);
}

async function main() {
  const courses = new Map();
  for (const f of await readdir(join(SRC, 'courses'))) {
    if (f.endsWith('.json')) {
      const c = await readJson(join(SRC, 'courses', f));
      courses.set(c.id, c);
    }
  }

  const eventFiles = (await readdir(join(SRC, 'events'))).filter((f) => f.endsWith('.json')).sort();
  if (!eventFiles.length) throw new Error('no events found in src/events/');

  const entries = [];
  for (const f of eventFiles) {
    const event = await readJson(join(SRC, 'events', f));
    const course = courses.get(event.course);
    validate(event, course, `src/events/${f}`);
    const date = thaiDate(event.date);
    entries.push({ slug: event.slug, event, course, date, vars: buildVars(course, event, date) });
  }

  const slugs = entries.map((e) => e.slug);
  const dupe = slugs.find((s, i) => slugs.indexOf(s) !== i);
  if (dupe) throw new Error(`duplicate slug "${dupe}" — each event needs its own`);

  // The root page is the next event that has not happened yet; once every event is
  // in the past it falls back to the most recent one, so / is never a dead link.
  const todayKey = Date.parse(new Date().toISOString().slice(0, 10));
  const upcoming = entries.filter((e) => e.date.sortKey >= todayKey).sort((a, b) => a.date.sortKey - b.date.sortKey);
  const featured = upcoming[0] ?? [...entries].sort((a, b) => b.date.sortKey - a.date.sortKey)[0];

  const files = new Map();
  for (const e of entries) {
    const siblings = entries.filter((o) => o !== e);
    const page = renderPage({ ...e, siblings, vars: { ...e.vars, rootPath: '../' } });
    files.set(join(e.slug, 'index.html'), page);

    if (e === featured) {
      files.set('index.html', renderPage({ ...e, siblings, vars: { ...e.vars, rootPath: '' } }));
      files.set(join('diagrams', `${e.course.overview.fileName}.svg`), svgFile(overviewSvg(e.course, e.vars)));
      files.set(join('diagrams', `${e.course.lab.fileName}.svg`),
        svgFile(labSvg(e.course, e.vars, e.event.podsDrawn)));
    }
  }
  if (entries.length > 1) {
    files.set('events.html', renderIndex([...entries].sort((a, b) => b.date.sortKey - a.date.sortKey)));
  }

  if (CHECK) {
    const stale = [];
    for (const [rel, content] of files) {
      const path = join(ROOT, rel);
      if (!existsSync(path) || (await readFile(path, 'utf8')) !== content) stale.push(rel);
    }
    if (stale.length) {
      console.error('stale build output — run `node build.mjs` and commit:\n  ' + stale.join('\n  '));
      process.exit(1);
    }
    console.log(`up to date — ${files.size} file(s), ${entries.length} event(s)`);
    return;
  }

  for (const [rel, content] of files) {
    const path = join(ROOT, rel);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, 'utf8');
    console.log(`  ${rel}`);
  }
  console.log(`built ${files.size} file(s) from ${entries.length} event(s) · root = ${featured.slug}`);
}

/**
 * Standalone .svg export. Adds explicit width/height from the viewBox — without them
 * slide tools and image viewers fall back to a default size instead of the real one.
 */
function svgFile(svg) {
  const box = /viewBox="0 0 (\S+) (\S+)"/.exec(svg);
  if (!box) throw new Error('svg export: no viewBox to size from');
  const sized = svg.replace('<svg ', `<svg width="${box[1]}" height="${box[2]}" `);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${sized}\n`;
}

main().catch((err) => {
  console.error(`build failed: ${err.message}`);
  process.exit(1);
});
