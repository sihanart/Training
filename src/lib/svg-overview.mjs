// FIG.01 — Campus architecture overview.
// Fixed layout (it does not vary with pod count); every label comes from course.overview.

import { esc, t } from './util.mjs';

const ID = 'svg-overview';
const W = 1400;
const H = 830;

const CSS = `#${ID} text{font-family:"IBM Plex Sans Thai","Sarabun","Loma","Noto Sans Thai","Sarabun","Segoe UI",sans-serif;fill:#0F1E2E}#${ID} .h1{font-size:28px;font-weight:700}#${ID} .sub{font-size:14px;fill:#5A6C7D}#${ID} .lbl{font-size:15px;font-weight:700}#${ID} .role{font-size:11.5px;fill:#41545F}#${ID} .tiny{font-size:11px;fill:#5A6C7D}#${ID} .tag{font-size:11px;font-weight:700;fill:#fff}#${ID} .link{stroke:#4A6274;stroke-width:2.5;fill:none}#${ID} .link10{stroke:#0E7C86;stroke-width:5;fill:none;stroke-linecap:round}#${ID} .tunnel{stroke:#FF8300;stroke-width:3;stroke-dasharray:9 6;fill:none}#${ID} .radius{stroke:#6B4EA8;stroke-width:2.5;stroke-dasharray:3 5;fill:none}#${ID} .air{stroke:#14996B;stroke-width:2;fill:none;opacity:.75}#${ID} .grp{fill:#FAFCFE;stroke:#C7D6E2;stroke-width:1.5;stroke-dasharray:6 5}`;

/** Stack of `.role` lines starting at `y`, stepping `step` px. */
const roles = (list, x, y, step, vars) =>
  list.map((line, i) => `<text class="role" x="${x}" y="${y + i * step}">${t(line, vars)}</text>`).join('\n');

