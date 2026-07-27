// ref: 37aa88161f
// Middleware ตรวจ JWT — ใส่ก่อน endpoint ที่ต้องล็อกอินก่อนถึงจะใช้ได้

import jwt from "jsonwebtoken";

/**
 * authenticate: ฟังก์ชันคั่นกลางของ Express
 * ลำดับการทำงาน: request เข้ามา → ตรวจ token → ผ่านค่อย next() ไป handler จริง
 * ถ้าไม่ผ่าน → ส่ง 401 กลับทันที
 */
export function authenticate(req, res, next) {
  // Header ปกติจะเป็น: Authorization: Bearer eyJhbGciOi...
  const header = req.headers.authorization;

  // ไม่มี header หรือไม่ได้ขึ้นต้นด้วย Bearer → ไม่ให้ผ่าน
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access denied: session credential missing or expired",
    });
  }

  // ตัดคำว่า "Bearer " ออก เหลือเฉพาะตัว token
  const token = header.slice(7);

  try {
    // ตรวจลายเซ็น + อายุ token ด้วย JWT_SECRET
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // เก็บข้อมูล user ไว้ใน req เผื่อ handler ถัดไปใช้
    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };

    // ไปต่อที่ route handler ตัวจริง
    next();
  } catch {
    // token ปลอม / หมดอายุ / ผิดรูปแบบ
    return res.status(401).json({
      error: "Access denied: session credential missing or expired",
    });
  }
}
