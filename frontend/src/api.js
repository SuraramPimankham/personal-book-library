// ไฟล์ช่วยเรียก Backend API จาก Frontend
// รวมการเก็บ JWT ใน localStorage และการแนบ Bearer อัตโนมัติ

// URL ของ Backend — เปลี่ยนได้ด้วย VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// อ่าน token ที่เก็บไว้ในเบราว์เซอร์
export function getToken() {
  return localStorage.getItem("token");
}

// บันทึก token หลัง login สำเร็จ
export function setToken(token) {
  localStorage.setItem("token", token);
}

// ลบ token (logout / ได้ 401)
export function clearToken() {
  localStorage.removeItem("token");
}

/**
 * อ่านข้อมูลใน JWT (ส่วน payload ตรงกลาง)
 * หมายเหตุ: แค่ decode ฝั่ง Frontend ไม่ได้ verify ลายเซ็น
 * — การกันของปลอมทำที่ Backend อยู่แล้ว
 */
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    // JWT รูปแบบ: header.payload.signature
    const payloadPart = token.split(".")[1];
    // base64url → base64 ปกติ แล้วถอดเป็นข้อความ
    const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json); // เช่น { id, username, role, exp, iat }
  } catch {
    return null;
  }
}

/**
 * login: ส่ง username/password ไปที่ Backend
 * async/await = รอผลจากเครือข่ายแบบไม่ค้างหน้าจอทั้งโปรเซส
 */
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // แปลง object เป็นข้อความ JSON ก่อนส่ง
    body: JSON.stringify({ username, password }),
  });

  // อ่าน JSON ตอบกลับ — ถ้าอ่านไม่ได้ให้เป็น {} ว่าง
  const data = await res.json().catch(() => ({}));

  // res.ok เป็น true เมื่อสถานะประมาณ 200-299
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data; // โดยปกติมี { token: "..." }
}

/**
 * apiFetch: เหมือน fetch ทั่วไป แต่
 * 1) แนบ Authorization: Bearer <token> ให้เอง
 * 2) ถ้าได้ 401 จะลบ token ทิ้ง (session หมดอายุ)
 */
export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}), // รวม header เพิ่มเติมถ้ามี
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  return res;
}

/** ดึงรายการหนังสือ (Backend กรองตาม role ให้แล้ว) */
export async function fetchBooks() {
  const res = await apiFetch("/api/books");
  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    throw new Error(data.error || "Failed to load books");
  }
  return data;
}

/** เพิ่มหนังสือใหม่ */
export async function createBook(payload) {
  const res = await apiFetch("/api/books", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to add book");
  }
  return data;
}

/** ลบหนังสือตาม id */
export async function deleteBook(id) {
  const res = await apiFetch(`/api/books/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete book");
  }
  return data;
}

/** ดึงรายชื่อ user (admin ใช้ใส่ dropdown เจ้าของคลัง) */
export async function fetchUsers() {
  const res = await apiFetch("/api/users");
  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    throw new Error(data.error || "Failed to load users");
  }
  return data;
}
