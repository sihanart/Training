# Aruba Campus Network Training — Network Diagram

แผนผังและเอกสารอ้างอิงสำหรับอบรม **Aruba Campus Network Training**
RMUTT × Commserv Siam · 26 สิงหาคม 2569 · Royal Hills Golf Resort & Spa

เว็บไซต์: **https://sihanart.github.io/Training/**

> ### ⚠️ อย่าแก้ `index.html`, `diagrams/*.svg` หรือ `configs/*.txt` โดยตรง
>
> ไฟล์พวกนี้ **ถูก generate ทั้งหมด** — `node build.mjs` เขียนทับทุกครั้ง และ CI ก็รันให้ทุกครั้งที่ push
> แก้แล้วจะหายเงียบ ๆ ตอน build รอบถัดไป
>
> แก้ที่ `src/` แทน แล้ว push — ระบบ build ขึ้นเว็บให้เอง

## ไฟล์ในโปรเจกต์

| ไฟล์ | คำอธิบาย | แก้ที่ไหน |
|---|---|---|
| `index.html` | เว็บไซต์ไฟล์เดียว (ฝัง SVG ทั้งสองผังไว้ในตัว) | `src/` |
| `diagrams/01_Overview_Campus_Architecture.svg` | ภาพรวมสถาปัตยกรรม Campus: Switch + Controller + AP และเส้นทางเดินของ traffic | `src/courses/*.json` + `src/lib/svg-overview.mjs` |
| `diagrams/02_Lab_Topology.svg` | ผัง Lab: ชุดนักศึกษา + ชุดผู้สอน พร้อมตารางแจก Controller / AP VLAN | `src/courses/*.json` + `src/lib/svg-lab.mjs` |
| `diagrams/*.png` | PNG ความละเอียด 2x สำหรับแปะสไลด์ (CI export ให้) | — |
| `configs/POD1.txt` … `POD7.txt`, `TEACHER.txt` | Golden config ของ Controller VM แต่ละชุด | `src/events/*.json` (บล็อก `lab`) |
| `configs/SWITCH.txt` | Golden config ของสวิตช์กลาง CX 6100 (ผู้สอนวาง) | `src/events/*.json` (บล็อก `lab`) |
| `slides/rmutt-2026-08.pdf` | สไลด์อบรมให้ดาวน์โหลดจากหน้าเว็บ | วางไฟล์เอง |

## Build

```bash
node build.mjs
```

ไม่ต้อง `npm install` — ใช้ Node เปล่า ๆ (ต้องการ Node 18+) · `node build.mjs --check` ตรวจว่าไฟล์บนดิสก์ตรงกับ `src/` หรือยัง (CI ใช้ตัวนี้ และมันจะจับได้ถ้ามีใครไปแก้ไฟล์ generated มือ)

## เพิ่มงานอบรมใหม่ (ลูกค้าใหม่)

สร้างไฟล์เดียวใน `src/events/` แล้ว push จบ

| ฟิลด์ | ความหมาย |
|---|---|
| `slug` | ชื่อโฟลเดอร์ URL — ห้ามซ้ำกับงานอื่น |
| `course` | อ้างถึง `id` ในไฟล์ `src/courses/*.json` |
| `date` | **ค.ศ. เสมอ** รูปแบบ `YYYY-MM-DD` — วัน/เดือน/ปี พ.ศ. ไทยคำนวณให้อัตโนมัติ |
| `podsDrawn` | จำนวน Pod (1–8) |
| `lab` | อุปกรณ์จริงของงานนั้น — ดูหัวข้อถัดไป |
| `slides` | _(ไม่ใส่ก็ได้)_ `{ "file": "slides/xxx.pdf", "pages": 132 }` — ได้ลิงก์ดาวน์โหลดที่ footer ขนาดไฟล์อ่านจากดิสก์ตอน build ชี้ไปไฟล์ที่ไม่มีอยู่ build จะ fail |
| `unlisted` / `draft` | ไม่ลิงก์จากหน้าไหน / ไม่ build เลย |

## อุปกรณ์ที่ใช้

| ชั้น | อุปกรณ์ | ใครแตะ |
|---|---|---|
| Virtual (บน HCI Server) | Controller VM ชุดละตัว + PNETLAB switch simulator คนละตัว | **นักศึกษา** |
| หัวสาย RAP | Aruba 9004-LTE — จบ IPsec ของ AP-515 | ผู้สอน |
| ทางผ่าน | AP-515 (Remote AP) ตัวเดียวใช้ร่วม → Aruba CX 6100 12 พอร์ต | ผู้สอน |
| ปลายทาง | Campus AP ชุดละ 1 ตัว เสียบ CX 6100 พอร์ตของชุดนั้น | นักศึกษา (onboard) |

Module 1 (สวิตช์) ฝึกบน **PNETLAB** ไม่ใช่สวิตช์จริง เพราะ CX 6100 เป็นทางผ่านของทุกชุด

## การจัด Controller / VLAN ต่อชุด

Mobility Controller: **VM บน HCI Server (ArubaOS 8.7.1.2)** — 1 ตัวต่อ 1 ชุด

