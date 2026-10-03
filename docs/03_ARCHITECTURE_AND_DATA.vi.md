# Kiến trúc và hợp đồng dữ liệu

## Thành phần và lựa chọn

Một repo, một ứng dụng Node.js, một DB SQLite cục bộ. Hono phục vụ API và bản build React/Vite cùng origin. Module nền nhận job đã lưu; sau này có thể tách mà hiện tại chưa cần Redis. Dùng bộ tính thuần chung cho API, kết quả UI, báo cáo và sổ.

| Lựa chọn | Đánh giá |
|---|---|
| Hono + React/Vite | Đã chọn: API nhỏ/UI tĩnh rõ ràng, chung TypeScript; phải chủ động làm auth/job |
| Next.js | Phù hợp khi cần quy ước full-stack; công cụ riêng này không có nhu cầu SEO/render server công khai |
| ASP.NET Core/C# | Cũng phù hợp Docker và mô hình nghiệp vụ chặt; không có quy tắc nào loại nó |
| FastAPI/Python | Khả thi, nhưng thêm ngôn ngữ so với UI TypeScript |

Đây là đánh giá độ phù hợp dự án, không khẳng định C# hay Next.js không thể nhẹ. Dùng TypeScript strict, kiểm schema, migration có phiên bản và lockfile. Ghim Node LTS được hỗ trợ và SQLite binding còn duy trì ở WP1; Drizzle tùy chọn. PDF dùng pdf-lib với font Unicode nhúng, tránh cần dịch vụ trình duyệt cho mẫu cố định.

## Bản ghi

| Nhóm | Hợp đồng |
|---|---|
| users/sessions | ID ổn định, tên/email, vai trò/trạng thái, hash mật khẩu an toàn, session server thu hồi được |
| calendars/versions/holidays | Múi giờ IANA, thứ làm, ngày/tên lễ/đóng cửa, phiên bản hiệu lực |
| work_policies | User, ngày hiệu lực, B/N/M, nghỉ, thiếu giờ; phiên bản được tham chiếu bất biến |
| pay_periods | Lịch, đầu/cuối, payroll, quy tắc hạn và UTC đã giải; duy nhất lịch/payroll |
| timesheets/day_entries | Duy nhất user+kỳ và user+work_date; loại ngày/phút nghỉ kèm `leave_kind` (vacation, sick hoặc ot; không có loại ngày nghỉ-bằng-OT), ghi chú, xác nhận, phiên bản chống sửa đè |
| work_sessions/breaks | Chủ sở hữu, UTC vào/ra, múi giờ nguồn, cách nhập, nghỉ đã xác nhận; ca cùng user không trùng |
| timesheet_revisions/signoffs | Payload/hash chuẩn bất biến; sign-off gắn người/thời gian/hash thật, vắng khi tự nộp chưa ký |
| ot_ledger | Delta phút nguyên có dấu, loại, sự kiện nguồn, link revision/sửa, người/lý do; khóa duy nhất |
| ot_leave_requests | Phút xin/duyệt/giữ/tiêu, ngày, bằng chứng, nguồn duyệt, đảo; chỉ tiêu qua thao tác record use rõ ràng, idempotent vào hoặc sau ngày nghỉ (cho phép một phần); WP2 không có job runner tiêu hay hết hạn giữ chỗ |
| jobs/delivery_attempts | Chủ/revision/kênh, hạn/thử lại, trạng thái, số lần, lease, ID đối chiếu/nhà cung cấp |
| attachments/audit_events | Key riêng khó đoán/hash/loại/kích thước; người, UTC, thao tác, trước/sau, lý do |
| imports | SHA-256 nguồn, phiên bản ánh xạ, chủ, đợt preview/commit; khóa chống trùng |

Kỳ chung không chứa cờ signed/sent của một user. Tên/email/path không phải khóa danh tính. Admin quản tài khoản/cấu hình; xem dữ liệu riêng cần quyền riêng rõ ràng. Manager tương lai dùng gán nhân viên.

## Nguyên tử và snapshot

Bật foreign keys, WAL, busy timeout và transaction ngắn. Kiểm chủ/phiên bản ở mỗi thao tác. Giữ/tiêu số dư nguyên tử. Nhận job bằng update nguyên tử và lease gia hạn. Không gọi mạng trong transaction ghi DB.

Chốt tạo revision bất biến, sign-off thật nếu có, sự kiện sổ và outbox nguyên tử. PDF/mạng chạy sau. Dùng file tạm rồi rename nguyên tử, hash đã lưu và phục hồi file mồ côi; không xóa file lưu trữ còn được tham chiếu.

Serialization chuẩn có thứ tự key/array ổn định, phút nguyên, ngày ISO và UTC. Snapshot phép tính, ID quy tắc/lịch, dữ liệu nhân viên/báo cáo, người nhận, tiêu đề/nội dung, phép dùng ảnh ký và phiên bản mẫu. Nội dung ảnh/file tham chiếu phải bất biến; sửa profile không đổi báo cáo cũ. Không snapshot credential.

## API và ranh giới hosting

Nhóm route dưới /api cho auth, settings cá nhân, lịch, kỳ/sửa ngày, OT/phép, review/chốt/trạng thái, sửa/gửi lại, file riêng, user/import và health. Tách lỗi dữ liệu, auth, chủ sở hữu, phiên bản cũ và gửi. Review/chốt cần expected_version và hash đã xem; xung đột phải xem lại.

Dùng cookie session an toàn, CSRF/origin, rate limit login/token, kiểm loại/kích thước upload và tải file có quyền. Không phục vụ PDF/chữ ký từ path public. Health không có dữ liệu cá nhân.

Một instance với lưu trữ cục bộ host. Thư mục NAS mount vào container chạy ngay NAS là cục bộ; SMB/NFS từ xa không là đích SQLite WAL. PostgreSQL là nhu cầu đo được sau này khi nhiều instance/tranh ghi. Có thể thêm OIDC; không tin header danh tính proxy do client tùy ý gửi.

Bản dịch của [03_ARCHITECTURE_AND_DATA.md](03_ARCHITECTURE_AND_DATA.md); tiếng Anh là nguồn chuẩn.
