# Workbook mẫu tham chiếu

[Timesheet_Rev8_2026.xlsx](Timesheet_Rev8_2026.xlsx) là mẫu công khai tạo từ file được cung cấp “Timesheet - Rev8 - 2026.xlsx,” chỉ đổi tên để path dễ dùng. Ngày 2026-09-30 chủ dự án xóa toàn bộ dữ liệu cá nhân và công khai file làm mẫu; không giữ bản gốc cá nhân.

- Đã xóa: tám sheet kỳ lương có ngày (2026.01.09 tới 2026.04.17) chứa lịch sử chấm công, tên nhân viên, ảnh chữ ký, thuộc tính tác giả/người sửa cuối và đường dẫn thư mục máy mà Excel lưu.
- Nội dung: ba sheet — Working Infos (nhãn ngày, bảng thời gian và các ngày trả lương từ 2022-12-30 tới 2035-12-28), Holiday Dates (chín ngày lễ công ty năm 2026) và biểu mẫu Timesheet có tiêu đề công ty. Cờ “xóa thông tin cá nhân khỏi thuộc tính file khi lưu” đã bật, nên Excel để trống trường tác giả.
- Dung lượng 25.878 byte; SHA-256 47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331. Các manifest lịch sử r1.1 vẫn ghi bản gốc cá nhân (94.537 byte, SHA-256 477984c3…a877f33).
- Trong Timesheet, công thức ngày trừ 8,5 giờ. X24 cộng B16:Y16 và B23:Y23, bỏ Chủ nhật Z16/Z23. W26 dùng TODAY().

Dùng tham chiếu bố cục báo cáo và, khi điền các sheet có ngày giả, để preview nhập. Yêu cầu mới thay công thức cũ. File không xác lập sign-off lịch sử thật, email đã gửi hay số dư OT đầu.

Không bao giờ thêm tên, chữ ký, lịch sử chấm công hay dữ liệu cá nhân khác vào mẫu được theo dõi, và không đưa nó vào image production. Đọc mà không lưu lại bằng thư viện có thể làm mất tính năng Excel. Ghi mọi thay đổi có chủ đích tại đây cùng hash mới, và kiểm lại metadata sau mỗi lần lưu bằng Excel trước khi commit.

Bản dịch của [README.md](README.md); tiếng Anh là nguồn chuẩn.
