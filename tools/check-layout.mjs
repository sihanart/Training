#!/usr/bin/env node
// Geometry linter for the generated diagrams.
//
//   node tools/check-layout.mjs <file.svg> [...]
//
// Catches the failure modes a diagram generator actually has: boxes drawn on top
// of each other, anything past the edge of the canvas, and stacked text lines
// that overflow the box they belong to. Cheap to run and does not need a browser.

import { readFile } from 'node:fs/promises';

const num = (attrs, key) => {
  const m = new RegExp(`\\b${key}="(-?[\\d.]+)"`).exec(attrs);
  return m ? parseFloat(m[1]) : null;
};

function parse(svg) {
  const rects = [];
  for (const m of svg.matchAll(/<rect\b([^>]*)>/g)) {
    const a = m[1];
    const x = num(a, 'x'), y = num(a, 'y'), w = num(a, 'width'), h = num(a, 'height');
    const cls = /class="([^"]+)"/.exec(a)?.[1] ?? '';
    if (x === null || y === null || w === null || h === null) continue; // canvas background
    rects.push({ x, y, w, h, cls });
  }
  const texts = [];
  for (const m of svg.matchAll(/<text\b([^>]*)>/g)) {
    const a = m[1];
    const x = num(a, 'x'), y = num(a, 'y');
    if (x !== null && y !== null) texts.push({ x, y, cls: /class="([^"]+)"/.exec(a)?.[1] ?? '' });
  }
  return { rects, texts };
}

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
/** One box fully inside another is deliberate nesting (a stack around its members). */
const contains = (a, b) => b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w && b.y + b.h <= a.y + a.h;
const collides = (a, b) => overlaps(a, b) && !contains(a, b) && !contains(b, a);
const fmt = (b) => `${b.x},${b.y} ${b.w}×${b.h}${b.cls ? ` .${b.cls}` : ''}`;

let failed = 0;

for (const file of process.argv.slice(2)) {
  const svg = await readFile(file, 'utf8');
  const box = /viewBox="0 0 (\S+) (\S+)"/.exec(svg);
  const W = Number(box[1]), H = Number(box[2]);
  const { rects, texts } = parse(svg);

  // Containers and the coloured header bars that sit on top of their own box are
  // meant to overlap; everything else drawing over a sibling is a bug.
  const solid = rects.filter((r) => !/grp|cloud/.test(r.cls) && r.h > 30);

  const problems = [];
  for (let i = 0; i < solid.length; i++) {
    for (let j = i + 1; j < solid.length; j++) {
      if (collides(solid[i], solid[j])) problems.push(`overlap: ${fmt(solid[i])}  ∩  ${fmt(solid[j])}`);
    }
  }
  for (const r of rects) {
    if (r.x < 0 || r.y < 0 || r.x + r.w > W || r.y + r.h > H) problems.push(`off-canvas rect: ${fmt(r)}`);
  }
  for (const t of texts) {
    if (t.x < 0 || t.y < 0 || t.x > W || t.y > H) problems.push(`off-canvas text at ${t.x},${t.y}`);
  }
  // A text baseline inside a box must leave room for the glyph descender.
  for (const r of solid) {
    for (const t of texts) {
      const inside = t.x > r.x && t.x < r.x + r.w && t.y > r.y && t.y <= r.y + r.h + 4;
      if (inside && t.y > r.y + r.h - 2) problems.push(`text baseline ${t.x},${t.y} sits on the bottom edge of ${fmt(r)}`);
    }
  }

  console.log(`${file}  ${W}×${H}  ${rects.length} rects, ${texts.length} texts`);
  if (problems.length) {
    failed++;
    for (const p of [...new Set(problems)]) console.log(`   ✗ ${p}`);
  } else {
    console.log('   ✓ no overlaps, nothing off-canvas, no text on a box edge');
  }
}

process.exit(failed ? 1 : 0);
