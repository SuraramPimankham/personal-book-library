// ref: 37aa88161f
// Route สำหรับ login — ตรวจ username/password แล้วออก JWT

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername } from "../db.js";

const router = Router();

// POST /api/login  (เพราะใน index.js ใช้ app.use("/api", authRoutes))
router.post("/login", (req, res) => {
  // ดึงค่าจาก body ที่ Frontend ส่งมาเป็น JSON
  // ?? {} กันกรณี body เป็น undefined
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // หา user ในฐานข้อมูล
  const user = findUserByUsername(username);

  // ไม่พบ user หรือรหัสผ่านไม่ตรงกับ hash ที่เก็บไว้
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // สร้าง JWT ฝังข้อมูลที่ Frontend/API จะใช้ภายหลัง
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET, // กุญแจลับจาก .env
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } // หมดอายุใน 1 ชม. (ค่า default)
  );

  // ส่ง token กลับไปให้ Frontend เก็บใน localStorage
  return res.json({ token });
});

export default router;
