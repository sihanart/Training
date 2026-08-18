// FIG.02 — Lab topology, generated from the pod count.
//
// Layout model: pods sit in one row on a canvas that widens with N. The core box
// spans the pods, and the server column (MC / ClearPass / Services) plus the
// "POD n+1 ... POD n" notes panel share the right-hand column. With N=2 every
// coordinate below reproduces the original hand-drawn diagram exactly.

import { esc, t } from './util.mjs';
import {
  POD_X0, POD_PITCH, POD_W, POD_Y, POD_H, COL_W, HUB_H, CANVAS_H, BAND_Y, BAND_H,
  n2, roles, labGeometry, uplinks,
} from './lab-layout.mjs';

const ID = 'svg-lab';

const CSS = `#${ID} text{font-family:"IBM Plex Sans Thai","Sarabun","Loma","Noto Sans Thai","Sarabun","Segoe UI",sans-serif;fill:#0F1E2E}#${ID} .h1{font-size:28px;font-weight:700}#${ID} .sub{font-size:14px;fill:#5A6C7D}#${ID} .lbl{font-size:15px;font-weight:700}#${ID} .lbl2{font-size:13px;font-weight:700}#${ID} .role{font-size:11.5px;fill:#41545F}#${ID} .tiny{font-size:11px;fill:#5A6C7D}#${ID} .tag{font-size:11px;font-weight:700;fill:#fff}#${ID} .th{font-size:11.5px;font-weight:700;fill:#1E6BB8}#${ID} .td{font-size:11.5px;fill:#33454F}#${ID} .link{stroke:#4A6274;stroke-width:2.5;fill:none}#${ID} .link10{stroke:#0E7C86;stroke-width:5;fill:none;stroke-linecap:round}#${ID} .stackl{stroke:#0E7C86;stroke-width:7;fill:none;stroke-linecap:round}#${ID} .tunnel{stroke:#FF8300;stroke-width:3;stroke-dasharray:9 6;fill:none}#${ID} .radius{stroke:#6B4EA8;stroke-width:2.5;stroke-dasharray:3 5;fill:none}#${ID} .air{stroke:#14996B;stroke-width:2;fill:none;opacity:.75}#${ID} .grp{fill:#FAFCFE;stroke:#C7D6E2;stroke-width:1.5;stroke-dasharray:6 5}`;

/** One pod group: stack, APs, wired PC, wireless clients, SSID line. */
function podGroup(i, course, vars) {
  const p = course.pod;
  const num = i + 1;
  const x = POD_X0 + i * POD_PITCH;
  const first = i === 0;
  const ssids = p.ssids.map((s) => `POD${num}-${s.suffix} (${s.auth})`).join(' · ');
  const [sw1, sw2] = p.stack.members;
  const [ap1, ap2] = p.aps;

  return `<!-- ============ POD ${num} ============ -->
<rect class="grp" x="${x}" y="${POD_Y}" width="${POD_W}" height="${POD_H}" rx="12"/>
<rect x="${x}" y="${POD_Y}" width="120" height="28" rx="10" fill="#1E6BB8"/>
<text class="tag" x="${x + 16}" y="489">POD ${num} (${t(p.size, vars)})</text>

<rect x="${x + 22}" y="512" width="396" height="106" rx="9" fill="#F2F7FB" stroke="#1E6BB8" stroke-width="1.5" stroke-dasharray="5 4"/>
<text class="lbl2" x="${x + 36}" y="534">${t(p.stack.label, vars)}</text>
<rect x="${x + 36}" y="546" width="170" height="58" rx="7" fill="#E9F2FA" stroke="#1E6BB8" stroke-width="2"/>
<text class="lbl2" x="${x + 50}" y="568">${esc(sw1.name)}-POD${num}</text>
<text class="role" x="${x + 50}" y="588">${t(sw1.role, vars)}</text>
<rect x="${x + 236}" y="546" width="170" height="58" rx="7" fill="#E9F2FA" stroke="#1E6BB8" stroke-width="2"/>
<text class="lbl2" x="${x + 250}" y="568">${esc(sw2.name)}-POD${num}</text>
<text class="role" x="${x + 250}" y="588">${t(sw2.role, vars)}</text>
<path class="stackl" d="M${x + 206} 575 H ${x + 236}"/>${first ? `
<text class="tiny" x="${x + 178}" y="640">VSF stack link</text>` : ''}

<rect x="${x + 28}" y="676" width="118" height="66" rx="9" fill="#E9F7F1" stroke="#14996B" stroke-width="2"/>
<text class="lbl2" x="${x + 42}" y="700">${t(ap1.model, vars)}</text>
<text class="role" x="${x + 42}" y="720">${t(ap1.note, vars)}</text>
<rect x="${x + 162}" y="676" width="118" height="66" rx="9" fill="#E9F7F1" stroke="#14996B" stroke-width="2"/>
<text class="lbl2" x="${x + 176}" y="700">${t(ap2.model, vars)}</text>
<text class="role" x="${x + 176}" y="720">${t(ap2.note, vars)}</text>
<rect x="${x + 296}" y="676" width="122" height="66" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl2" x="${x + 310}" y="700">${t(p.client.label, vars)}</text>
<text class="role" x="${x + 310}" y="720">${t(p.client.note, vars)}</text>
<line class="link" x1="${x + 87}" y1="604" x2="${x + 87}" y2="676"/>
<line class="link" x1="${x + 221}" y1="604" x2="${x + 221}" y2="676"/>
<line class="link" x1="${x + 357}" y1="604" x2="${x + 357}" y2="676"/>${first ? `
<text class="tiny" x="${x + 92}" y="646">PoE+</text>` : ''}
<text class="tiny" x="${x + 362}" y="646">VLAN ${num}${p.wiredVlanIndex}</text>

<path class="air" d="M${x + 58} 668 a38 38 0 0 1 56 0"/>
<path class="air" d="M${x + 192} 668 a38 38 0 0 1 56 0"/>
<rect x="${x + 28}" y="790" width="252" height="62" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl2" x="${x + 42}" y="813">${t(p.clients.label, vars)}</text>
<text class="role" x="${x + 42}" y="832">${t(p.clients.note, vars)}</text>
<line class="link" x1="${x + 154}" y1="742" x2="${x + 154}" y2="790" stroke-dasharray="4 4"/>
<text class="role" x="${x + 28}" y="874">SSID: ${esc(ssids)}</text>`;
}

