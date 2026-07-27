# Personal Book Library

ระบบจัดการคลังหนังสือส่วนตัว (Full Stack SPA)  
Frontend: React + Vite · Backend: Node.js + Express · Auth: JWT

## โครงสร้าง

```
personal-book-library/
├── backend/          # Node.js + Express + SQLite
├── frontend/         # React + Vite
├── uploads/          # ไฟล์อัปโหลด
├── api-collection/   # Bruno (.bru) ชุดทดสอบ API endpoint
├── data_dictionary.md
├── usecase.md
└── api_design.md
```

## ความต้องการของระบบ

- Node.js (แนะนำ v18 ขึ้นไป)
- npm

## ติดตั้ง Dependency

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## ตั้งค่า Environment Variable (สำคัญ)

ไฟล์ `.env` **ไม่ถูก commit ขึ้น GitHub** (อยู่ใน `.gitignore`)  
ดังนั้นคนที่ clone โปรเจกต์มาต้องสร้างเองทุกครั้งก่อนรัน Backend

### ขั้นตอนตั้งค่า Backend

1. เข้าโฟลเดอร์ backend
2. คัดลอกไฟล์ตัวอย่างเป็น `.env`
3. เปิด `.env` แล้วตรวจ/แก้ค่าตามตารางด้านล่าง

**Windows (PowerShell / CMD):**

```bash
cd backend
copy .env.example .env
```

**macOS / Linux:**

```bash
cd backend
cp .env.example .env
```

### ตัวอย่างเนื้อหา `backend/.env`

```env
PORT=3000
JWT_SECRET=change-me
JWT_EXPIRES_IN=1h
UPLOADS_PATH=../uploads
DB_PATH=./data/library.db
```

### อธิบายแต่ละตัวแปร

| ตัวแปร | ต้องตั้งไหม | ความหมาย | ค่าที่แนะนำตอนทดสอบ |
|--------|-------------|----------|----------------------|
| `PORT` | แนะนำ | พอร์ตที่ Backend เปิดรอ | `3000` |
| `JWT_SECRET` | **จำเป็น** | รหัสลับใช้เซ็นและตรวจ JWT — ต้องตรงกันตอน login และตอนตรวจ token | ทดสอบใช้ `change-me` ได้ บนของจริงควรเปลี่ยนเป็นข้อความยาวๆ ยากเดา |
| `JWT_EXPIRES_IN` | ไม่บังคับ | อายุของ token หลัง login | `1h` = 1 ชั่วโมง |
| `DB_PATH` | ไม่บังคับ | ที่อยู่ไฟล์ฐานข้อมูล SQLite (สัมพัทธ์จากโฟลเดอร์ `backend/`) | `./data/library.db` → ได้ไฟล์ที่ `backend/data/library.db` |
| `UPLOADS_PATH` | ไม่บังคับ | path โฟลเดอร์อัปโหลด | `../uploads` |

### สิ่งที่เกิดขึ้นหลังรัน Backend

ถ้ายังไม่มีไฟล์ database ระบบจะสร้างให้อัตโนมัติที่ `backend/data/library.db`  
พร้อมตาราง `users` และบัญชีทดสอบ (`admin`, `spk1`, `spk2`)

### Frontend (ถ้าต้องการเปลี่ยน URL ของ API)

ค่าเริ่มต้น Frontend เรียก `http://localhost:3000` อยู่แล้ว  
ถ้า Backend อยู่คนละที่ ให้สร้างไฟล์ `frontend/.env` เช่น:

```env
VITE_API_URL=http://localhost:3000
```

จากนั้นรัน `npm run dev` ใหม่ในโฟลเดอร์ `frontend`

## วิธีรัน

เปิด 2 terminal

### 1) Backend

```bash
cd backend
npm run dev
```

หรือ:

```bash
cd backend
npm start
```

เมื่อพร้อมจะเห็นข้อความประมาณ:

```text
Book library server is up and ready to roll
http://localhost:3000
```

### 2) Frontend

```bash
cd frontend
npm run dev
```

เปิดเบราว์เซอร์ตาม URL ที่ Vite แสดง (ปกติ `http://localhost:5173`)

## บัญชีทดสอบ Login

| username | password | role |
|----------|----------|------|
| `admin` | `password123` | admin |
| `spk1` | `password123` | user |
| `spk2` | `password123` | user |

ใช้บัญชีใดบัญชีหนึ่งบนหน้า Login เพื่อทดสอบระบบยืนยันตัวตน

## ทดสอบ API (Bruno)

ชุด request สำหรับกรรมการอยู่ที่ [`api-collection/`](api-collection/)

1. ติดตั้ง [Bruno](https://www.usebruno.com/)
2. Open Collection → เลือกโฟลเดอร์ `api-collection/`
3. เลือก environment **Local**
4. รัน Backend ก่อน แล้วเริ่มจาก **Auth → Login (admin)**

รายละเอียดและลำดับทดสอบ: [api-collection/README.md](api-collection/README.md)
