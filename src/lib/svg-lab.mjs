// FIG.02 — Lab topology.
//
// Layout model: fixed canvas, three zones.
//
//   left    the HCI server, drawn as a container because everything virtual
//           lives inside it — one controller VM per pod, plus the switch
//           simulator the students actually type on
//   middle  the 9004-LTE, which is the only thing the remote AP tunnels to
//   right   the physical chain at the venue: RAP » switch » campus AP » clients
//
// The two tunnels are the point of the drawing and terminate in different
// places, so they get different colours and both are drawn all the way to their
// real endpoint rather than stopping at the edge of a box.

import { esc, t } from './util.mjs';
import { labPods } from './lab-config.mjs';

const ID = 'svg-lab';
const W = 1440;
const H = 1000;

const ACCENT = {
  rap:    { fill: '#F3EEFA', line: '#6B4EA8' },
  switch: { fill: '#E9F2FA', line: '#1E6BB8' },
  ap:     { fill: '#E9F7F1', line: '#14996B' },
};

const CSS = [
  `#${ID} text{font-family:"IBM Plex Sans Thai","Sarabun","Loma","Noto Sans Thai","Segoe UI",sans-serif;fill:#0F1E2E}`,
  `#${ID} .h1{font-size:28px;font-weight:700}`,
  `#${ID} .sub{font-size:13.5px;fill:#5A6C7D}`,
  `#${ID} .lbl2{font-size:13px;font-weight:700}`,
  `#${ID} .role{font-size:11.5px;fill:#41545F}`,
  `#${ID} .tiny{font-size:11px;fill:#5A6C7D}`,
  `#${ID} .tag{font-size:11px;font-weight:700;fill:#fff}`,
  `#${ID} .th{font-size:10.5px;font-weight:700;fill:#1E6BB8;letter-spacing:.06em}`,
  `#${ID} .td{font-size:11.5px;fill:#33454F}`,
  `#${ID} .tteach{font-weight:700;fill:#C4620A}`,
  `#${ID} .mono2{font-family:"IBM Plex Mono",monospace;font-size:11.5px}`,
  `#${ID} .link{stroke:#4A6274;stroke-width:2.5;fill:none}`,
  `#${ID} .tunnel{stroke:#FF8300;stroke-width:3;stroke-dasharray:9 6;fill:none}`,
  `#${ID} .ipsec{stroke:#6B4EA8;stroke-width:3;stroke-dasharray:3 5;fill:none}`,
  `#${ID} .air{stroke:#14996B;stroke-width:2;fill:none;opacity:.75}`,
  `#${ID} .host{fill:#F4F7F9;stroke:#5A6C7D;stroke-width:2.5;stroke-dasharray:8 5}`,
].join('');

const line = (cls, x, y, text, vars) =>
  `<text class="${cls}" x="${x}" y="${y}">${esc(t(text, vars))}</text>`;
const stack = (cls, x, y0, step, list, vars) =>
  list.map((s, i) => line(cls, x, y0 + i * step, s, vars)).join('\n');

/** One box in the right-hand physical chain. */
function chainBox(box, y, vars) {
  const c = ACCENT[box.accent];
  return `<rect x="1040" y="${y}" width="340" height="118" rx="10" fill="${c.fill}" stroke="${c.line}" stroke-width="2.5"/>
<rect x="1040" y="${y}" width="340" height="26" rx="10" fill="${c.line}"/>
<text class="tag" x="1054" y="${y + 18}">${t(box.tag, vars)}</text>
<text class="lbl2" x="1054" y="${y + 50}">${t(box.label, vars)}</text>
${stack('role', 1054, y + 72, 20, box.roles, vars)}`;
}

