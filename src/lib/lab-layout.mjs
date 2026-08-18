// Shared geometry for the pod-row lab diagrams (FIG.02 of every course).
//
// Layout model: pods sit in one row on a canvas that widens with N. A shared
// infrastructure box spans the pods, and the right-hand column carries the
// cloud/server stack plus the "POD n+1 ... POD n" notes panel. With N=2 the
// numbers reproduce the original hand-drawn campus diagram exactly.

import { t } from './util.mjs';

export const POD_X0 = 60;      // left edge of the first pod
export const POD_PITCH = 460;  // pod-to-pod horizontal step
export const POD_W = 440;
export const POD_Y = 470;      // top edge of the pod row
export const POD_H = 420;
export const COL_W = 400;      // right-hand column
export const HUB_X = 330;      // shared infrastructure box (core switch / venue uplink)
export const HUB_Y = 185;
export const HUB_H = 122;
export const CANVAS_H = 1130;
export const BAND_Y = 912;     // bottom band (legend / plan / topic map)
export const BAND_H = 192;

// Below this the hub box and the bottom plan panel collapse to nothing, so a
// single-pod lab keeps the two-pod canvas and just carries extra whitespace.
const MIN_COL_X = 1000;

// Boxes hold a fixed amount of text, so past a point stretching them with the
// canvas just adds dead space. Both cap out and centre on what they describe.
const HUB_MAX_W = 900;
const PLAN_W = 440;

/** Round to 2dp and drop a trailing ".00" so N=2 emits the original integers. */
export const n2 = (v) => String(Math.round(v * 100) / 100);

/** Stack of `.role` lines starting at `y`, stepping `step` px. */
export const roles = (list, x, y, step, vars) =>
  list.map((line, i) => `<text class="role" x="${x}" y="${n2(y + i * step)}">${t(line, vars)}</text>`).join('\n');

/** Geometry derived from the pod count. */
export function labGeometry(pods) {
  const podsRight = POD_X0 + pods * POD_PITCH - 20;
  const colX = Math.max(POD_X0 + pods * POD_PITCH + 20, MIN_COL_X);
  const width = colX + COL_W + 40;

  // The hub spans the pods it serves, up to the width its own text needs.
  const hubW = Math.min(colX - 200 - HUB_X, HUB_MAX_W);
  const hubX = Math.max(HUB_X, (POD_X0 + podsRight) / 2 - hubW / 2);

  // Bottom band: legend (fixed, left) | plan | topic map (fixed, under the right
  // column). The plan sits centred in whatever gap the other two leave.
  const legendRight = POD_X0 + 440;
  const planX = colX <= MIN_COL_X ? 520 : legendRight + (colX - legendRight - PLAN_W) / 2;

  return {
    pods,
    podsRight,
    colX,
    width,
    coreX: hubX,
    coreY: HUB_Y,
    coreW: hubW,
    coreRight: hubX + hubW,
    coreBottom: HUB_Y + HUB_H,
    planX,
    planW: PLAN_W,
  };
}

/**
 * Two uplinks per pod, fanning out onto the bottom edge of the hub box.
 * `cls` picks the stroke style so each course can use its own link colour.
 */
export function uplinks(g, cls = 'link10') {
  const slots = 2 * g.pods + 1;
  const out = [];
  for (let i = 0; i < g.pods; i++) {
    const x = POD_X0 + i * POD_PITCH;
    for (const k of [2 * i, 2 * i + 1]) {
      const from = x + (k % 2 === 0 ? 90 : 350);
      const to = g.coreX + (g.coreW * (k + 1)) / slots;
      out.push(`<path class="${cls}" d="M${n2(from)} 512 L ${n2(to)} ${g.coreBottom}"/>`);
    }
  }
  return out.join('\n');
}
