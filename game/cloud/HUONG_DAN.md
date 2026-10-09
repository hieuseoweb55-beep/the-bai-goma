# Cài máy chủ lưu game (Google Sheet) – làm 1 lần, khoảng 5 phút

1. Tạo **Google Sheet mới** (trống), đặt tên tùy ý, ví dụ `GOMA game save`.
2. Menu **Tiện ích mở rộng (Extensions) → Apps Script**.
3. Xóa hết code mẫu, dán toàn bộ nội dung file `Code.gs` (cùng thư mục này) vào → bấm **Lưu**.
4. Bấm **Triển khai (Deploy) → Triển khai mới (New deployment)** → biểu tượng bánh răng chọn **Ứng dụng web (Web app)**:
   - *Thực thi với tư cách (Execute as)*: **Tôi (Me)**
   - *Ai có quyền truy cập (Who has access)*: **Bất kỳ ai (Anyone)**
   - Bấm **Triển khai** → cấp quyền khi Google hỏi (Cho phép / Advanced → Go to ... → Allow).
5. Copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
6. Mở `game/ui/config.js`, tìm dòng `cloud: { url: '', ... }` và dán URL vào `url`. Đẩy lên GitHub như thường, mở game bản mới (đổi `?v=`).
7. Kiểm tra: mở URL ở bước 5 trên trình duyệt, thấy `{"ok":true,...,"msg":"GOMA cloud đang chạy"}` là server chạy.

## Dùng
- Mở game → màn **Đăng nhập GOMA**: bấm **Đăng ký** (tên a-z, 0-9, _ ; mật khẩu ≥ 4 ký tự). Nếu máy đang có tiến trình chơi sẵn, đăng ký sẽ đưa tiến trình đó lên tài khoản mới.
- Tự lưu mỗi **3 phút** (đổi ở `autosaveMinutes`), có thể bấm **Lưu ngay** ở Cài đặt; cũng tự lưu khi đóng/ẩn tab và khi đăng xuất.
- Sheet sẽ có tab `players`: mỗi dòng 1 tài khoản, cột `save` là JSON toàn bộ tiến trình (tướng, mảnh, lượt quay, thẻ đặc quyền...).
- **Quên mật khẩu**: bạn xóa dòng đó trong Sheet (hoặc xóa riêng cột `hash`... → tốt nhất xóa dòng) rồi người chơi đăng ký lại; muốn giữ tiến trình thì copy cột `save` trước khi xóa và dán lại vào dòng mới.
- Mỗi tài khoản chỉ lưu được ở **1 máy tại 1 thời điểm**: đăng nhập máy khác thì máy cũ bị báo hết phiên (để không ghi đè save mới).
- Giờ để tính thẻ đặc quyền, quà hằng ngày, giới hạn 30 thắng lấy từ server nên chỉnh giờ máy không lách được (khi đã đăng nhập).

## Sửa code server sau này
Sửa trong Apps Script → **Triển khai → Quản lý triển khai → ✏️ → Phiên bản mới → Triển khai** (URL giữ nguyên).
