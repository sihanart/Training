// FIG.01 — Aruba Central (CNX) cloud architecture.
//
// The diagram is built around the split this course keeps coming back to:
// control plane and NAC live in the cloud, the data plane never leaves the site.
// Cloud region on top, site group at the bottom, three annotated flows between.

import { esc, t } from './util.mjs';

const ID = 'svg-overview';
const W = 1400;
const H = 900;

const CSS = `#${ID} text{font-family:"IBM Plex Sans Thai","Sarabun","Loma","Noto Sans Thai","Sarabun","Segoe UI",sans-serif;fill:#0F1E2E}#${ID} .h1{font-size:28px;font-weight:700}#${ID} .sub{font-size:14px;fill:#5A6C7D}#${ID} .lbl{font-size:15px;font-weight:700}#${ID} .lbl2{font-size:13px;font-weight:700}#${ID} .role{font-size:11.5px;fill:#41545F}#${ID} .tiny{font-size:11px;fill:#5A6C7D}#${ID} .tag{font-size:11px;font-weight:700;fill:#fff}#${ID} .link{stroke:#4A6274;stroke-width:2.5;fill:none}#${ID} .mgmt{stroke:#0E7C86;stroke-width:5;fill:none;stroke-linecap:round}#${ID} .auth{stroke:#6B4EA8;stroke-width:2.5;stroke-dasharray:3 5;fill:none}#${ID} .data{stroke:#1E6BB8;stroke-width:3;fill:none}#${ID} .air{stroke:#14996B;stroke-width:2;fill:none;opacity:.75}#${ID} .grp{fill:#FAFCFE;stroke:#C7D6E2;stroke-width:1.5;stroke-dasharray:6 5}#${ID} .cloud{fill:#F7FAFE;stroke:#8FB3D9;stroke-width:2;stroke-dasharray:8 6}`;

const roles = (list, x, y, step, vars) =>
  list.map((line, i) => `<text class="role" x="${x}" y="${y + i * step}">${t(line, vars)}</text>`).join('\n');

