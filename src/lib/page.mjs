// Renders one event page. The CSS and the viewer script are fixed assets;
// everything between them comes from the course + event data.

import { esc, t, inlineCode } from './util.mjs';
import { overviewSvg } from './svg-overview.mjs';
import { labSvg } from './svg-lab.mjs';
import { cloudOverviewSvg } from './svg-cloud-overview.mjs';
import { cloudLabSvg } from './svg-cloud-lab.mjs';

// A course picks its diagram pair with `diagramSet`. Architectures differ too
// much between courses to parameterise one drawing — an on-prem controller
// topology and a cloud-managed one share geometry, not shapes.
const DIAGRAM_SETS = {
  campus: { overview: overviewSvg, lab: labSvg },
  cloud: { overview: cloudOverviewSvg, lab: cloudLabSvg },
};

/** The drawing pair a course uses. Also used by the build for standalone exports. */
export function diagramsFor(course) {
  const set = DIAGRAM_SETS[course.diagramSet ?? 'campus'];
  if (!set) throw new Error(`course "${course.id}": unknown diagramSet "${course.diagramSet}"`);
  return set;
}

const STYLE = `:root{
  --ink:#0B1F2A; --panel:#102A38; --panel-2:#16394B;
  --paper:#F1F4F3; --card:#FFFFFF; --line:#D6E0DC;
  --text:#12242F; --muted:#5E7280;
  --led:#38D39F; --amber:#FF8300; --blue:#1E6BB8;
  --sans:"IBM Plex Sans Thai","Segoe UI",system-ui,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,"SF Mono",Consolas,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:96px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
body{margin:0;background:var(--paper);color:var(--text);font-family:var(--sans);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.mono{font-family:var(--mono)}
.wrap{width:min(1240px,92vw);margin-inline:auto}

/* ---------- hero ---------- */
header{background:var(--ink);color:#E7EFEC;padding:38px 0 0;background-image:linear-gradient(180deg,#0B1F2A,#0E2635)}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--led)}
h1{font-size:clamp(28px,4.4vw,50px);line-height:1.12;margin:12px 0 10px;font-weight:700;letter-spacing:-.02em}
h1 em{font-style:normal;color:var(--amber)}
.lede{color:#9FB4BD;max-width:64ch;margin:0 0 24px}
.meta{display:flex;flex-wrap:wrap;gap:10px 26px;padding:0 0 30px;font-family:var(--mono);font-size:12.5px;color:#8DA6B1}
.meta b{color:#E7EFEC;font-weight:500}

/* ---------- signature: switch faceplate nav ---------- */
.faceplate{position:sticky;top:0;z-index:40;background:var(--panel);border-top:1px solid #1F4256;border-bottom:3px solid #071620;
  box-shadow:0 10px 24px -18px rgba(0,0,0,.8)}
.faceplate .wrap{display:flex;align-items:stretch;gap:0;overflow-x:auto;scrollbar-width:none}
.faceplate .wrap::-webkit-scrollbar{display:none}
.plate-label{display:flex;align-items:center;gap:8px;padding-right:20px;margin-right:8px;border-right:1px solid #23485C;
  font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:#6E8F9E;text-transform:uppercase;white-space:nowrap}
.port{display:flex;flex-direction:column;gap:5px;padding:11px 16px 10px;text-decoration:none;color:#9FB4BD;
  border-right:1px solid #1B3B4D;min-width:118px;transition:background .18s,color .18s}
.port:hover{background:#174054;color:#fff}
.port:focus-visible{outline:2px solid var(--led);outline-offset:-2px}
.jack{position:relative;display:block;width:26px;height:17px;border:1.5px solid #4A768A;border-radius:2px;background:#0C2331}
.jack::after{content:"";position:absolute;left:8px;top:-4px;width:9px;height:5px;border:1.5px solid #4A768A;border-bottom:none;border-radius:2px 2px 0 0;background:#0C2331}
.jack i{position:absolute;bottom:2px;width:4px;height:4px;border-radius:50%;background:#28414E}
.jack i:first-child{left:3px}.jack i:last-child{right:3px}
.port.on .jack{border-color:var(--led)}
.port.on .jack::after{border-color:var(--led)}
.port.on .jack i:first-child{background:var(--led);box-shadow:0 0 7px var(--led)}
.port.on .jack i:last-child{background:var(--amber)}
.port.on{color:#fff;background:#174054}
.pnum{font-size:10.5px;letter-spacing:.1em;color:#6E8F9E}
.port.on .pnum{color:var(--led)}
.pname{font-size:13px;white-space:nowrap}

/* ---------- sections ---------- */
section{padding:64px 0 8px}
.sechead{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:6px}
.sechead .mono{font-size:12px;letter-spacing:.14em;color:var(--amber);text-transform:uppercase}
h2{font-size:clamp(21px,2.5vw,30px);margin:0;font-weight:600;letter-spacing:-.01em}
.sub{color:var(--muted);margin:6px 0 22px;max-width:76ch}

.figure{background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.figbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 14px;border-bottom:1px solid var(--line);background:#FAFCFB}
.figbar span{font-family:var(--mono);font-size:11.5px;color:var(--muted);letter-spacing:.06em}
.figtools{display:flex;gap:8px}
button.tool{font-family:var(--mono);font-size:11.5px;letter-spacing:.04em;color:var(--text);background:#fff;border:1px solid var(--line);
  border-radius:5px;padding:5px 11px;cursor:pointer;transition:border-color .15s,color .15s}
button.tool:hover{border-color:var(--blue);color:var(--blue)}
button.tool:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
.figscroll{overflow-x:auto;padding:8px}
.swipe{display:none;font-family:var(--mono);font-size:11px;color:var(--muted);padding:0 14px 10px}
.figscroll svg{display:block;width:100%;height:auto;min-width:900px}
.caption{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin:20px 0 0}
.cap{border-left:3px solid var(--blue);padding:2px 0 2px 14px}
.cap.amber{border-color:var(--amber)}
.cap h4{margin:0 0 4px;font-size:14.5px;font-weight:600}
.cap p{margin:0;font-size:13.5px;color:var(--muted)}

/* ---------- table ---------- */
.tablecard{background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:auto}
table{border-collapse:collapse;width:100%;min-width:640px}
th,td{text-align:left;padding:11px 16px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:top}
th{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);background:#FAFCFB}
tr:last-child td{border-bottom:none}
.vid{color:var(--blue);font-weight:600}
td.note{color:var(--muted);font-size:13px}
.hint{margin-top:12px;font-size:13.5px;color:var(--muted)}
.hint code{font-family:var(--mono);background:#E7EDEB;border-radius:4px;padding:1px 6px;font-size:12.5px}

/* ---------- agenda ---------- */
ol.agenda{list-style:none;margin:0;padding:0;border-left:2px solid var(--line);max-width:760px}
li.ag{position:relative;padding:0 0 24px 26px}
li.ag::before{content:"";position:absolute;left:-7px;top:7px;width:12px;height:12px;border-radius:50%;background:var(--card);border:2px solid var(--blue)}
li.ag-break::before{border-color:var(--line)}
li.ag h4{margin:0;font-size:15.5px;font-weight:600}
li.ag p{margin:3px 0 0;font-size:13.5px;color:var(--muted)}
li.ag .time{display:block;font-size:12px;color:var(--amber);letter-spacing:.06em}
li.ag-break h4{font-weight:400;color:var(--muted)}
li.ag-break .time{color:var(--muted)}

/* ---------- lightbox ---------- */
.lb{position:fixed;inset:0;z-index:90;background:rgba(8,22,30,.94);display:none;flex-direction:column}
.lb.open{display:flex}
.lbbar{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;color:#9FB4BD;font-family:var(--mono);font-size:12px}
.lbbar button{background:transparent;border:1px solid #33566A;color:#D8E4E1;border-radius:5px;padding:5px 12px;margin-left:6px;cursor:pointer;font-family:var(--mono);font-size:12px}
.lbbar button:hover{border-color:var(--led);color:#fff}
.lbstage{flex:1;overflow:hidden;cursor:grab;display:flex;align-items:center;justify-content:center}
.lbstage.drag{cursor:grabbing}
.lbstage>div{transform-origin:center center;will-change:transform}
.lbstage svg{width:min(1600px,96vw);height:auto;background:#fff;border-radius:6px}

footer{margin-top:64px;background:var(--ink);color:#8DA6B1;padding:30px 0;font-size:13.5px}
footer .wrap{display:flex;flex-wrap:wrap;gap:14px 30px;justify-content:space-between;align-items:center}
footer b{color:#E7EFEC;font-weight:500}
footer a{color:#9FB4BD}

@media (max-width:640px){
  .figscroll{padding:4px}
  .swipe{display:block}
  .figbar{flex-wrap:wrap}
  .plate-label{display:none}
  section{padding:44px 0 4px}
}
@media print{
  .faceplate,.figtools,.lb,footer{display:none!important}
  body{background:#fff}
  .figscroll svg{min-width:0}
  section{padding:18px 0;break-inside:avoid}
  header{background:#fff;color:#000}
  .lede,.meta{color:#333}
}`;

