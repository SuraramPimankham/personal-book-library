# Personal Book Library

ระบบจัดการคลังหนังสือส่วนตัว (Full Stack) — กำลังพัฒนาตามโจทย์

## โครงสร้าง

```
personal-book-library/
├── backend/          # Node.js + Express
├── frontend/         # React + Vite
├── uploads/          # ไฟล์อัปโหลด
├── api-collection/   # Bruno (.bru) ชุดทดสอบ API endpoint
├── data_dictionary.md
└── usecase.md
```

## Frontend — สร้างและรัน

### สร้าง (React + Vite)

จาก root ของโปรเจกต์ (`personal-book-library/`):

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### รัน

```bash
cd frontend
npm run dev
```

เปิดเบราว์เซอร์ตาม URL ที่ Vite แสดง (ปกติ `http://localhost:5173`)

### คำสั่งอื่นๆ

```bash
cd frontend
npm run build    # build สำหรับ production
npm run preview  # ดูผล build
```

## Backend — สร้างและรัน

### สร้าง (Express โครงเปล่า)

จาก root ของโปรเจกต์:

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
```

ตั้ง `"type": "module"` ใน `package.json` แล้วสร้างไฟล์ `src/index.js` (Express + CORS เปล่า)

คัดลอก env:

```bash
copy .env.example .env
```

### รัน

```bash
cd backend
npm run dev
```

หรือ:

```bash
cd backend
npm start
```

เซิร์ฟเวอร์ปกติอยู่ที่ `http://localhost:3000`  
เมื่อพร้อมจะเห็นข้อความประมาณ `Book library server is up and ready to roll`
