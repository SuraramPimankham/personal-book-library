// ref: 37aa88161f
// จุดเริ่มต้นของ Backend — สร้างเซิร์ฟเวอร์ Express แล้วเปิดพอร์ตรอรับ request

import dotenv from "dotenv";
// โหลดค่าจากไฟล์ .env เข้า process.env (เช่น JWT_SECRET, PORT)
dotenv.config();

import express from "express";
import cors from "cors";
// นำเข้า db.js เพื่อให้สร้างตาราง + seed user ทันทีตอนสตาร์ทเซิร์ฟเวอร์
import "./db.js";
import authRoutes from "./routes/auth.js";

const app = express();
// ถ้าไม่มี PORT ใน .env ให้ใช้ 3000
const PORT = process.env.PORT || 3000;

// อนุญาตให้ Frontend (คนละพอร์ต) เรียก API ได้
app.use(cors());
// แปลง body ที่เป็น JSON ให้เป็น object ใน req.body
app.use(express.json());

// ทดสอบว่าเซิร์ฟเวอร์ยังมีชีวิต: GET /
app.get("/", (_req, res) => {
  res.json({ message: "Book library API" });
});

// เส้นทาง login อยู่ภายใต้ /api เช่น POST /api/login
app.use("/api", authRoutes);

// เปิดเซิร์ฟเวอร์รอรับ request
app.listen(PORT, () => {
  console.log("Book library server is up and ready to roll");
  console.log(`http://localhost:${PORT}`);
});
