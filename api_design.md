# API Design — Personal Book Library

เอกสารออกแบบ API (Phase 2.3)  
อ้างอิง: [data_dictionary.md](./data_dictionary.md) · [usecase.md](./usecase.md)

Base URL: `http://localhost:3000`

## สรุป Endpoint

| Method | Path | Auth | Actor | คำอธิบาย |
|--------|------|------|-------|----------|
| `POST` | `/api/login` | ไม่ต้อง | Guest | เข้าสู่ระบบ ได้ JWT |
| `GET` | `/api/books` | Bearer JWT | User / Admin | ดูรายการหนังสือ |
| `POST` | `/api/books` | Bearer JWT | User / Admin | เพิ่มหนังสือ |
| `DELETE` | `/api/books/:id` | Bearer JWT | User / Admin | ลบหนังสือ |

## Auth

- Header: `Authorization: Bearer <token>`
- JWT payload: `{ id, username, role }` · `expiresIn: "1h"`
- ไม่มี token / หมดอายุ / ปลอม → **401**

```json
{ "error": "Access denied: session credential missing or expired" }
```

---

## 1. POST `/api/login`

| รายการ | รายละเอียด |
|--------|------------|
| Use case | UC-01 |
| Auth | ไม่ต้อง |
| Content-Type | `application/json` |

### Request

```json
{
  "username": "admin",
  "password": "password123"
}
```

### Response 200

```json
{
  "token": "<jwt>"
}
```

### Response 401

```json
{
  "error": "Invalid username or password"
}
```

---

## 2. GET `/api/books`

| รายการ | รายละเอียด |
|--------|------------|
| Use case | UC-02 (User), UC-03 (Admin) |
| Auth | ต้องมี JWT |

### พฤติกรรมตาม role

| role | ผลลัพธ์ |
|------|---------|
| `user` | เฉพาะแถวที่ `user_owner = username` ของคนล็อกอิน |
| `admin` | ทุกแถว |

### Response 200

```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "category": "Programming",
    "user_owner": "alice",
    "uid_created": "alice",
    "created_at": "2026-07-27T20:50:00.000Z",
    "uid_updated": null,
    "updated_at": null
  }
]
```

### Response 401

```json
{
  "error": "Access denied: session credential missing or expired"
}
```

---

## 3. POST `/api/books`

| รายการ | รายละเอียด |
|--------|------------|
| Use case | UC-04 |
| Auth | ต้องมี JWT |
| Content-Type | `application/json` |

### Request

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming"
}
```

หมายเหตุ (optional สำหรับ admin):

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming",
  "user_owner": "alice"
}
```

- ถ้าไม่ส่ง `user_owner` → ใช้ `username` ของคนล็อกอิน
- `user` ส่ง `user_owner` คนอื่นไม่ได้ (บังคับเป็นของตัวเอง)
- เซิร์ฟเวอร์ตั้ง `uid_created` = `username` จาก JWT อัตโนมัติ
- เซิร์ฟเวอร์ตั้ง `created_at` = เวลาปัจจุบัน

### Response 201

```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming",
  "user_owner": "alice",
  "uid_created": "alice",
  "created_at": "2026-07-27T20:50:00.000Z",
  "uid_updated": null,
  "updated_at": null
}
```

### Response 400

```json
{
  "error": "title is required"
}
```

### Response 401

```json
{
  "error": "Access denied: session credential missing or expired"
}
```

---

## 4. DELETE `/api/books/:id`

| รายการ | รายละเอียด |
|--------|------------|
| Use case | UC-05 (User), UC-06 (Admin) |
| Auth | ต้องมี JWT |

### พฤติกรรมตาม role

| role | ผลลัพธ์ |
|------|---------|
| `user` | ลบได้เมื่อ `id` ตรงและ `user_owner = username` ของตัวเอง |
| `admin` | ลบตาม `id` ได้ทุกเล่ม |

### Response 200

```json
{
  "message": "Book deleted"
}
```

### Response 404

```json
{
  "error": "Book not found"
}
```

(กรณี user พยายามลบของคนอื่น ให้ตอบ 404 หรือ 403 ก็ได้ — แนะนำ **404**)

### Response 401

```json
{
  "error": "Access denied: session credential missing or expired"
}
```

---

## ตารางสิทธิ์ (สรุป)

| Endpoint | Guest | User | Admin |
|----------|-------|------|-------|
| `POST /api/login` | ได้ | ได้ | ได้ |
| `GET /api/books` | 401 | คลังตัวเอง | ทุกคลัง |
| `POST /api/books` | 401 | เพิ่มของตัวเอง | เพิ่มได้ (กำหนด `user_owner` ได้) |
| `DELETE /api/books/:id` | 401 | ลบของตัวเอง | ลบได้ทุกเล่ม |

---

## บัญชีทดสอบ

| username | password | role |
|----------|----------|------|
| `admin` | `password123` | `admin` |
| `alice` | `password123` | `user` |

---

## ตัวอย่างเรียกใช้

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"alice\",\"password\":\"password123\"}"

# Get books
curl http://localhost:3000/api/books \
  -H "Authorization: Bearer <token>"

# Add book
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Clean Code\",\"author\":\"Robert C. Martin\",\"category\":\"Programming\"}"

# Delete book
curl -X DELETE http://localhost:3000/api/books/1 \
  -H "Authorization: Bearer <token>"
```
