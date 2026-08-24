#!/usr/bin/env node
// Builds the site from src/courses/*.json + src/events/*.json.
//
//   node build.mjs          write the site
//   node build.mjs --check  build into memory and fail if anything on disk is stale (CI)
//
// Output: index.html (nearest upcoming event), <slug>/index.html for every event,
// diagrams/*.svg exports, and events.html once more than one event exists.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { thaiDate } from './src/lib/util.mjs';
import { labPods, podConfig } from './src/lib/lab-config.mjs';
import { renderPage, renderIndex, diagramsFor } from './src/lib/page.mjs';

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
    ...labVars(event),
  };
}

/**
 * Tokens describing the kit this event actually runs on. Absent for an event
 * with no lab block — which is what makes {{controller}} fail the build there
 * instead of rendering as a blank on a published page.
 */
function labVars(event) {
  if (!event.lab) return {};
  const lab = event.lab;
  const pods = labPods(lab);
  const vlans = pods.map((p) => p.vlan);
  return {
    controller: lab.controller,
    controllerShort: lab.controller.replace(/^Aruba\s+/, ''),
    controllerUpper: lab.controller.toUpperCase(),
    controllerOs: lab.controllerOs,
    controllerOsShort: lab.controllerOs.replace(/^ArubaOS/, 'AOS'),
    mgmtNet: lab.mgmtNet,
    leaseHours: String(lab.leaseHours),
    poolRange: `.${lab.poolFrom}–.${lab.poolTo}`,
    studentPods: String(pods.filter((p) => !p.teacher).length),
    vlanFirst: String(Math.min(...vlans)),
    vlanLast: String(Math.max(...vlans)),
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
  if (event.slides) {
    const { slides } = event;
    if (!slides.file || !Number.isInteger(slides.pages) || slides.pages < 1) {
      throw new Error(`${file}: slides needs { file, pages } with pages a positive integer`);
    }
    // A dead download link on a published page is worse than no link, and the
    // file lives outside src/ where nothing else would catch its absence.
    if (!existsSync(join(ROOT, slides.file))) {
      throw new Error(`${file}: slides.file "${slides.file}" does not exist`);
    }
  }
}

/** Size of the linked deck, read at build time so the page can never quote a stale one. */
function slidesFor(event) {
  if (!event.slides) return null;
  const bytes = statSync(join(ROOT, event.slides.file)).size;
  return { ...event.slides, mb: Math.round(bytes / 1e6) };
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
  const drafts = [];
  for (const f of eventFiles) {
    const event = await readJson(join(SRC, 'events', f));
    const course = courses.get(event.course);
    validate(event, course, `src/events/${f}`);
    const date = thaiDate(event.date); // checked even for drafts, so a bad date fails now
    // Drafts are validated like any other event but never published — a booking
    // with a placeholder customer or date must not reach a public page.
    if (event.draft) {
      drafts.push(f);
      continue;
    }
    entries.push({ slug: event.slug, event, course, date, slides: slidesFor(event),
                   vars: buildVars(course, event, date) });
  }
  if (drafts.length) console.log(`  (skipped ${drafts.length} draft: ${drafts.join(', ')})`);

  const slugs = entries.map((e) => e.slug);
  const dupe = slugs.find((s, i) => slugs.indexOf(s) !== i);
  if (dupe) throw new Error(`duplicate slug "${dupe}" — each event needs its own`);

  // Unlisted events are published at their own URL but kept out of the listing,
  // the footer link and the root page — reachable only by someone given the link.
  const listed = entries.filter((e) => !e.event.unlisted);
  const unlisted = entries.filter((e) => e.event.unlisted);
  if (!listed.length) throw new Error('every event is unlisted — nothing would be published at /');

  // The root page is the next listed event that has not happened yet; once every
  // event is in the past it falls back to the most recent, so / is never a dead link.
  const todayKey = Date.parse(new Date().toISOString().slice(0, 10));
  const upcoming = listed.filter((e) => e.date.sortKey >= todayKey).sort((a, b) => a.date.sortKey - b.date.sortKey);
  const featured = upcoming[0] ?? [...listed].sort((a, b) => b.date.sortKey - a.date.sortKey)[0];

  const files = new Map();
  for (const e of entries) {
    // Only listed events count as siblings — an unlisted page must not advertise
    // itself, and must not gain a link back into the public listing either.
    const siblings = e.event.unlisted ? [] : listed.filter((o) => o !== e);
    files.set(join(e.slug, 'index.html'), renderPage({ ...e, siblings, vars: { ...e.vars, rootPath: '../' } }));

    const draw = diagramsFor(e.course);
    const svgs = [
      [e.course.overview.fileName, draw.overview(e.course, e.vars)],
      [e.course.lab.fileName, draw.lab(e.course, e.vars, e.event)],
    ];
    if (e === featured) {
      files.set('index.html', renderPage({ ...e, siblings, vars: { ...e.vars, rootPath: '' } }));
      // The featured event keeps the flat diagrams/ path its PNGs already use.
      for (const [name, svg] of svgs) files.set(join('diagrams', `${name}.svg`), svgFile(svg));
    } else {
      for (const [name, svg] of svgs) files.set(join('diagrams', e.slug, `${name}.svg`), svgFile(svg));
    }
  }
  for (const e of entries) {
    if (!e.event.lab) continue;
    for (const pod of labPods(e.event.lab)) {
      files.set(join('configs', `${pod.id.toUpperCase()}.txt`), `${podConfig(e.event.lab, pod, { annotated: true })}
`);
    }
  }
  if (listed.length > 1) {
    files.set('events.html', renderIndex([...listed].sort((a, b) => b.date.sortKey - a.date.sortKey)));
  }
  if (unlisted.length) {
    console.log(`  (unlisted, reachable only by link: ${unlisted.map((e) => `/${e.slug}/`).join(', ')})`);
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