export function labSvg(course, vars, event) {
  const l = course.lab;
  const pods = labPods(event.lab);
  const subhead = `${vars.partnerLine} · ${vars.dateShort} · ${t(l.subheadTail, vars)}`;

  const ROW_H = 24;
  const TABLE_Y = 235;
  const rows = pods.map((p, i) => {
    const y = TABLE_Y + i * ROW_H;
    const fill = p.teacher ? '#FFE8CC' : i % 2 === 0 ? '#FFFAF4' : '#FFFFFF';
    return `<rect x="102" y="${y}" width="476" height="${ROW_H}" fill="${fill}"/>` +
      `<text class="td${p.teacher ? ' tteach' : ''}" x="112" y="${y + 17}">${esc(p.label)}</text>` +
      `<text class="td mono2" x="212" y="${y + 17}">${esc(p.mgmt)}</text>` +
      `<text class="td mono2" x="376" y="${y + 17}">VLAN ${esc(String(p.vlan))}</text>`;
  }).join('\n');
  const tableEnd = TABLE_Y + pods.length * ROW_H;

  // The chain is evenly spaced; the campus AP row is where the GRE tunnel starts.
  const chainY = [150, 320, 490];
  const greY = chainY[2] + 59;

  return `<svg id="${ID}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs>
<style>${CSS}</style>
<marker id="ar-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#FF8300"/></marker>
<marker id="arp-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#6B4EA8"/></marker>
<marker id="arg-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#4A6274"/></marker>
</defs>

<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text class="h1" x="40" y="48">${t(l.heading, vars)}</text>
<text class="sub" x="40" y="74">${esc(subhead)}</text>
<line x1="40" y1="90" x2="1400" y2="90" stroke="#E1E9EF" stroke-width="2"/>

<!-- everything virtual lives on the one host -->
<rect class="host" x="60" y="128" width="560" height="620" rx="14"/>
<rect x="60" y="128" width="250" height="28" rx="10" fill="#5A6C7D"/>
<text class="tag" x="76" y="147">${t(l.host.tag, vars)}</text>

<rect x="84" y="178" width="512" height="300" rx="10" fill="#FFF3E6" stroke="#FF8300" stroke-width="2.5"/>
<text class="lbl2" x="102" y="204">${t(l.host.controllers.title, vars)}</text>
<text class="th" x="102" y="226">${esc(l.host.controllers.cols[0])}</text><text class="th" x="212" y="226">${esc(l.host.controllers.cols[1])}</text><text class="th" x="376" y="226">${esc(l.host.controllers.cols[2])}</text>
<line x1="102" y1="231" x2="578" y2="231" stroke="#F0D6BC"/>
${rows}
${stack('tiny', 102, tableEnd + 19, 18, l.host.controllers.notes, vars)}

<rect x="84" y="500" width="512" height="226" rx="10" fill="#F3F7FA" stroke="#4A6274" stroke-width="2.5"/>
<text class="lbl2" x="102" y="526">${t(l.host.simulator.title, vars)}</text>
${stack('role', 102, 552, 22, l.host.simulator.rows, vars)}
<line x1="102" y1="640" x2="578" y2="640" stroke="#CBD8E2"/>
<text class="lbl2" x="102" y="664">${t(l.host.simulator.whyTitle, vars)}</text>
${stack('role', 102, 688, 20, l.host.simulator.why, vars)}

<!-- the only box the remote AP tunnels to -->
<rect x="672" y="150" width="316" height="130" rx="10" fill="#FDECEC" stroke="#C0504D" stroke-width="2.5"/>
<rect x="672" y="150" width="316" height="26" rx="10" fill="#C0504D"/>
<text class="tag" x="686" y="168">${t(l.rapHead.tag, vars)}</text>
<text class="lbl2" x="686" y="200">${t(l.rapHead.label, vars)}</text>
${stack('role', 686, 222, 20, l.rapHead.roles, vars)}

<path class="link" marker-end="url(#arg-${ID})" d="M620 215 H 672"/>
<text class="tiny" x="624" y="205">${t(l.wireLabel, vars)}</text>

<!-- physical chain at the venue -->
<text class="lbl2" x="1040" y="140">${t(l.chainTitle, vars)}</text>
${l.chain.map((b, i) => chainBox(b, chainY[i], vars)).join('\n')}

<rect x="1040" y="660" width="340" height="76" rx="10" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl2" x="1054" y="686">${t(l.clients.label, vars)}</text>
${line('role', 1054, 708, l.clients.note, vars)}

<path class="link" marker-end="url(#arg-${ID})" d="M1210 268 V 320"/>
<path class="link" marker-end="url(#arg-${ID})" d="M1210 438 V 490"/>
<path class="air" d="M1180 642 a30 30 0 0 1 60 0"/>

<path class="ipsec" marker-end="url(#arp-${ID})" d="M1040 209 H 988"/>
<text class="tiny" x="998" y="199" fill="#6B4EA8" font-weight="700">${t(l.ipsecLabel, vars)}</text>

<path class="tunnel" marker-end="url(#ar-${ID})" d="M1040 ${greY} C 880 ${greY} 820 420 600 404"/>
<text class="tiny" x="726" y="500" fill="#C4620A" font-weight="700">${t(l.greLabel, vars)}</text>

<!-- reference band -->
<rect x="60" y="780" width="400" height="178" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="78" y="806">${t(l.legend.title, vars)}</text>
<line class="link" x1="80" y1="830" x2="128" y2="830"/><text class="tiny" x="138" y="834">${t(l.legend.rows[0], vars)}</text>
<path class="ipsec" d="M80 858 H 128"/><text class="tiny" x="138" y="862">${t(l.legend.rows[1], vars)}</text>
<path class="tunnel" d="M80 886 H 128"/><text class="tiny" x="138" y="890">${t(l.legend.rows[2], vars)}</text>
<path class="air" d="M84 918 a24 24 0 0 1 40 0"/><text class="tiny" x="138" y="918">${t(l.legend.rows[3], vars)}</text>
${line('tiny', 78, 944, l.legend.note, vars)}

<rect x="500" y="780" width="420" height="178" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="518" y="806">${t(l.plan.title, vars)}</text>
<text class="th" x="518" y="828">${esc(l.plan.cols[0])}</text><text class="th" x="740" y="828">${esc(l.plan.cols[1])}</text>
<line x1="518" y1="834" x2="902" y2="834" stroke="#DCE6ED"/>
${l.plan.rows.map(([k, v], i) => `<text class="td" x="518" y="${852 + i * 20}">${t(k, vars)}</text><text class="td mono2" x="740" y="${852 + i * 20}">${t(v, vars)}</text>`).join('\n')}

<rect x="960" y="780" width="420" height="178" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="978" y="806">${t(l.topicMap.title, vars)}</text>
${l.topicMap.rows.map((s, i) => `<text class="td" x="978" y="${830 + i * 20}">${t(s, vars)}</text>`).join('\n')}
</svg>`;
}
