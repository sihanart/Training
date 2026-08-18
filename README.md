# Aruba Campus Network Training — Network Diagram

แผนผังและเอกสารอ้างอิงสำหรับอบรม **Aruba Campus Network Training**
RMUTT × Commserv Siam · 26 สิงหาคม 2569 · Royal Hills Golf Resort & Spa

## ไฟล์ในโปรเจกต์

| ไฟล์ | คำอธิบาย |
|---|---|
| `index.html` | เว็บไซต์ไฟล์เดียว (ฝัง SVG ทั้งสองผังไว้ในตัว) — เปิดดูได้เลย ไม่ต้องติดตั้งอะไร |
| `diagrams/01_Overview_Campus_Architecture.svg` | ภาพรวมสถาปัตยกรรม Campus: Switch + Controller + AP และเส้นทางเดินของ traffic |
| `diagrams/02_Lab_Topology.svg` | ผัง Lab แบ่งตาม Pod ครอบคลุมหัวข้อ Module 1 และ Module 2 |
| `diagrams/*.png` | ไฟล์ PNG ความละเอียด 2x สำหรับแปะสไลด์ |

## เปิดดูในเครื่อง

เปิด `index.html` ด้วยเบราว์เซอร์ได้ทันที

## เผยแพร่ด้วย GitHub Pages

1. Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `main` / `(root)` → Save
4. รอสักครู่ จะได้ลิงก์ `https://sihanart.github.io/Training/`

## เนื้อหาในเว็บ

- ผังทั้งสองใบ กดเพื่อขยายเต็มจอ (ล้อเมาส์ซูม ลากเลื่อน Esc ปิด) และดาวน์โหลด SVG ได้
- ตารางแผน VLAN / IP ต่อ Pod
- กำหนดการอบรมวันที่ 26 ส.ค. 2569

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
