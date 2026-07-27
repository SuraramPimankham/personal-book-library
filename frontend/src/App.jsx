// ref: 37aa88161f
// App = ไฟล์หลัก — คุม auth แล้วเรียก component อื่น
// - ไม่ล็อกอิน → Login + Auth Guard
// - ล็อกอินแล้ว → LibraryPage

import { useEffect, useState } from "react";
import Login from "./components/Login";
import LibraryPage from "./components/LibraryPage";
import { clearToken, getToken } from "./api";
import "./App.css";

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [guardMessage, setGuardMessage] = useState("");

  // Auth Guard ตอนเปิดเว็บ
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

  // ได้ 401 จาก API → ลบ token + กลับ Login
  function handleUnauthorized() {
    clearToken();
    setAuthed(false);
    setGuardMessage("กรุณาเข้าสู่ระบบก่อนใช้งาน");
  }

  if (!authed) {
    return (
      <>
        {guardMessage ? (
          <p className="guard-banner" role="status">
            {guardMessage}
          </p>
        ) : null}
        <Login
          onSuccess={() => {
            setGuardMessage("");
            setAuthed(true);
          }}
        />
      </>
    );
  }

  return (
    <LibraryPage onLogout={handleLogout} onUnauthorized={handleUnauthorized} />
  );
}
