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

## ตั้งค่า Environment Variable

ในโฟลเดอร์ `backend/` คัดลอกไฟล์ตัวอย่างแล้วแก้ค่าตามต้องการ:

```bash
cd backend
copy .env.example .env
```

(บน macOS/Linux ใช้ `cp .env.example .env`)

ตัวแปรที่จำเป็นใน `backend/.env`:

| ตัวแปร | ความหมาย | ตัวอย่าง |
|--------|----------|----------|
| `PORT` | พอร์ต Backend | `3000` |
| `JWT_SECRET` | รหัสลับสำหรับเซ็น/ตรวจ JWT | `change-me` |
| `JWT_EXPIRES_IN` | อายุ token | `1h` |
| `DB_PATH` | path ไฟล์ SQLite | `./data/library.db` |
| `UPLOADS_PATH` | โฟลเดอร์อัปโหลด | `../uploads` |

หมายเหตุ: Frontend เรียก API ที่ `http://localhost:3000` เป็นค่าเริ่มต้น  
ถ้าต้องการเปลี่ยน ตั้ง `VITE_API_URL` ตอนรัน/สร้าง frontend ได้

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
| `alice` | `password123` | user |

ใช้บัญชีใดบัญชีหนึ่งบนหน้า Login เพื่อทดสอบระบบยืนยันตัวตน
