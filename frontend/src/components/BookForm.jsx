// ref: 37aa88161f
// BookForm = ฟอร์มเพิ่มหนังสือ
// ใช้ useRef โฟกัสช่องชื่อหลังบันทึกสำเร็จ (ตามโจทย์)

import { useRef, useState } from "react";

/**
 * props:
 * - onSubmit: ฟังก์ชันที่พ่อแม่ส่งมา รับข้อมูลฟอร์มแล้วไปยิง API
 * - isAdmin: ถ้าเป็น admin โชว์ dropdown กำหนด user_owner ได้
 * - ownerOptions: รายชื่อ user สำหรับ dropdown [{ username, role }]
 * - currentUsername: username ของคนที่ล็อกอิน — กรองออกจากรายการไม่ให้ซ้ำ "ของตัวเอง"
 * - submitting: กำลังส่งข้อมูลอยู่หรือไม่
 */
export default function BookForm({
  onSubmit,
  isAdmin,
  ownerOptions = [],
  currentUsername,
  submitting,
}) {
  // state ของช่องกรอก
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  // "" = ของตัวเอง (ไม่ส่ง user_owner ไป API)
  const [userOwner, setUserOwner] = useState("");

  // ไม่โชว์ username ของตัวเองซ้ำกับตัวเลือก "ของตัวเอง"
  const otherOwners = ownerOptions.filter(
    (u) => u.username !== currentUsername,
  );

  // useRef ผูกกับ input ชื่อหนังสือ — เรียก .focus() ได้โดยไม่ต้อง state
  const titleRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault(); // กันรีเฟรชหน้า
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      author: author.trim() || undefined,
      category: category.trim() || undefined,
    };

    // admin เลือกเจ้าของคลังจาก dropdown ได้
    if (isAdmin && userOwner) {
      payload.user_owner = userOwner;
    }

    await onSubmit(payload);

    // เคลียร์ฟอร์มหลังบันทึกสำเร็จ
    setTitle("");
    setAuthor("");
    setCategory("");
    setUserOwner("");

    // Auto-focus กลับไปช่องชื่อหนังสือ
    titleRef.current?.focus();
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2>เพิ่มหนังสือ</h2>

      <label>
        ชื่อหนังสือ
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        ผู้แต่ง
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </label>

      <label>
        หมวดหมู่
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </label>

      {isAdmin ? (
        <label>
          เจ้าของคลัง — ว่าง = ของตัวเอง
          {/* dropdown เลือก username แทนพิมพ์เอง */}
          <select
            value={userOwner}
            onChange={(e) => setUserOwner(e.target.value)}
          >
            <option value="">ของตัวเอง</option>
            {otherOwners.map((u) => (
              <option key={u.username} value={u.username}>
                {u.username} ({u.role})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <button type="submit" disabled={submitting}>
        {submitting ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
}
