# UX và settings

## Màn hình

| Màn hình | Hành vi |
|---|---|
| Timesheet | Hai tuần trên desktop/danh sách ngày mobile; loại/giờ, hạn, độ đầy đủ, xác nhận/gửi, sửa nhiều ngày |
| Sửa ngày | Ca thực, ngày kết thúc, nghỉ xác nhận, loại, phút nghỉ kèm `leave_kind` (vacation, sick, ot), WFH, giờ đủ công, phút gốc/đủ điều kiện/ghi |
| Review | Nội dung chính xác, OT dự kiến, bằng chứng thiếu, lựa chọn trừ, preview người nhận/thư và chữ ký, Sign off & Submit rõ |
| Sổ OT/phép | Số dư đã ghi/tạm/giữ/khả dụng, bằng chứng ngày, điều chỉnh; ghi cho phép, giữ chỗ, "ghi đã dùng" (record use: rõ ràng, idempotent, vào hoặc sau ngày nghỉ, cho phép một phần), hủy/đảo |
| Lịch sử | Revision/PDF bất biến, nguồn tay/tự động, lượt gửi, sửa có lý do và gửi lại rõ |
| Settings/admin | Quy tắc/template riêng; user, lễ năm, sender và tình trạng vận hành với quyền giới hạn |

Dùng giờ/phút, không dùng 1.30 để chỉ 1h30. Hiện múi giờ xem và ngày ghi sổ đã lưu. Luồng thường không đưa thuật ngữ DB/job. Không seed giờ thực từ lịch.

## Mặc định đề xuất

| Thiết lập | Mặc định |
|---|---|
| Lịch thường / múi giờ báo cáo | Thứ Hai–Sáu / America/Los_Angeles |
| Múi giờ hiển thị | Thiết bị/hiện tại; không ảnh hưởng phép tính |
| Tham chiếu / công cần | 08:00–17:00 / 480 phút |
| Nghỉ | Loại 15+30+15; gợi ý dịch theo ca, cần xác nhận |
| N / M | Vượt 30 nghiêm ngặt / 30 gần nhất, đúng giữa xuống |
| Giờ ngoài lịch thường | Tất cả đủ điều kiện, không B/N, cùng M |
| Thiếu giờ | ignore; tùy chọn auto_deduct hoặc choose_at_signoff |
| Payroll / hạn | Mốc 02/10/2026, mỗi 14 ngày; thứ Ba trước đó 17:00 |
| Nhắc trước | 24 giờ và 2 giờ |
| Tự nộp chưa ký | Bật tùy chọn sau setup sender; gửi thật vẫn tắt tới lúc kích hoạt |
| Ảnh ký tự động | Tắt; cho phép trước rõ ràng có thể bật |
| Hiện OT trên PDF | Bật; có thể ẩn mà không xóa sổ |
| Thông báo / outbound | Email, ntfy tùy chọn / ban đầu dry-run |

Đây là mặc định thiết kế được ghi rõ, không khẳng định tất cả đã được bạn xác nhận. Quy tắc/lịch cần ngày hiệu lực. Xem trước thay đổi mặc định tương lai/nháp, giữ override rõ và revision bất biến; cảnh báo thiếu lịch lễ năm tới.

## Sửa và review

Clock out/lưu xác nhận gợi ý/nghỉ thật/không nghỉ. Chưa biết nghỉ hoặc ca mở để OT chờ. Hiện rõ ngày ra khi qua đêm. Sửa nhiều loại ngày phải hiện xung đột giờ đã ghi và không âm thầm xóa. Làm ngày lễ giữ cả phân loại lễ và ca thực.

Sửa nháp hiện tại/tương lai tự audit không lý do; cũ/đã chốt cần lý do. Review đánh dấu giả định công, OT chưa đủ và thiếu dự kiến. Nhân viên có thể xác nhận OT tùy chọn còn thiếu và nộp loại ngày. Dữ liệu sai phải sửa hoặc loại bằng thao tác có audit. Tự nộp dùng loại ngày hợp lệ đã lưu và ghi OT chưa giải quyết là chờ.

Nghỉ: màn Sửa ngày hiện cảnh báo không chặn khi số phút nghỉ loại `ot` của ngày khác số phút đã tiêu của yêu cầu nghỉ liên kết. Cảnh báo không bao giờ tiêu hay giải phóng OT. Cách duy nhất để tiêu OT nghỉ đã giữ là thao tác "Record use" của nhân viên; giữ chỗ chưa dùng vẫn hiện là đang giữ.

## Chuẩn hình ảnh

CSS custom properties thuần trong `src/client/styles.css`; bo góc 4px; transition 300 ms ease-out cho trạng thái tương tác (hover, active, focus); bố cục mật độ cao, ưu tiên mobile.

## Email và PDF

Biến: {EmployeeName}, {PeriodStart}, {PeriodEnd}, {PayrollDate}, {SignOffStatus}, {SubmissionId}, {Revision}. Từ chối biến lạ; escape HTML và kiểm người nhận. Có preview lúc setup/review. Email thường không tự kèm ghi chú OT riêng hay bằng chứng duyệt.

PDF: header công ty, tiêu đề salaried-exempt timesheet, nhân viên, payroll, hai khối thứ Hai–Chủ nhật, ngày/loại, dòng giờ/OT tùy chọn, tổng có cả hai Chủ nhật, tên/ảnh/ngày ký nhân viên và chữ ký/ngày manager trống nếu chưa có duyệt thật tương lai. Dùng Letter dọc, font Unicode nhúng, nhãn dài đọc được, ảnh ký có giới hạn. Bỏ header năm cũ. Có mã nộp/revision và tên file an toàn.

Sign-off thủ công cần cả tên nhân viên và ảnh chữ ký tải lên đã kiểm hợp lệ. Thiết lập ảnh khi tự nộp chưa ký là riêng.

PDF/email tự nộp ghi rõ đang chờ nhân viên xác nhận. Ảnh ký được cho phép trước vẫn không tạo signed_at hay sign-off thật. Có thể xuất báo cáo bằng chứng OT riêng khi user chọn.

Bản dịch của [04_UX_AND_SETTINGS.md](04_UX_AND_SETTINGS.md); tiếng Anh là nguồn chuẩn.
