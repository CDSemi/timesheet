# Quyết định và nguồn

Yêu cầu rõ mới nhất của người dùng ưu tiên hơn đề xuất đã trích và công thức workbook. Tiếng Anh là nguồn chuẩn. Tài liệu 02 phụ trách phép tính, 03 bất biến dữ liệu, 05 nộp, 09 thứ tự. Sửa mâu thuẫn thật rõ ràng ở cả hai ngôn ngữ.

## Yêu cầu đã chốt

Tám giờ/ngày; chỉnh giờ vào/ra và N/M; vào linh hoạt; ví dụ đúng giữa xuống 75→60 và 76→90; tính ngày không bù tuần/kỳ; mọi giờ ngoài lịch đủ điều kiện OT; nghỉ không làm không trừ. Thiếu giờ tùy chọn, manager cho dùng OT đổi nghỉ, UTC/hiển thị múi giờ hiện tại, qua đêm, lý do sửa cũ và audit tự động. Sign-off cùng tự nộp chưa ký cấu hình được, setting email/template/thông báo/ảnh, dữ liệu riêng và manager tương lai. Docker Synology; PDF Excel quen thuộc. Docs song ngữ, prompt theo giai đoạn, ưu tiên subscription.

## Mặc định thiết kế

Đóng khoảng trống để không phải hỏi thêm; đây không phải xác nhận do người dùng nói mà bị bịa thêm.

| ID | Mặc định |
|---|---|
| D-01 | Hono/TypeScript + React/Vite + SQLite + pdf-lib; một container. C# và Next.js vẫn là phương án khả thi. |
| D-02 | Loại cả ba nghỉ trong ví dụ, dịch gợi ý theo giờ vào, xác nhận nghỉ thật/không nghỉ; chưa biết để chờ. |
| D-03 | N kích hoạt nghiêm ngặt, không là khoản trừ; M gần nhất, đúng nửa xuống. |
| D-04 | Mọi phút ngoài lịch bỏ B/N nhưng giữ M; hiện phút đủ điều kiện gốc dù làm tròn còn không. |
| D-05 | Qua đêm ở nhóm ngày bắt đầu; chia điều kiện tại ranh giới địa phương. Múi giờ báo cáo đã lưu phụ trách ghi sổ. |
| D-06 | Mặc định bỏ thiếu; trừ phút chính xác, không âm thầm quá số dư. Giờ qua đêm đáp ứng công; thiếu bản ghi/nghỉ cả ngày không làm không bị trừ. |
| D-07 | Ghi OT lúc chốt bất biến; tách tạm tính. Giữ phép đã duyệt, tiêu ngày nghỉ, tỷ lệ phút 1:1. |
| D-08 | Thứ Hai–Sáu, America/Los_Angeles, thứ Ba trước payroll 17:00; giờ/múi giờ là đề xuất, không do workbook xác lập. |
| D-09 | Bật tùy chọn tự nộp sau setup; dry-run tới kích hoạt; ảnh tự động tắt; không sign-off giả. |
| D-10 | Email trước, ntfy tùy chọn, hoãn SMS; link review có login đủ ban đầu. |
| D-11 | Phiên bản lễ công ty hằng năm rõ; nghỉ cá nhân tách phân loại lịch. |
| D-12 | Hiện tại = payroll sớm nhất bằng/sau hôm nay theo múi giờ báo cáo; ưu tiên kỳ cũ chưa xử lý không làm nó thành hiện tại. |
| D-13 | UI đầu tiếng Anh được; docs song ngữ bắt buộc; portal manager sau. |
| D-14 | Đã xác nhận Max 20x; giữ kế hoạch công việc có phạm vi, dự kiến không dùng reserve/API phí. Khối lượng không là lời hứa quota. |

## Cập nhật bằng chứng tài khoản

Ngày 30/09/2026, người dùng cung cấp ảnh gói Max ghi usage gấp 20 lần Pro. Ảnh xác lập cấp gói Claude, không xác lập allowance còn lại hay settings usage trả thêm. Không sao chép thông tin thanh toán.

## Bằng chứng workbook

[Mẫu đã làm sạch](../reference/inputs/Timesheet_Rev8_2026.xlsx) hỗ trợ mẫu 14 ngày, payroll thứ Sáu/hạn thứ Ba. Không xác lập quy tắc lương pháp lý, ngày ký cũ thật, email đã gửi hoặc số dư OT đầu. [Ghi chú nguồn](../reference/inputs/README.vi.md) ghi những gì đã xóa, hash và lỗi công thức. Ngày 2026-09-30 chủ dự án xóa toàn bộ dữ liệu cá nhân (các sheet chấm công theo ngày, tên, chữ ký và metadata) và công khai mẫu này; không giữ bản gốc cá nhân.

Thay công thức/khoản trừ 8,5 giờ, cách nói tự ký, giả định scheduler chỉ trong RAM và shortcut backup chỉ file đang chạy của đề xuất trước. Không giả định SMTP thường gửi đúng một lần.

## Nguồn chính thức

Đã xem khi chuẩn bị ngày **29/09/2026**; kiểm lại Claude Desktop/model/Max và điều khiển model ChatGPT ngày **30/09/2026**. Lựa chọn/mặc định/ước lượng là nhận định dự án; nguồn mô tả khả năng/giới hạn. Ghim dependency còn hỗ trợ lúc triển khai, không theo giả định thiếu ngày.

| Nguồn | Dùng cho |
|---|---|
| [Hono on Node](https://hono.dev/docs/getting-started/nodejs) | Nền tảng app Node |
| [SQLite WAL](https://www.sqlite.org/wal.html) | Giới hạn cục bộ host/WAL |
| [SQLite backup](https://www.sqlite.org/backup.html) | Backup nhất quán |
| [pdf-lib](https://pdf-lib.js.org/) | Tạo/nhúng PDF |
| [ntfy configuration](https://docs.ntfy.sh/config/) | Adapter thông báo tùy chọn |
| [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Phương án thay thế được xem xét |
| [ChatGPT models](https://learn.chatgpt.com/docs/models) | Model và điều khiển Work/Codex |
| [ChatGPT pricing/usage](https://learn.chatgpt.com/docs/pricing) | Usage trong gói và phân biệt credits/tốc độ |
| [Workspace usage limits](https://learn.chatgpt.com/docs/enterprise/usage-limits) | Điều khiển workspace; kiểm UI Business thật |
| [Claude Code Desktop](https://code.claude.com/docs/en/desktop) | Chọn dự án cục bộ, menu model/effort và chế độ quyền |
| [Claude model configuration](https://code.claude.com/docs/en/model-config) | Tên model, bộ chọn và effort |
| [Claude Max](https://support.claude.com/en/articles/11049741-what-is-the-max-plan) | Các mức Max |
| [Claude usage practices](https://support.claude.com/en/articles/9797557-usage-limit-best-practices) | Dashboard usage và dự trù allowance |

Kiểm nguồn công khai không xem quota, điều khiển phí thật, kiến trúc NAS, credential hay người nhận. Kiểm trong client/setup thật. Khả dụng có thể đổi; danh sách model có ngày không là quyền truy cập vĩnh viễn.

Bản dịch của [10_DECISIONS_AND_SOURCES.md](10_DECISIONS_AND_SOURCES.md); tiếng Anh là nguồn chuẩn.
