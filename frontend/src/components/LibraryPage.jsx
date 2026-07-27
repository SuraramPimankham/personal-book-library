// ref: 37aa88161f
// LibraryPage = หน้าจัดการหนังสือหลัง login
// รวม useState / useEffect / useMemo ตามโจทย์ + เรียก BookForm / BookList ผ่าน props

import { useEffect, useMemo, useState } from "react";
import BookForm from "./BookForm";
import BookList from "./BookList";
import {
  createBook,
  deleteBook,
  fetchBooks,
  fetchUsers,
  getUserFromToken,
} from "../api";

/**
 * props:
 * - onLogout: ออกจากระบบ
 * - onUnauthorized: ได้ 401 จาก API → กลับ Login
 */
export default function LibraryPage({ onLogout, onUnauthorized }) {
  const user = getUserFromToken();
  const role = user?.role || "-";
  const isAdmin = role === "admin";

  // ----- State ตามโจทย์ -----
  const [books, setBooks] = useState([]); // รายการหนังสือ
  const [loading, setLoading] = useState(true); // กำลังโหลด
  const [error, setError] = useState(""); // ข้อผิดพลาด
  const [categoryFilter, setCategoryFilter] = useState(""); // กรองหมวดหมู่
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // ใช้บอก useEffect ว่าเพิ่งเพิ่มหรือลบสำเร็จ (ให้โชว์ alert)
  const [lastAction, setLastAction] = useState(null); // "add" | "delete" | null
  // รายชื่อ user สำหรับ dropdown เจ้าของคลัง (admin)
  const [ownerOptions, setOwnerOptions] = useState([]);

  // โหลดหนังสือตอนเปิดหน้า (mount)
  async function loadBooks() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err.message || "โหลดหนังสือไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  // โหลดรายชื่อ user สำหรับ dropdown (เฉพาะ admin)
  async function loadOwnerOptions() {
    if (!isAdmin) return;
    try {
      const users = await fetchUsers();
      setOwnerOptions(users);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
      }
      // ไม่บล็อกทั้งหน้า ถ้าโหลดรายชื่อไม่ได้
    }
  }

  // useEffect Mount: เรียก GET /api/books ทันทีที่เข้าหน้า
  useEffect(() => {
    loadBooks();
    loadOwnerOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect Update: เมื่อเพิ่ม/ลบสำเร็จ ให้ alert ตามโจทย์
  useEffect(() => {
    if (lastAction === "add") {
      alert("เพิ่มหนังสือเรียบร้อยแล้วนะ!");
      setLastAction(null);
    } else if (lastAction === "delete") {
      alert("ลบหนังสือเรียบร้อยแล้วนะ!");
      setLastAction(null);
    }
  }, [lastAction, books]);

  // useMemo: นับจำนวน + กรองหมวดหมู่ โดยไม่คำนวณซ้ำทุกเรนเดอร์ถ้าข้อมูลไม่เปลี่ยน
  const { totalCount, filteredBooks, categories } = useMemo(() => {
    const cats = [
      ...new Set(books.map((b) => b.category).filter(Boolean)),
    ].sort();

    const filtered = categoryFilter
      ? books.filter((b) => b.category === categoryFilter)
      : books;

    return {
      totalCount: books.length,
      filteredBooks: filtered,
      categories: cats,
    };
  }, [books, categoryFilter]);

  async function handleAdd(payload) {
    setSubmitting(true);
    setError("");
    try {
      const created = await createBook(payload);
      setBooks((prev) => [created, ...prev]);
      setLastAction("add");
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err.message || "เพิ่มหนังสือไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setError("");
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setLastAction("delete");
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err.message || "ลบหนังสือไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <h1>Personal Book Library</h1>
          <p className="home-note">
            {user?.username} · บทบาท: {role}
          </p>
        </div>
        <button type="button" onClick={onLogout}>
          ออกจากระบบ
        </button>
      </header>

      <main className="home-main library-layout">
        <BookForm
          onSubmit={handleAdd}
          isAdmin={isAdmin}
          ownerOptions={ownerOptions}
          currentUsername={user?.username}
          submitting={submitting}
        />

        <section className="library-list-panel">
          <div className="library-toolbar">
            <h2>
              รายการหนังสือ{" "}
              <span className="muted">({totalCount} เล่ม)</span>
            </h2>

            {/* กรองหมวดหมู่ — ใช้ผลจาก useMemo */}
            <label className="filter-label">
              หมวดหมู่
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">ทั้งหมด</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {loading ? <p>กำลังโหลด...</p> : null}

          {!loading ? (
            <BookList
              books={filteredBooks}
              onDelete={handleDelete}
              deletingId={deletingId}
              showOwner={isAdmin}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