export function labSvg(course, vars, pods) {
  const l = course.lab;
  const g = labGeometry(pods);
  const inf = course.infra;
  const subhead = `${vars.partnerLine} · ${vars.dateShort} · ${l.subheadTail}`;

  const { planX, planW } = g;

  const vlanRows = [
    ...course.vlanPlan.map((r) => [r.vid, r.name, r.subnet]),
    [inf.transitVlan, inf.transitName, inf.transitSubnet],
    [inf.serverVlan, inf.serverNameShort, inf.serverSubnet],
  ];

  return `<svg id="${ID}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${CANVAS_H}">
<defs>
<style>${CSS}
</style>
<marker id="ar-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#FF8300"/></marker>
</defs>

<rect width="${g.width}" height="${CANVAS_H}" fill="#FFFFFF"/>
<text class="h1" x="40" y="48">${t(l.heading, vars)}</text>
<text class="sub" x="40" y="74">${esc(subhead)}</text>
<line x1="40" y1="90" x2="${g.width - 40}" y2="90" stroke="#E1E9EF" stroke-width="2"/>

<!-- Internet + edge -->
<path d="M75 148 a30 30 0 0 1 30-30 h110 a30 30 0 0 1 0 60 h-110 a30 30 0 0 1-30-30z" fill="#EEF3F7" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl" x="128" y="143">${t(l.edge.label, vars)}</text>
<text class="tiny" x="95" y="160">${t(l.edge.note, vars)}</text>
<rect x="75" y="215" width="180" height="58" rx="8" fill="#FDECEC" stroke="#C0504D" stroke-width="2"/>
<text class="lbl2" x="90" y="240">${t(l.firewall.label, vars)}</text>
<text class="role" x="90" y="259">VLAN ${esc(inf.transitVlan)} · ${esc(inf.gateway)}</text>
<line class="link" x1="165" y1="178" x2="165" y2="215"/>
<line class="link" x1="255" y1="244" x2="${g.coreX}" y2="244"/>

<!-- Core -->
<rect x="${g.coreX}" y="${g.coreY}" width="${n2(g.coreW)}" height="${HUB_H}" rx="10" fill="#E8F1F8" stroke="#1E6BB8" stroke-width="2.5"/>
<rect x="${g.coreX}" y="${g.coreY}" width="${n2(g.coreW)}" height="26" rx="10" fill="#1E6BB8"/>
<text class="tag" x="${g.coreX + 14}" y="203">${t(l.core.tag, vars)}</text>
${roles(l.core.roles, g.coreX + 14, 233, 19, vars)}

<!-- Mobility Controller -->
<rect x="${g.colX}" y="118" width="${COL_W}" height="122" rx="10" fill="#FFF3E6" stroke="#FF8300" stroke-width="2.5"/>
<rect x="${g.colX}" y="118" width="${COL_W}" height="26" rx="10" fill="#FF8300"/>
<text class="tag" x="${g.colX + 14}" y="136">${t(l.controller.tag, vars)}</text>
${roles(l.controller.roles, g.colX + 14, 166, 19, vars)}
<path class="link10" d="M${g.coreRight} 200 H ${g.colX}"/>
<text class="tiny" x="${g.coreRight + 12}" y="190">LAG 2x10G (VLAN ${esc(inf.serverVlan)} + user VLANs)</text>

<!-- ClearPass -->
<rect x="${g.colX}" y="262" width="${COL_W}" height="96" rx="10" fill="#F1ECFB" stroke="#6B4EA8" stroke-width="2.5"/>
<text class="lbl2" x="${g.colX + 14}" y="288">${t(l.cppm.label, vars)}</text>
${roles(l.cppm.roles, g.colX + 14, 308, 19, vars)}
<path class="radius" d="M${g.colX} 300 H ${g.coreRight + 80} V ${g.coreBottom}"/>

<!-- Services -->
<rect x="${g.colX}" y="378" width="${COL_W}" height="66" rx="10" fill="#EFF6F1" stroke="#4B8F6E" stroke-width="2"/>
<text class="lbl2" x="${g.colX + 14}" y="402">${t(l.services.label, vars)}</text>
<text class="role" x="${g.colX + 14}" y="424">${t(l.services.note, vars)}</text>
<path class="link" d="M${g.colX} 410 H ${g.coreRight + 50} V ${g.coreBottom}"/>

<!-- Tunnel indication -->
<path class="tunnel" marker-end="url(#ar-${ID})" d="M${g.coreRight - 100} 330 C ${g.coreRight + 20} 380 ${g.coreRight + 100} 330 ${g.colX - 15} 250" />
<text class="tiny" x="${g.coreRight - 178}" y="398" fill="#C4620A" font-size="12" font-weight="700">GRE Tunnel: AP » MC</text>

${uplinks(g)}
<text class="tiny" x="${POD_X0 + 14}" y="446">${t(course.pod.uplinkNote, vars)}</text>

${Array.from({ length: pods }, (_, i) => podGroup(i, course, vars)).join('\n\n')}

<!-- ============ POD n note ============ -->
<rect class="grp" x="${g.colX}" y="${POD_Y}" width="${COL_W}" height="${POD_H}" rx="12"/>
<rect x="${g.colX}" y="${POD_Y}" width="150" height="28" rx="10" fill="#7A8C99"/>
<text class="tag" x="${g.colX + 16}" y="489">${t(l.notesPanel.title, vars)}</text>
${roles(l.notesPanel.intro, g.colX + 16, 524, 22, vars)}

<line x1="${g.colX + 16}" y1="588" x2="${g.colX + 384}" y2="588" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="${g.colX + 16}" y="612">${t(l.notesPanel.fallbackTitle, vars)}</text>
${roles(l.notesPanel.fallback, g.colX + 16, 634, 22, vars)}

<line x1="${g.colX + 16}" y1="742" x2="${g.colX + 384}" y2="742" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="${g.colX + 16}" y="766">${t(l.notesPanel.prepTitle, vars)}</text>
${roles(l.notesPanel.prep, g.colX + 16, 788, 22, vars)}
<text class="role" x="${g.colX + 16}" y="862">${t(l.notesPanel.footnote, vars)}</text>

<!-- ============ bottom band ============ -->
<rect x="${POD_X0}" y="${BAND_Y}" width="440" height="${BAND_H}" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="78" y="938">Legend</text>
<line class="link" x1="80" y1="962" x2="128" y2="962"/><text class="tiny" x="138" y="966">Copper 1G (AP / PC)</text>
<line class="link10" x1="80" y1="988" x2="128" y2="988"/><text class="tiny" x="138" y="992">10G Fiber / LAG uplink</text>
<path class="stackl" d="M80 1014 H 128"/><text class="tiny" x="138" y="1018">VSF Stack link</text>
<path class="tunnel" d="M80 1040 H 128"/><text class="tiny" x="138" y="1044">GRE Tunnel (AP — Controller)</text>
<path class="radius" d="M80 1066 H 128"/><text class="tiny" x="138" y="1070">RADIUS (802.1X / MAC Auth)</text>
<path class="air" d="M84 1094 a24 24 0 0 1 40 0"/><text class="tiny" x="138" y="1094">Wireless (SSID broadcast)</text>

<rect x="${planX}" y="${BAND_Y}" width="${n2(planW)}" height="${BAND_H}" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="${planX + 18}" y="938">VLAN / IP Plan (n = หมายเลข Pod)</text>
<text class="th" x="${planX + 18}" y="960">VLAN</text><text class="th" x="${planX + 76}" y="960">ชื่อ / การใช้งาน</text><text class="th" x="${planX + 292}" y="960">Subnet</text>
<line x1="${planX + 18}" y1="966" x2="${n2(planX + planW - 18)}" y2="966" stroke="#DCE6ED"/>
${vlanRows.map(([vid, name, subnet], i) => {
    const y = 984 + i * 18;
    return `<text class="td" x="${planX + 18}" y="${y}">${esc(vid)}</text><text class="td" x="${planX + 76}" y="${y}">${esc(name)}</text><text class="td" x="${planX + 292}" y="${y}">${esc(subnet)}</text>`;
  }).join('\n')}

<rect x="${g.colX}" y="${BAND_Y}" width="${COL_W}" height="${BAND_H}" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="${g.colX + 18}" y="938">${t(l.topicMap.title, vars)}</text>
${l.topicMap.rows.map((row, i) => `<text class="td" x="${g.colX + 18}" y="${960 + i * 19}">${t(row, vars)}</text>`).join('\n')}
</svg>`;
}