const SCRIPT = `(function(){
  // --- faceplate link status: light the port for the section in view ---
  var ports = [].slice.call(document.querySelectorAll('.port'));
  var map = {};
  ports.forEach(function(p){ map[p.dataset.target] = p; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        ports.forEach(function(p){ p.classList.remove('on'); });
        if(map[e.target.id]) map[e.target.id].classList.add('on');
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('main section').forEach(function(s){ io.observe(s); });
  if(ports[0]) ports[0].classList.add('on');

  // --- download the inline diagram as an SVG file ---
  document.querySelectorAll('[data-dl]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var svg = document.getElementById(btn.dataset.dl).cloneNode(true);
      var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\\n' + svg.outerHTML],
        {type:'image/svg+xml;charset=utf-8'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = btn.dataset.name + '.svg';
      a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
    });
  });

  // --- zoom viewer: wheel to zoom, drag to pan ---
  var lb = document.getElementById('lb'), stage = document.getElementById('lbstage'),
      inner = document.getElementById('lbinner'), zlabel = document.getElementById('lbzoom'),
      title = document.getElementById('lbtitle');
  var scale = 1, tx = 0, ty = 0, dragging = false, sx = 0, sy = 0;

  function apply(){
    inner.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    zlabel.textContent = Math.round(scale * 100) + '%';
  }
  var moved = null, anchor = null;
  function open(id, label){
    if(moved) close();
    var svg = document.getElementById(id);
    anchor = document.createComment('slot');       // keep the spot on the page
    svg.parentNode.insertBefore(anchor, svg);
    moved = svg;
    inner.appendChild(svg);                        // move, don't clone: keeps styles + markers
    title.textContent = label;
    scale = 1; tx = 0; ty = 0; apply();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    if(moved && anchor){ anchor.parentNode.replaceChild(moved, anchor); }
    moved = null; anchor = null;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-zoom]').forEach(function(btn){
    btn.addEventListener('click', function(){
      open(btn.dataset.zoom, btn.closest('.figbar').querySelector('span').textContent);
    });
  });
  document.querySelectorAll('.figscroll svg').forEach(function(svg){
    svg.style.cursor = 'zoom-in';
    svg.addEventListener('click', function(){
      open(svg.id, svg.closest('.figure').querySelector('.figbar span').textContent);
    });
  });
  document.querySelectorAll('[data-lb]').forEach(function(b){
    b.addEventListener('click', function(){
      var a = b.dataset.lb;
      if(a === 'in') scale = Math.min(scale * 1.25, 8);
      if(a === 'out') scale = Math.max(scale / 1.25, 0.4);
      if(a === 'reset'){ scale = 1; tx = 0; ty = 0; }
      if(a === 'close'){ close(); return; }
      apply();
    });
  });
  stage.addEventListener('wheel', function(e){
    if(!lb.classList.contains('open')) return;
    e.preventDefault();
    scale = Math.min(Math.max(scale * (e.deltaY < 0 ? 1.12 : 0.89), 0.4), 8);
    apply();
  }, {passive:false});
  stage.addEventListener('pointerdown', function(e){
    dragging = true; sx = e.clientX - tx; sy = e.clientY - ty;
    stage.classList.add('drag'); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', function(e){
    if(!dragging) return;
    tx = e.clientX - sx; ty = e.clientY - sy; apply();
  });
  ['pointerup','pointercancel'].forEach(function(ev){
    stage.addEventListener(ev, function(){ dragging = false; stage.classList.remove('drag'); });
  });
  stage.addEventListener('click', function(e){ if(e.target === stage) close(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && lb.classList.contains('open')) close();
  });
})();`;

