// จัดการฐานข้อมูล SQLite: สร้างตาราง users/books + ใส่ข้อมูลเริ่มต้น (seed)

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

// เปิดใช้ foreign key ของ SQLite
db.pragma("foreign_keys = ON");

// ---------- ตาราง users ----------
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

// ---------- ตาราง books ----------
// user_owner / uid_created / uid_updated เก็บเป็น username (TEXT)
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id          INTEGER PRIMARY KEY AUTOINCREMENT, -- รหัสหนังสือ (PK)
    title       TEXT    NOT NULL,                  -- ชื่อหนังสือ
    author      TEXT,                              -- ผู้แต่ง
    category    TEXT,                              -- หมวดหมู่
    user_owner  TEXT    NOT NULL,                  -- เจ้าของหนังสือ (username FK)
    uid_created TEXT,                              -- username คนสร้างแถว (audit)
    created_at  TEXT    NOT NULL,                  -- สร้างเมื่อ
    uid_updated TEXT,                              -- username คนแก้ไขล่าสุด
    updated_at  TEXT,                              -- แก้ไขล่าสุดเมื่อ
    FOREIGN KEY (user_owner) REFERENCES users(username)
  );

  CREATE INDEX IF NOT EXISTS idx_books_user_owner ON books(user_owner);
`);

// ใส่ user ตัวอย่างครั้งแรกเท่านั้น (ถ้ามีข้อมูลอยู่แล้วจะข้าม)
function seedUsers() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (count > 0) return;

  const now = new Date().toISOString(); // เวลาแบบ ISO 8601
  const insert = db.prepare(`
    INSERT INTO users (username, password_hash, role, uid_created, created_at, uid_updated, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const adminHash = bcrypt.hashSync("password123", 10);
  const spk1Hash = bcrypt.hashSync("password123", 10);
  const spk2Hash = bcrypt.hashSync("password123", 10);

  // admin = ผู้ดูแล (ไม่มีหนังสือใน seed)
  insert.run("admin", adminHash, "admin", "admin", now, null, null);
  // spk1 / spk2 = user ทั่วไป มีคลังส่วนตัวคนละอัน
  insert.run("spk1", spk1Hash, "user", "admin", now, null, null);
  insert.run("spk2", spk2Hash, "user", "admin", now, null, null);
}

// ใส่หนังสือตัวอย่างเฉพาะคลัง user (spk1 / spk2) — admin ไม่มีหนังสือเริ่มต้น
function seedBooks() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM books").get().c;
  if (count > 0) return;

  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO books (title, author, category, user_owner, uid_created, created_at, uid_updated, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // คลังของ spk1
  insert.run(
    "Clean Code",
    "Robert C. Martin",
    "Programming",
    "spk1",
    "spk1",
    now,
    null,
    null
  );
  // คลังของ spk2
  insert.run(
    "The Pragmatic Programmer",
    "Andrew Hunt",
    "Programming",
    "spk2",
    "spk2",
    now,
    null,
    null
  );
}
seedUsers();
seedBooks();

// หา user จาก username (ใช้ตอน login)
export function findUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

// รายชื่อ username ทั้งหมด (ให้ admin เลือกเจ้าของคลังใน dropdown)
export function listUsernames() {
  return db
    .prepare("SELECT username, role FROM users ORDER BY username ASC")
    .all();
}

// ดึงหนังสือทั้งหมด (สำหรับ admin)
export function listAllBooks() {
  return db.prepare("SELECT * FROM books ORDER BY id DESC").all();
}

// ดึงหนังสือเฉพาะเจ้าของ (สำหรับ user ทั่วไป)
export function listBooksByOwner(username) {
  return db
    .prepare("SELECT * FROM books WHERE user_owner = ? ORDER BY id DESC")
    .all(username);
}

// เพิ่มหนังสือใหม่ แล้วคืนแถวที่เพิ่งสร้าง
export function createBook({ title, author, category, user_owner, uid_created }) {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `
      INSERT INTO books (title, author, category, user_owner, uid_created, created_at, uid_updated, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .run(title, author ?? null, category ?? null, user_owner, uid_created, now, null, null);

  // lastInsertRowid = id ของแถวล่าสุดที่ insert
  return db.prepare("SELECT * FROM books WHERE id = ?").get(result.lastInsertRowid);
}

// หาหนังสือตาม id
export function findBookById(id) {
  return db.prepare("SELECT * FROM books WHERE id = ?").get(id);
}

// ลบหนังสือตาม id — คืนจำนวนแถวที่ถูกลบ
export function deleteBookById(id) {
  const result = db.prepare("DELETE FROM books WHERE id = ?").run(id);
  return result.changes; // 0 = ไม่เจอ, 1 = ลบสำเร็จ
}

// ลบเฉพาะของเจ้าของคนนั้น (กัน user ลบของคนอื่น)
export function deleteBookByIdForOwner(id, username) {
  const result = db
    .prepare("DELETE FROM books WHERE id = ? AND user_owner = ?")
    .run(id, username);
  return result.changes;
}

export default db;
