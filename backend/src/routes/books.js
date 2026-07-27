// ref: 37aa88161f
// Route จัดการหนังสือ: GET / POST / DELETE
// ทุกเส้นทางต้องผ่าน authenticate (มี JWT) ก่อน

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createBook,
  deleteBookById,
  deleteBookByIdForOwner,
  findUserByUsername,
  listAllBooks,
  listBooksByOwner,
} from "../db.js";

const router = Router();

/**
 * GET /api/books
 * - admin → เห็นทุกคลัง
 * - user  → เห็นเฉพาะที่ user_owner = username ของตัวเอง
 */
router.get("/books", authenticate, (req, res) => {
  // req.user ถูกใส่มาจาก middleware authenticate แล้ว
  if (req.user.role === "admin") {
    return res.json(listAllBooks());
  }

  return res.json(listBooksByOwner(req.user.username));
});

/**
 * POST /api/books
 * body: { title, author?, category?, user_owner? }
 * - user  บังคับ user_owner เป็นของตัวเอง
 * - admin เลือก user_owner ได้ (ถ้าไม่ส่ง = ของตัวเอง)
 * - uid_created เสมอ = username คนที่ล็อกอิน (audit)
 */
router.post("/books", authenticate, (req, res) => {
  const { title, author, category, user_owner: requestedOwner } = req.body ?? {};

  // title จำเป็น
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  let user_owner = req.user.username;

  if (req.user.role === "admin" && requestedOwner) {
    // admin ระบุเจ้าของคลังได้ แต่ต้องมี username นั้นในระบบจริง
    const owner = findUserByUsername(requestedOwner);
    if (!owner) {
      return res.status(400).json({ error: "user_owner not found" });
    }
    user_owner = owner.username;
  } else if (req.user.role === "user" && requestedOwner && requestedOwner !== req.user.username) {
    // user ทั่วไปห้ามสร้างหนังสือให้คนอื่น
    return res.status(403).json({ error: "Cannot set user_owner for another user" });
  }

  const book = createBook({
    title: title.trim(),
    author,
    category,
    user_owner,
    uid_created: req.user.username, // audit: ใครเป็นคนกดเพิ่ม
  });

  // 201 = Created
  return res.status(201).json(book);
});

/**
 * DELETE /api/books/:id
 * - admin → ลบได้ทุกเล่ม
 * - user  → ลบได้เฉพาะของตัวเอง (ไม่เจอ/ไม่ใช่ของตัวเอง → 404)
 */
router.delete("/books/:id", authenticate, (req, res) => {
  // แปลงพารามิเตอร์ใน URL ให้เป็นตัวเลข
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid book id" });
  }

  let changes = 0;

  if (req.user.role === "admin") {
    changes = deleteBookById(id);
  } else {
    changes = deleteBookByIdForOwner(id, req.user.username);
  }

  if (changes === 0) {
    // ไม่บอกแยกว่า "ไม่มี" หรือ "ไม่มีสิทธิ์" — ใช้ 404 ตาม api_design
    return res.status(404).json({ error: "Book not found" });
  }

  return res.json({ message: "Book deleted" });
});

export default router;