const figure = (label, svgId, fileName, svg) => `  <figure class="figure" style="margin:0">
    <div class="figbar">
      <span>${esc(label)}</span>
      <div class="figtools">
        <button class="tool" data-zoom="${svgId}">ขยายเต็มจอ</button>
        <button class="tool" data-dl="${svgId}" data-name="${esc(fileName)}">ดาวน์โหลด SVG</button>
      </div>
    </div>
    <div class="figscroll">${svg}</div>
    <p class="swipe">เลื่อนซ้าย–ขวาเพื่อดูทั้งผัง · แตะที่ผังเพื่อขยาย</p>
  </figure>`;

const captions = (list, vars) => `  <div class="caption">
${list.map((c) => `    <div class="cap${c.accent ? ' amber' : ''}"><h4>${t(c.title, vars)}</h4><p>${t(c.body, vars)}</p></div>`).join('\n')}
  </div>`;

const sechead = (s, vars) => `  <div class="sechead"><span class="mono">${esc(s.num)}</span><h2>${t(s.title, vars)}</h2></div>
  <p class="sub">${t(s.sub, vars)}</p>`;

export function renderPage({ course, event, vars, siblings = [], slides = null }) {
  const s = course.sections;
  const inf = course.infra;
  const order = ['overview', 'lab', 'vlan', 'agenda'];

  const draw = diagramsFor(course);

  const vlanRows = [
    ...course.vlanPlan.map((r) => [r.vid, r.name, r.subnet, r.note]),
    [inf.transitVlan, inf.transitName, inf.transitSubnet, inf.transitNote],
    [inf.serverVlan, inf.serverName, inf.serverSubnet, inf.serverNote],
  ];

  const others = siblings.length
    ? `\n    <div><a href="${esc(vars.rootPath)}events.html">งานอบรมอื่น (${siblings.length + 1})</a></div>`
    : '';

  // Size comes from the file on disk at build time, so the page cannot advertise
  // a stale one; pages comes from the event, which is the only place that knows
  // whether anything was held back from the published copy.
  const deck = slides
    ? `\n    <div><a href="${esc(vars.rootPath)}${esc(slides.file)}" download>ดาวน์โหลดสไลด์อบรม (PDF · ${slides.pages} หน้า · ${slides.mb} MB)</a></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t(course.docTitle, vars)} | ${esc(event.partnerLine)}</title>
<meta name="description" content="${t(course.description, vars)}">${event.unlisted ? `
<meta name="robots" content="noindex, nofollow">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${STYLE}
</style>
</head>
<body>

<header>
  <div class="wrap">
    <p class="eyebrow">Training reference · ${esc(vars.dateShort)}</p>
    <h1>${t(course.title, vars)}<br><em>${t(course.subtitle, vars)}</em></h1>
    <p class="lede">${t(course.lede, vars)}</p>
    <div class="meta">
      <div>หลักสูตร <b>${t(course.courseName, vars)}</b></div>
      <div>จัดโดย <b>${esc(event.organizer)}</b></div>
      <div>ผู้เข้าอบรม <b>${esc(event.attendees)}</b></div>
      <div>สถานที่ <b>${esc(event.venue)}</b></div>
    </div>
  </div>
</header>

<nav class="faceplate" aria-label="สารบัญ">
  <div class="wrap">
    <div class="plate-label">Link status</div>
${order.map((key, i) => `    <a class="port" href="#${key}" data-target="${key}"><span class="jack"><i></i><i></i></span><span class="mono pnum">${String(i + 1).padStart(2, '0')}</span><span class="pname">${esc(s[key].nav)}</span></a>`).join('\n')}
  </div>
</nav>

<main class="wrap">

<section id="overview">
${sechead(s.overview, vars)}
${figure(course.overview.figLabel, 'svg-overview', course.overview.fileName, draw.overview(course, vars))}
${captions(course.overview.captions, vars)}
</section>

<section id="lab">
${sechead(s.lab, vars)}
${figure(course.lab.figLabel, 'svg-lab', course.lab.fileName, draw.lab(course, vars, event.podsDrawn))}
${captions(course.lab.captions, vars)}
</section>

<section id="vlan">
${sechead(s.vlan, vars)}
  <div class="tablecard">
    <table>
      <thead><tr><th>VLAN</th><th>ชื่อ / การใช้งาน</th><th>Subnet</th><th>หมายเหตุ</th></tr></thead>
      <tbody>
${vlanRows.map(([vid, name, subnet, note]) => `<tr><td class="mono vid">${esc(vid)}</td><td>${t(name, vars)}</td><td class="mono">${esc(subnet)}</td><td class="note">${t(note, vars)}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>
  <p class="hint">${inlineCode(course.vlanHint, vars)}</p>
</section>

<section id="agenda">
${sechead(s.agenda, vars)}
  <ol class="agenda">
${course.agenda.map((a) => `<li class="ag${a.break ? ' ag-break' : ''}"><span class="mono time">${esc(a.time)}</span><div><h4>${t(a.title, vars)}</h4>${a.detail ? `<p>${t(a.detail, vars)}</p>` : ''}</div></li>`).join('\n')}
  </ol>
</section>

</main>

<footer>
  <div class="wrap">
    <div>${t(course.title, vars)} · <b>${esc(event.partnerLine)}</b> · ${esc(vars.dateShort)}</div>
    <div>กด <b>Ctrl/Cmd + P</b> เพื่อพิมพ์หรือบันทึกเป็น PDF</div>${deck}${others}
  </div>
</footer>

<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="ดูแผนผังแบบเต็มจอ">
  <div class="lbbar">
    <span id="lbtitle" class="mono"></span>
    <div>
      <span class="mono" id="lbzoom">100%</span>
      <button data-lb="out">−</button>
      <button data-lb="in">+</button>
      <button data-lb="reset">รีเซ็ต</button>
      <button data-lb="close">ปิด (Esc)</button>
    </div>
  </div>
  <div class="lbstage" id="lbstage"><div id="lbinner"></div></div>
</div>

<script>
${SCRIPT}
</script>
</body>
</html>
`;
}

/** Simple listing page, emitted only when more than one event exists. */
export function renderIndex(entries) {
  const rows = entries.map((e) => `      <tr>
        <td class="mono">${esc(e.vars.dateShort)}</td>
        <td><a href="${esc(e.slug)}/">${esc(e.course.title)}</a></td>
        <td>${esc(e.event.partnerLine)}</td>
        <td class="note">${esc(e.event.venue)}</td>
      </tr>`).join('\n');

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>งานอบรมทั้งหมด</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${STYLE}
main{padding:48px 0}
</style>
</head>
<body>
<header><div class="wrap"><p class="eyebrow">Training reference</p><h1>งานอบรมทั้งหมด</h1><p class="lede">รวมแผนผังและเอกสารอ้างอิงของทุกรุ่นที่จัดไปแล้วและกำลังจะจัด</p></div></header>
<main class="wrap">
  <div class="tablecard">
    <table>
      <thead><tr><th>วันที่</th><th>หลักสูตร</th><th>ลูกค้า</th><th>สถานที่</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>
</main>
<footer><div class="wrap"><div>สร้างจาก <b>src/events/*.json</b> · แก้ข้อมูลแล้ว push ได้เลย</div></div></footer>
</body>
</html>
`;
}
