// FIG.02 — Lab topology.
//
// Layout model: fixed canvas. Every pod runs identical kit on a controller of
// its own, so the diagram draws that arrangement once for the students and once
// for the instructor instead of repeating it per pod. Seven identical boxes said
// nothing the caption "n = 1–7" does not, and cost the width that makes the
// assignment table and the DHCP notes readable beside them.
//
// The pod count therefore grows the tables, not the geometry.

import { esc, t } from './util.mjs';
import { labPods } from './lab-config.mjs';

const ID = 'svg-lab';
const W = 1440;
const H = 1120;

const CSS = [
  `#${ID} text{font-family:"IBM Plex Sans Thai","Sarabun","Loma","Noto Sans Thai","Segoe UI",sans-serif;fill:#0F1E2E}`,
  `#${ID} .h1{font-size:28px;font-weight:700}`,
  `#${ID} .sub{font-size:13.5px;fill:#5A6C7D}`,
  `#${ID} .lbl{font-size:15px;font-weight:700}`,
  `#${ID} .lbl2{font-size:13px;font-weight:700}`,
  `#${ID} .role{font-size:11.5px;fill:#41545F}`,
  `#${ID} .tiny{font-size:11px;fill:#5A6C7D}`,
  `#${ID} .tag{font-size:11px;font-weight:700;fill:#fff}`,
  `#${ID} .th{font-size:10.5px;font-weight:700;fill:#1E6BB8;letter-spacing:.06em}`,
  `#${ID} .td{font-size:11.5px;fill:#33454F}`,
  `#${ID} .tteach{font-weight:700;fill:#C4620A}`,
  `#${ID} .mono2{font-family:"IBM Plex Mono",monospace;font-size:11.5px}`,
  `#${ID} .ip{font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:600;fill:#1E6BB8}`,
  `#${ID} .link{stroke:#4A6274;stroke-width:2.5;fill:none}`,
  `#${ID} .link10{stroke:#0E7C86;stroke-width:5;fill:none;stroke-linecap:round}`,
  `#${ID} .tunnel{stroke:#FF8300;stroke-width:3;stroke-dasharray:9 6;fill:none}`,
  `#${ID} .air{stroke:#14996B;stroke-width:2;fill:none;opacity:.75}`,
  `#${ID} .grp{fill:#FAFCFE;stroke:#C7D6E2;stroke-width:1.5;stroke-dasharray:6 5}`,
].join('');

/** `code` and **address** inside a data string, as tspans rather than markup. */
function rich(text, vars) {
  return esc(t(text, vars))
    .replace(/\*\*(.+?)\*\*/g, '<tspan class="ip">$1</tspan>')
    .replace(/`(.+?)`/g, '<tspan class="mono2">$1</tspan>');
}

const line = (cls, x, y, text, vars) =>
  `<text class="${cls}" x="${x}" y="${y}">${rich(text, vars)}</text>`;
const stack = (cls, x, y0, step, list, vars) =>
  list.map((s, i) => line(cls, x, y0 + i * step, s, vars)).join('\n');

