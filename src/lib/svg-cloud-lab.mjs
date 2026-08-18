// FIG.02 — Aruba Central (CNX) lab topology, generated from the pod count.
//
// Same pod-row geometry as the campus diagram (see lab-layout.mjs), but the
// shared hub is a PoE switch rather than a routing core, and the right-hand
// column carries the cloud stack — Central, Central NAC, and the identity
// provider — instead of on-prem controller and RADIUS appliances.

import { esc, t } from './util.mjs';
import {
  POD_X0, POD_PITCH, POD_W, POD_Y, POD_H, COL_W, HUB_H, CANVAS_H, BAND_Y, BAND_H,
  n2, roles, labGeometry, uplinks,
} from './lab-layout.mjs';

const ID = 'svg-lab';

const CSS = `#${ID} text{font-family:"IBM Plex Sans Thai","Sarabun","Loma","Noto Sans Thai","Sarabun","Segoe UI",sans-serif;fill:#0F1E2E}#${ID} .h1{font-size:28px;font-weight:700}#${ID} .sub{font-size:14px;fill:#5A6C7D}#${ID} .lbl{font-size:15px;font-weight:700}#${ID} .lbl2{font-size:13px;font-weight:700}#${ID} .role{font-size:11.5px;fill:#41545F}#${ID} .tiny{font-size:11px;fill:#5A6C7D}#${ID} .tag{font-size:11px;font-weight:700;fill:#fff}#${ID} .th{font-size:11.5px;font-weight:700;fill:#1E6BB8}#${ID} .td{font-size:11.5px;fill:#33454F}#${ID} .link{stroke:#4A6274;stroke-width:2.5;fill:none}#${ID} .link10{stroke:#0E7C86;stroke-width:5;fill:none;stroke-linecap:round}#${ID} .auth{stroke:#6B4EA8;stroke-width:2.5;stroke-dasharray:3 5;fill:none}#${ID} .air{stroke:#14996B;stroke-width:2;fill:none;opacity:.75}#${ID} .grp{fill:#FAFCFE;stroke:#C7D6E2;stroke-width:1.5;stroke-dasharray:6 5}#${ID} .cloud{fill:#F7FAFE;stroke:#8FB3D9;stroke-width:2;stroke-dasharray:8 6}`;

/** One pod: trunk/PoE feed, APs, notebook, wireless clients, SSID + Central group. */
function podGroup(i, course, vars) {
  const p = course.pod;
  const num = i + 1;
  const x = POD_X0 + i * POD_PITCH;
  const first = i === 0;
  const ssids = p.ssids.map((s) => `POD${num}-${s.suffix} (${s.auth})`).join(' · ');
  const [ap1, ap2] = p.aps;

  return `<!-- ============ POD ${num} ============ -->
<rect class="grp" x="${x}" y="${POD_Y}" width="${POD_W}" height="${POD_H}" rx="12"/>
<rect x="${x}" y="${POD_Y}" width="130" height="28" rx="10" fill="#1E6BB8"/>
<text class="tag" x="${x + 16}" y="489">POD ${num} (${t(p.size, vars)})</text>

<rect x="${x + 22}" y="512" width="396" height="56" rx="9" fill="#F2F7FB" stroke="#1E6BB8" stroke-width="1.5" stroke-dasharray="5 4"/>
<text class="lbl2" x="${x + 36}" y="534">${t(p.uplinkNote, vars)}</text>
<text class="role" x="${x + 36}" y="554">VLAN ${num}1–${num}${course.vlanPlan.length} · DHCP ที่ไซต์</text>

<rect x="${x + 28}" y="600" width="118" height="66" rx="9" fill="#E9F7F1" stroke="#14996B" stroke-width="2"/>
<text class="lbl2" x="${x + 42}" y="626">${t(ap1.model, vars)}</text>
<text class="role" x="${x + 42}" y="646">${t(ap1.note, vars)}</text>
<rect x="${x + 162}" y="600" width="118" height="66" rx="9" fill="#E9F7F1" stroke="#14996B" stroke-width="2"/>
<text class="lbl2" x="${x + 176}" y="626">${t(ap2.model, vars)}</text>
<text class="role" x="${x + 176}" y="646">${t(ap2.note, vars)}</text>
<rect x="${x + 296}" y="600" width="122" height="66" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl2" x="${x + 310}" y="626">${t(p.client.label, vars)}</text>
<text class="role" x="${x + 310}" y="646">${t(p.client.note, vars)}</text>
<line class="link" x1="${x + 87}" y1="568" x2="${x + 87}" y2="600"/>
<line class="link" x1="${x + 221}" y1="568" x2="${x + 221}" y2="600"/>
<line class="link" x1="${x + 357}" y1="568" x2="${x + 357}" y2="600"/>${first ? `
<text class="tiny" x="${x + 92}" y="590">PoE+</text>` : ''}

<path class="air" d="M${x + 58} 692 a38 38 0 0 1 56 0"/>
<path class="air" d="M${x + 192} 692 a38 38 0 0 1 56 0"/>
<rect x="${x + 28}" y="714" width="252" height="58" rx="9" fill="#F5F7F8" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl2" x="${x + 42}" y="736">${t(p.clients.label, vars)}</text>
<text class="role" x="${x + 42}" y="756">${t(p.clients.note, vars)}</text>
<line class="link" x1="${x + 154}" y1="666" x2="${x + 154}" y2="714" stroke-dasharray="4 4"/>

<text class="role" x="${x + 28}" y="806">SSID: ${esc(ssids)}</text>
<text class="role" x="${x + 28}" y="828" fill="#4C7BA8">Central: Group POD-${num} · Site POD-${num}</text>`;
}

