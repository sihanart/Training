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

## เปลี่ยนจำนวน Pod

แก้ `podsDrawn` ในไฟล์ event แล้ว push — แค่นั้น

```bash
sed -i 's/"podsDrawn": 2/"podsDrawn": 4/' src/events/2026-08-26-rmutt.json
git commit -am "RMUTT: 4 pods" && git push
```

ประมาณ 2 นาทีให้หลัง หน้าเว็บ · SVG · PNG อัปเดตครบทุกไฟล์

### สิ่งที่ปรับให้อัตโนมัติ

| | เปลี่ยนตามยังไง |
|---|---|
| กล่อง Pod | วาดครบตามจำนวน อุปกรณ์ในแต่ละ Pod เหมือนกันทุกชุด |
| VLAN ของ wired client | Pod n ได้ VLAN `n2` — 12, 22, 32, 42 ... |
| ชื่อ SSID | `PODn-EMP` / `PODn-GUEST` / `PODn-IOT` |
| สาย uplink | 2 เส้นต่อ Pod กระจายลงขอบล่างกล่อง Core เท่า ๆ กัน |
| กล่อง "POD n ... POD n" | เลขเริ่มต้นเลื่อนเอง (4 Pod » "POD 5 ... POD n") |
| ผืนผ้าใบ | ขยายตามจำนวน Pod |

ตาราง VLAN, ชื่ออุปกรณ์, ข้อความในกล่องหมายเหตุ ไม่ต้องแตะ — มาจากไฟล์หลักสูตรอยู่แล้ว

### ขนาดที่ได้

| Pod | SVG | PNG (2x) |
|---|---|---|
| 1 | 1440×1130 | 2880×2260 |
| 2 | 1440×1130 | 2880×2260 |
| 3 | 1900×1130 | 3800×2260 |
| 4 | 2360×1130 | 4720×2260 |
| 5 | 2820×1130 | 5640×2260 |
| 6 | 3280×1130 | 6560×2260 |
| 7 | 3740×1130 | 7480×2260 |
| 8 | 4200×1130 | 8400×2260 |

**รับได้ 1–8 Pod** ใส่นอกช่วงนี้ build จะ fail ทันทีพร้อมบอกเหตุผล ไม่ปล่อยผังพัง ๆ ขึ้นเว็บ

เกิน 6 Pod ผังจะกว้างมากจนแปะสไลด์แผ่นเดียวอ่านไม่ออก — แนะนำให้พิมพ์แยกหรือใช้ปุ่ม "ขยายเต็มจอ" บนเว็บระหว่างสอนแทน

### รายละเอียดเล็กน้อย

- **1 กับ 2 Pod ได้ผืนผ้าใบเท่ากัน** เพราะ 1 Pod ถ้าย่อตามจริงกล่อง Core จะแคบจนใส่ข้อความไม่ลง เลยตรึงขนาดขั้นต่ำไว้ — 1 Pod จึงมีที่ว่างเหลือด้านขวา ไม่ใช่บั๊ก
- **ตั้งแต่ 3 Pod ขึ้นไป** กล่อง Core กับตาราง VLAN ด้านล่างจะหยุดขยายที่ความกว้างสูงสุดของตัวเอง แล้วจัดกึ่งกลางแทน ถ้าปล่อยให้ยืดเต็มผืนผ้าใบจะกลายเป็นกล่องโล่งที่มีข้อความกระจุกอยู่มุมเดียว

## หลักสูตรที่มี

| `course` | หลักสูตร | ชุดผัง |
|---|---|---|
| `campus-network` | Aruba Campus Network (Switch + Controller + AP) | `campus` |
| `central-wireless` | HPE Aruba Networking Central (New CNX) — Wireless | `cloud` |

ผังสองชุดวาดคนละแบบเพราะสถาปัตยกรรมต่างกันจริง — `campus` มี Mobility Controller ที่ไซต์และ traffic วิ่งใน GRE tunnel ส่วน `cloud` ให้ Central ดูแลเฉพาะ config/auth แล้ว AP bridge traffic ลง VLAN ที่ไซต์เลย ฟิลด์ `diagramSet` ในไฟล์หลักสูตรเป็นตัวเลือกว่าใช้ชุดไหน

### แบบร่าง (ยังไม่ขึ้นเว็บ)

ใส่ `"draft": true` ในไฟล์ event แล้ว build จะข้ามไป — ใช้เตรียมหลักสูตรไว้ล่วงหน้าโดยที่ยังไม่รู้ลูกค้าหรือวันที่จริง ข้อมูล placeholder จะได้ไม่หลุดขึ้นเว็บสาธารณะ

พอได้งานจริง: แก้ `customer` / `attendees` / `partnerLine` / `venue` / `date` / `slug` แล้วลบบรรทัด `draft` ออก

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