| ชุด | Controller MGMT | AP VLAN | Subnet (DHCP บน controller) |
|---|---|---|---|
| POD 1 | 192.168.10.221 | 2601 | 10.26.1.0/24 |
| POD 2 | 192.168.10.222 | 2602 | 10.26.2.0/24 |
| POD 3 | 192.168.10.223 | 2603 | 10.26.3.0/24 |
| POD 4 | 192.168.10.224 | 2604 | 10.26.4.0/24 |
| POD 5 | 192.168.10.225 | 2605 | 10.26.5.0/24 |
| POD 6 | 192.168.10.226 | 2606 | 10.26.6.0/24 |
| POD 7 | 192.168.10.227 | 2607 | 10.26.7.0/24 |
| ผู้สอน | 192.168.10.133 | 2608 | 10.26.8.0/24 |

Management network ของทุก controller: `192.168.10.0/24`
แต่ละ controller ทำหน้าที่เป็น DHCP server ของ AP VLAN ตัวเอง (gateway `10.26.n.1`, แจก `.11–.240`,
exclude `.1–.10` และ `.241–.254`, lease 8 ชม.) และทำ `ip nat inside` บน `interface vlan 260n`

**ตารางนี้เป็นสำเนาไว้อ่านเร็ว** — ตัวจริงอยู่ในบล็อก `lab` ของ `src/events/2026-08-26-rmutt.json`:

```json
"lab": {
  "controller": "Mobility Controller (VM)",
  "controllerOs": "ArubaOS 8.7.1.2",
  "host": "HCI Server",
  "rapHead": "Aruba 9004-LTE",
  "rap": "AP-515",
  "switch": "Aruba CX 6100",
  "switchPorts": 12,
  "switchUplink": "1/1/12",
  "simulator": "PNETLAB",
  "mgmtNet": "192.168.10.0/24",
  "dns": "8.8.8.8 1.1.1.1",
  "domain": "lab.local",
  "leaseHours": 8, "poolFrom": 11, "poolTo": 240,
  "pods": [
    { "label": "POD 1", "mgmt": "192.168.10.221", "vlan": 2601,
      "subnet": "10.26.1.0/24", "port": "1/1/1" },
    { "label": "TEACHER", "mgmt": "192.168.10.133", "vlan": 2608,
      "subnet": "10.26.8.0/24", "port": "1/1/8", "role": "teacher" }
  ]
}
```

แก้ตรงนี้ที่เดียวแล้ว build — **ตารางในผัง Lab, หัวข้อ Golden config บนเว็บ, `configs/POD*.txt` และ `configs/SWITCH.txt` เปลี่ยนตามพร้อมกัน**
เขียนแยกกันเมื่อไหร่มันจะเพี้ยนกันเอง แล้วชุดที่วาง config ตามเอกสารผิดตัวจะเสียเวลาไล่หาสิ่งที่ไม่ใช่บทเรียน

`subnet` ต้องเป็น `/24` (build fail ถ้าไม่ใช่) · gateway, ช่วง exclude, ชื่อ DHCP pool คำนวณจาก `subnet` ให้เอง
`port` คือพอร์ตบนสวิตช์กลางที่ Campus AP ของชุดนั้นเสียบอยู่ — `configs/SWITCH.txt` สร้างจากคอลัมน์นี้

## เผยแพร่

push เข้า `main` → GitHub Actions build แล้ว commit ผลลัพธ์กลับมา → GitHub Pages เสิร์ฟจาก branch root

Pages ตั้งเป็น **Deploy from a branch · main · /(root)** เว็บที่เผยแพร่จึงเป็นไฟล์จริงใน git ถ้า workflow พัง เว็บเดิมยังอยู่ ไม่ดับ

## เนื้อหาในเว็บ

- ผังทั้งสองใบ กดเพื่อขยายเต็มจอ (ล้อเมาส์ซูม ลากเลื่อน Esc ปิด) และดาวน์โหลด SVG ได้
- ตารางแผน VLAN / IP
- Golden config รายชุด — เลือกแท็บชุดตัวเอง กดคัดลอก วางลง CLI ได้เลย
- Lab ทีละขั้น — บอกด้วยว่าแต่ละ Lab ทำที่เครื่องไหน (PNETLAB / Controller VM)
- กำหนดการอบรม และลิงก์ดาวน์โหลดสไลด์ PDF

## โครงสร้าง

```
src/
  courses/campus-network.json   หลักสูตร — ข้อความทั้งหมดในผังและในหน้าเว็บ
  events/*.json                 งานอบรมแต่ละครั้ง + อุปกรณ์จริง (บล็อก lab)
  lib/
    util.mjs                    escape, วันที่ไทย, ตัวแปร {{...}}
    lab-config.mjs              ตาราง Pod » CLI (ที่มาเดียวของผัง เว็บ และ configs/)
    page.mjs                    โครงหน้า HTML + CSS + สคริปต์
    svg-overview.mjs            ผัง FIG.01
    svg-lab.mjs                 ผัง FIG.02
build.mjs                       ตัว build
tools/check-layout.mjs          จับกล่องทับกัน/หลุดขอบในผัง
```

ข้อความรองรับตัวแปร `{{...}}` เช่น `{{controller}}`, `{{mgmtNet}}`, `{{studentPods}}`, `{{dateLong}}` — พิมพ์ชื่อผิด build จะ fail ทันที ไม่ปล่อยข้อความเพี้ยนขึ้นเว็บ
