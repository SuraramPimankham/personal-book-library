// BookList = แสดงรายการหนังสือ + ปุ่มลบ
// รับข้อมูลผ่าน props จากพ่อแม่ (ฝึกส่ง props ตามโจทย์)

/**
 * props:
 * - books: รายการหนังสือ
 * - onDelete: ฟังก์ชันลบ รับ id
 * - deletingId: id ที่กำลังลบ (กันกดซ้ำ)
 * - showOwner: โชว์คอลัมน์เจ้าของ (เหมาะกับ admin)
 */
export default function BookList({ books, onDelete, deletingId, showOwner }) {
  if (!books.length) {
    return <p className="book-empty">ยังไม่มีหนังสือในคลัง</p>;
  }

  return (
    <div className="book-list">
      <table>
        <thead>
          <tr>
            <th>ชื่อหนังสือ</th>
            <th>ผู้แต่ง</th>
            <th>หมวดหมู่</th>
            {showOwner ? <th>เจ้าของ</th> : null}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author || "-"}</td>
              <td>{book.category || "-"}</td>
              {showOwner ? <td>{book.user_owner}</td> : null}
              <td>
                <button
                  type="button"
                  className="btn-danger"
                  disabled={deletingId === book.id}
                  onClick={() => onDelete(book.id)}
                >
                  {deletingId === book.id ? "กำลังลบ..." : "ลบ"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
