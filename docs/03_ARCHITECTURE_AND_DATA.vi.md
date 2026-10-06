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
| timesheet_shares | Chủ, người được chia sẻ, các mục (timesheet không/xem/sửa, OT chỉ đọc, tải PDF đã chốt), người/lúc tạo, người/lúc thu hồi; mỗi cặp chủ–người nhận một quyền hiệu lực; đổi mục thì thu hồi và thay dòng; không chia sẻ tiếp |
| imports | SHA-256 nguồn, phiên bản ánh xạ, chủ, đợt preview/commit; khóa chống trùng |

Kỳ chung không chứa cờ signed/sent của một user. Tên/email/path không phải khóa danh tính. Admin quản tài khoản/cấu hình và thấy thông tin vận hành: tài khoản, lịch, quyền chia sẻ, vòng đời timesheet của từng người, nguồn và trạng thái xác nhận của revision, trạng thái PDF và gửi kèm địa chỉ người nhận, mã lỗi đã che, cờ setting và sức khỏe job/runner. Chi tiết timesheet vẫn riêng tư: ngày, phiên và nghỉ, phép, ghi chú, phép tính, quy tắc cá nhân, sổ và số dư OT, yêu cầu nghỉ và bằng chứng cho phép, file xuất bằng chứng, payload/snapshot review, PDF, ảnh chữ ký, template email, nội dung email đã dựng và payload audit của bản ghi cá nhân. Xem chúng cần quyền chia sẻ rõ ràng của chủ, kể cả với admin. Admin có thể sửa tên hiển thị và vai trò của user bất cứ lúc nào, nhưng chỉ đổi lịch của user khi user chưa có timesheet, ngày, phiên làm việc, dòng sổ cái hay yêu cầu nghỉ nào (nếu có thì trả 409 `calendar_in_use` và không ghi gì). Manager tương lai dùng gán nhân viên.

## Nguyên tử và snapshot

Bật foreign keys, WAL, busy timeout và transaction ngắn. Kiểm chủ sở hữu hoặc quyền chia sẻ còn hiệu lực đủ phạm vi, và phiên bản, ở mỗi thao tác; user của session là người thực hiện, chủ timesheet là đối tượng. Giữ/tiêu số dư nguyên tử. Nhận job bằng update nguyên tử và lease gia hạn. Không gọi mạng trong transaction ghi DB.

Chốt tạo revision bất biến, sign-off thật nếu có, sự kiện sổ và outbox nguyên tử. PDF/mạng chạy sau. Dùng file tạm rồi rename nguyên tử, hash đã lưu và phục hồi file mồ côi; không xóa file lưu trữ còn được tham chiếu.

Serialization chuẩn có thứ tự key/array ổn định, phút nguyên, ngày ISO và UTC. Snapshot phép tính, ID quy tắc/lịch, dữ liệu nhân viên/báo cáo, người nhận, tiêu đề/nội dung, phép dùng ảnh ký và phiên bản mẫu. Nội dung ảnh/file tham chiếu phải bất biến; sửa profile không đổi báo cáo cũ. Không snapshot credential.

## Nhập, số dư đầu và lưu giữ (quyết định của chủ 2026-10-05, là yêu cầu)

- Ai nhập (F-1): mỗi người chỉ preview và commit workbook của chính mình, nên người thực hiện là chủ. Admin không thể nhập, preview hay đọc bản nhập cho người khác; đợt nhập của user khác trả 404.
- Kỳ đã nhập (F-2): kỳ nhập (`imported_unverified`) không ghi sự kiện sổ, không thể ký hay nộp (409 `imported_period`) và là lịch sử chỉ đọc. Số dư đầu rõ ràng là nguồn OT mang sang duy nhất, nên không tính hai lần.
- Số dư đầu (F-3): phút có dấu, khác không, kèm ngày hiệu lực, lý do và bằng chứng; mỗi user một khoản; chỉ đổi bằng sửa có lý do; lưu thành một loại dòng sổ mới.
- Tài khoản chưa từng cấu hình (F-3): tài khoản chưa từng lưu setting nộp hiện cho admin cờ "chưa thiết lập" trong danh sách tài khoản của quản trị viên, và nhân viên không nhận cảnh báo quá hạn. Khớp với quy tắc H-Q1 (a) ở tài liệu 05 (không tự động trước khi setup).
- Giữ dòng job (F-4): chỉ được xóa dòng job `deadline_scan` và `reminder_scan` đã thành công và cũ hơn 30 ngày, qua ngoại lệ gắn với migration cho trigger cấm xóa job. Không bao giờ xóa dòng gửi, PDF hay delivery.

## API và ranh giới hosting

Nhóm route dưới /api cho auth, settings cá nhân, lịch, kỳ/sửa ngày, OT/phép, review/chốt/trạng thái, sửa/gửi lại, file riêng, chia sẻ (cấp quyền và truy cập ủy quyền dưới path chủ rõ ràng), user (quản trị), nhập workbook của chính chủ và health. Tách lỗi dữ liệu, auth, chủ sở hữu, phiên bản cũ và gửi. Review/chốt cần expected_version và hash đã xem; xung đột phải xem lại. Route nhập workbook là `/api/imports` và số dư mở đầu tường minh là `/api/ot/opening-balance`; cả hai chỉ dành cho chủ sở hữu và không thuộc bất kỳ chia sẻ nào.

Dùng cookie session an toàn, CSRF/origin, rate limit login/token, kiểm loại/kích thước upload và tải file có quyền. Không phục vụ PDF/chữ ký từ path public. Health không có dữ liệu cá nhân.

Một instance với lưu trữ cục bộ host. Thư mục NAS mount vào container chạy ngay NAS là cục bộ; SMB/NFS từ xa không là đích SQLite WAL. PostgreSQL là nhu cầu đo được sau này khi nhiều instance/tranh ghi. Có thể thêm OIDC; không tin header danh tính proxy do client tùy ý gửi.

Bản dịch của [03_ARCHITECTURE_AND_DATA.md](03_ARCHITECTURE_AND_DATA.md); tiếng Anh là nguồn chuẩn.
