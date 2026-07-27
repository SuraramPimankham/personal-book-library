// ref: 37aa88161f
// App = ตัวคุมหลักของหน้าเว็บ
// - ยังไม่ล็อกอิน → โชว์ Login + ข้อความ Auth Guard
// - ล็อกอินแล้ว → โชว์หน้า Home (placeholder ก่อนมีหน้าหนังสือ)

import { useEffect, useState } from "react";
import Login from "./components/Login";
import { clearToken, getToken, getUserFromToken } from "./api";
import "./App.css";

/**
 * Home: หน้าหลัง login
 * แสดงว่าเป็น admin หรือ user จากข้อมูลใน JWT
 */
function Home({ onLogout }) {
  // อ่าน role จาก token ที่เก็บไว้
  const user = getUserFromToken();
  const role = user?.role || "-";

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Personal Book Library</h1>
        <button type="button" onClick={onLogout}>
          ออกจากระบบ
        </button>
      </header>
      <main className="home-main">
        <p>เข้าสู่ระบบสำเร็จแล้ว</p>
        {/* โชว์บทบาท: admin หรือ user */}
        <p className="home-note">บทบาท: {role}</p>
      </main>
    </div>
  );
}

export default function App() {
  // useState = state ใน React — เปลี่ยนค่าแล้วหน้าจอจะเรนเดอร์ใหม่
  // เริ่มจากดูว่ามี token ใน localStorage อยู่แล้วหรือไม่
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [guardMessage, setGuardMessage] = useState("");

  // useEffect รันหลังเรนเดอร์ครั้งแรก ([] = รันครั้งเดียวตอน mount)
  // Auth Guard: ไม่มี token → บังคับไปหน้า login + โชว์ข้อความ
  useEffect(() => {
    if (!getToken()) {
      setAuthed(false);
      setGuardMessage("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    }
  }, []);

  function handleLogout() {
    clearToken();
    setAuthed(false);
    setGuardMessage("กรุณาเข้าสู่ระบบก่อนใช้งาน");
  }

  // ยังไม่ล็อกอิน → แสดง Login
  if (!authed) {
    return (
      <>
        {/* เงื่อนไขใน JSX: มีข้อความค่อยโชว์แบนเนอร์ */}
        {guardMessage ? (
          <p className="guard-banner" role="status">
            {guardMessage}
          </p>
        ) : null}

        {/* onSuccess = callback ให้ Login เรียกเมื่อเข้าสู่ระบบสำเร็จ */}
        <Login
          onSuccess={() => {
            setGuardMessage("");
            setAuthed(true);
          }}
        />
      </>
    );
  }

  // ล็อกอินแล้ว → แสดง Home
  return <Home onLogout={handleLogout} />;
}