export function overviewSvg(course, vars) {
  const o = course.overview;
  const subhead = `${o.subhead} — ${vars.customer} / ${vars.organizer} · ${vars.dateShort}`;

  return `<svg id="${ID}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs>
<style>${CSS}
</style>
<marker id="ar-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#FF8300"/></marker>
<marker id="arb-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#1E6BB8"/></marker>
</defs>

<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text class="h1" x="40" y="48">${t(o.heading, vars)}</text>
<text class="sub" x="40" y="72">${esc(subhead)}</text>
<line x1="40" y1="88" x2="1360" y2="88" stroke="#E1E9EF" stroke-width="2"/>

<!-- Internet -->
<path d="M120 150 a34 34 0 0 1 34-34 h96 a34 34 0 0 1 0 68 h-96 a34 34 0 0 1-34-34z" fill="#EEF3F7" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl" x="175" y="145">${t(o.edge.label, vars)}</text>
<text class="tiny" x="150" y="163">${t(o.edge.note, vars)}</text>

<!-- Firewall -->
<rect x="120" y="230" width="170" height="62" rx="8" fill="#FDECEC" stroke="#C0504D" stroke-width="2"/>
<text class="lbl" x="140" y="256">${t(o.firewall.label, vars)}</text>
<text class="role" x="140" y="276">${t(o.firewall.note, vars)}</text>
<line class="link" x1="205" y1="184" x2="205" y2="230"/>

<!-- Core -->
<rect x="430" y="205" width="360" height="126" rx="10" fill="#E8F1F8" stroke="#1E6BB8" stroke-width="2.5"/>
<rect x="430" y="205" width="360" height="26" rx="10" fill="#1E6BB8"/>
<text class="tag" x="444" y="223">${t(o.core.tag, vars)}</text>
<text class="lbl" x="444" y="253">${t(o.core.label, vars)}</text>
${roles(o.core.roles, 444, 275, 20, vars)}
<line class="link" x1="290" y1="261" x2="430" y2="261"/>

<!-- Mobility Controller -->
<rect x="950" y="180" width="400" height="118" rx="10" fill="#FFF3E6" stroke="#FF8300" stroke-width="2.5"/>
<rect x="950" y="180" width="400" height="26" rx="10" fill="#FF8300"/>
<text class="tag" x="964" y="198">${t(o.controller.tag, vars)}</text>
<text class="lbl" x="964" y="228">${t(o.controller.label, vars)}</text>
${roles(o.controller.roles, 964, 248, 18, vars)}
<path class="link10" d="M790 250 H 950"/>
<text class="tiny" x="812" y="240">LAG 2x10G</text>

<!-- ClearPass -->
<rect x="950" y="330" width="400" height="86" rx="10" fill="#F1ECFB" stroke="#6B4EA8" stroke-width="2.5"/>
<text class="lbl" x="964" y="358">${t(o.cppm.label, vars)}</text>
${roles(o.cppm.roles, 964, 378, 18, vars)}
<path class="radius" d="M950 373 H 830 V 331"/>
<text class="tiny" x="836" y="366">RADIUS</text>

<!-- Services -->
<rect x="950" y="446" width="400" height="72" rx="10" fill="#EFF6F1" stroke="#4B8F6E" stroke-width="2"/>
<text class="lbl" x="964" y="472">${t(o.services.label, vars)}</text>
${roles(o.services.roles, 964, 492, 18, vars)}
<path class="link" d="M950 482 H 880 V 331"/>

<!-- Access layer group -->
<rect class="grp" x="180" y="390" width="640" height="130" rx="12"/>
<text class="tiny" x="196" y="410">ACCESS LAYER</text>

${o.access.map((sw, i) => {
    const x = i === 0 ? 230 : 520;
    return `<rect x="${x}" y="420" width="250" height="80" rx="9" fill="#E9F2FA" stroke="#1E6BB8" stroke-width="2"/>
<text class="lbl" x="${x + 16}" y="446">${t(sw.label, vars)}</text>
${roles(sw.roles, x + 16, 466, 18, vars)}`;
  }).join('\n')}

<path class="link10" d="M540 331 L 380 420"/>
<path class="link10" d="M660 331 L 645 420"/>
<text class="tiny" x="344" y="372">Uplink 10G / LAG</text>

<!-- APs -->
${o.aps.map((ap, i) => {
    const x = i === 0 ? 230 : 380;
    return `<rect x="${x}" y="580" width="120" height="62" rx="9" fill="#E9F7F1" stroke="#14996B" stroke-width="2"/>
<text class="lbl" x="${x + 18}" y="606">${t(ap.label, vars)}</text>
<text class="role" x="${x + 18}" y="626">${t(ap.note, vars)}</text>`;
  }).join('\n')}
<line class="link" x1="290" y1="500" x2="290" y2="580"/>
<line class="link" x1="440" y1="500" x2="440" y2="580"/>
<text class="tiny" x="298" y="546">PoE+</text>

<!-- wireless clients -->
<path class="air" d="M300 572 a44 44 0 0 1 60 0"/>
<path class="air" d="M312 560 a30 30 0 0 1 36 0"/>
<rect x="250" y="690" width="230" height="58" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl" x="266" y="714">${t(o.wirelessClients.label, vars)}</text>
<text class="role" x="266" y="734">${t(o.wirelessClients.note, vars)}</text>
<line class="link" x1="365" y1="642" x2="365" y2="690" stroke-dasharray="4 4"/>

<!-- wired client -->
<rect x="620" y="580" width="180" height="62" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl" x="636" y="606">${t(o.wiredClient.label, vars)}</text>
<text class="role" x="636" y="626">${t(o.wiredClient.note, vars)}</text>
<line class="link" x1="690" y1="500" x2="690" y2="580"/>

<!-- Traffic flows -->
${o.flows.map((f, i) => {
    const cy = 600 + i * 56;
    const lines = f.lines
      .map((line, j) => `<text class="role" x="900" y="${cy - 8 + j * 18}" font-size="12.5">${t(line, vars)}</text>`)
      .join('\n');
    return `<circle cx="880" cy="${cy}" r="13" fill="${esc(f.color)}"/><text class="tag" x="875" y="${cy + 5}">${t(f.n, vars)}</text>
${lines}`;
  }).join('\n\n')}

<path class="tunnel" marker-end="url(#ar-${ID})" d="M500 612 C 700 604 850 500 952 306"/>
<text class="tiny" x="516" y="552" fill="#C4620A" font-size="12.5" font-weight="700">${t(o.tunnelLabel, vars)}</text>

<!-- legend -->
<rect x="40" y="770" width="1320" height="44" rx="8" fill="#F7FAFC" stroke="#E1E9EF"/>
<line class="link" x1="60" y1="792" x2="110" y2="792"/><text class="tiny" x="118" y="796">Copper 1G</text>
<line class="link10" x1="210" y1="792" x2="260" y2="792"/><text class="tiny" x="268" y="796">10G / LAG (Fiber)</text>
<path class="tunnel" d="M400 792 H 450"/><text class="tiny" x="458" y="796">GRE Tunnel (AP — MC)</text>
<path class="radius" d="M620 792 H 670"/><text class="tiny" x="678" y="796">RADIUS (802.1X / MAC Auth)</text>
<path class="air" d="M840 796 a26 26 0 0 1 34 0"/><text class="tiny" x="884" y="796">Wireless (SSID)</text>
<text class="tiny" x="1010" y="796">${t(o.footnote, vars)}</text>
</svg>`;
}
