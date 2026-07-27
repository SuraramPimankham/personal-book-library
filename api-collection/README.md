# API Collection (Bruno)

ชุดทดสอบ API สำหรับกรรมการ — ใช้ [Bruno](https://www.usebruno.com/)

## วิธีเปิด

1. ติดตั้ง Bruno (Desktop หรือ CLI)
2. **Open Collection** → เลือกโฟลเดอร์ `api-collection/` นี้
3. เลือก environment **Local** (มุมขวาบน)
4. รัน Backend ก่อน: `cd backend && npm run dev` → `http://localhost:3000`

## ลำดับทดสอบแนะนำ

1. **Auth → Login (admin)** หรือ **Login (spk1)** — เก็บ JWT อัตโนมัติ
2. **Books → GET Books** — ดูรายการ + เก็บ `bookId`
3. **Books → POST Book** — เพิ่มหนังสือ
4. **Books → DELETE Book** — ลบตาม `bookId`
5. **Users → GET Users (admin)** — ทดสอบ admin only

## Endpoint ที่ครอบคลุม

| โฟลเดอร์ | Request | หมายเหตุ |
|----------|---------|----------|
| auth | Login admin / spk1 / spk2 | 200 + token |
| auth | Login invalid | 401 |
| books | GET Books | Bearer JWT |
| books | GET Books (no token) | 401 |
| books | POST Book | 201 |
| books | POST Book (admin assign owner) | admin + user_owner |
| books | DELETE Book | 200 / 404 |
| users | GET Users (admin) | 200 |
| users | GET Users (spk1 forbidden) | 403 |

## ตัวแปร environment (Local)

| ตัวแปร | ค่าเริ่มต้น |
|--------|-------------|
| `baseUrl` | `http://localhost:3000` |
| `token` | ตั้งอัตโนมัติหลัง login |
| `adminToken` / `spk1Token` / `spk2Token` | ตั้งอัตโนมัติหลัง login |
| `bookId` | ตั้งจาก GET/POST books |

## CLI (ถ้ามี @usebruno/cli)

```bash
npm install -g @usebruno/cli
cd api-collection
bru run --env Local
```