export function cloudLabSvg(course, vars, pods) {
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
<marker id="am-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#6B4EA8"/></marker>
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

<!-- Shared PoE switch -->
<rect x="${g.coreX}" y="${g.coreY}" width="${n2(g.coreW)}" height="${HUB_H}" rx="10" fill="#E8F1F8" stroke="#1E6BB8" stroke-width="2.5"/>
<rect x="${g.coreX}" y="${g.coreY}" width="${n2(g.coreW)}" height="26" rx="10" fill="#1E6BB8"/>
<text class="tag" x="${g.coreX + 14}" y="203">${t(l.core.tag, vars)}</text>
${roles(l.core.roles, g.coreX + 14, 233, 19, vars)}

<!-- Cloud column -->
<rect class="cloud" x="${g.colX - 14}" y="104" width="${COL_W + 28}" height="248" rx="16"/>

<rect x="${g.colX}" y="126" width="${COL_W}" height="104" rx="10" fill="#E8F1F8" stroke="#1E6BB8" stroke-width="2.5"/>
<rect x="${g.colX}" y="126" width="${COL_W}" height="26" rx="10" fill="#1E6BB8"/>
<text class="tag" x="${g.colX + 14}" y="144">${t(l.cloud.tag, vars)}</text>
${roles(l.cloud.roles, g.colX + 14, 174, 19, vars)}

<rect x="${g.colX}" y="244" width="${COL_W}" height="90" rx="10" fill="#F1ECFB" stroke="#6B4EA8" stroke-width="2.5"/>
<text class="lbl2" x="${g.colX + 14}" y="268">${t(l.nac.label, vars)}</text>
${roles(l.nac.roles, g.colX + 14, 288, 19, vars)}

<rect x="${g.colX}" y="372" width="${COL_W}" height="58" rx="10" fill="#EFF3F7" stroke="#5A6C7D" stroke-width="2"/>
<text class="lbl2" x="${g.colX + 14}" y="396">${t(l.idp.label, vars)}</text>
<text class="role" x="${g.colX + 14}" y="416">${t(l.idp.note, vars)}</text>
<path class="auth" marker-end="url(#am-${ID})" d="M${g.colX + 200} 334 V 372"/>

<!-- site uplink: management to Central, auth to Central NAC -->
<path class="link10" d="M${g.coreRight} 180 H ${g.colX}"/>
<text class="tiny" x="${g.coreRight + 12}" y="170">HTTPS / WSS 443 — config, firmware, telemetry</text>
<path class="auth" d="M${g.colX} 289 H ${g.coreRight + 60} V ${g.coreBottom}"/>
<text class="tiny" x="${g.coreRight + 12}" y="283" fill="#59418F">RadSec 2083 — 802.1X / MAC Auth</text>

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
<text class="role" x="${g.colX + 16}" y="876">${t(l.notesPanel.footnote, vars)}</text>

<!-- ============ bottom band ============ -->
<rect x="${POD_X0}" y="${BAND_Y}" width="440" height="${BAND_H}" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="78" y="938">Legend</text>
<line class="link" x1="80" y1="966" x2="128" y2="966"/><text class="tiny" x="138" y="970">Copper / PoE+ (AP, Notebook)</text>
<path class="link10" d="M80 998 H 128"/><text class="tiny" x="138" y="1002">Trunk uplink · ขึ้น Cloud (443)</text>
<path class="auth" d="M80 1030 H 128"/><text class="tiny" x="138" y="1034">Authentication · RadSec / Identity</text>
<path class="air" d="M84 1062 a24 24 0 0 1 40 0"/><text class="tiny" x="138" y="1062">Wireless (SSID broadcast)</text>
<text class="tiny" x="80" y="1094" fill="#4C7BA8">ไม่มี tunnel ขึ้น cloud — data ออกที่ไซต์</text>

<rect x="${n2(planX)}" y="${BAND_Y}" width="${n2(planW)}" height="${BAND_H}" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="${n2(planX + 18)}" y="938">SSID / VLAN Plan (n = หมายเลข Pod)</text>
<text class="th" x="${n2(planX + 18)}" y="960">VLAN</text><text class="th" x="${n2(planX + 76)}" y="960">ชื่อ / การใช้งาน</text><text class="th" x="${n2(planX + 292)}" y="960">Subnet</text>
<line x1="${n2(planX + 18)}" y1="966" x2="${n2(planX + planW - 18)}" y2="966" stroke="#DCE6ED"/>
${vlanRows.map(([vid, name, subnet], i) => {
    const y = 986 + i * 19;
    return `<text class="td" x="${n2(planX + 18)}" y="${y}">${esc(vid)}</text><text class="td" x="${n2(planX + 76)}" y="${y}">${esc(name)}</text><text class="td" x="${n2(planX + 292)}" y="${y}">${esc(subnet)}</text>`;
  }).join('\n')}

<rect x="${g.colX}" y="${BAND_Y}" width="${COL_W}" height="${BAND_H}" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<text class="lbl2" x="${g.colX + 18}" y="938">${t(l.topicMap.title, vars)}</text>
${l.topicMap.rows.map((row, i) => `<text class="td" x="${g.colX + 18}" y="${962 + i * 21}">${t(row, vars)}</text>`).join('\n')}
</svg>`;
}