export function cloudOverviewSvg(course, vars) {
  const o = course.overview;
  const subhead = `${o.subhead} — ${vars.customer} / ${vars.organizer} · ${vars.dateShort}`;

  return `<svg id="${ID}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs>
<style>${CSS}
</style>
<marker id="am-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#6B4EA8"/></marker>
<marker id="ad-${ID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="#1E6BB8"/></marker>
</defs>

<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text class="h1" x="40" y="48">${t(o.heading, vars)}</text>
<text class="sub" x="40" y="72">${esc(subhead)}</text>
<line x1="40" y1="88" x2="1360" y2="88" stroke="#E1E9EF" stroke-width="2"/>

<!-- ============ CLOUD ============ -->
<rect class="cloud" x="350" y="104" width="740" height="226" rx="16"/>
<text class="tiny" x="366" y="126" fill="#4C7BA8" font-weight="700">${t(o.cloudLabel, vars)}</text>

<rect x="368" y="142" width="346" height="170" rx="10" fill="#E8F1F8" stroke="#1E6BB8" stroke-width="2.5"/>
<rect x="368" y="142" width="346" height="26" rx="10" fill="#1E6BB8"/>
<text class="tag" x="382" y="160">${t(o.central.tag, vars)}</text>
<text class="lbl2" x="382" y="188">${t(o.central.label, vars)}</text>
${roles(o.central.roles, 382, 210, 19, vars)}

<rect x="726" y="142" width="346" height="170" rx="10" fill="#F1ECFB" stroke="#6B4EA8" stroke-width="2.5"/>
<rect x="726" y="142" width="346" height="26" rx="10" fill="#6B4EA8"/>
<text class="tag" x="740" y="160">${t(o.nac.tag, vars)}</text>
<text class="lbl2" x="740" y="188">${t(o.nac.label, vars)}</text>
${roles(o.nac.roles, 740, 210, 19, vars)}

<!-- Identity provider, outside Central -->
<rect x="1120" y="160" width="240" height="140" rx="10" fill="#EFF3F7" stroke="#5A6C7D" stroke-width="2"/>
<text class="lbl2" x="1136" y="188">${t(o.idp.label, vars)}</text>
${roles(o.idp.roles, 1136, 212, 19, vars)}
<path class="auth" marker-end="url(#am-${ID})" d="M1072 230 H 1120"/>

<!-- ============ INTERNET ============ -->
<path d="M90 402 a30 30 0 0 1 30-30 h110 a30 30 0 0 1 0 60 h-110 a30 30 0 0 1-30-30z" fill="#EEF3F7" stroke="#8FA6B6" stroke-width="2"/>
<text class="lbl" x="140" y="398">${t(o.edge.label, vars)}</text>
<text class="tiny" x="115" y="416">${t(o.edge.note, vars)}</text>

<!-- site uplink to the cloud: management + auth ride the same physical path -->
<path class="mgmt" d="M175 372 V 350 H 430 V 330"/>
<path class="auth" d="M195 372 V 340 H 800 V 330"/>
<text class="tiny" x="238" y="344" fill="#0B6068" font-weight="700">HTTPS / WSS 443</text>
<text class="tiny" x="440" y="334" fill="#59418F" font-weight="700">RadSec TLS 2083</text>

<!-- ============ FLOWS ============ -->
${o.flows.map((f, i) => {
    const cy = 360 + i * 36;
    const lines = f.lines
      .map((line, j) => `<text class="role" x="${684}" y="${cy - 6 + j * 18}" font-size="12">${t(line, vars)}</text>`)
      .join('\n');
    return `<circle cx="660" cy="${cy}" r="13" fill="${esc(f.color)}"/><text class="tag" x="655" y="${cy + 5}">${t(f.n, vars)}</text>
${lines}`;
  }).join('\n\n')}

<!-- ============ SITE ============ -->
<rect class="grp" x="40" y="456" width="1320" height="296" rx="12"/>
<text class="tiny" x="56" y="476">${t(o.siteLabel, vars)}</text>

<rect x="70" y="492" width="190" height="64" rx="9" fill="#FDECEC" stroke="#C0504D" stroke-width="2"/>
<text class="lbl2" x="86" y="518">${t(o.firewall.label, vars)}</text>
<text class="role" x="86" y="538">${t(o.firewall.note, vars)}</text>
<line class="link" x1="165" y1="492" x2="165" y2="432"/>

<rect x="330" y="492" width="280" height="80" rx="9" fill="#E9F2FA" stroke="#1E6BB8" stroke-width="2"/>
<text class="lbl2" x="346" y="516">${t(o.switch.label, vars)}</text>
${roles(o.switch.roles, 346, 536, 18, vars)}
<line class="link" x1="260" y1="524" x2="330" y2="524"/>

${o.aps.map((ap, i) => {
    const x = 330 + i * 150;
    return `<rect x="${x}" y="616" width="130" height="66" rx="9" fill="#E9F7F1" stroke="#14996B" stroke-width="2"/>
<text class="lbl2" x="${x + 16}" y="642">${t(ap.label, vars)}</text>
<text class="role" x="${x + 16}" y="662">${t(ap.note, vars)}</text>
<line class="link" x1="${x + 65}" y1="572" x2="${x + 65}" y2="616"/>
<path class="air" d="M${x + 30} 608 a35 35 0 0 1 50 0"/>`;
  }).join('\n')}
<text class="tiny" x="400" y="598">PoE+</text>

${o.clients.map((c, i) => {
    const x = 680 + i * 230;
    return `<rect x="${x}" y="616" width="200" height="66" rx="9" fill="${esc(c.color)}" stroke="${esc(c.stroke)}" stroke-width="2"/>
<text class="lbl2" x="${x + 16}" y="642">${t(c.label, vars)}</text>
<text class="role" x="${x + 16}" y="662">${t(c.note, vars)}</text>`;
  }).join('\n')}
<path class="air" d="M614 649 H 674" stroke-dasharray="4 4"/>

<!-- data path stays on site -->
<path class="data" marker-end="url(#ad-${ID})" d="M700 700 H 400 V 690" />
<text class="role" x="712" y="704" font-size="12" fill="#1A5C9E" font-weight="700">${t(o.flows[2].lines[1], vars)}</text>
<line class="link" x1="470" y1="682" x2="470" y2="700" stroke-dasharray="4 4"/>

<!-- ============ CALLOUT + LEGEND ============ -->
<rect x="40" y="768" width="830" height="112" rx="10" fill="#FFF8EC" stroke="#E8C88A" stroke-width="1.5"/>
<text class="lbl2" x="58" y="792" fill="#8A5A12">${t(o.callout.title, vars)}</text>
${roles(o.callout.lines, 58, 814, 20, vars)}

<rect x="890" y="768" width="470" height="112" rx="10" fill="#F7FAFC" stroke="#E1E9EF" stroke-width="1.5"/>
<path class="mgmt" d="M910 792 H 958"/><text class="tiny" x="968" y="796">Management · HTTPS/WSS 443</text>
<path class="auth" d="M910 818 H 958"/><text class="tiny" x="968" y="822">Authentication · RadSec / RADIUS</text>
<path class="data" d="M910 844 H 958"/><text class="tiny" x="968" y="848">User data · bridge ลง VLAN ที่ไซต์</text>
<path class="air" d="M914 872 a24 24 0 0 1 40 0"/><text class="tiny" x="968" y="872">Wireless (SSID broadcast)</text>
</svg>`;
}
