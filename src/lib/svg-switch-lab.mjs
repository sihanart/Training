// FIG.03 — the switch lab as it is wired inside PNETLAB.
//
// This is the topology students actually type into, so it is drawn the way the
// simulator lays it out rather than the way a campus is drawn elsewhere in this
// deck: the VSX pair side by side with both of its inter-switch links visible,
// because telling the keepalive link from the ISL is half of what goes wrong.

import { esc, t } from './util.mjs';

const ID = 'svg-switchlab';
const W = 1440;
const H = 760;

const CSS = [
  `#${ID} text{font-family:"IBM Plex Sans Thai","Sarabun","Loma","Noto Sans Thai","Segoe UI",sans-serif;fill:#0F1E2E}`,
  `#${ID} .h1{font-size:26px;font-weight:700}`,
  `#${ID} .sub{font-size:13.5px;fill:#5A6C7D}`,
  `#${ID} .lbl2{font-size:13px;font-weight:700}`,
  `#${ID} .role{font-size:11.5px;fill:#41545F}`,
  `#${ID} .tiny{font-size:11px;fill:#5A6C7D}`,
  `#${ID} .th{font-size:10.5px;font-weight:700;fill:#1E6BB8;letter-spacing:.06em}`,
  `#${ID} .td{font-size:11.5px;fill:#33454F}`,
  `#${ID} .mono2{font-family:"IBM Plex Mono",monospace;font-size:11.5px}`,
  `#${ID} .ip{font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:600;fill:#1E6BB8}`,
  `#${ID} .port{font-family:"IBM Plex Mono",monospace;font-size:10px;fill:#41545F}`,
  `#${ID} .link{stroke:#4A6274;stroke-width:2.5;fill:none}`,
  `#${ID} .isl{stroke:#0E7C86;stroke-width:4;fill:none}`,
  `#${ID} .ka{stroke:#C4620A;stroke-width:2.5;stroke-dasharray:6 4;fill:none}`,
  `#${ID} .ag{fill:#C4620A;font-size:13px;font-weight:700}`,
].join('');

/** A port bubble sitting on a link, the way the simulator labels them. */
const port = (x, y, label) =>
  `<rect x="${x - 24}" y="${y - 10}" width="48" height="20" rx="10" fill="#FFFFFF" stroke="#9FB4BD"/>` +
  `<text class="port" x="${x}" y="${y + 4}" text-anchor="middle">${esc(label)}</text>`;

/** A switch box with its management address underneath. */
const sw = (x, y, node) =>
  `<rect x="${x}" y="${y}" width="200" height="72" rx="10" fill="#E9F2FA" stroke="#1E6BB8" stroke-width="2.5"/>` +
  `<text class="lbl2" x="${x + 100}" y="${y + 30}" text-anchor="middle">${esc(node.name)}</text>` +
  `<text class="ip" x="${x + 100}" y="${y + 52}" text-anchor="middle">${esc(node.ip)}</text>`;

/** A PC box. */
const pc = (x, y, node) =>
  `<rect x="${x}" y="${y}" width="120" height="52" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>` +
  `<text class="lbl2" x="${x + 60}" y="${y + 32}" text-anchor="middle">${esc(node.name)}</text>`;

export function switchLabSvg(course, vars) {
  const s = course.switchLab;
  const n = s.nodes;
  const subhead = `${vars.partnerLine} · ${vars.dateShort} · ${t(s.subTail, vars)}`;

  return `<svg id="${ID}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs><style>${CSS}</style></defs>

<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text class="h1" x="40" y="46">${t(s.heading, vars)}</text>
<text class="sub" x="40" y="70">${esc(subhead)}</text>
<line x1="40" y1="86" x2="1400" y2="86" stroke="#E1E9EF" stroke-width="2"/>

<!-- VSX pair, drawn side by side so KA and ISL are told apart -->
<text class="ag" x="440" y="140" text-anchor="middle">${t(s.agLabel, vars)}</text>
<text class="ag" x="440" y="162" text-anchor="middle">${esc(s.agIp)}</text>

${sw(200, 196, n.sw1)}
${sw(580, 196, n.sw2)}

<line class="ka" x1="400" y1="216" x2="580" y2="216"/>
${port(428, 216, '1/1/5')}${port(552, 216, '1/1/5')}
<text class="lbl2" x="490" y="206" text-anchor="middle" fill="#C4620A">${esc(s.kaLabel)}</text>

<line class="isl" x1="400" y1="252" x2="580" y2="252"/>
${port(428, 252, '1/1/6')}${port(552, 252, '1/1/6')}
<text class="lbl2" x="490" y="278" text-anchor="middle" fill="#0E7C86">${esc(s.vsxLabel)}</text>

<!-- PCs on the pair -->
${pc(40, 206, n.pc11)}
<line class="link" x1="160" y1="232" x2="200" y2="232"/>
${port(180, 232, '1/1/3')}

${pc(850, 206, n.pc12)}
<line class="link" x1="780" y1="232" x2="850" y2="232"/>
${port(815, 232, '1/1/1')}

<!-- down to the second core -->
${sw(440, 430, n.sw3)}
<path class="link" d="M300 268 L 300 350 L 490 350 L 490 430"/>
${port(300, 300, '1/1/1')}${port(490, 400, '1/1/1')}
<path class="link" d="M680 268 L 680 350 L 590 350 L 590 430"/>
${port(680, 300, '1/1/2')}${port(590, 400, '1/1/2')}

${pc(480, 600, n.pc21)}
<line class="link" x1="540" y1="502" x2="540" y2="600"/>
${port(540, 550, '1/1/3')}

<!-- how to get in -->
<rect x="1000" y="120" width="400" height="150" rx="10" fill="#F3F7FA" stroke="#4A6274" stroke-width="2"/>
<text class="lbl2" x="1018" y="146">${t(s.access.title, vars)}</text>
${s.access.rows.map(([k, v], i) => `<text class="td" x="1018" y="${172 + i * 22}">${esc(k)}</text><text class="td mono2" x="1140" y="${172 + i * 22}">${esc(v)}</text>`).join('\n')}
<text class="tiny" x="1018" y="${172 + s.access.rows.length * 22 + 8}">${t(s.access.note, vars)}</text>

<rect x="1000" y="300" width="400" height="190" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="1018" y="326">${t(s.plan.title, vars)}</text>
<text class="th" x="1018" y="348">${esc(s.plan.cols[0])}</text><text class="th" x="1210" y="348">${esc(s.plan.cols[1])}</text>
<line x1="1018" y1="354" x2="1382" y2="354" stroke="#DCE6ED"/>
${s.plan.rows.map(([k, v], i) => `<text class="td" x="1018" y="${372 + i * 20}">${esc(k)}</text><text class="td mono2" x="1210" y="${372 + i * 20}">${esc(v)}</text>`).join('\n')}

<rect x="1000" y="520" width="400" height="150" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="1018" y="546">อ่านผังนี้อย่างไร</text>
${s.notes.map((r, i) => `<text class="role" x="1018" y="${572 + i * 30}">• ${esc(t(r, vars))}</text>`).join('\n')}

<line class="ka" x1="60" y1="700" x2="108" y2="700"/><text class="tiny" x="118" y="704">Keepalive (1/1/5)</text>
<line class="isl" x1="260" y1="700" x2="308" y2="700"/><text class="tiny" x="318" y="704">VSX ISL (1/1/6)</text>
<line class="link" x1="460" y1="700" x2="508" y2="700"/><text class="tiny" x="518" y="704">สายปกติ</text>
</svg>`;
}
