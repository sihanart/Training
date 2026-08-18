# Aruba Campus Network Training — Network Diagram

แผนผังและเอกสารอ้างอิงสำหรับอบรม **Aruba Campus Network Training**

เว็บไซต์: **https://sihanart.github.io/Training/**

หน้าเว็บทั้งหมด **generate จากไฟล์ JSON** ไม่ได้เขียน HTML มือ — แก้ข้อมูลแล้ว push ระบบจะ build ขึ้นเว็บให้เอง

## เพิ่มงานอบรมใหม่ (ลูกค้าใหม่)

สร้างไฟล์เดียวใน `src/events/` แล้ว push จบ:

```bash
cp src/events/2026-08-26-rmutt.json src/events/2026-11-10-xyz.json
```

แก้ข้อมูลในไฟล์ใหม่:

```json
{
  "slug": "xyz-2026-11",
  "course": "campus-network",
  "date": "2026-11-10",
  "organizer": "Commserv Siam",
  "customer": "XYZ",
  "attendees": "ฝ่าย IT บริษัท XYZ",
  "partnerLine": "XYZ × Commserv Siam",
  "venue": "สำนักงานใหญ่ XYZ",
  "podsDrawn": 4
}
```

| ฟิลด์ | ความหมาย |
|---|---|
| `slug` | ชื่อโฟลเดอร์ URL — ห้ามซ้ำกับงานอื่น |
| `course` | อ้างถึง `id` ในไฟล์ `src/courses/*.json` |
| `date` | **ค.ศ. เสมอ** รูปแบบ `YYYY-MM-DD` — วัน/เดือน/ปี พ.ศ. ไทยคำนวณให้อัตโนมัติ |
| `podsDrawn` | จำนวน Pod ที่วาดในผัง (1–8) — ผัง Lab ปรับขนาดเอง |

`podsDrawn` คือหัวใจ: เปลี่ยนจาก 2 เป็น 4 แล้วผัง Lab จะวาด Pod เพิ่ม พร้อม VLAN, ชื่อ SSID, สาย uplink ขึ้น Core และขยายผืนผ้าใบให้เองทั้งหมด

## แก้หลักสูตร

`src/courses/campus-network.json` — โมดูล, ตาราง VLAN, กำหนดการ, ข้อความในผังทั้งสองใบ, สเปกอุปกรณ์ต่อ Pod
แก้ที่นี่ที่เดียว มีผลกับ **ทุกงาน** ที่อ้างหลักสูตรนี้

ข้อความรองรับตัวแปร `{{...}}` เช่น `{{gateway}}`, `{{mc}}`, `{{podSize}}`, `{{dateLong}}` — ถ้าพิมพ์ชื่อตัวแปรผิด build จะ fail ทันที ไม่ปล่อยให้ขึ้นเว็บแบบข้อความเพี้ยน

## Build

```bash
node build.mjs
```

ไม่ต้อง `npm install` — ใช้ Node เปล่า ๆ ไม่มี dependency สักตัว (ต้องการ Node 18+)

| คำสั่ง | ผล |
|---|---|
| `node build.mjs` | เขียนไฟล์เว็บ |
| `node build.mjs --check` | ตรวจว่าไฟล์บนดิสก์ตรงกับ source หรือยัง (ใช้ใน CI) |

### ไฟล์ที่ถูก generate — อย่าแก้มือ

`index.html` · `<slug>/index.html` · `events.html` · `diagrams/*.svg`

แก้ไปก็โดน build ทับ ให้ไปแก้ที่ `src/` แทน

## Deploy

push เข้า `main` → GitHub Actions build แล้ว commit ผลลัพธ์กลับมาให้ → GitHub Pages เสิร์ฟจาก branch root

Pages ตั้งเป็น **Deploy from a branch · main · /(root)** เว็บที่เผยแพร่จึงเป็นไฟล์จริงใน git ถ้า workflow พัง เว็บเดิมยังอยู่ ไม่ดับ

## โครงสร้าง

```
src/
  courses/campus-network.json   หลักสูตร — ใช้ซ้ำได้ทุกลูกค้า
  events/*.json                 งานอบรมแต่ละครั้ง
  lib/
    util.mjs                    escape, วันที่ไทย, ตัวแปร {{...}}
    page.mjs                    โครงหน้า HTML + CSS + สคริปต์ซูม
    svg-overview.mjs            ผัง FIG.01 (เลย์เอาต์คงที่)
    svg-lab.mjs                 ผัง FIG.02 (ปรับตามจำนวน Pod)
build.mjs                       ตัว build
```

## เนื้อหาในเว็บ

- ผังทั้งสองใบ กดเพื่อขยายเต็มจอ (ล้อเมาส์ซูม ลากเลื่อน Esc ปิด) และดาวน์โหลด SVG ได้
- ตารางแผน VLAN / IP ต่อ Pod
- กำหนดการอบรม

## แผน VLAN โดยย่อ (n = หมายเลข Pod)

| VLAN | การใช้งาน | Subnet |
|---|---|---|
| n1 | MGMT (Switch / AP) | 10.n.1.0/24 |
| n2 | Wired Users — 802.1X | 10.n.2.0/24 |
| n3 | WLAN Employee — 802.1X | 10.n.3.0/24 |
| n4 | WLAN Guest — Captive portal | 10.n.4.0/24 |
| n5 | WLAN IoT — PSK + MAC Auth | 10.n.5.0/24 |
| 100 | Transit / Internet uplink | 192.168.100.0/24 |
| 200 | Servers (MC / ClearPass / DHCP) | 192.168.200.0/24 |

ตัวอย่าง: Pod 1 ใช้ VLAN 11–15 กับ 10.1.x.0/24 · Pod 2 ใช้ VLAN 21–25 กับ 10.2.x.0/24

> ตารางนี้เป็นสำเนาไว้อ่านเร็ว — ตัวจริงอยู่ใน `src/courses/campus-network.json`

## PNG สำหรับสไลด์

`diagrams/*.png` (ความละเอียด 2x) **export อัตโนมัติใน GitHub Actions** ทุกครั้งที่ผังเปลี่ยน — แก้ `podsDrawn` แล้ว push ได้ PNG ใหม่กลับมาเอง ไม่ต้องแปลงมือ

ใช้ Chromium render เพราะผังถูกออกแบบมาสำหรับเบราว์เซอร์ — CSS cascade และการจัดวางตัวอักษรไทยตรงกับหน้าเว็บจริง PNG จึงไม่มีทางเพี้ยนไปจากที่เห็นบนเว็บ

รันเองในเครื่องก็ได้ (ไม่จำเป็น — CI ทำให้แล้ว):

```bash
npm install && npx playwright install chromium && npm run png
```

> `node build.mjs` **ไม่ต้องใช้ dependency ใด ๆ** Playwright จำเป็นเฉพาะตอน export PNG เท่านั้น จึงไม่ commit `node_modules/` และ lockfile ลง repo