/** One column: access switch, its own controller, two APs, the client box. */
function podColumn(g, x, vars) {
  const hot = g.accent;
  const ap = (i, ax) => `<rect x="${ax}" y="586" width="84" height="96" rx="9" fill="#E9F7F1" stroke="#14996B" stroke-width="2"/>
<text class="lbl2" x="${ax + 14}" y="609">${esc(g.aps[i].model)}</text>
${g.aps[i].lines.map((s, k) => line('role', ax + 14, 629 + k * 19, s, vars)).join('\n')}
<path class="air" d="M${ax + 14} 578 a28 28 0 0 1 56 0"/>`;

  return `<rect class="grp" x="${x}" y="440" width="440" height="430" rx="12"${hot ? ' stroke="#FFC489"' : ''}/>
<rect x="${x}" y="440" width="${g.tagW}" height="28" rx="10" fill="${hot ? '#C4620A' : '#1E6BB8'}"/>
<text class="tag" x="${x + 16}" y="459">${rich(g.tag, vars)}</text>

<rect x="${x + 24}" y="486" width="392" height="66" rx="9" fill="#E9F2FA" stroke="#1E6BB8" stroke-width="2"/>
<text class="lbl2" x="${x + 38}" y="509">${rich(g.switch.label, vars)}</text>
${line('role', x + 38, 530, g.switch.note, vars)}

<rect x="${x + 24}" y="586" width="196" height="96" rx="9" fill="${hot ? '#FFE8CC' : '#FFF3E6'}" stroke="${hot ? '#C4620A' : '#FF8300'}" stroke-width="2.5"/>
<text class="lbl2" x="${x + 38}" y="609">${rich(g.controller.label, vars)}</text>
${line('role', x + 38, 629, g.controller.mgmtLabel, vars)}
<text class="ip" x="${x + 38}" y="648"${hot ? ' fill="#C4620A"' : ''}>${esc(g.controller.mgmt)}</text>
${line('role', x + 38, 668, g.controller.note, vars)}

${ap(0, x + 240)}
${ap(1, x + 332)}
${g.apNote ? line('tiny', x + 38, 714, g.apNote, vars) : ''}

<line class="link" x1="${x + 122}" y1="552" x2="${x + 122}" y2="586"/>
<line class="link" x1="${x + 282}" y1="552" x2="${x + 282}" y2="586"/>
<line class="link" x1="${x + 374}" y1="552" x2="${x + 374}" y2="586"/>

<rect x="${x + 24}" y="736" width="392" height="60" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl2" x="${x + 38}" y="759">${rich(g.clients.label, vars)}</text>
${line('role', x + 38, 779, g.clients.note, vars)}
<line class="link" x1="${x + 282}" y1="682" x2="${x + 282}" y2="736" stroke-dasharray="4 4"/>
${g.example ? line('role', x + 24, 822, g.example, vars) : ''}
${line('tiny', x + 24, g.example ? 846 : 822, g.note, vars)}`;
}

