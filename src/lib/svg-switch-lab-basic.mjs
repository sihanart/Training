// FIG.03 — the switch lab as it is wired inside PNETLAB, basic edition.
//
// Same simulator as the campus course draws, but this course stops short of
// VSX: one L3 switch holds every SVI, a LAG carries VLANs to the second switch
// and a plain trunk carries them to the third. Drawing the LAG as two lines and
// the trunk as one is the whole point — the difference between them is the
// lesson, and a single fat line would hide it.

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
  `#${ID} .lag{stroke:#0E7C86;stroke-width:4;fill:none}`,
  `#${ID} .ag{fill:#C4620A;font-size:13px;font-weight:700}`,
  `#${ID} .agsub{fill:#C4620A;font-size:11.5px}`,
  `#${ID} .l3{font-size:10.5px;font-weight:700;fill:#C4620A;letter-spacing:.06em}`,
].join('');

/** A port bubble sitting on a link, the way the simulator labels them. */
const port = (x, y, label) =>
  `<rect x="${x - 24}" y="${y - 10}" width="48" height="20" rx="10" fill="#FFFFFF" stroke="#9FB4BD"/>` +
  `<text class="port" x="${x}" y="${y + 4}" text-anchor="middle">${esc(label)}</text>`;

/** A switch box with its management address underneath; `tag` marks the L3 one. */
const sw = (x, y, node, tag) =>
  `<rect x="${x}" y="${y}" width="200" height="72" rx="10" fill="${tag ? '#FFF6EC' : '#E9F2FA'}" stroke="${tag ? '#C4620A' : '#1E6BB8'}" stroke-width="2.5"/>` +
  `<text class="lbl2" x="${x + 100}" y="${y + 30}" text-anchor="middle">${esc(node.name)}</text>` +
  `<text class="ip" x="${x + 100}" y="${y + 52}" text-anchor="middle">${esc(node.ip)}</text>` +
  (tag ? `<text class="l3" x="${x + 100}" y="${y - 10}" text-anchor="middle">${esc(tag)}</text>` : '');

/** A PC box: which machine, and the VLAN it sits in. */
const pc = (x, y, node) =>
  `<rect x="${x}" y="${y}" width="124" height="60" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>` +
  `<text class="lbl2" x="${x + 62}" y="${y + 26}" text-anchor="middle">${esc(node.name)}</text>` +
  `<text class="tiny" x="${x + 62}" y="${y + 45}" text-anchor="middle">${esc(node.detail)}</text>`;

export function basicSwitchLabSvg(course, vars) {
  const s = course.switchLab;
  const n = s.nodes;
  const subhead = `${vars.partnerLine} · ${vars.dateShort} · ${t(s.subTail, vars)}`;

  return `<svg id="${ID}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs><style>${CSS}</style></defs>

<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text class="h1" x="40" y="46">${t(s.heading, vars)}</text>
<text class="sub" x="40" y="70">${esc(subhead)}</text>
<line x1="40" y1="86" x2="1400" y2="86" stroke="#E1E9EF" stroke-width="2"/>

<!-- what the whole picture is for -->
<text class="ag" x="495" y="140" text-anchor="middle">${t(s.agLabel, vars)}</text>
<text class="agsub" x="495" y="161" text-anchor="middle">${esc(s.agIp)}</text>

${sw(170, 200, n.sw1, 'L3 — SVI')}
${sw(620, 200, n.sw2)}

<!-- LAG: two members, drawn as two lines because that is the lesson -->
<line class="lag" x1="370" y1="222" x2="620" y2="222"/>
${port(398, 222, '1/1/1')}${port(592, 222, '1/1/1')}
<line class="lag" x1="370" y1="258" x2="620" y2="258"/>
${port(398, 258, '1/1/2')}${port(592, 258, '1/1/2')}
<text class="lbl2" x="495" y="292" text-anchor="middle" fill="#0E7C86">${esc(s.lagLabel)}</text>
<text class="tiny" x="495" y="310" text-anchor="middle">${esc(s.lagSub)}</text>

<!-- PCs on the pair -->
${pc(15, 206, n.pc1)}
<line class="link" x1="139" y1="236" x2="170" y2="236"/>
${port(154, 190, '1/1/3')}

${pc(860, 206, n.pc2)}
<line class="link" x1="820" y1="236" x2="860" y2="236"/>
${port(840, 190, '1/1/3')}

<!-- plain trunk down to the third switch -->
${sw(395, 450, n.sw3)}
<line class="link" x1="270" y1="272" x2="445" y2="450"/>
${port(300, 303, '1/1/4')}${port(415, 419, '1/1/1')}
<text class="lbl2" x="352" y="404" text-anchor="middle" fill="#4A6274">${esc(s.trunkLabel)}</text>

${pc(433, 590, n.pc3)}
<line class="link" x1="495" y1="522" x2="495" y2="590"/>
${port(495, 556, '1/1/3')}

<!-- how to get in -->
<rect x="1000" y="120" width="400" height="150" rx="10" fill="#F3F7FA" stroke="#4A6274" stroke-width="2"/>
<text class="lbl2" x="1018" y="146">${t(s.access.title, vars)}</text>
${s.access.rows.map(([k, v], i) => `<text class="td" x="1018" y="${172 + i * 22}">${esc(k)}</text><text class="td mono2" x="1140" y="${172 + i * 22}">${t(v, vars)}</text>`).join('\n')}
<text class="tiny" x="1018" y="${172 + s.access.rows.length * 22 + 8}">${t(s.access.note, vars)}</text>

<rect x="1000" y="300" width="400" height="212" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="1018" y="326">${t(s.plan.title, vars)}</text>
<text class="th" x="1018" y="348">${esc(s.plan.cols[0])}</text><text class="th" x="1190" y="348">${esc(s.plan.cols[1])}</text>
<line x1="1018" y1="354" x2="1382" y2="354" stroke="#DCE6ED"/>
${s.plan.rows.map(([k, v], i) => `<text class="td" x="1018" y="${372 + i * 20}">${esc(k)}</text><text class="td mono2" x="1190" y="${372 + i * 20}">${esc(v)}</text>`).join('\n')}

<rect x="1000" y="534" width="400" height="146" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="1018" y="560">อ่านผังนี้อย่างไร</text>
${s.notes.map((r, i) => `<text class="role" x="1018" y="${584 + i * 25}">• ${esc(t(r, vars))}</text>`).join('\n')}

<line class="lag" x1="60" y1="700" x2="108" y2="700"/><text class="tiny" x="118" y="704">LAG 1 — สองสายรวมเป็นเส้นเดียว</text>
<line class="link" x1="380" y1="700" x2="428" y2="700"/><text class="tiny" x="438" y="704">Trunk / Access — สายเดี่ยว</text>
<text class="tiny" x="700" y="704">กล่องส้ม = สวิตช์ที่ทำ routing · กล่องฟ้า = L2 ล้วน</text>
</svg>`;
}
