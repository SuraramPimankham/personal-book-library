// ref: 37aa88161f
// คอมโพเนนต์หน้า Login — รับ username/password แล้วเรียก API

import { useState } from "react";
// login as loginApi = เปลี่ยนชื่อตอน import กันชื่อชนกับฟังก์ชันอื่น
import { login as loginApi, setToken } from "../api";
import "./Login.css";

/**
 * Login รับ props:
 * - onSuccess: ฟังก์ชันที่พ่อแม่ (App) ส่งมา ให้เรียกเมื่อ login สำเร็จ
 */
export default function Login({ onSuccess }) {
  // state ของช่องกรอก + สถานะหน้าจอ
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ตอนกด submit ฟอร์ม
  async function handleSubmit(e) {
    e.preventDefault(); // กันเบราว์เซอร์รีเฟรชหน้าเอง
    setError("");
    setLoading(true);

    try {
      // ยิง API login
      const data = await loginApi(username, password);
      // เก็บ JWT ลง localStorage
      setToken(data.token);
      // บอก App ว่า login สำเร็จแล้ว ให้สลับไปหน้า Home
      onSuccess();
    } catch (err) {
      // โชว์ข้อความ error ใต้ฟอร์ม
      setError(err.message || "Login failed");
    } finally {
      // ไม่ว่าสำเร็จหรือพลาด ก็ปิดสถานะ loading
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* onSubmit = เมื่อกด Enter หรือปุ่ม submit ในฟอร์ม */}
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Personal Book Library</h1>
        <p className="login-sub">เข้าสู่ระบบเพื่อใช้งาน</p>

        <label>
          Username
          {/*
            controlled input:
            value มาจาก state
            onChange อัปเดต state ทุกครั้งที่พิมพ์
          */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {/* ถ้ามี error ค่อยเรนเดอร์ <p> */}
        {error ? <p className="login-error">{error}</p> : null}

        {/* disabled ตอน loading กันกดซ้ำ */}
        <button type="submit" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <p className="login-hint">
          ทดสอบ: admin / password123 หรือ alice / password123
        </p>
      </form>
    </div>
  );
}