export function labSvg(course, vars, event) {
  const l = course.lab;
  const pods = labPods(event.lab);
  const subhead = `${vars.partnerLine} · ${vars.dateShort} · ${t(l.subheadTail, vars)}`;

  // One row per pod. The instructor row is tinted to match its box below.
  const ROW_H = 24;
  const TABLE_Y = 335;
  const assign = pods.map((p, i) => {
    const y = TABLE_Y + i * ROW_H;
    const fill = p.teacher ? '#FFF3E6' : i % 2 === 0 ? '#F7FAFC' : '#FFFFFF';
    return `<rect x="1014" y="${y}" width="372" height="${ROW_H}" fill="${fill}"/>` +
      `<text class="td${p.teacher ? ' tteach' : ''}" x="1024" y="${y + 17}">${esc(p.label)}</text>` +
      `<text class="td mono2" x="1120" y="${y + 17}">${esc(p.mgmt)}</text>` +
      `<text class="td mono2" x="1268" y="${y + 17}">VLAN ${esc(String(p.vlan))}</text>`;
  }).join('\n');
  const tableEnd = TABLE_Y + pods.length * ROW_H;

  return `<svg id="${ID}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs>
<style>${CSS}</style>
<marker id="ar-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#FF8300"/></marker>
</defs>

<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text class="h1" x="40" y="48">${t(l.heading, vars)}</text>
<text class="sub" x="40" y="74">${esc(subhead)}</text>
<line x1="40" y1="90" x2="1400" y2="90" stroke="#E1E9EF" stroke-width="2"/>

<!-- internet + management uplink -->
<path d="M75 148 a30 30 0 0 1 30-30 h110 a30 30 0 0 1 0 60 h-110 a30 30 0 0 1-30-30z" fill="#EEF3F7" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl" x="128" y="143">${t(l.edge.label, vars)}</text>
<text class="tiny" x="96" y="160">${t(l.edge.note, vars)}</text>
<rect x="70" y="212" width="190" height="58" rx="8" fill="#FDECEC" stroke="#C0504D" stroke-width="2"/>
<text class="lbl2" x="86" y="237">${t(l.firewall.label, vars)}</text>
${line('role', 86, 256, l.firewall.note, vars)}
<line class="link" x1="165" y1="178" x2="165" y2="212"/>
<line class="link" x1="260" y1="241" x2="330" y2="241"/>

<!-- core -->
<rect x="330" y="180" width="470" height="122" rx="10" fill="#E8F1F8" stroke="#1E6BB8" stroke-width="2.5"/>
<rect x="330" y="180" width="470" height="26" rx="10" fill="#1E6BB8"/>
<text class="tag" x="344" y="198">${t(l.core.tag, vars)}</text>
${stack('role', 344, 228, 20, l.core.roles, vars)}

<!-- what the controller is for -->
<rect x="1000" y="118" width="400" height="128" rx="10" fill="#FFF3E6" stroke="#FF8300" stroke-width="2.5"/>
<rect x="1000" y="118" width="400" height="26" rx="10" fill="#FF8300"/>
<text class="tag" x="1014" y="136">${t(l.controller.tag, vars)}</text>
${stack('role', 1014, 166, 20, l.controller.roles, vars)}

<!-- which controller belongs to which pod -->
<rect x="1000" y="282" width="400" height="${tableEnd - 282 + 19}" rx="10" fill="#FFFFFF" stroke="#C7D6E2" stroke-width="1.5"/>
<text class="lbl2" x="1014" y="306">${t(l.assign.title, vars)}</text>
<text class="th" x="1024" y="326">${esc(l.assign.cols[0])}</text><text class="th" x="1120" y="326">${esc(l.assign.cols[1])}</text><text class="th" x="1268" y="326">${esc(l.assign.cols[2])}</text>
<line x1="1014" y1="331" x2="1386" y2="331" stroke="#DCE6ED"/>
${assign}
${line('tiny', 1014, tableEnd + 11, l.assign.note, vars)}

<!-- DHCP / NAT, which live on the controller here rather than the core -->
<rect x="1000" y="566" width="400" height="304" rx="10" fill="#EFF6F1" stroke="#4B8F6E" stroke-width="2"/>
<text class="lbl2" x="1014" y="592">${t(l.dhcp.title, vars)}</text>
${stack('role', 1014, 616, 22, l.dhcp.rows, vars)}
<line x1="1014" y1="746" x2="1386" y2="746" stroke="#CBDDD2"/>
<text class="lbl2" x="1014" y="770">${t(l.dhcp.checkTitle, vars)}</text>
${l.dhcp.checks.map((s, i) => `<text class="role mono2" x="1014" y="${792 + i * 20}">${esc(s)}</text>`).join('\n')}

<!-- student pods -->
${podColumn({ ...l.student, tagW: 230 }, 60, vars)}

<!-- instructor pod -->
${podColumn({ ...l.teacher, tagW: 210, accent: true }, 520, vars)}

<!-- core down to each column -->
<path class="link10" d="M420 302 L 220 486"/>
<path class="link10" d="M620 302 L 700 486"/>
<text class="tiny" x="300" y="404">${t(l.uplinkLabel, vars)}</text>
<text class="tiny" x="660" y="404">${t(l.uplinkLabel, vars)}</text>

<path class="tunnel" marker-end="url(#ar-${ID})" d="M810 300 C 900 300 920 240 985 214"/>
<text class="tiny" x="700" y="352" fill="#C4620A" font-size="11.5" font-weight="700">${t(l.tunnelNote, vars)}</text>

<!-- legend -->
<rect x="60" y="900" width="440" height="196" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="78" y="926">${t(l.legend.title, vars)}</text>
<line class="link" x1="80" y1="950" x2="128" y2="950"/><text class="tiny" x="138" y="954">${esc(l.legend.rows[0])}</text>
<line class="link10" x1="80" y1="978" x2="128" y2="978"/><text class="tiny" x="138" y="982">${esc(l.legend.rows[1])}</text>
<path class="tunnel" d="M80 1006 H 128"/><text class="tiny" x="138" y="1010">${esc(l.legend.rows[2])}</text>
<path class="air" d="M84 1040 a24 24 0 0 1 40 0"/><text class="tiny" x="138" y="1040">${esc(l.legend.rows[3])}</text>
<text class="tiny" x="80" y="1072">${t(l.legend.note, vars)}</text>

<!-- VLAN / IP summary -->
<rect x="520" y="900" width="440" height="196" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="538" y="926">${t(l.plan.title, vars)}</text>
<text class="th" x="538" y="948">${esc(l.plan.cols[0])}</text><text class="th" x="742" y="948">${esc(l.plan.cols[1])}</text>
<line x1="538" y1="954" x2="942" y2="954" stroke="#DCE6ED"/>
${l.plan.rows.map(([k, v], i) => `<text class="td" x="538" y="${972 + i * 20}">${t(k, vars)}</text><text class="td mono2" x="742" y="${972 + i * 20}">${t(v, vars)}</text>`).join('\n')}

<!-- course topic map -->
<rect x="1000" y="900" width="400" height="196" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="1018" y="926">${t(l.topicMap.title, vars)}</text>
${l.topicMap.rows.map((s, i) => `<text class="td" x="1018" y="${950 + i * 20}">${t(s, vars)}</text>`).join('\n')}
</svg>`;
}
