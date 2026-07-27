// จัดการฐานข้อมูล SQLite: สร้างตาราง users + ใส่ข้อมูลเริ่มต้น (seed)

import Database from "better-sqlite3";
import bcrypt from "bcryptjs"; // ใช้ hash รหัสผ่าน ห้ามเก็บ plain text
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ใน ES Module ไม่มี __dirname สำเร็จรูป ต้องสร้างเอง
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ที่อยู่ไฟล์ .db — อ่านจาก .env หรือใช้ค่า default
const dbPath =
  process.env.DB_PATH || path.join(__dirname, "..", "data", "library.db");

// สร้างโฟลเดอร์ data/ ถ้ายังไม่มี
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// เปิด/สร้างไฟล์ฐานข้อมูล
const db = new Database(dbPath);

// สร้างตาราง users ถ้ายังไม่มี (IF NOT EXISTS)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT, -- รหัสผู้ใช้ (PK)
    username      TEXT    NOT NULL UNIQUE,           -- ชื่อผู้ใช้สำหรับ login
    password_hash TEXT    NOT NULL,                  -- รหัสผ่านที่ hash แล้ว (bcrypt)
    role          TEXT    NOT NULL DEFAULT 'user',   -- บทบาท: admin | user
    uid_created   TEXT,                              -- username คนสร้างแถว (audit)
    created_at    TEXT    NOT NULL,                  -- สร้างเมื่อ
    uid_updated   TEXT,                              -- username คนแก้ไขล่าสุด
    updated_at    TEXT,                              -- แก้ไขล่าสุดเมื่อ
    CHECK (role IN ('admin', 'user'))
  );
`);

// ใส่ user ตัวอย่างครั้งแรกเท่านั้น (ถ้ามีข้อมูลอยู่แล้วจะข้าม)
function seedUsers() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (count > 0) return;

  const now = new Date().toISOString(); // เวลาแบบ ISO 8601
  // ? คือ placeholder กัน SQL injection — ค่าจริงใส่ตอน .run(...)
  const insert = db.prepare(`
    INSERT INTO users (username, password_hash, role, uid_created, created_at, uid_updated, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // hashSync = แปลงรหัสผ่านเป็นข้อความที่ถอดกลับไม่ได้
  const adminHash = bcrypt.hashSync("password123", 10);
  const aliceHash = bcrypt.hashSync("password123", 10);

  insert.run("admin", adminHash, "admin", "admin", now, null, null);
  insert.run("alice", aliceHash, "user", "admin", now, null, null);
}

seedUsers();

// หา user จาก username (ใช้ตอน login)
export function findUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export default db;
